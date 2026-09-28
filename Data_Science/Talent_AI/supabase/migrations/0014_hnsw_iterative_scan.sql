-- Make tenant-filtered vector search return a full top-K at multi-tenant scale.
--
-- candidates_embedding_idx (0003) is one HNSW index over every tenant's rows.
-- Without iterative scans, an index scan returns at most hnsw.ef_search (40)
-- nearest rows globally, and only *then* is the tenant filter applied (RLS in
-- match_candidates, the explicit tenant_id predicate in
-- match_candidates_for_tenant). Once other tenants' candidates crowd that
-- neighbourhood, a tenant can get fewer than match_count results -- or none --
-- even though it has plenty of candidates. pgvector >= 0.8 can keep scanning
-- the index until enough rows survive the filter; it's off by default, so turn
-- it on per function. strict_order keeps results exactly distance-ordered, so
-- the ORDER BY needs no re-sort.
--
-- Bodies are unchanged from 0009/0012; `create or replace` keeps their grants.

create or replace function public.match_candidates(
  query_embedding extensions.vector(384),
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
set hnsw.iterative_scan = 'strict_order'
as $$
  select
    c.id,
    c.source_path,
    c.category,
    c.skills,
    1 - (c.embedding <=> query_embedding) as score
  from public.candidates c
  where c.embedding is not null
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 0)
$$;

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
set hnsw.iterative_scan = 'strict_order'
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
