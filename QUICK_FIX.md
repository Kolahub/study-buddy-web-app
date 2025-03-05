# Quick Fix for Slide Deletion Issues

Follow these steps to fix the slide deletion issues:

## 1. Run this SQL in your Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Create a "New Query"
5. Paste the following SQL:

```sql
-- Enable RLS on slides table
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- Create delete policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'slides'
    AND policyname = 'Authenticated users can delete slides'
  ) THEN
    CREATE POLICY "Authenticated users can delete slides"
    ON public.slides
    FOR DELETE
    USING (auth.role() = 'authenticated');

    RAISE NOTICE 'Delete policy created successfully!';
  ELSE
    RAISE NOTICE 'Delete policy already exists.';
  END IF;
END
$$;

-- Create a fallback function that works even without RLS
CREATE OR REPLACE FUNCTION public.delete_slide(slide_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the slide record
  DELETE FROM public.slides WHERE id = slide_id;

  -- Return success
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_slide(UUID) TO authenticated;
```

6. Click "Run" to execute the SQL

## 2. Restart Your App

After running the SQL, restart your Next.js app:

```bash
npm run dev
```

## 3. Test Deletion Again

Try deleting a slide again. It should now work correctly and remain deleted even after page refresh.

## What This Fix Does

1. Ensures Row Level Security (RLS) is enabled on the slides table
2. Creates a policy that allows authenticated users to delete slides
3. Creates a fallback function that can delete slides even if RLS policies fail
4. The application code has been updated to try both methods

If you continue to have issues, run the diagnostics in the app by clicking the "Run Diagnostics" button when an error appears.
