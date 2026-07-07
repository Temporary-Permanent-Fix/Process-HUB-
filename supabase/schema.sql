-- Process HUB — run this once in the Supabase project's SQL editor.

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

-- Shared internal dashboard: any signed-in user may read/write any tool.
-- There is no per-user ownership — all authenticated teammates see the same data.
create policy "Authenticated users can read tools"
  on public.tools for select
  to authenticated
  using (true);

create policy "Authenticated users can insert tools"
  on public.tools for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update tools"
  on public.tools for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete tools"
  on public.tools for delete
  to authenticated
  using (true);

-- Enable realtime change broadcasts so every open tab reflects edits live.
alter publication supabase_realtime add table public.tools;

-- Seed data — safe to re-run, ids are fixed so it won't duplicate.
insert into public.tools (id, name, icon, purpose, status, url, note, created_at)
values
  ('seed-zjazdyapp', 'ZjazdyApp', 'Mountain', 'analyza', 'vyvoj', null,
   'Analýza zjazdov, čaká na dátový feed z prevádzky.', extract(epoch from now()) * 1000 - 1000 * 60 * 60 * 24 * 3),
  ('seed-kibana-tms', 'Kibana – TMS monitoring', 'Activity', 'analyza', 'online', 'https://kibana.internal/tms',
   'Monitoring transportného systému v reálnom čase.', extract(epoch from now()) * 1000 - 1000 * 60 * 60 * 24 * 10),
  ('seed-sklc3', 'SKLC3 kapacitný kalkulátor', 'Boxes', 'predikcia', 'chyba', null,
   'Predikcia kapacity skladu SKLC3, čaká na nasadenie.', extract(epoch from now()) * 1000 - 1000 * 60 * 60 * 24 * 1)
on conflict (id) do nothing;
