alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.candidates enable row level security;
alter table public.job_descriptions enable row level security;
alter table public.match_results enable row level security;

-- Helper: reads the caller's own tenant_id. security definer so it can read
-- profiles regardless of the caller's own RLS on profiles; wrapped in `select`
-- so Postgres caches the result once per statement (Supabase's documented
-- RLS perf pattern) rather than re-evaluating it per row.
create or replace function public.current_tenant_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

-- profiles: a user may read/update only their own row.
create policy "profiles_self_select" on public.profiles
  for select using (id = (select auth.uid()));
create policy "profiles_self_update" on public.profiles
  for update using (id = (select auth.uid()));

-- tenants: members can read their own tenant row.
create policy "tenants_select_own" on public.tenants
  for select using (id = (select public.current_tenant_id()));

-- candidates / job_descriptions / match_results: full tenant isolation --
-- this is the actual isolation mechanism, not app-code filtering.
create policy "candidates_tenant_isolation" on public.candidates
  for all using (tenant_id = (select public.current_tenant_id()))
  with check (tenant_id = (select public.current_tenant_id()));

create policy "job_descriptions_tenant_isolation" on public.job_descriptions
  for all using (tenant_id = (select public.current_tenant_id()))
  with check (tenant_id = (select public.current_tenant_id()));

create policy "match_results_tenant_isolation" on public.match_results
  for all using (tenant_id = (select public.current_tenant_id()))
  with check (tenant_id = (select public.current_tenant_id()));
