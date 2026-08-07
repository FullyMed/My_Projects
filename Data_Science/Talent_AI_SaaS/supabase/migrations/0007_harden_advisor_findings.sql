-- Fixes from get_advisors (security):
-- 1. `vector` extension was installed in `public` -- move to a dedicated schema.
-- 2. `current_tenant_id()`/`handle_new_user()` were exposed as public PostgREST
--    RPC endpoints (/rest/v1/rpc/...) just by living in `public`, even though
--    they're only meant to be called from RLS policies / the auth trigger.
--    Moving them into `private` (not in PostgREST's exposed schema list)
--    removes the RPC exposure while RLS policies can still call the
--    fully-qualified function.

create schema if not exists extensions;
alter extension vector set schema extensions;

create schema if not exists private;

create or replace function private.current_tenant_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;
grant execute on function private.current_tenant_id() to anon, authenticated;

drop policy "tenants_select_own" on public.tenants;
create policy "tenants_select_own" on public.tenants
  for select using (id = (select private.current_tenant_id()));

drop policy "candidates_tenant_isolation" on public.candidates;
create policy "candidates_tenant_isolation" on public.candidates
  for all using (tenant_id = (select private.current_tenant_id()))
  with check (tenant_id = (select private.current_tenant_id()));

drop policy "job_descriptions_tenant_isolation" on public.job_descriptions;
create policy "job_descriptions_tenant_isolation" on public.job_descriptions
  for all using (tenant_id = (select private.current_tenant_id()))
  with check (tenant_id = (select private.current_tenant_id()));

drop policy "match_results_tenant_isolation" on public.match_results;
create policy "match_results_tenant_isolation" on public.match_results
  for all using (tenant_id = (select private.current_tenant_id()))
  with check (tenant_id = (select private.current_tenant_id()));

drop policy "resumes_tenant_isolation_select" on storage.objects;
create policy "resumes_tenant_isolation_select" on storage.objects
  for select using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select private.current_tenant_id())::text
  );

drop policy "resumes_tenant_isolation_insert" on storage.objects;
create policy "resumes_tenant_isolation_insert" on storage.objects
  for insert with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select private.current_tenant_id())::text
  );

drop function public.current_tenant_id();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  insert into public.tenants (name, slug)
  values (
    coalesce(new.raw_user_meta_data->>'tenant_name', 'My Company'),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'tenant_name', new.id::text), '[^a-zA-Z0-9]+', '-', 'gi'))
      || '-' || substr(new.id::text, 1, 8)
  )
  returning id into new_tenant_id;

  insert into public.profiles (id, tenant_id, email)
  values (new.id, new_tenant_id, new.email);

  return new;
end;
$$;

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop function public.handle_new_user();
