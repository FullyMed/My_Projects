-- tenant_id is duplicated onto every tenant-owned table on purpose: it keeps
-- every RLS policy a plain equality check instead of a join.

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  source_path text not null,                 -- Supabase Storage object key
  category text,
  raw_text text not null,
  anonymized_text text not null,
  skills text[] not null default '{}',
  education text[] not null default '{}',
  experience text[] not null default '{}',
  embedding vector(384),                     -- matches all-MiniLM-L6-v2 output
  created_at timestamptz not null default now()
);
create index candidates_tenant_id_idx on public.candidates(tenant_id);
create index candidates_embedding_idx on public.candidates
  using hnsw (embedding vector_cosine_ops);

create table public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  raw_text text not null,
  required_skills text[] not null default '{}',
  embedding vector(384),
  created_at timestamptz not null default now()
);
create index job_descriptions_tenant_id_idx on public.job_descriptions(tenant_id);

create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  job_description_id uuid not null references public.job_descriptions(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  score float8 not null,
  rank int not null,
  created_at timestamptz not null default now()
);
create index match_results_tenant_id_idx on public.match_results(tenant_id);
create index match_results_job_idx on public.match_results(job_description_id);
