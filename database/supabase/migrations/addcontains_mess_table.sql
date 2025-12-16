create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamp with time zone default now()
);




-- create policy "Allow public insert"
-- on contact_messages
-- for insert
-- to anon
-- with check (true);
-- 