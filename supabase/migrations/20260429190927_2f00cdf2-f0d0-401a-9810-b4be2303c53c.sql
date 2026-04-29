
-- Fix mutable search_path
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.enforce_milestone_limit()
returns trigger language plpgsql
set search_path = public
as $$
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

-- Revoke public execute on security definer functions
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.current_stellar_pubkey() from public, anon;
grant execute on function public.current_stellar_pubkey() to authenticated;
