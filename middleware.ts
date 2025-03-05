import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the current path
  const path = req.nextUrl.pathname

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/quizzes", "/content", "/progress"]
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  // Define auth routes
  const authRoutes = ["/login", "/signup"]
  const isAuthRoute = authRoutes.some((route) => path === route)

  // Redirect logic
  if (!session && isProtectedRoute) {
    // If user is not authenticated and tries to access a protected route
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isAuthRoute) {
    // If user is authenticated and tries to access an auth route
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

