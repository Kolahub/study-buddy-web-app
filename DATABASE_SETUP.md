# Database Setup Guide

This document provides instructions for setting up the necessary database tables for the Study Buddy application in your Supabase project.

## Option 1: Using the Supabase Dashboard (Easiest)

1. Go to your [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Navigate to the **SQL Editor** tab
4. Create a new query
5. Copy and paste the SQL from the migration file (`supabase/migrations/20240305_create_slides_table.sql`)
6. Click "Run" to execute the SQL statements

## Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run migrations with the following steps:

1. Make sure you have the Supabase CLI installed:

   ```bash
   npm install -g supabase
   ```

2. Link your project (if not already linked):

   ```bash
   supabase link --project-ref <your-project-ref>
   ```

3. Run the migrations:
   ```bash
   supabase db push
   ```

## Required Tables

The migration will create the following tables:

### slides

This table stores information about learning materials (slides, PDFs, etc.):

- `id`: UUID primary key
- `title`: Title of the slide
- `description`: Optional description
- `course_id`: ID of the course the slide belongs to
- `file_path`: Path to the file in Supabase storage
- `file_url`: Public URL of the file
- `file_type`: MIME type of the file
- `file_size`: Size of the file in bytes
- `created_at`: Timestamp when the slide was created
- `updated_at`: Timestamp when the slide was last updated

### content_progress

This table tracks user progress through the learning content:

- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `slide_id`: Foreign key to slides
- `completed`: Boolean indicating if the user has completed the slide
- `last_position`: Integer representing the user's last position in the content
- `created_at`: Timestamp when the progress was first recorded
- `updated_at`: Timestamp when the progress was last updated

## Row Level Security (RLS)

The migration also sets up Row Level Security policies to ensure that:

1. Authenticated users can view all slides
2. Authenticated users can insert their own slides
3. Users can only view, insert, and update their own progress records

## Storage Bucket Setup

Make sure you also have a "content" storage bucket set up in your Supabase project:

1. Go to the **Storage** tab in your Supabase dashboard
2. Create a new bucket named "content"
3. Set the RLS policies to allow authenticated users to upload files

## Troubleshooting

If you encounter issues:

1. Check the Supabase dashboard logs for any SQL errors
2. Ensure you have the `uuid-ossp` extension enabled in your database
3. Verify that your Supabase project has RLS enabled

If you're still experiencing issues, refer to the [Supabase documentation](https://supabase.io/docs) or seek help in the community forums.
