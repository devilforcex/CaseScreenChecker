-- Optional, measured geometry for screen-protector fit. Existing records remain
-- valid, but the client will require a physical check until these values exist.
begin;

alter table public.phone_models
  add column if not exists screen_width_mm numeric(6,2),
  add column if not exists screen_height_mm numeric(6,2),
  add column if not exists screen_corner_radius_mm numeric(5,2),
  add column if not exists screen_cutout_width_mm numeric(5,2),
  add column if not exists screen_cutout_height_mm numeric(5,2),
  add column if not exists edge_to_edge_compatible boolean,
  add column if not exists screen_geometry_source text,
  add column if not exists screen_geometry_verified_at timestamptz,
  add column if not exists screen_geometry_verified_by uuid references public.profiles(id);

alter table public.phone_models
  add constraint phone_models_screen_corner_radius_nonnegative
    check (screen_corner_radius_mm is null or screen_corner_radius_mm >= 0) not valid,
  add constraint phone_models_screen_cutout_width_positive
    check (screen_cutout_width_mm is null or screen_cutout_width_mm > 0) not valid,
  add constraint phone_models_screen_cutout_height_positive
    check (screen_cutout_height_mm is null or screen_cutout_height_mm > 0) not valid;

alter table public.phone_models validate constraint phone_models_screen_corner_radius_nonnegative;
alter table public.phone_models validate constraint phone_models_screen_cutout_width_positive;
alter table public.phone_models validate constraint phone_models_screen_cutout_height_positive;

comment on column public.phone_models.screen_width_mm is 'Measured active display/glass width for protector matching.';
comment on column public.phone_models.screen_height_mm is 'Measured active display/glass height for protector matching.';
comment on column public.phone_models.screen_geometry_source is 'Evidence source: staff_measurement, oem_specification, or physical_test.';

create or replace function public.create_phone_model_with_aliases(model_payload jsonb, aliases text[] default '{}')
returns uuid language plpgsql security invoker set search_path = '' as $$
declare new_model_id uuid; clean_aliases text[];
begin
  if not public.is_staff() then raise exception 'Staff access is required to create a phone model.' using errcode = '42501'; end if;
  if model_payload is null or jsonb_typeof(model_payload) <> 'object' then raise exception 'A phone model payload is required.' using errcode = '22023'; end if;
  select coalesce(array_agg(alias order by alias), '{}') into clean_aliases from (
    select distinct trim(value) as alias from unnest(coalesce(aliases, '{}')) as raw(value) where length(trim(value)) between 1 and 128
  ) normalized;
  insert into public.phone_models (
    slug, brand, name, full_name, release_year, status, height_mm, width_mm, thickness_mm, weight_g,
    screen_diagonal_in, screen_width_mm, screen_height_mm, screen_corner_radius_mm, screen_cutout_width_mm, screen_cutout_height_mm, edge_to_edge_compatible,
    screen_curvature, notch_type, aspect_ratio, has_curved_edges, camera_shape, camera_lens_count, camera_bump_height_mm, camera_island_width_mm, camera_island_height_mm, camera_position,
    has_headphone_jack, fingerprint_sensor, port_type, button_layout, notes, image_url, created_by, updated_by
  ) values (
    model_payload->>'slug', model_payload->>'brand', model_payload->>'name', model_payload->>'full_name', nullif(model_payload->>'release_year', '')::integer,
    coalesce(nullif(model_payload->>'status', ''), 'active'), (model_payload->>'height_mm')::numeric, (model_payload->>'width_mm')::numeric, (model_payload->>'thickness_mm')::numeric,
    nullif(model_payload->>'weight_g', '')::numeric, (model_payload->>'screen_diagonal_in')::numeric, nullif(model_payload->>'screen_width_mm', '')::numeric,
    nullif(model_payload->>'screen_height_mm', '')::numeric, nullif(model_payload->>'screen_corner_radius_mm', '')::numeric,
    nullif(model_payload->>'screen_cutout_width_mm', '')::numeric, nullif(model_payload->>'screen_cutout_height_mm', '')::numeric,
    nullif(model_payload->>'edge_to_edge_compatible', '')::boolean, model_payload->>'screen_curvature', model_payload->>'notch_type', nullif(model_payload->>'aspect_ratio', ''),
    coalesce((model_payload->>'has_curved_edges')::boolean, false), model_payload->>'camera_shape', (model_payload->>'camera_lens_count')::smallint,
    nullif(model_payload->>'camera_bump_height_mm', '')::numeric, nullif(model_payload->>'camera_island_width_mm', '')::numeric,
    nullif(model_payload->>'camera_island_height_mm', '')::numeric, model_payload->>'camera_position', coalesce((model_payload->>'has_headphone_jack')::boolean, false),
    model_payload->>'fingerprint_sensor', model_payload->>'port_type', model_payload->>'button_layout', nullif(model_payload->>'notes', ''), nullif(model_payload->>'image_url', ''),
    (select auth.uid()), (select auth.uid())
  ) returning id into new_model_id;
  insert into public.phone_aliases (model_id, alias, alias_kind) select new_model_id, alias, 'common_name' from unnest(clean_aliases) as normalized(alias);
  return new_model_id;
