-- Fix RLS policy for slides table
-- This should allow authenticated users to delete slides

-- Check if delete policy exists and drop it if it does
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' 
    AND policyname = 'Authenticated users can delete slides'
  ) THEN
    DROP POLICY "Authenticated users can delete slides" ON public.slides;
  END IF;
END
$$;

-- Create the delete policy
CREATE POLICY "Authenticated users can delete slides"
ON public.slides
FOR DELETE
USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- Add Update policy as well for completeness
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' 
    AND policyname = 'Authenticated users can update slides'
  ) THEN
    CREATE POLICY "Authenticated users can update slides"
    ON public.slides
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$; 