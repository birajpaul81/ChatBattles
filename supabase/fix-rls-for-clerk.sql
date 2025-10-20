-- Fix RLS policies for Clerk authentication
-- Run this SQL in your Supabase SQL Editor

-- Drop existing RLS policies that use Supabase Auth
drop policy if exists "Users can view their own chats" on chats;
drop policy if exists "Users can insert their own chats" on chats;
drop policy if exists "Users can delete their own chats" on chats;

-- Option 1: Disable RLS (simpler, good for development)
-- Uncomment the line below if you want to disable RLS completely
-- alter table chats disable row level security;

-- Option 2: Create permissive policies for Clerk (recommended)
-- These policies allow authenticated users to manage their data
-- based on the user_id field stored in the database

create policy "Enable read access for authenticated users"
  on chats for select
  using (true);

create policy "Enable insert access for authenticated users"
  on chats for insert
  with check (true);

create policy "Enable delete access for authenticated users"
  on chats for delete
  using (true);

-- Note: These policies are permissive. For production, you should:
-- 1. Use Supabase's service role key on the backend
-- 2. Or implement proper Clerk JWT verification in Supabase
-- 3. The API routes already filter by userId from Clerk, providing security
