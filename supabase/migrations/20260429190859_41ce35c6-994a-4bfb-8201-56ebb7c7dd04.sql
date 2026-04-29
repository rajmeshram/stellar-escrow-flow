
-- =========================
-- Profiles
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  stellar_pubkey text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, stellar_pubkey)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'stellar_pubkey'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================
-- Escrow Contracts
-- =========================
create type public.escrow_status as enum ('draft','funded','in_progress','completed','cancelled');
create type public.asset_type as enum ('XLM','USDC');
create type public.network_type as enum ('testnet','mainnet');

create table public.escrow_contracts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  client_address text not null,
  creator_address text not null,
  total_amount numeric(20,7) not null check (total_amount > 0),
  asset public.asset_type not null default 'XLM',
  network public.network_type not null default 'testnet',
  status public.escrow_status not null default 'draft',
  soroban_contract_id text,
  funding_tx_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.escrow_contracts enable row level security;

create trigger trg_escrows_updated_at
  before update on public.escrow_contracts
  for each row execute function public.set_updated_at();

-- Helper: get caller stellar pubkey
create or replace function public.current_stellar_pubkey()
returns text
language sql stable security definer set search_path = public
as $$
  select stellar_pubkey from public.profiles where id = auth.uid();
$$;

create policy "Escrows visible to parties"
  on public.escrow_contracts for select
  using (
    auth.uid() = owner_id
    or client_address = public.current_stellar_pubkey()
    or creator_address = public.current_stellar_pubkey()
  );

create policy "Escrows insert by owner"
  on public.escrow_contracts for insert
  with check (auth.uid() = owner_id);

create policy "Escrows update by owner or client"
  on public.escrow_contracts for update
  using (
    auth.uid() = owner_id
    or client_address = public.current_stellar_pubkey()
  );

create policy "Escrows delete by owner"
  on public.escrow_contracts for delete
  using (auth.uid() = owner_id);

-- =========================
-- Milestones
-- =========================
create type public.milestone_status as enum ('pending','approved','released');

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.escrow_contracts(id) on delete cascade,
  order_index int not null check (order_index between 1 and 5),
  title text not null,
  amount numeric(20,7) not null check (amount > 0),
  status public.milestone_status not null default 'pending',
  release_tx_hash text,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contract_id, order_index)
);

alter table public.milestones enable row level security;

create trigger trg_milestones_updated_at
  before update on public.milestones
  for each row execute function public.set_updated_at();

-- Limit to 5 milestones per contract
create or replace function public.enforce_milestone_limit()
returns trigger language plpgsql as $$
declare
  c int;
begin
  select count(*) into c from public.milestones where contract_id = new.contract_id;
  if c >= 5 then
    raise exception 'A contract can have at most 5 milestones';
  end if;
  return new;
end;
$$;

create trigger trg_milestone_limit
  before insert on public.milestones
  for each row execute function public.enforce_milestone_limit();

create policy "Milestones visible to contract parties"
  on public.milestones for select
  using (
    exists (
      select 1 from public.escrow_contracts c
      where c.id = milestones.contract_id
        and (
          c.owner_id = auth.uid()
          or c.client_address = public.current_stellar_pubkey()
          or c.creator_address = public.current_stellar_pubkey()
        )
    )
  );

create policy "Milestones insert by contract owner"
  on public.milestones for insert
  with check (
    exists (
      select 1 from public.escrow_contracts c
      where c.id = milestones.contract_id and c.owner_id = auth.uid()
    )
  );

create policy "Milestones update by client or owner"
  on public.milestones for update
  using (
    exists (
      select 1 from public.escrow_contracts c
      where c.id = milestones.contract_id
        and (c.owner_id = auth.uid() or c.client_address = public.current_stellar_pubkey())
    )
  );

create policy "Milestones delete by owner"
  on public.milestones for delete
  using (
    exists (
      select 1 from public.escrow_contracts c
      where c.id = milestones.contract_id and c.owner_id = auth.uid()
    )
  );

-- =========================
-- Audit Logs
-- =========================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.escrow_contracts(id) on delete cascade,
  actor_address text,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Audit logs visible to contract parties"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.escrow_contracts c
      where c.id = audit_logs.contract_id
        and (
          c.owner_id = auth.uid()
          or c.client_address = public.current_stellar_pubkey()
          or c.creator_address = public.current_stellar_pubkey()
        )
    )
  );

create policy "Audit logs insert by parties"
  on public.audit_logs for insert
  with check (
    exists (
      select 1 from public.escrow_contracts c
      where c.id = audit_logs.contract_id
        and (
          c.owner_id = auth.uid()
          or c.client_address = public.current_stellar_pubkey()
          or c.creator_address = public.current_stellar_pubkey()
        )
    )
  );
