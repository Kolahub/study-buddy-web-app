-- Add slides table to the database schema
CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX slides_course_id_idx ON slides(course_id);
CREATE INDEX slides_created_at_idx ON slides(created_at);

-- Add storage bucket for content
-- Run this in Supabase SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true);

