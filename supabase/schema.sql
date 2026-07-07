-- Process HUB — run this in the Supabase project's SQL editor.
-- Safe to re-run: every statement is idempotent.

-- ========== tools ==========
create table if not exists public.tools (
  id text primary key,
  name text not null,
  icon text not null,
  purpose text not null check (purpose in ('analyza', 'predikcia', 'fakturacia')),
  status text not null check (status in ('online', 'vyvoj', 'chyba')),
  url text,
  note text,
  created_at bigint not null
);

alter table public.tools enable row level security;

-- ========== profiles (username + role) ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  role text not null default 'user' check (role in ('user', 'admin', 'mega_admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile row for every new signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users who signed up before this trigger existed.
insert into public.profiles (id, username)
select u.id, coalesce(u.raw_user_meta_data ->> 'username', split_part(u.email, '@', 1))
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- Promote the designated mega admin. Re-run any time to (re)grant it.
update public.profiles set role = 'mega_admin' where username = 'SerhiiBerdar';

-- Reads the acting user's role. SECURITY DEFINER + owned by postgres so it
-- bypasses RLS internally — avoids infinite recursion in the profiles policy
-- below, which itself calls this function.
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ---- profiles policies ----
drop policy if exists "Users can read own profile, admins read all" on public.profiles;
create policy "Users can read own profile, admins read all"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.current_user_role() in ('admin', 'mega_admin'));

drop policy if exists "Mega admin can change roles" on public.profiles;
create policy "Mega admin can change roles"
  on public.profiles for update
  to authenticated
  using (public.current_user_role() = 'mega_admin')
  with check (public.current_user_role() = 'mega_admin');

-- ---- tools policies ----
-- Everyone signed in can view tools; only admin/mega_admin can change them.
drop policy if exists "Authenticated users can read tools" on public.tools;
create policy "Authenticated users can read tools"
  on public.tools for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert tools" on public.tools;
drop policy if exists "Admins can insert tools" on public.tools;
create policy "Admins can insert tools"
  on public.tools for insert
  to authenticated
  with check (public.current_user_role() in ('admin', 'mega_admin'));

drop policy if exists "Authenticated users can update tools" on public.tools;
drop policy if exists "Admins can update tools" on public.tools;
create policy "Admins can update tools"
  on public.tools for update
  to authenticated
  using (public.current_user_role() in ('admin', 'mega_admin'))
  with check (public.current_user_role() in ('admin', 'mega_admin'));

drop policy if exists "Authenticated users can delete tools" on public.tools;
drop policy if exists "Admins can delete tools" on public.tools;
create policy "Admins can delete tools"
  on public.tools for delete
  to authenticated
  using (public.current_user_role() in ('admin', 'mega_admin'));

-- ========== issues ==========
create extension if not exists pgcrypto;

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (
    category in ('shuttle', 'autostore', 'pick', 'pack', 'stow', 'receive', 'reverse_logistics', 'expedition')
  ),
  priority text not null check (priority in ('nizka', 'stredna', 'vysoka')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reporter_username text not null,
  assignee_id uuid references auth.users (id) on delete set null,
  assignee_username text,
  attachments jsonb not null default '[]'::jsonb,
  created_at bigint not null
);

alter table public.issues enable row level security;

create table if not exists public.issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  author_username text not null,
  body text not null,
  created_at bigint not null
);

alter table public.issue_comments enable row level security;

-- ---- issues policies ----
-- Shared visibility: every signed-in user sees every issue.
drop policy if exists "Authenticated users can read issues" on public.issues;
create policy "Authenticated users can read issues"
  on public.issues for select
  to authenticated
  using (true);

-- Anyone can report an issue, but only as themselves.
drop policy if exists "Authenticated users can create issues" on public.issues;
create policy "Authenticated users can create issues"
  on public.issues for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- Only admins change status/assignee.
drop policy if exists "Admins can update issues" on public.issues;
create policy "Admins can update issues"
  on public.issues for update
  to authenticated
  using (public.current_user_role() in ('admin', 'mega_admin'))
  with check (public.current_user_role() in ('admin', 'mega_admin'));

drop policy if exists "Admins can delete issues" on public.issues;
create policy "Admins can delete issues"
  on public.issues for delete
  to authenticated
  using (public.current_user_role() in ('admin', 'mega_admin'));

-- ---- issue_comments policies ----
-- Append-only conversation: everyone reads, everyone can post as themselves,
-- nobody edits or deletes (no update/delete policy defined).
drop policy if exists "Authenticated users can read issue comments" on public.issue_comments;
create policy "Authenticated users can read issue comments"
  on public.issue_comments for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can add issue comments" on public.issue_comments;
create policy "Authenticated users can add issue comments"
  on public.issue_comments for insert
  to authenticated
  with check (author_id = auth.uid());

-- ---- issue media storage ----
insert into storage.buckets (id, name, public)
values ('issue-media', 'issue-media', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated can upload issue media" on storage.objects;
create policy "Authenticated can upload issue media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'issue-media');

-- ---- realtime ----
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tools'
  ) then
    alter publication supabase_realtime add table public.tools;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'issues'
  ) then
    alter publication supabase_realtime add table public.issues;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'issue_comments'
  ) then
    alter publication supabase_realtime add table public.issue_comments;
  end if;
end $$;

-- ---- seed data (safe to re-run, fixed ids won't duplicate) ----
insert into public.tools (id, name, icon, purpose, status, url, note, created_at)
values
  ('seed-zjazdyapp', 'ZjazdyApp', 'Mountain', 'analyza', 'vyvoj', null,
   'Analýza zjazdov, čaká na dátový feed z prevádzky.', extract(epoch from now()) * 1000 - 1000 * 60 * 60 * 24 * 3),
  ('seed-kibana-tms', 'Kibana – TMS monitoring', 'Activity', 'analyza', 'online', 'https://kibana.internal/tms',
   'Monitoring transportného systému v reálnom čase.', extract(epoch from now()) * 1000 - 1000 * 60 * 60 * 24 * 10),
  ('seed-sklc3', 'SKLC3 kapacitný kalkulátor', 'Boxes', 'predikcia', 'chyba', null,
   'Predikcia kapacity skladu SKLC3, čaká na nasadenie.', extract(epoch from now()) * 1000 - 1000 * 60 * 60 * 24 * 1)
on conflict (id) do nothing;