end;
$$;
revoke all on function public.create_phone_model_with_aliases(jsonb, text[]) from public, anon;
grant execute on function public.create_phone_model_with_aliases(jsonb, text[]) to authenticated;

-- A verified relationship must be accompanied by evidence in the same transaction.
-- The deferred trigger allows the staff RPC below to create the relationship and
-- its evidence atomically, while rejecting direct verified inserts without proof.
create or replace function public.ensure_verified_relationship_evidence()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.verification_status = 'verified' and not exists (
    select 1 from public.compatibility_evidence evidence where evidence.relationship_id = new.id
  ) then
    raise exception 'Verified compatibility relationships require evidence.' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.ensure_verified_relationship_evidence() from public, anon, authenticated;

drop trigger if exists compatibility_relationship_verified_evidence on public.compatibility_relationships;
create constraint trigger compatibility_relationship_verified_evidence
after insert or update of verification_status on public.compatibility_relationships
deferrable initially deferred for each row execute function public.ensure_verified_relationship_evidence();

create or replace function public.create_compatibility_relationship_with_evidence(pair_payload jsonb)
returns uuid[] language plpgsql security invoker set search_path = '' as $$
declare
  device_a uuid; device_b uuid; category_slug text; category_record record;
  verification text; relationship_id uuid; relationship_ids uuid[] := '{}';
begin
  if not public.is_staff() then raise exception 'Staff access is required to create a relationship.' using errcode = '42501'; end if;
  if pair_payload is null or jsonb_typeof(pair_payload) <> 'object' then raise exception 'A relationship payload is required.' using errcode = '22023'; end if;
  if coalesce(trim(pair_payload->>'fit_notes'), '') = '' or coalesce(trim(pair_payload->>'evidence_title'), '') = '' then
    raise exception 'Fit notes and evidence title are required.' using errcode = '22023';
  end if;
  select id into device_a from public.phone_models where slug = pair_payload->>'source_model_id';
  select id into device_b from public.phone_models where slug = pair_payload->>'target_model_id';
  if device_a is null or device_b is null or device_a = device_b then raise exception 'Two distinct catalog models are required.' using errcode = '22023'; end if;
  verification := case when coalesce((pair_payload->>'is_verified')::boolean, false) then 'verified' else 'candidate' end;
  if verification = 'verified' and not public.is_admin() then raise exception 'Only an administrator can verify a relationship.' using errcode = '42501'; end if;
  for category_record in select id from public.accessory_categories where slug = any(case when pair_payload->>'category' = 'all_accessories' then array['screen_protector', 'phone_case'] else array[pair_payload->>'category'] end) and is_active loop
    insert into public.compatibility_relationships (
      device_a_id, device_b_id, category_id, relationship_status, confidence_level, confidence_score, fit_notes, caveats, origin, verification_status, verified_at, verified_by
    ) values (
      device_a, device_b, category_record.id,
      case when pair_payload->>'confidence_level' = 'NOT_COMPATIBLE' then 'not_compatible' else 'compatible' end,
      pair_payload->>'confidence_level', (pair_payload->>'confidence_score')::integer, pair_payload->>'fit_notes', nullif(pair_payload->>'caveats', ''), 'manual', verification,
      case when verification = 'verified' then now() else null end, case when verification = 'verified' then (select auth.uid()) else null end
    ) returning id into relationship_id;
    insert into public.compatibility_evidence (relationship_id, source_type, source_title, claim, evidence_text, confidence_score, verification_state)
    values (relationship_id, coalesce(nullif(pair_payload->>'evidence_type', ''), 'staff_test'), pair_payload->>'evidence_title', pair_payload->>'fit_notes', nullif(pair_payload->>'caveats', ''), (pair_payload->>'confidence_score')::integer, verification);
    relationship_ids := array_append(relationship_ids, relationship_id);
  end loop;
  if coalesce(array_length(relationship_ids, 1), 0) = 0 then raise exception 'Accessory category is not active.' using errcode = '22023'; end if;
  return relationship_ids;
end;
$$;
revoke all on function public.create_compatibility_relationship_with_evidence(jsonb) from public, anon;
grant execute on function public.create_compatibility_relationship_with_evidence(jsonb) to authenticated;

commit;
