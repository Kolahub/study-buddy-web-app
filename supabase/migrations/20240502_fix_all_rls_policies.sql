-- Comprehensive RLS Policy Fixer
-- This script fixes all Row Level Security policies for the slides table

-- Step 1: Make sure the slides table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'slides'
  ) THEN
    RAISE EXCEPTION 'Table public.slides does not exist!';
  END IF;
END
$$;

-- Step 2: Enable Row Level Security on the slides table
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- Step 3: Check and create/update policies for each operation type

-- SELECT policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' AND schemaname = 'public'
    AND policyname = 'Authenticated users can view all slides'
  ) THEN
    -- Update existing policy
    DROP POLICY "Authenticated users can view all slides" ON public.slides;
  END IF;
  
  -- Create policy with correct definition
  CREATE POLICY "Authenticated users can view all slides" 
  ON public.slides 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
  
  RAISE NOTICE 'SELECT policy for slides table created or updated';
END
$$;

-- INSERT policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' AND schemaname = 'public'
    AND policyname = 'Authenticated users can insert their own slides'
  ) THEN
    -- Update existing policy
    DROP POLICY "Authenticated users can insert their own slides" ON public.slides;
  END IF;
  
  -- Create policy with correct definition
  CREATE POLICY "Authenticated users can insert their own slides"
  ON public.slides
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
  
  RAISE NOTICE 'INSERT policy for slides table created or updated';
END
$$;

-- UPDATE policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' AND schemaname = 'public'
    AND policyname = 'Authenticated users can update slides'
  ) THEN
    -- Update existing policy
    DROP POLICY "Authenticated users can update slides" ON public.slides;
  END IF;
  
  -- Create policy with correct definition
  CREATE POLICY "Authenticated users can update slides"
  ON public.slides
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
  
  RAISE NOTICE 'UPDATE policy for slides table created or updated';
END
$$;

-- DELETE policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' AND schemaname = 'public'
    AND policyname = 'Authenticated users can delete slides'
  ) THEN
    -- Update existing policy
    DROP POLICY "Authenticated users can delete slides" ON public.slides;
  END IF;
  
  -- Create policy with correct definition
  CREATE POLICY "Authenticated users can delete slides"
  ON public.slides
  FOR DELETE
  USING (auth.role() = 'authenticated');
  
  RAISE NOTICE 'DELETE policy for slides table created or updated';
END
$$;

-- Step 4: Validate policies exist
DO $$
DECLARE
  select_policy_exists BOOLEAN;
  insert_policy_exists BOOLEAN;
  update_policy_exists BOOLEAN;
  delete_policy_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' AND schemaname = 'public'
    AND policyname = 'Authenticated users can view all slides'
  ) INTO select_policy_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' AND schemaname = 'public'
    AND policyname = 'Authenticated users can insert their own slides'
  ) INTO insert_policy_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' AND schemaname = 'public'
    AND policyname = 'Authenticated users can update slides'
  ) INTO update_policy_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slides' AND schemaname = 'public'
    AND policyname = 'Authenticated users can delete slides'
  ) INTO delete_policy_exists;
  
  IF select_policy_exists AND insert_policy_exists AND update_policy_exists AND delete_policy_exists THEN
    RAISE NOTICE 'All policies successfully applied!';
  ELSE
    RAISE WARNING 'Some policies may not have been applied correctly.';
    RAISE NOTICE 'SELECT policy: %', select_policy_exists;
    RAISE NOTICE 'INSERT policy: %', insert_policy_exists;
    RAISE NOTICE 'UPDATE policy: %', update_policy_exists;
    RAISE NOTICE 'DELETE policy: %', delete_policy_exists;
  END IF;
END
$$; 