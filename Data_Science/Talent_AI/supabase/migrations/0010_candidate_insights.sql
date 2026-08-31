-- Phase D: AI candidate insights.
--
-- One structured OpenAI call per (candidate, job) produces a summary,
-- strengths/weaknesses, missing qualifications, a hiring recommendation, and
-- tailored interview questions. That output is cached here so viewing the
-- same candidate-vs-job again is free, and so the token counts can be summed
-- per tenant for usage metering (the next Phase D step).
--
-- Only anonymized_text is ever sent to OpenAI (see
-- talent_ai_core/insights/insight_generator.py) -- no PII leaves the system.
--
-- RLS: same tenant-isolation shape as every other tenant-owned table. The
-- unique (candidate_id, job_description_id) pair makes regeneration an
-- upsert rather than an accumulating history.

create table public.candidate_insights (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_description_id uuid not null references public.job_descriptions(id) on delete cascade,
  insights jsonb not null,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, job_description_id)
);

create index candidate_insights_tenant_id_idx on public.candidate_insights(tenant_id);
create index candidate_insights_candidate_idx on public.candidate_insights(candidate_id);

alter table public.candidate_insights enable row level security;

create policy "candidate_insights_tenant_isolation" on public.candidate_insights
  for all using (tenant_id = (select private.current_tenant_id()))
  with check (tenant_id = (select private.current_tenant_id()));
