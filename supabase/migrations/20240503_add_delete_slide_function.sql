-- Create a function to delete slides that works without RLS
CREATE OR REPLACE FUNCTION public.delete_slide(slide_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This means the function runs with the privileges of the creator
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

-- Comment explaining the function
COMMENT ON FUNCTION public.delete_slide(UUID) IS 'Deletes a slide by ID. Runs with security definer privileges to bypass RLS.'; 