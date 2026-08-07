-- On signup, auto-provision a tenant + profile row from the tenant_name passed
-- in Supabase Auth signUp()'s options.data. security definer is required here
-- (and only here) because a trigger on auth.users needs elevated privilege to
-- write into public.* -- everything else in this schema stays security invoker
-- so RLS applies normally.
create or replace function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
