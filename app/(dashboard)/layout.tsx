import type React from "react"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/nav"
import { SiteHeader } from "@/components/site-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the Supabase client
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session exists, redirect to login
  if (!session) {
    redirect("/login")
  }

  // Update the profile fetch logic
  const getProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      return profile;
    } catch (error) {
      return null;
    }
  };

  const profile = await getProfile();

  // If profile doesn't exist, create it (but don't block rendering on this)
  if (!profile) {
    // Use upsert to avoid race conditions
    supabase
      .from("profiles")
      .upsert(
        [
          {
            user_id: session.user.id,
            name: session.user.user_metadata?.name || "User",
            email: session.user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "user_id",
        },
      )
      .then(() => {
        console.log("Created missing profile for user:", session.user.id)
      })
      .catch((err) => {
        console.error("Failed to create profile:", err)
      })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden py-6">{children}</main>
      </div>
    </div>
  )
}

