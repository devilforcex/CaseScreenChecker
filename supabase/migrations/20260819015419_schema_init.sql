-- CaseScreenChecker Database Schema (PostgreSQL / Supabase / SQLite compatible)
-- Generated for Hostinger VPS & Production Deployment

-- ========================================================
-- 1. PHONE MODELS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS phone_models (
    id VARCHAR(64) PRIMARY KEY,
    brand VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    full_name VARCHAR(256) NOT NULL,
    release_year INT NOT NULL,
    
    -- Physical Dimensions (mm & grams)
    height_mm NUMERIC(6, 2) NOT NULL,
    width_mm NUMERIC(6, 2) NOT NULL,
    thickness_mm NUMERIC(6, 2) NOT NULL,
    weight_g NUMERIC(6, 2),
    
    -- Display & Screen Geometry
    screen_diagonal_in NUMERIC(4, 2) NOT NULL,
    screen_curvature VARCHAR(32) NOT NULL DEFAULT 'flat', -- 'flat' | '2.5d_curved_edge' | 'waterfall_3d'
    notch_type VARCHAR(32) NOT NULL DEFAULT 'punch_hole_center', -- 'punch_hole_center' | 'punch_hole_left' | 'teardrop_v' | 'waterdrop_u' | 'dynamic_island' | 'wide_notch' | 'bezel'
    aspect_ratio VARCHAR(16) NOT NULL DEFAULT '20:9',
    has_curved_edges BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Camera Island Geometry
    camera_shape VARCHAR(32) NOT NULL DEFAULT 'rectangular_island', -- 'individual_rings' | 'rectangular_island' | 'square_island' | 'circular_oreo' | 'horizontal_bar' | 'teardrop_vertical'
    camera_lens_count INT NOT NULL DEFAULT 3,
    camera_bump_height_mm NUMERIC(4, 2) NOT NULL DEFAULT 1.5,
    camera_island_width_mm NUMERIC(5, 2),
    camera_island_height_mm NUMERIC(5, 2),
    camera_position VARCHAR(32) NOT NULL DEFAULT 'top_left',
    
    -- Hardware Features & Cutouts
    has_headphone_jack BOOLEAN NOT NULL DEFAULT FALSE,
    fingerprint_sensor VARCHAR(32) NOT NULL DEFAULT 'under_display', -- 'under_display' | 'side_power_button' | 'rear' | 'none'
    port_type VARCHAR(32) NOT NULL DEFAULT 'usb_c', -- 'usb_c' | 'lightning' | 'micro_usb'
    button_layout VARCHAR(32) NOT NULL DEFAULT 'power_right_vol_right',
    
    -- Search & Metadata
    aliases TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_phone_models_brand ON phone_models(brand);
CREATE INDEX IF NOT EXISTS idx_phone_models_year ON phone_models(release_year);
CREATE INDEX IF NOT EXISTS idx_phone_models_name ON phone_models(name);

-- ========================================================
-- 2. COMPATIBILITY PAIRINGS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS compatibility_pairs (
    id VARCHAR(128) PRIMARY KEY,
    source_model_id VARCHAR(64) NOT NULL REFERENCES phone_models(id) ON DELETE CASCADE,
    target_model_id VARCHAR(64) NOT NULL REFERENCES phone_models(id) ON DELETE CASCADE,
    category VARCHAR(32) NOT NULL DEFAULT 'all_accessories', -- 'screen_protector' | 'phone_case' | 'all_accessories'
    
    -- Confidence & Scoring
    confidence_level VARCHAR(32) NOT NULL, -- 'EXACT_MATCH' | 'CONFIRMED_COMPATIBLE' | 'HIGHLY_LIKELY' | 'POSSIBLE_WITH_CAUTION' | 'NOT_COMPATIBLE'
    confidence_score INT NOT NULL DEFAULT 85,
    
    -- Technical Notes & Verification
    fit_notes TEXT NOT NULL,
    caveats TEXT,
    is_verified_by_staff BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by VARCHAR(128),
    verified_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_pair_category UNIQUE (source_model_id, target_model_id, category)
);

CREATE INDEX IF NOT EXISTS idx_pairs_source ON compatibility_pairs(source_model_id);
CREATE INDEX IF NOT EXISTS idx_pairs_target ON compatibility_pairs(target_model_id);
CREATE INDEX IF NOT EXISTS idx_pairs_category ON compatibility_pairs(category);

-- ========================================================
-- 3. EVIDENCE SOURCES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS evidence_sources (
    id VARCHAR(128) PRIMARY KEY,
    pair_id VARCHAR(128) NOT NULL REFERENCES compatibility_pairs(id) ON DELETE CASCADE,
    source_type VARCHAR(32) NOT NULL, -- 'staff_test' | 'manufacturer_spec' | 'teardown' | 'web_research'
    title VARCHAR(256) NOT NULL,
    url VARCHAR(512),
    snippet TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidence_pair ON evidence_sources(pair_id);

-- ========================================================
-- 4. ROW-LEVEL SECURITY (RLS) FOR SUPABASE / POSTGRES
-- ========================================================
ALTER TABLE phone_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_sources ENABLE ROW LEVEL SECURITY;

-- Public Read Policy
CREATE POLICY "Allow public read access on phone_models" ON phone_models FOR SELECT USING (true);
CREATE POLICY "Allow public read access on compatibility_pairs" ON compatibility_pairs FOR SELECT USING (true);
CREATE POLICY "Allow public read access on evidence_sources" ON evidence_sources FOR SELECT USING (true);

-- Authenticated Staff Write Policy
CREATE POLICY "Allow authenticated staff to insert/update models" ON phone_models FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated staff to insert/update pairs" ON compatibility_pairs FOR ALL USING (auth.role() = 'authenticated');
