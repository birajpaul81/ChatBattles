# Fix: Recent Chats Not Showing in Profile

## Problem
The profile page can't display recent chats because Supabase Row Level Security (RLS) policies are blocking database access. The current RLS policies are configured for Supabase Auth, but this app uses Clerk for authentication.

## Solution

### Step 1: Run the SQL Fix
1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project: **sdqpaeaglbvhsdcmtqaw**
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/fix-rls-for-clerk.sql`
6. Click **Run** or press `Ctrl+Enter`

### Step 2: Verify the Fix
1. Go back to your ChatBattles app
2. Send a test message in the chat
3. Navigate to the Profile page
4. You should now see your recent chats!

### Step 3: Check Console Logs
Open the browser console (F12) and check for:
- `Chat save response:` - Should show `success: true`
- `Fetch chats response:` - Should show your saved chats

## Why This Happened
- The database schema uses RLS policies that check for Supabase's JWT tokens
- Your app uses Clerk, which has different authentication tokens
- The API routes already provide security by filtering based on Clerk's `userId`
- The RLS policies were preventing even authenticated requests from accessing the database

## Alternative: Quick Fix (Development Only)
If you want to quickly test without running SQL, you can temporarily disable RLS:

1. Open Supabase SQL Editor
2. Run: `alter table chats disable row level security;`
3. **Warning**: This removes database-level security. Only use in development!

## Production Recommendation
For production, you should:
1. Use Supabase's service role key in your API routes (server-side only)
2. Or integrate Clerk's JWT with Supabase's auth.jwt() function
3. Keep RLS enabled with proper policies
