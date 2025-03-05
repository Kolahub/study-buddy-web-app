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
CREATE POLICY "Authenticated users can view all slides" 
ON public.slides 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert their own slides
CREATE POLICY "Authenticated users can insert their own slides"
ON public.slides
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete their own slides
CREATE POLICY "Authenticated users can delete slides"
ON public.slides
FOR DELETE
USING (auth.role() = 'authenticated');

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
CREATE POLICY "Users can view their own progress"
ON public.content_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to update their own progress
CREATE POLICY "Users can update their own progress"
ON public.content_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to insert their own progress
CREATE POLICY "Users can insert their own progress"
ON public.content_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id); 