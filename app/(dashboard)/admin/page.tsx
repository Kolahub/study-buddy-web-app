"use client"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase/provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { Database, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const createSlidesTable = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      // SQL for creating the slides table
      const createSlidesSQL = `
      -- Create slides table
      CREATE TABLE IF NOT EXISTS public.slides (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          course_id TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_url TEXT NOT NULL,
          file_type TEXT,
          file_size INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      -- Add RLS (Row Level Security) policies
      ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

      -- Create policy for authenticated users to view all slides
      CREATE POLICY IF NOT EXISTS "Authenticated users can view all slides" 
      ON public.slides 
      FOR SELECT 
      USING (auth.role() = 'authenticated');

      -- Create policy for authenticated users to insert their own slides
      CREATE POLICY IF NOT EXISTS "Authenticated users can insert their own slides"
      ON public.slides
      FOR INSERT 
      WITH CHECK (auth.role() = 'authenticated');
      `

      // SQL for creating the content_progress table
      const createProgressSQL = `
      -- Create content_progress table to track user progress through slides
      CREATE TABLE IF NOT EXISTS public.content_progress (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          slide_id UUID NOT NULL REFERENCES public.slides(id) ON DELETE CASCADE,
          completed BOOLEAN DEFAULT FALSE,
          last_position INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(user_id, slide_id)
      );

      -- Add RLS for content_progress
      ALTER TABLE public.content_progress ENABLE ROW LEVEL SECURITY;

      -- Create policy for users to see only their own progress
      CREATE POLICY IF NOT EXISTS "Users can view their own progress"
      ON public.content_progress
      FOR SELECT
      USING (auth.uid() = user_id);

      -- Create policy for users to update their own progress
      CREATE POLICY IF NOT EXISTS "Users can update their own progress"
      ON public.content_progress
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

      -- Create policy for users to insert their own progress
      CREATE POLICY IF NOT EXISTS "Users can insert their own progress"
      ON public.content_progress
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
      `

      // Create the UUID extension if it doesn't exist
      await supabase.rpc('create_uuid_extension')
        .catch(e => console.error("Error creating UUID extension:", e))

      // Create tables
      await supabase.rpc('run_sql_query', { query: createSlidesSQL })
      await supabase.rpc('run_sql_query', { query: createProgressSQL })

      // Verify tables were created
      const { error: checkError } = await supabase.from('slides').select('id').limit(1)

      if (checkError) {
        throw new Error(`Failed to verify tables: ${checkError.message}`)
      }

      toast({
        title: "Database setup successful",
        description: "The required database tables have been created.",
      })

      setResult({
        success: true,
        message: "Database tables created successfully! You can now use the content library."
      })
    } catch (error) {
      console.error("Error setting up database:", error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Special handling for rpc error - likely need to create the SQL function
      if (errorMessage.includes("function") && errorMessage.includes("does not exist")) {
        setResult({
          success: false,
          message: `You need to create the SQL functions in Supabase first. Please follow the instructions in DATABASE_SETUP.md to set up your database using the Supabase dashboard SQL editor.`
        })
      } else {
        setResult({
          success: false,
          message: `Failed to create database tables: ${errorMessage}`
        })
      }
      
      toast({
        title: "Database setup failed",
        description: "There was an error creating the database tables. See details on screen.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (!session || !session.user) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Admin" text="Database administration tools" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be logged in to access the admin page.
          </AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Database Administration" 
        text="Tools for setting up and maintaining your database" 
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup
            </CardTitle>
            <CardDescription>
              Set up the required database tables for the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will create the necessary tables in your Supabase database for the content library, including:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
              <li>slides - for storing learning materials</li>
              <li>content_progress - for tracking user progress</li>
            </ul>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button onClick={createSlidesTable} disabled={isCreating}>
                {isCreating ? "Setting Up Database..." : "Create Database Tables"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Policies
            </CardTitle>
            <CardDescription>
              Set up Row Level Security policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Row Level Security (RLS) policies ensure that users can only access their own data. The database setup process 
              automatically configures RLS policies for all tables.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
} 