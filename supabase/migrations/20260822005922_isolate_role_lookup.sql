-- Keep the SECURITY DEFINER role lookup internal to RLS helpers. The public
-- schema is exposed through PostgREST, so an internal helper must not be an
-- authenticated RPC surface.
begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.get_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
$$;

revoke all on function private.get_user_role() from public, anon;
grant execute on function private.get_user_role() to authenticated, service_role;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select private.get_user_role() = 'admin'
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
set search_path = ''
as $$
  select private.get_user_role() in ('staff', 'admin')
$$;

revoke all on function public.get_user_role() from public, anon, authenticated;

commit;
