import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Function to read values from .env file
const getEnvVars = () => {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    const envContent = fs.readFileSync(envPath, "utf8");
    const envLines = envContent.split("\n");

    const envVars: Record<string, string> = {};

    envLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        const value = valueParts.join("="); // Rejoin in case value contains = characters
        envVars[key.trim()] = value.trim();
      }
    });

    console.log("Found environment variables:");
    Object.keys(envVars).forEach((key) => {
      console.log(
        `- ${key}: ${key.includes("KEY") ? "[SECRET]" : envVars[key]}`
      );
    });

    return envVars;
  } catch (error) {
    console.error("Error reading .env file:", error);
    return {};
  }
};

// This script directly applies RLS policies to fix slide deletion
// To run: npx tsx lib/supabase/fix-rls.ts

const fixRlsPolicies = async () => {
  console.log("Starting RLS policy fix...");

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("Found environment variables:");
  console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
  console.log(
    `- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${
      supabaseAnonKey ? "[SECRET]" : "MISSING"
    }`
  );
  console.log(
    `- SUPABASE_SERVICE_ROLE_KEY: ${
      supabaseServiceRoleKey ? "[SECRET]" : "MISSING"
    }`
  );

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Error: Missing environment variables.");
    console.log(
      "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file"
    );
    return;
  }

  // Create a Supabase client with admin privileges
  console.log("Testing connection to Supabase...");
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // First check if we can connect
    console.log("Trying to access slides table...");
    const { data, error, status, statusText } = await supabase
      .from("slides")
      .select("count(*)", { count: "exact", head: true });

    console.log("Connection response:", {
      status,
      statusText,
      hasData: !!data,
      hasError: !!error,
    });

    if (error) {
      if (typeof error === "object" && Object.keys(error).length === 0) {
        console.error(
          "Empty error object received. This may indicate a CORS or network issue."
        );

        // Try a simpler request as fallback
        console.log("Trying a fallback healthcheck...");
        const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            apikey: supabaseServiceRoleKey,
            Authorization: `Bearer ${supabaseServiceRoleKey}`,
          },
        }).catch((e) => ({ ok: false, error: e }));

        console.log(
          "Healthcheck result:",
          healthCheck.ok ? "Success" : "Failed"
        );

        if (!healthCheck.ok) {
          console.error("Could not connect to Supabase API.");
          return;
        }
      } else {
        console.error("Error connecting to Supabase:", error);
        return;
      }
    }

    console.log("Connected to Supabase successfully");

    // Apply each policy in sequence
    console.log("Applying SELECT policy...");
    await applyPolicy(
      supabase,
      "Authenticated users can view all slides",
      "SELECT",
      "auth.role() = 'authenticated'"
    );

    console.log("Applying INSERT policy...");
    await applyPolicy(
      supabase,
      "Authenticated users can insert their own slides",
      "INSERT",
      null,
      "auth.role() = 'authenticated'"
    );

    console.log("Applying UPDATE policy...");
    await applyPolicy(
      supabase,
      "Authenticated users can update slides",
      "UPDATE",
      "auth.role() = 'authenticated'",
      "auth.role() = 'authenticated'"
    );

    console.log("Applying DELETE policy...");
    await applyPolicy(
      supabase,
      "Authenticated users can delete slides",
      "DELETE",
      "auth.role() = 'authenticated'"
    );

    console.log("All policies applied successfully!");

    // Verify policies
    console.log("Verifying policies...");
    const { data: policies, error: policyError } = await supabase.rpc(
      "get_policies"
    );

    if (policyError) {
      console.error("Error fetching policies:", policyError);
      return;
    }

    if (policies) {
      const slidesPolicies = policies.filter(
        (p: any) => p.tablename === "slides"
      );
      console.log(`Found ${slidesPolicies.length} policies for slides table:`);
      slidesPolicies.forEach((p: any) => {
        console.log(`- ${p.policyname}: ${p.permissive} for ${p.operation}`);
      });
    }
  } catch (error) {
    console.error("Error applying RLS policies:", error);
  }
};

// Helper function to apply a policy
const applyPolicy = async (
  supabase: any,
  policyName: string,
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE",
  usingExpression?: string | null,
  withCheckExpression?: string | null
) => {
  try {
    // First check if policy exists
    const { data: existingPolicies, error: policiesError } = await supabase.rpc(
      "get_policies"
    );

    if (policiesError) {
      console.error(
        `Error checking for existing policies: ${
          policiesError.message || JSON.stringify(policiesError)
        }`
      );
      return false;
    }

    const policyExists = existingPolicies?.some(
      (p: any) => p.tablename === "slides" && p.policyname === policyName
    );

    // If it exists, drop it first
    if (policyExists) {
      console.log(`Dropping existing policy: ${policyName}`);
      const { error: dropError } = await supabase.rpc("exec_sql", {
        sql: `DROP POLICY "${policyName}" ON public.slides;`,
      });

      if (dropError) {
        console.error(
          `Error dropping policy: ${
            dropError.message || JSON.stringify(dropError)
          }`
        );
        return false;
      }
    }

    // Build the SQL for creating the policy
    let sql = `CREATE POLICY "${policyName}" ON public.slides FOR ${operation}`;

    if (usingExpression) {
      sql += ` USING (${usingExpression})`;
    }

    if (withCheckExpression) {
      sql += ` WITH CHECK (${withCheckExpression})`;
    }

    sql += ";";

    console.log(`Executing SQL: ${sql}`);

    // Apply the policy
    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error(
        `Failed to apply policy "${policyName}": ${
          error.message || JSON.stringify(error)
        }`
      );
      return false;
    }

    console.log(`Successfully applied policy: ${policyName}`);
    return true;
  } catch (error) {
    console.error(`Error applying policy "${policyName}":`, error);
    return false;
  }
};

// Manual SQL apply alternative method
const applyManualSql = async (supabase: any) => {
  try {
    console.log("Attempting to apply policies with direct SQL...");

    const sql = `
      ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
      
      -- Create or replace policies
      DO $$
      BEGIN
        -- Drop existing policies if they exist
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'slides' AND policyname = 'Authenticated users can view all slides') THEN
          DROP POLICY "Authenticated users can view all slides" ON public.slides;
        END IF;
        
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'slides' AND policyname = 'Authenticated users can insert their own slides') THEN
          DROP POLICY "Authenticated users can insert their own slides" ON public.slides;
        END IF;
        
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'slides' AND policyname = 'Authenticated users can update slides') THEN
          DROP POLICY "Authenticated users can update slides" ON public.slides;
        END IF;
        
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'slides' AND policyname = 'Authenticated users can delete slides') THEN
          DROP POLICY "Authenticated users can delete slides" ON public.slides;
        END IF;
      END
      $$;
      
      -- Create new policies
      CREATE POLICY "Authenticated users can view all slides" ON public.slides FOR SELECT USING (auth.role() = 'authenticated');
      CREATE POLICY "Authenticated users can insert their own slides" ON public.slides FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "Authenticated users can update slides" ON public.slides FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
      CREATE POLICY "Authenticated users can delete slides" ON public.slides FOR DELETE USING (auth.role() = 'authenticated');
    `;

    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error("Error applying SQL:", error);
      return false;
    }

    console.log("Successfully applied all policies with direct SQL!");
    return true;
  } catch (error) {
    console.error("Error in manual SQL application:", error);
    return false;
  }
};

// Run the function
fixRlsPolicies()
  .then(() => console.log("RLS policy fix completed"))
  .catch((err) => console.error("Script failed:", err));
