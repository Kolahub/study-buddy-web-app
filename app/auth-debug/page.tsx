"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase/provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AuthDebug() {
  const { supabase, session, isLoading } = useSupabase()
  const [userDetails, setUserDetails] = useState<any>(null)
  const [profileDetails, setProfileDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session) return

      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          setError(`Profile error: ${profileError.message}`)
        } else {
          setProfileDetails(profile)
        }

        // Get user details
        setUserDetails({
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata,
          aud: session.user.aud,
          role: session.user.role,
        })
      } catch (err: any) {
        console.error("Error in fetchUserDetails:", err)
        setError(`Fetch error: ${err.message}`)
      }
    }

    fetchUserDetails()
  }, [session, supabase])

  const handleForceRedirect = () => {
    router.replace("/dashboard")
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/")
  }

  const handleFixProfile = async () => {
    if (!session) return

    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single()

      if (profileError || !profile) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            user_id: session.user.id,
            name: session.user.user_metadata.name || "User",
            email: session.user.email,
          },
        ])

        if (insertError) {
          setError(`Error creating profile: ${insertError.message}`)
        } else {
          // Refresh profile data
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single()

          setProfileDetails(newProfile)
          setError(null)
        }
      } else {
        setError("Profile already exists")
      }
    } catch (err: any) {
      setError(`Fix profile error: ${err.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
            <CardDescription>Loading authentication data...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>This page helps diagnose authentication and redirection issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Session Status</h3>
            <pre className="mt-2 rounded-md bg-muted p-4 overflow-auto">
              {session ? "Authenticated" : "Not authenticated"}
            </pre>
          </div>

          {error && (
            <div>
              <h3 className="text-lg font-medium text-destructive">Error</h3>
              <pre className="mt-2 rounded-md bg-destructive/10 p-4 text-destructive overflow-auto">{error}</pre>
            </div>
          )}

          {userDetails && (
            <div>
              <h3 className="text-lg font-medium">User Details</h3>
              <pre className="mt-2 rounded-md bg-muted p-4 overflow-auto">{JSON.stringify(userDetails, null, 2)}</pre>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium">Profile Details</h3>
            <pre className="mt-2 rounded-md bg-muted p-4 overflow-auto">
              {profileDetails ? JSON.stringify(profileDetails, null, 2) : "No profile found"}
            </pre>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={handleForceRedirect}>Force Redirect to Dashboard</Button>

            <Button variant="outline" onClick={handleFixProfile}>
              Fix Missing Profile
            </Button>

            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

