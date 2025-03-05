import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// This is a utility function to check if Supabase is reachable
// You can call this function in your components when debugging connection issues
export const checkSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");

    // Create a client
    const supabase = createClientComponentClient();

    // Try a simple query that should always work if connected
    const { data, error, status } = await supabase
      .from("slides")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Supabase connection test failed:", error);
      return {
        connected: false,
        error: error.message,
        status,
        details: error,
      };
    }

    console.log("Supabase connection successful!", { status, data });
    return {
      connected: true,
      status,
      data,
    };
  } catch (error) {
    console.error("Error checking Supabase connection:", error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error,
    };
  }
};

// Add a function to check auth status
export const checkAuthStatus = async () => {
  try {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        authenticated: false,
        error: error.message,
      };
    }

    return {
      authenticated: !!data.session,
      user: data.session?.user || null,
    };
  } catch (error) {
    return {
      authenticated: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during auth check",
    };
  }
};
