# 🔧 Chat History Fix - Quick Setup Guide

## Problem
Chat history is not being stored or displayed in the profile section due to Supabase Row Level Security (RLS) policies not working with Clerk authentication.

## Solution
The code has been updated to use Supabase's service role key which bypasses RLS for API routes. Follow these steps to complete the setup:

## Step-by-Step Fix

### 1. Get Your Supabase Service Role Key

1. Go to your Supabase project dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** (gear icon in sidebar) → **API**
4. In the "Project API keys" section, find the **`service_role`** key
5. Click to reveal and copy the key (⚠️ This is a secret key - never commit it to git!)

### 2. Add the Service Role Key to Your Environment Variables

Open or create `.env.local` in your project root and add:

```env
# Your existing variables...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add this line with your service role key:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Verify Database Schema

Make sure the `chats` table exists in your Supabase database:

1. Go to **SQL Editor** in Supabase dashboard
2. Run the SQL from `supabase/schema.sql`
3. You should see a success message

### 4. Restart Your Development Server

Stop your current server (Ctrl+C) and restart:

```bash
npm run dev
```

### 5. Test the Fix

1. Go to `/chat` page
2. Submit a prompt
3. Wait for responses
4. Go to `/profile` page
5. You should now see your chat history!

## What Changed?

The following files were updated:

- ✅ `lib/supabaseClient.ts` - Added `supabaseAdmin` client with service role key
- ✅ `app/api/chats/route.ts` - Updated to use `supabaseAdmin` instead of `supabase`
- ✅ `README.md` - Added service role key instructions

## Why This Works

- **Clerk** handles user authentication (sign in/sign up)
- **Supabase RLS** policies expect Supabase Auth JWT tokens
- **Service Role Key** bypasses RLS entirely for server-side operations
- **API Routes** still filter data by `userId` from Clerk for security

## Troubleshooting

**Still not working?**

1. Check browser console for errors (F12)
2. Check terminal for server errors
3. Verify all environment variables are set correctly
4. Make sure you restarted the dev server
5. Try clearing chat history and creating a new chat

**Environment variable not loading?**

```bash
# Verify your .env.local exists
ls -la .env.local

# Restart your dev server
npm run dev
```

**Database connection errors?**

- Verify your Supabase project is active (not paused)
- Check that all three Supabase credentials are correct
- Test the connection in Supabase dashboard

## Security Note

⚠️ **IMPORTANT**: The service role key should ONLY be used in:
- Server-side API routes (like `/app/api/*`)
- Server-side code that runs on your backend

❌ **NEVER** use the service role key in:
- Client-side components
- Code that runs in the browser
- Frontend JavaScript

The current implementation is secure because `supabaseAdmin` is only imported in API route files which run on the server.

## Need More Help?

Check the updated troubleshooting section in `README.md` or open an issue on GitHub.
