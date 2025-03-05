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

// Apply the SQL function to delete slides
const applySqlFunction = async () => {
  console.log("Starting SQL function application...");

  // Get variables from .env file
  const envVars = getEnvVars();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Error: Missing environment variables in .env file.");
    console.log("Required variables:");
    console.log("- NEXT_PUBLIC_SUPABASE_URL");
    console.log("- SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  // Create a Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Read the SQL file content
    const sqlFilePath = path.resolve(
      process.cwd(),
      "supabase/migrations/20240503_add_delete_slide_function.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    console.log("SQL Content loaded:");
    console.log(sqlContent.substring(0, 100) + "...");

    // Execute the SQL
    console.log("Executing SQL...");
    const { error } = await supabase.rpc("exec_sql", { sql: sqlContent });

    if (error) {
      console.error("Error executing SQL:", error);
      return;
    }

    console.log("SQL function successfully applied!");

    // Test the function
    console.log("Testing the function with a non-existent ID...");
    const testResult = await supabase.rpc("delete_slide", {
      slide_id: "00000000-0000-0000-0000-000000000000",
    });

    console.log("Test result:", testResult);

    if (testResult.error) {
      console.error("Error testing function:", testResult.error);
    } else {
      console.log("Function is accessible and working correctly!");
    }
  } catch (error) {
    console.error("Error applying SQL function:", error);
  }
};

// Run the function
applySqlFunction()
  .then(() => console.log("SQL function application completed"))
  .catch((err) => console.error("Script failed:", err));
