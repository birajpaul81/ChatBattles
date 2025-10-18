-- ChatBattles.ai Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create chats table
create table if not exists chats (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  prompt text,
  responses jsonb,
  created_at timestamp with time zone default now()
);

-- Create index on user_id for faster queries
create index if not exists chats_user_id_idx on chats(user_id);

-- Create index on created_at for sorting
create index if not exists chats_created_at_idx on chats(created_at desc);

-- Enable Row Level Security (RLS)
alter table chats enable row level security;

-- Create policy to allow users to view only their own chats
create policy "Users can view their own chats"
  on chats for select
  using (auth.jwt() ->> 'sub' = user_id);

-- Create policy to allow users to insert their own chats
create policy "Users can insert their own chats"
  on chats for insert
  with check (auth.jwt() ->> 'sub' = user_id);

-- Create policy to allow users to delete their own chats
create policy "Users can delete their own chats"
  on chats for delete
  using (auth.jwt() ->> 'sub' = user_id);

-- Note: If you're not using Supabase Auth (using Clerk instead),
-- you may need to adjust or disable RLS policies.
-- For development, you can disable RLS:
-- alter table chats disable row level security;

