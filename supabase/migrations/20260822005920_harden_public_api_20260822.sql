-- Harden the production public API without changing or deleting existing data.
-- Baseline: remote_schema (20260818234304).
-- This migration intentionally targets the deployed UUID-based schema, not the
-- older local compatibility_pairs schema.

begin;

-- Keep all application-owned functions deterministic with respect to name
-- resolution. The existing function bodies already schema-qualify public calls.
alter function public.enforce_role_change_admin() set search_path to '';
alter function public.enforce_verification_approval() set search_path to '';
alter function public.get_user_role() set search_path to '';
alter function public.handle_new_user() set search_path to '';
alter function public.is_admin() set search_path to '';
alter function public.is_staff() set search_path to '';
alter function public.set_updated_at() set search_path to '';

-- The legacy trigger explicitly granted every newly authenticated identity the
-- staff role. Preserve the trigger contract but make its safe default viewer.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- SECURITY DEFINER routines must never inherit the default PUBLIC EXECUTE
-- privilege. get_user_role is required by authenticated RLS helper functions;
-- handle_new_user is invoked only by the auth trigger and has no API caller.
revoke all on function public.get_user_role() from public;
revoke all on function public.handle_new_user() from public;
grant execute on function public.get_user_role() to authenticated, service_role;

-- pg_trgm was installed in the exposed public schema. Move it only when the
-- installed extension reports that it is relocatable, preserving its objects
-- and the existing indexes that depend on them.
create schema if not exists extensions;
do $$
declare
  extension_is_relocatable boolean;
  extension_schema text;
begin
  select e.extrelocatable, n.nspname
    into extension_is_relocatable, extension_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';

  if extension_schema = 'public' and extension_is_relocatable then
    execute 'alter extension pg_trgm set schema extensions';
  end if;
end
$$;

-- Index foreign-key columns that are not already covered by an existing index.
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_phone_models_created_by on public.phone_models(created_by);
create index if not exists idx_phone_models_updated_by on public.phone_models(updated_by);
create index if not exists idx_phone_variants_created_by on public.phone_variants(created_by);
create index if not exists idx_compatibility_relationships_created_by on public.compatibility_relationships(created_by);
create index if not exists idx_compatibility_relationships_updated_by on public.compatibility_relationships(updated_by);
create index if not exists idx_compatibility_relationships_verified_by on public.compatibility_relationships(verified_by);
create index if not exists idx_compatibility_evidence_created_by on public.compatibility_evidence(created_by);

-- Data API grants are deliberately narrower than the default Supabase grants.
-- RLS below remains the row-level enforcement layer.
revoke all on table public.roles, public.profiles, public.accessory_categories,
  public.phone_models, public.phone_aliases, public.phone_variants,
  public.compatibility_relationships, public.compatibility_evidence from anon;
grant select on table public.roles, public.accessory_categories, public.phone_models,
  public.phone_aliases, public.phone_variants, public.compatibility_relationships,
  public.compatibility_evidence to anon;

grant select, insert, update, delete on table public.roles, public.profiles,
  public.accessory_categories, public.phone_models, public.phone_aliases,
  public.phone_variants, public.compatibility_relationships,
  public.compatibility_evidence to authenticated;

-- OAuth creates a profile through the existing auth trigger. New identities are
-- read-only until an administrator promotes them; never default them to staff.
insert into public.roles (slug, name, description)
values ('viewer', 'Viewer', 'Authenticated read-only user')
on conflict (slug) do nothing;
alter table public.profiles alter column role set default 'viewer';

-- Replace the previous broad and overlapping permissive policies with one
-- policy per command/role. Public means anon/authenticated and never grants
-- unverified compatibility data to anon users.
drop policy if exists "categories admin write" on public.accessory_categories;
drop policy if exists "categories select" on public.accessory_categories;
drop policy if exists "relationships admin delete" on public.compatibility_relationships;
drop policy if exists "relationships public select verified" on public.compatibility_relationships;
drop policy if exists "relationships staff insert" on public.compatibility_relationships;
drop policy if exists "relationships staff select all" on public.compatibility_relationships;
drop policy if exists "relationships staff update" on public.compatibility_relationships;
drop policy if exists "evidence admin delete" on public.compatibility_evidence;
drop policy if exists "evidence staff insert" on public.compatibility_evidence;
drop policy if exists "evidence staff select" on public.compatibility_evidence;
drop policy if exists "evidence staff update" on public.compatibility_evidence;
drop policy if exists "phone_aliases admin delete" on public.phone_aliases;
drop policy if exists "phone_aliases select" on public.phone_aliases;
drop policy if exists "phone_aliases staff insert" on public.phone_aliases;
drop policy if exists "phone_aliases staff update" on public.phone_aliases;
drop policy if exists "phone_models admin delete" on public.phone_models;
drop policy if exists "phone_models select" on public.phone_models;
drop policy if exists "phone_models staff insert" on public.phone_models;
drop policy if exists "phone_models staff update" on public.phone_models;
drop policy if exists "phone_variants admin delete" on public.phone_variants;
drop policy if exists "phone_variants select" on public.phone_variants;
drop policy if exists "phone_variants staff insert" on public.phone_variants;
drop policy if exists "phone_variants staff update" on public.phone_variants;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles select own or admin" on public.profiles;
drop policy if exists "profiles update own or admin" on public.profiles;
drop policy if exists "roles admin write" on public.roles;
drop policy if exists "roles select" on public.roles;

