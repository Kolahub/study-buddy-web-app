import type React from "react"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is already authenticated on the server
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <div className="min-h-screen">{children}</div>
}

