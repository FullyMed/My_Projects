-- Two RLS gaps that let a signed-in user bypass what the rest of the schema
-- relies on, both reachable by calling PostgREST directly with the anon key +
-- the user's own JWT (no FastAPI involved).
--
-- 1. profiles: `profiles_self_update` (0005) had a USING clause but no WITH
--    CHECK, and `authenticated` has table-wide UPDATE. So a user could PATCH
--    their own row's `tenant_id` to any other tenant's id -- and since every
--    tenant-isolation policy resolves the caller's tenant through
--    private.current_tenant_id() (a lookup on this very column), that moved
--    them into the other tenant wholesale: candidates, jobs, resume files.
--    Tenant ids aren't secret enough to rely on (they're the first segment of
--    every resume Storage path, including signed "View resume" URLs).
--    Nothing in the app updates profiles -- the row is written once by the
--    signup trigger (security definer, unaffected by this) -- so the fix is
--    to remove the ability entirely rather than try to scope it per column.
--
-- 2. usage_events: the 0011 policy was `for all`, so a tenant could DELETE or
--    UPDATE its own ledger rows and reset its monthly OpenAI token budget
--    (usage_service.ensure_within_budget sums this table). The ledger is
--    meant to be append-only; the app only ever SELECTs and INSERTs here
--    (usage_service.get_usage_summary / record_usage), so users get exactly
--    those two.

drop policy "profiles_self_update" on public.profiles;
revoke update on public.profiles from anon, authenticated;

drop policy "usage_events_tenant_isolation" on public.usage_events;

create policy "usage_events_tenant_select" on public.usage_events
  for select using (tenant_id = (select private.current_tenant_id()));

create policy "usage_events_tenant_insert" on public.usage_events
  for insert with check (tenant_id = (select private.current_tenant_id()));

revoke update, delete, truncate on public.usage_events from anon, authenticated;
