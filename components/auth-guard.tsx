"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/provider"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, isLoading } = useSupabase()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        console.log("AuthGuard: No session, redirecting to login")
        router.replace("/login")
      } else {
        setIsAuthorized(true)
      }
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

