-- Companies buying the product.
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'trial',       -- Phase D (Stripe) hook
  stripe_customer_id text,                   -- Phase D hook, unused for now
  created_at timestamptz not null default now()
);

-- Maps a Supabase Auth user to exactly one tenant (Phase A: single-tenant-per-user).
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  role text not null default 'owner',        -- room for 'admin'/'member' later
  created_at timestamptz not null default now()
);
create index profiles_tenant_id_idx on public.profiles(tenant_id);
