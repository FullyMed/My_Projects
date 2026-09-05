-- Phase D: per-tenant OpenAI usage metering.
--
-- Append-only ledger, deliberately separate from `candidate_insights` --
-- that table is a cache keyed by (candidate_id, job_description_id) and
-- gets overwritten on every regenerate, so it can't answer "how much did
-- this tenant actually spend this month." This table is never updated,
-- only inserted into, once per real OpenAI call.
--
-- No new column on `tenants` for the monthly limit: `tenants.plan` already
-- exists (added in 0002 as a Phase D hook) and the limit-per-plan mapping
-- lives in app code (app/services/usage_service.py) so it's one place to
-- tune and the Stripe webhook (a later Phase D step) only ever has to
-- update `tenants.plan`, not a separate limit column.

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  kind text not null default 'insight_generation',
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  created_at timestamptz not null default now()
);

create index usage_events_tenant_created_idx on public.usage_events(tenant_id, created_at);

alter table public.usage_events enable row level security;

create policy "usage_events_tenant_isolation" on public.usage_events
  for all using (tenant_id = (select private.current_tenant_id()))
  with check (tenant_id = (select private.current_tenant_id()));
