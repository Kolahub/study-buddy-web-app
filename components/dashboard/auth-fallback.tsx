"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/provider"
import { Loader2 } from "lucide-react"

export function DashboardAuthFallback() {
  const { session, isLoading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    // If we're not loading and there's no session, redirect to login
    if (!isLoading && !session) {
      router.replace("/login")
    }
  }, [session, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your access...</p>
      </div>
    </div>
  )
}

