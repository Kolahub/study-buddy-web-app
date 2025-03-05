// Simple script to fix RLS policies using direct API calls
// Run with: node fix-rls.js

// Configuration - REPLACE THESE VALUES with your actual Supabase details
const SUPABASE_URL = "https://bmqdtcbrdunxzbrozcxs.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcWR0Y2JyZHVueHpicm96Y3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTAyODYzMSwiZXhwIjoyMDU2NjA0NjMxfQ.HpF5iNwaaDPj49pCiuK3JQJ0nrYPmcVeXRFl-3xvNRI";

async function fixRlsPolicies() {
  console.log("Starting RLS policy fix...");

  // SQL to fix all RLS policies at once
  const sql = `
    -- Enable RLS on slides table
    ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Authenticated users can view all slides" ON public.slides;
    DROP POLICY IF EXISTS "Authenticated users can insert their own slides" ON public.slides;
    DROP POLICY IF EXISTS "Authenticated users can update slides" ON public.slides;
    DROP POLICY IF EXISTS "Authenticated users can delete slides" ON public.slides;
    
    -- Create policies
    CREATE POLICY "Authenticated users can view all slides" 
    ON public.slides 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated users can insert their own slides"
    ON public.slides
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated users can update slides"
    ON public.slides
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated users can delete slides"
    ON public.slides
    FOR DELETE
    USING (auth.role() = 'authenticated');
  `;

  try {
    console.log("Executing SQL to fix RLS policies...");

    // Call the Supabase rpc endpoint to execute SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Successfully applied all RLS policies!");
    } else {
      console.error("❌ Error applying RLS policies:", result);
    }

    // Verify the policies were created
    console.log("Verifying policies...");
    const policiesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/get_policies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({}),
      }
    );

    const policies = await policiesResponse.json();

    if (policiesResponse.ok) {
      const slidesPolicies = policies.filter((p) => p.tablename === "slides");
      console.log(
        `Found ${slidesPolicies.length} policies for the slides table:`
      );
      slidesPolicies.forEach((p) => {
        console.log(`- ${p.policyname} (${p.operation})`);
      });

      if (slidesPolicies.length === 4) {
        console.log("✅ All required policies are in place!");
      } else {
        console.warn(
          "⚠️ Not all policies were created. Check the logs for details."
        );
      }
    } else {
      console.error("❌ Error verifying policies:", policies);
    }
  } catch (error) {
    console.error("❌ Script execution failed:", error);
  }
}

// Run the script
fixRlsPolicies().then(() => {
  console.log("RLS policy fix process completed");
});
