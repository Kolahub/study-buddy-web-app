"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, LayoutDashboard, LineChart, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase/provider"
import { useRouter } from "next/navigation"

export function DashboardNav() {
  const pathname = usePathname()
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Quizzes",
      href: "/quizzes",
      icon: BookOpen,
    },
    {
      title: "Content",
      href: "/content",
      icon: FileText,
    },
    {
      title: "Progress",
      href: "/progress",
      icon: LineChart,
    },
  ]

  return (
    <nav className="grid items-start gap-2 py-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
        return (
          <Link key={item.href} href={item.href}>
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        )
      })}
      <Button variant="ghost" className="w-full justify-start mt-auto" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </nav>
  )
}

