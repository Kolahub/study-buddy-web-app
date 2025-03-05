"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { SupabaseProvider } from "@/lib/supabase/provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SupabaseProvider>{children}</SupabaseProvider>
    </ThemeProvider>
  )
}

