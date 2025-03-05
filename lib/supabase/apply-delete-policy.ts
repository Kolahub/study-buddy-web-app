import { createClient } from "@supabase/supabase-js";

// This is a one-time script to apply the delete policy to fix the deletion issue
// Run this with: npx tsx lib/supabase/apply-delete-policy.ts

const applyDeletePolicy = async () => {
  // Create a Supabase client with admin privileges (run this with proper credentials)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Note: This needs to be the service role key
  );

  console.log("Applying delete policy for slides table...");

  // Check if the policy already exists
  const { data: policies, error: policyError } = await supabase.rpc(
    "get_policies"
  );

  if (policyError) {
    console.error("Error fetching policies:", policyError);
    return;
  }

  const existingPolicy = policies.find(
    (p) =>
      p.tablename === "slides" &&
      p.policyname === "Authenticated users can delete slides"
  );

  if (existingPolicy) {
    console.log("Policy already exists!");
    return;
  }

  // Apply the policy using SQL
  const { error } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE POLICY "Authenticated users can delete slides"
      ON public.slides
      FOR DELETE
      USING (auth.role() = 'authenticated');
    `,
  });

  if (error) {
    console.error("Error applying policy:", error);
  } else {
    console.log("Policy successfully applied!");
  }
};

// Run the function
applyDeletePolicy()
  .then(() => console.log("Done!"))
  .catch((error) => console.error("Script failed:", error));
