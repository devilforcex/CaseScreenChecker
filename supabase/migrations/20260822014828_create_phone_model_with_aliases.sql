-- Add a single transaction boundary for the staff "research -> catalog" flow.
-- The browser sends the already validated snake_case model payload; database
-- checks and RLS remain authoritative.
begin;

create or replace function public.create_phone_model_with_aliases(
  model_payload jsonb,
  aliases text[] default '{}'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_model_id uuid;
  clean_aliases text[];
begin
  if not public.is_staff() then
    raise exception 'Staff access is required to create a phone model.' using errcode = '42501';
  end if;

  if model_payload is null or jsonb_typeof(model_payload) <> 'object' then
    raise exception 'A phone model payload is required.' using errcode = '22023';
  end if;

  if coalesce(model_payload->>'slug', '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Phone model slug must contain lowercase letters, numbers and hyphens only.' using errcode = '22023';
  end if;

  select coalesce(array_agg(alias order by alias), '{}')
    into clean_aliases
  from (
    select distinct trim(value) as alias
    from unnest(coalesce(aliases, '{}')) as raw(value)
    where length(trim(value)) between 1 and 128
  ) normalized;

  if coalesce(array_length(clean_aliases, 1), 0) > 50 then
    raise exception 'A phone model may have at most 50 aliases.' using errcode = '22023';
  end if;

  insert into public.phone_models (
    slug, brand, name, full_name, release_year, status,
    height_mm, width_mm, thickness_mm, weight_g,
    screen_diagonal_in, screen_curvature, notch_type, aspect_ratio,
    has_curved_edges, camera_shape, camera_lens_count, camera_bump_height_mm,
    camera_island_width_mm, camera_island_height_mm, camera_position,
    has_headphone_jack, fingerprint_sensor, port_type, button_layout,
    notes, image_url, created_by, updated_by
  )
  values (
    model_payload->>'slug', model_payload->>'brand', model_payload->>'name',
    model_payload->>'full_name', nullif(model_payload->>'release_year', '')::integer,
    coalesce(nullif(model_payload->>'status', ''), 'active'),
    (model_payload->>'height_mm')::numeric, (model_payload->>'width_mm')::numeric,
    (model_payload->>'thickness_mm')::numeric, nullif(model_payload->>'weight_g', '')::numeric,
    (model_payload->>'screen_diagonal_in')::numeric, model_payload->>'screen_curvature',
    model_payload->>'notch_type', nullif(model_payload->>'aspect_ratio', ''),
    coalesce((model_payload->>'has_curved_edges')::boolean, false),
    model_payload->>'camera_shape', (model_payload->>'camera_lens_count')::smallint,
    nullif(model_payload->>'camera_bump_height_mm', '')::numeric,
    nullif(model_payload->>'camera_island_width_mm', '')::numeric,
    nullif(model_payload->>'camera_island_height_mm', '')::numeric,
    model_payload->>'camera_position', coalesce((model_payload->>'has_headphone_jack')::boolean, false),
    model_payload->>'fingerprint_sensor', model_payload->>'port_type', model_payload->>'button_layout',
    nullif(model_payload->>'notes', ''), nullif(model_payload->>'image_url', ''),
    (select auth.uid()), (select auth.uid())
  )
  returning id into new_model_id;

  insert into public.phone_aliases (model_id, alias, alias_kind)
  select new_model_id, alias, 'common_name'
  from unnest(clean_aliases) as normalized(alias);

  return new_model_id;
end;
$$;

revoke all on function public.create_phone_model_with_aliases(jsonb, text[]) from public, anon;
grant execute on function public.create_phone_model_with_aliases(jsonb, text[]) to authenticated;

commit;


