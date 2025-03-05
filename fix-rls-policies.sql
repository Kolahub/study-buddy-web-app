-- Simple script to fix all RLS policies for the slides table
-- Run this in the Supabase SQL Editor

-- Enable RLS on slides table
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view all slides" ON public.slides;
DROP POLICY IF EXISTS "Authenticated users can insert their own slides" ON public.slides;
DROP POLICY IF EXISTS "Authenticated users can update slides" ON public.slides;
DROP POLICY IF EXISTS "Authenticated users can delete slides" ON public.slides;

-- Create policies
CREATE POLICY "Authenticated users can view all slides" 
ON public.slides 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert their own slides"
ON public.slides
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update slides"
ON public.slides
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete slides"
ON public.slides
FOR DELETE
USING (auth.role() = 'authenticated');

-- Verify policies exist
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS operation,
    qual AS using_expression,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'slides'; 