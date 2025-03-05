"use client"

import Link from "next/link"
import { Brain, Menu } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useSupabase } from "@/lib/supabase/provider"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardNav } from "@/components/dashboard/nav"
import { useState } from "react"

export function SiteHeader() {
  const { session } = useSupabase()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isDashboardPage =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/quizzes") ||
    pathname?.startsWith("/content") ||
    pathname?.startsWith("/progress")

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex gap-2 items-center mr-4">
          <Brain className="h-6 w-6 text-primary" />
          <Link href="/" className="flex items-center">
            <span className="font-bold hidden sm:inline-block">Study Buddy</span>
          </Link>
        </div>

        {isDashboardPage && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px] pr-0">
              <div className="flex gap-2 items-center mb-6">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-bold">Study Buddy</span>
              </div>
              <DashboardNav />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1 flex items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {!session && !isDashboardPage && (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}

