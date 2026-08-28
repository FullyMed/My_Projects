-- Phase C: push semantic ranking into Postgres.
--
-- Before this, ranking a job pulled every one of a tenant's candidate rows
-- into the API process and built a throwaway in-memory FAISS index per
-- request. This RPC does the same nearest-neighbour search as a single
-- query against the HNSW cosine index already created in 0003
-- (candidates_embedding_idx), so ranking is O(log n) in the DB instead of
-- O(n) in app memory, and the embedding model is no longer on the re-rank
-- path at all.
--
-- SECURITY INVOKER (the default, stated explicitly): the function runs as
-- the calling role, so the existing candidates_tenant_isolation RLS policy
-- still restricts the scan to the caller's own tenant. There is deliberately
-- no tenant_id argument -- isolation is not this function's job to enforce.
--
-- `vector` was moved to the `extensions` schema in 0007, hence the
-- schema-qualified parameter type and the search_path (which also lets the
-- `<=>` operator resolve and satisfies the function_search_path_mutable
-- advisor lint).

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

grant execute on function public.match_candidates(extensions.vector(384), int) to authenticated;