create policy "roles read reference data"
  on public.roles for select to anon, authenticated using (true);
create policy "roles admin insert"
  on public.roles for insert to authenticated with check ((select public.is_admin()));
create policy "roles admin update"
  on public.roles for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "roles admin delete"
  on public.roles for delete to authenticated using ((select public.is_admin()));

create policy "profiles read self or admin"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles admin update"
  on public.profiles for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "profiles admin delete"
  on public.profiles for delete to authenticated using ((select public.is_admin()));

create policy "categories read reference data"
  on public.accessory_categories for select to anon, authenticated using (true);
create policy "categories admin insert"
  on public.accessory_categories for insert to authenticated with check ((select public.is_admin()));
create policy "categories admin update"
  on public.accessory_categories for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories admin delete"
  on public.accessory_categories for delete to authenticated using ((select public.is_admin()));

create policy "phone models read reference data"
  on public.phone_models for select to anon, authenticated using (true);
create policy "phone models staff insert"
  on public.phone_models for insert to authenticated with check ((select public.is_staff()));
create policy "phone models staff update"
  on public.phone_models for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "phone models admin delete"
  on public.phone_models for delete to authenticated using ((select public.is_admin()));

create policy "phone aliases read reference data"
  on public.phone_aliases for select to anon, authenticated using (true);
create policy "phone aliases staff insert"
  on public.phone_aliases for insert to authenticated with check ((select public.is_staff()));
create policy "phone aliases staff update"
  on public.phone_aliases for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "phone aliases admin delete"
  on public.phone_aliases for delete to authenticated using ((select public.is_admin()));

create policy "phone variants read reference data"
  on public.phone_variants for select to anon, authenticated using (true);
create policy "phone variants staff insert"
  on public.phone_variants for insert to authenticated with check ((select public.is_staff()));
create policy "phone variants staff update"
  on public.phone_variants for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "phone variants admin delete"
  on public.phone_variants for delete to authenticated using ((select public.is_admin()));

create policy "relationships anon read verified"
  on public.compatibility_relationships for select to anon
  using (verification_status = 'verified');
create policy "relationships authenticated read verified or staff"
  on public.compatibility_relationships for select to authenticated
  using (verification_status = 'verified' or (select public.is_staff()));
create policy "relationships staff insert"
  on public.compatibility_relationships for insert to authenticated
  with check (
    (select public.is_staff())
    and (verification_status not in ('verified', 'rejected') or (select public.is_admin()))
  );
create policy "relationships staff update"
  on public.compatibility_relationships for update to authenticated
  using ((select public.is_staff()))
  with check (
    (select public.is_staff())
    and (verification_status not in ('verified', 'rejected') or (select public.is_admin()))
  );
create policy "relationships admin delete"
  on public.compatibility_relationships for delete to authenticated using ((select public.is_admin()));

create policy "evidence anon read verified relationships"
  on public.compatibility_evidence for select to anon
  using (
    exists (
      select 1 from public.compatibility_relationships relationship
      where relationship.id = relationship_id
        and relationship.verification_status = 'verified'
    )
  );
create policy "evidence authenticated read verified or staff"
  on public.compatibility_evidence for select to authenticated
  using (
    (select public.is_staff()) or exists (
      select 1 from public.compatibility_relationships relationship
      where relationship.id = relationship_id
        and relationship.verification_status = 'verified'
    )
  );
create policy "evidence staff insert"
  on public.compatibility_evidence for insert to authenticated with check ((select public.is_staff()));
create policy "evidence staff update"
  on public.compatibility_evidence for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "evidence admin delete"
  on public.compatibility_evidence for delete to authenticated using ((select public.is_admin()));

commit;
