-- Votes Table Schema for ChatBattles
-- Run this SQL in your Supabase SQL Editor to add vote tracking

-- Create votes table
create table if not exists votes (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  chat_id uuid references chats(id) on delete cascade,
  model text not null,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index if not exists votes_user_id_idx on votes(user_id);
create index if not exists votes_chat_id_idx on votes(chat_id);
create index if not exists votes_model_idx on votes(model);
create index if not exists votes_created_at_idx on votes(created_at desc);

-- Create composite index for user+model to prevent duplicate votes
create unique index if not exists votes_user_chat_model_idx on votes(user_id, chat_id, model);

-- Enable Row Level Security (RLS)
alter table votes enable row level security;

-- Create policy to allow users to view all votes (for statistics)
create policy "Users can view all votes"
  on votes for select
  using (true);

-- Create policy to allow users to insert their own votes
create policy "Users can insert their own votes"
  on votes for insert
  with check (auth.jwt() ->> 'sub' = user_id);

-- Create policy to allow users to update their own votes
create policy "Users can update their own votes"
  on votes for update
  using (auth.jwt() ->> 'sub' = user_id);

-- Create policy to allow users to delete their own votes
create policy "Users can delete their own votes"
  on votes for delete
  using (auth.jwt() ->> 'sub' = user_id);

-- Note: If you're using Clerk instead of Supabase Auth,
-- you may need to adjust RLS policies or disable them for development:
-- alter table votes disable row level security;
