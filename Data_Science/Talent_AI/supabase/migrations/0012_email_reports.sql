-- Phase E, Part 2b: opt-in weekly shortlist email per job.
--
-- The toggle column is covered by the existing job_descriptions RLS policy
-- (0005/0007) -- no new policy needed, a tenant member can already read/
-- write their own job rows.
alter table public.job_descriptions
  add column email_reports_enabled boolean not null default false;

-- A tenant-explicit twin of match_candidates (0009). The weekly report run
-- has no user session (it's triggered by a scheduler, not a browser), so it
-- uses the service_role client -- which bypasses RLS entirely. Calling the
-- existing SECURITY INVOKER match_candidates with that client would search
-- every tenant's candidates, not just the report's job's tenant. This
-- variant takes the tenant explicitly instead of relying on RLS to scope it,
-- so it's still safe under an RLS-bypassing client. It intentionally does
-- NOT lower the bar for anyone else: PostgREST callers can still invoke it
-- (it's SECURITY INVOKER, same as match_candidates), but a normal tenant's
-- RLS-scoped client can only ever pass its own tenant_id and get back what
-- match_candidates would already give it -- so this adds no privilege for
-- a regular caller, only an explicit target for the admin-client caller.
create or replace function public.match_candidates_for_tenant(
  query_embedding extensions.vector(384),
  p_tenant_id uuid,
  match_count int default 10
)
returns table (
  id uuid,
  source_path text,
  category text,
  skills text[],
  score double precision
)
language sql
stable
security invoker
set search_path = extensions, public
as $$
  select
    c.id,
    c.source_path,
    c.category,
    c.skills,
    1 - (c.embedding <=> query_embedding) as score
  from public.candidates c
  where c.embedding is not null
    and c.tenant_id = p_tenant_id
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 0)
$$;

grant execute on function public.match_candidates_for_tenant(extensions.vector(384), uuid, int) to authenticated;
