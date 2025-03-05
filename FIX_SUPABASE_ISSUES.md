# Fixing Supabase Connection and RLS Issues

This guide will help you resolve the "Error in Supabase query" and "Failed to fetch" errors that are occurring in the application. These errors are usually related to either connection issues or Row Level Security (RLS) policy configuration.

## Quick Fix Steps

1. **Apply RLS Policies**:
   The most common issue is missing RLS policies that prevent the deletion of slides. You can fix this by running:

   ```bash
   # First, add your service role key to .env
   echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here" >> .env

   # Then run the fix script
   npx tsx lib/supabase/fix-rls.ts
   ```

2. **Restart your application**:
   After applying the policies, restart your Next.js development server:

   ```bash
   npm run dev
   ```

## Detailed Troubleshooting Guide

### 1. Verify Environment Variables

Make sure your `.env` file has the correct Supabase URL and anonymous key:

```
NEXT_PUBLIC_SUPABASE_URL=https://yourdatabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Check Supabase Connection

You can run the diagnostics in the app by:

1. Refreshing the page
2. If an error appears, click the "Run Diagnostics" button
3. Check the results for connection, authentication, and RLS policy status

### 3. Manual RLS Policy Application

If the automatic fix script doesn't work, you can manually apply the policies:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20240502_fix_all_rls_policies.sql`
4. Run the SQL query

### 4. Hard Refresh & Clear Cache

If you still experience issues:

1. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
2. Clear your browser cache
3. Try in an incognito/private browsing window

### 5. Check Console for Error Details

Open your browser's developer tools (F12) and look at the Console tab for specific error messages. These can help diagnose:

- Connection issues
- Authentication problems
- RLS policy configuration errors

## Common Error Types and Solutions

### "Failed to fetch" Error

This indicates a network connectivity issue:

- Check your internet connection
- Verify Supabase service status
- Make sure your Supabase project is active

### Empty Error Object `{}`

This often indicates an RLS policy issue:

- Run the fix-rls.ts script to apply the correct policies
- Check if you can perform other operations (select, insert) on the slides table

### Authentication Errors

If you're logged in but experiencing permission issues:

- Try logging out and back in
- Check if your session has expired
- Verify RLS policies are correctly applied

## Need More Help?

If you continue to experience issues after trying these steps, you may need to:

1. Check the Supabase logs in your project dashboard
2. Contact Supabase support if it appears to be a service issue
3. Review your application code for any custom authentication or database access logic that might be interfering

---

_This guide is specifically for resolving RLS and connection issues in the Study Buddy application._
