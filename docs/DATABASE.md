# CaseScreenChecker Database Architecture

## 1. Target Relational Architecture (PostgreSQL / Supabase)

The production database is structured for PostgreSQL with Supabase Row-Level Security (RLS).

### Entity Relationship Model

```
+-------------------+       +---------------------------+       +-------------------+
|   phone_models    | 1   * | model_compatibility_pairs | *   1 |   phone_models    |
|   (Target Model)  |-------| (source_id <-> target_id) |-------| (Candidate Model) |
+-------------------+       +---------------------------+       +-------------------+
         | 1                              | 1
         | *                              | *
+-------------------+       +---------------------------+
|   model_aliases   |       |    compatibility_evidence |
+-------------------+       +---------------------------+
```

## 2. Table Schemas & DDL

```sql
-- 1. Manufacturers & Brands
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Canonical Phone Models
CREATE TABLE phone_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    release_year INT NOT NULL,
    
    -- Dimensions (mm)
    height_mm NUMERIC(5,2) NOT NULL,
    width_mm NUMERIC(5,2) NOT NULL,
    thickness_mm NUMERIC(4,2) NOT NULL,
    weight_g NUMERIC(5,1),
    
    -- Screen Parameters
    screen_diagonal_in NUMERIC(3,1) NOT NULL,
    screen_curvature VARCHAR(20) NOT NULL CHECK (screen_curvature IN ('flat', '2.5d_curved_edge', 'waterfall_3d')),
    screen_notch_type VARCHAR(30) NOT NULL CHECK (screen_notch_type IN ('punch_hole_center', 'punch_hole_left', 'teardrop_v', 'waterdrop_u', 'dynamic_island', 'wide_notch', 'bezel')),
    aspect_ratio VARCHAR(10) DEFAULT '20:9',
    
    -- Camera Island Parameters
    camera_island_shape VARCHAR(30) NOT NULL CHECK (camera_island_shape IN ('individual_rings', 'rectangular_island', 'square_island', 'circular_oreo', 'horizontal_bar', 'teardrop_vertical')),
    camera_island_width_mm NUMERIC(4,1),
    camera_island_height_mm NUMERIC(4,1),
    camera_island_offset_x_mm NUMERIC(4,1),
    camera_island_offset_y_mm NUMERIC(4,1),
    camera_bump_height_mm NUMERIC(3,1),
    
    -- Chassis Hardware Features
    has_headphone_jack BOOLEAN NOT NULL DEFAULT false,
    fingerprint_sensor_location VARCHAR(30) NOT NULL CHECK (fingerprint_sensor_location IN ('under_display', 'side_power_button', 'rear', 'none')),
    button_layout VARCHAR(50) NOT NULL DEFAULT 'power_right_vol_right',
    port_type VARCHAR(20) NOT NULL DEFAULT 'usb_c',
    
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Model Regional & SKU Aliases
CREATE TABLE phone_model_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_model_id UUID NOT NULL REFERENCES phone_models(id) ON DELETE CASCADE,
    alias_name VARCHAR(150) NOT NULL,
    alias_type VARCHAR(50) DEFAULT 'regional_code', -- e.g. 'model_number', 'rebrand_name', 'carrier_variant'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Cross-Model Compatibility Pairs
CREATE TABLE model_compatibility_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_model_id UUID NOT NULL REFERENCES phone_models(id) ON DELETE CASCADE,
    target_model_id UUID NOT NULL REFERENCES phone_models(id) ON DELETE CASCADE,
    accessory_category VARCHAR(30) NOT NULL CHECK (accessory_category IN ('screen_protector', 'phone_case', 'all_accessories')),
    
    confidence_level VARCHAR(30) NOT NULL CHECK (confidence_level IN (
        'EXACT_MATCH',
        'CONFIRMED_COMPATIBLE',
        'HIGHLY_LIKELY',
        'POSSIBLE_WITH_CAUTION',
        'NOT_COMPATIBLE',
        'UNKNOWN'
    )),
    confidence_score INT NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    
    -- Evaluation Details
    fit_notes TEXT NOT NULL,
    caveats TEXT,
    is_verified_by_staff BOOLEAN NOT NULL DEFAULT false,
    verified_by_user_id UUID,
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_compat_pair UNIQUE(source_model_id, target_model_id, accessory_category)
);

-- 5. Evidence & Source Citations
CREATE TABLE compatibility_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compatibility_pair_id UUID NOT NULL REFERENCES model_compatibility_pairs(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('staff_physical_test', 'manufacturer_spec_sheet', 'teardown_comparison', 'external_web_research')),
    source_url TEXT,
    source_title VARCHAR(255),
    evidence_snippet TEXT,
    credibility_rating INT NOT NULL CHECK (credibility_rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 3. Future Inventory Integration Strategy

When the retail store is ready to connect inventory (SKUs, quantities, POS system):
- An `inventory_items` table connects to `phone_models` and `accessory_categories`.
- The compatibility query seamlessly joins:
  `phone_models (requested) -> model_compatibility_pairs -> phone_models (compatible) -> inventory_items (in_stock > 0)`.
- This ensures zero breaking schema rewrites when upgrading to active stock tracking.
