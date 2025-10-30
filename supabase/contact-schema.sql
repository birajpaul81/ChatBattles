-- Contact Form Submissions Table
-- Run this SQL in your Supabase SQL Editor

-- Create contact_submissions table
create table if not exists contact_submissions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists contact_submissions_status_idx on contact_submissions(status);
create index if not exists contact_submissions_created_at_idx on contact_submissions(created_at desc);
create index if not exists contact_submissions_email_idx on contact_submissions(email);

-- Enable Row Level Security (RLS)
alter table contact_submissions enable row level security;

-- Create policy to allow anyone to insert contact submissions (public form)
create policy "Anyone can submit contact form"
  on contact_submissions for insert
  with check (true);

-- Create policy to allow only authenticated admins to view submissions
-- Note: You'll need to adjust this based on your admin setup
-- For now, this allows service role access only (via API with service key)
create policy "Service role can view all submissions"
  on contact_submissions for select
  using (auth.role() = 'service_role');

-- Create policy to allow service role to update submissions (mark as read, etc.)
create policy "Service role can update submissions"
  on contact_submissions for update
  using (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_contact_submissions_updated_at
  before update on contact_submissions
  for each row
  execute function update_updated_at_column();

-- Optional: Create a view for unread messages count
create or replace view unread_contact_count as
select count(*) as unread_count
from contact_submissions
where status = 'unread';
