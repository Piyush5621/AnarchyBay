-- Migration: create resources table

create table if not exists public.resources (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid null,
  title text not null,
  description text null,
  category text null,
  tags jsonb null,
  visibility text default 'public',
  storage_path text not null,
  public_url text null,
  size bigint null,
  mime_type text null,
  created_at timestamptz default now()
);

-- Optional: index for owner_id and created_at for querying recent uploads
create index if not exists resources_owner_idx on public.resources (owner_id);
create index if not exists resources_created_idx on public.resources (created_at desc);
