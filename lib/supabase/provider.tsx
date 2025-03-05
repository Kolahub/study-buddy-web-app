"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createClientComponentClient,
  type SupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";

type SupabaseContext = {
  supabase: SupabaseClient;
  session: Session | null;
  isLoading: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => {
    try {
      const client = createClientComponentClient({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        options: {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
          // Add a global error handler
          global: {
            fetch: (...args) => {
              return fetch(...args).catch((error) => {
                console.error("Supabase fetch error:", error);
                // Return a clearer error for debugging
                throw new Error(`Supabase connection error: ${error.message}`);
              });
            },
          },
        },
      });
      return client;
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
      // Return a basic client as fallback
      return createClientComponentClient();
    }
  });
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Track if we've already redirected to prevent loops
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Authentication error:", error.message);
          toast({
            title: "Authentication Error",
            description:
              "Failed to connect to authentication service. Please try again later.",
            variant: "destructive",
          });
        }

        setSession(data.session);
        setIsLoading(false);
      } catch (error) {
        console.error("Error getting session:", error);
        setIsLoading(false);

        // Handle network errors gracefully
        if (error instanceof Error) {
          if (error.message.includes("Failed to fetch")) {
            toast({
              title: "Connection Error",
              description:
                "Unable to connect to authentication service. Please check your internet connection and try again.",
              variant: "destructive",
            });
          }
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Update session state
      setSession(newSession);

      // Handle auth state changes with error handling
      try {
        if (event === "SIGNED_IN" && !hasRedirected) {
          setHasRedirected(true);

          // Force a router refresh
          router.refresh();

          // Redirect to dashboard if on an auth page
          if (pathname?.includes("/login") || pathname?.includes("/signup")) {
            // Use a short timeout to ensure state updates complete
            setTimeout(() => {
              router.push("/dashboard");
            }, 100);
          }
        } else if (event === "SIGNED_OUT") {
          setHasRedirected(false);
          router.refresh();
          router.push("/");
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
        } else if (event === "USER_UPDATED") {
          console.log("User updated");
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname, hasRedirected]);

  return (
    <Context.Provider value={{ supabase, session, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};
