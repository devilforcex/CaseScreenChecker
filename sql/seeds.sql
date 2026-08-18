-- CaseScreenChecker Initial Production Seed Data
-- Importable into PostgreSQL, Supabase, or SQLite

-- ========================================================
-- INSERT INITIAL PHONE MODELS
-- ========================================================
INSERT INTO phone_models (
    id, brand, name, full_name, release_year,
    height_mm, width_mm, thickness_mm, weight_g,
    screen_diagonal_in, screen_curvature, notch_type, aspect_ratio, has_curved_edges,
    camera_shape, camera_lens_count, camera_bump_height_mm, camera_position,
    has_headphone_jack, fingerprint_sensor, port_type, button_layout,
    aliases, notes
) VALUES
-- Samsung A-Series
('samsung-a05s', 'Samsung', 'Galaxy A05s', 'Samsung Galaxy A05s', 2023, 168.0, 77.8, 8.8, 194, 6.70, 'flat', 'waterdrop_u', '20:9', FALSE, 'individual_rings', 3, 1.4, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['SM-A057F', 'Galaxy A05s 4G'], 'Flat 6.7" PLS LCD with Infinity-U notch, triple vertical camera rings.'),
('samsung-a05', 'Samsung', 'Galaxy A05', 'Samsung Galaxy A05', 2023, 168.8, 78.2, 8.8, 195, 6.70, 'flat', 'waterdrop_u', '20:9', FALSE, 'individual_rings', 2, 1.3, 'top_left', TRUE, 'none', 'usb_c', 'power_right_vol_right', ARRAY['SM-A055F', 'Galaxy A05 4G'], 'Dual camera rings. Screen glass active area is identical to A05s.'),
('samsung-a04s', 'Samsung', 'Galaxy A04s', 'Samsung Galaxy A04s', 2022, 164.7, 76.7, 9.1, 195, 6.50, 'flat', 'waterdrop_u', '20:9', FALSE, 'individual_rings', 3, 1.5, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['SM-A047F'], 'Flat 6.5" Infinity-V.'),
('samsung-a04', 'Samsung', 'Galaxy A04', 'Samsung Galaxy A04', 2022, 164.4, 76.3, 9.1, 192, 6.50, 'flat', 'waterdrop_u', '20:9', FALSE, 'individual_rings', 2, 1.4, 'top_left', TRUE, 'none', 'usb_c', 'power_right_vol_right', ARRAY['SM-A045F'], 'Dual camera rings.'),
('samsung-a15', 'Samsung', 'Galaxy A15 4G/5G', 'Samsung Galaxy A15', 2023, 160.1, 76.8, 8.4, 200, 6.50, 'flat', 'waterdrop_u', '19.5:9', FALSE, 'individual_rings', 3, 1.2, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['SM-A155F', 'SM-A156B'], 'Key Island design frame.'),
('samsung-a25', 'Samsung', 'Galaxy A25 5G', 'Samsung Galaxy A25 5G', 2023, 161.0, 76.5, 8.3, 197, 6.50, 'flat', 'waterdrop_u', '19.5:9', FALSE, 'individual_rings', 3, 1.3, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['SM-A256B'], 'Key Island frame. Screen glass identical to A15.'),
('samsung-a35', 'Samsung', 'Galaxy A35 5G', 'Samsung Galaxy A35 5G', 2024, 161.7, 78.0, 8.2, 209, 6.60, 'flat', 'punch_hole_center', '19.5:9', FALSE, 'individual_rings', 3, 1.3, 'top_left', FALSE, 'under_display', 'usb_c', 'power_right_vol_right', ARRAY['SM-A356B'], 'Flat 6.6" 120Hz Super AMOLED.'),
('samsung-a55', 'Samsung', 'Galaxy A55 5G', 'Samsung Galaxy A55 5G', 2024, 161.1, 77.4, 8.2, 213, 6.60, 'flat', 'punch_hole_center', '19.5:9', FALSE, 'individual_rings', 3, 1.4, 'top_left', FALSE, 'under_display', 'usb_c', 'power_right_vol_right', ARRAY['SM-A556B'], 'Metal frame with Key Island. Screen glass matches Galaxy A35.'),
('samsung-a14-4g', 'Samsung', 'Galaxy A14 4G', 'Samsung Galaxy A14 4G', 2023, 167.7, 78.0, 9.1, 201, 6.60, 'flat', 'waterdrop_u', '20:9', FALSE, 'individual_rings', 3, 1.4, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['SM-A145F'], 'Identical chassis to A14 5G.'),
('samsung-a14-5g', 'Samsung', 'Galaxy A14 5G', 'Samsung Galaxy A14 5G', 2023, 167.7, 78.0, 9.1, 202, 6.60, 'flat', 'waterdrop_u', '20:9', FALSE, 'individual_rings', 3, 1.4, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['SM-A146B'], '100% case & screen interchangeable with A14 4G.'),

-- Apple iPhone
('apple-iphone-13', 'Apple', 'iPhone 13', 'Apple iPhone 13', 2021, 146.7, 71.5, 7.65, 174, 6.10, 'flat', 'wide_notch', '19.5:9', FALSE, 'square_island', 2, 2.5, 'top_left', FALSE, 'none', 'lightning', 'power_right_vol_left', ARRAY['A2633', 'iPhone14,5'], 'Diagonal dual camera.'),
('apple-iphone-14', 'Apple', 'iPhone 14', 'Apple iPhone 14', 2022, 146.7, 71.5, 7.80, 172, 6.10, 'flat', 'wide_notch', '19.5:9', FALSE, 'square_island', 2, 2.8, 'top_left', FALSE, 'none', 'lightning', 'power_right_vol_left', ARRAY['A2882', 'iPhone14,7'], 'Screen glass 100% matches iPhone 13.'),
('apple-iphone-15', 'Apple', 'iPhone 15', 'Apple iPhone 15', 2023, 147.6, 71.6, 7.80, 171, 6.10, '2.5d_curved_edge', 'dynamic_island', '19.5:9', FALSE, 'square_island', 2, 3.1, 'top_left', FALSE, 'none', 'usb_c', 'power_right_vol_left', ARRAY['A3090'], 'Dynamic Island with 2.5D contoured edge glass.'),

-- Xiaomi / Poco
('xiaomi-redmi-13c', 'Xiaomi', 'Redmi 13C', 'Xiaomi Redmi 13C', 2023, 168.0, 78.0, 8.1, 192, 6.74, 'flat', 'waterdrop_u', '20:9', FALSE, 'rectangular_island', 3, 1.8, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['23100RN82L'], 'Exact OEM twin of Poco C65.'),
('xiaomi-poco-c65', 'Xiaomi', 'Poco C65', 'Xiaomi Poco C65', 2023, 168.0, 78.0, 8.1, 192, 6.74, 'flat', 'waterdrop_u', '20:9', FALSE, 'rectangular_island', 3, 1.8, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['2310FPCA4G'], 'Exact OEM twin of Redmi 13C.'),

-- Motorola
('motorola-moto-g24', 'Motorola', 'Moto G24', 'Motorola Moto G24', 2024, 163.5, 74.5, 8.0, 181, 6.56, 'flat', 'punch_hole_center', '20:9', FALSE, 'rectangular_island', 2, 1.5, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['XT2423-1'], 'Twin chassis with Moto G04.'),
('motorola-moto-g04', 'Motorola', 'Moto G04', 'Motorola Moto G04', 2024, 163.5, 74.5, 8.0, 179, 6.56, 'flat', 'punch_hole_center', '20:9', FALSE, 'rectangular_island', 1, 1.5, 'top_left', TRUE, 'side_power_button', 'usb_c', 'power_right_vol_right', ARRAY['XT2421-1'], 'Twin chassis with Moto G24.')
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- INSERT INITIAL COMPATIBILITY PAIRINGS
-- ========================================================
INSERT INTO compatibility_pairs (
    id, source_model_id, target_model_id, category,
    confidence_level, confidence_score, fit_notes, caveats,
    is_verified_by_staff, verified_by, verified_date
) VALUES
('pair-redmi13c-pococ65-all', 'xiaomi-redmi-13c', 'xiaomi-poco-c65', 'all_accessories', 'EXACT_MATCH', 100, 'Identical hardware chassis mold and display panel. Screen protectors and all phone cases are 100% interchangeable.', NULL, TRUE, 'Store Lead Tech', '2024-01-10'),
('pair-motog24-motog04-all', 'motorola-moto-g24', 'motorola-moto-g04', 'all_accessories', 'CONFIRMED_COMPATIBLE', 99, 'Identical 163.5 x 74.5 x 8.0 mm chassis. Moto G04 single camera fits inside Moto G24 dual camera case cutout.', NULL, TRUE, 'Store Staff', '2024-02-14'),
('pair-iphone13-iphone14-screen', 'apple-iphone-13', 'apple-iphone-14', 'screen_protector', 'EXACT_MATCH', 100, 'Identical 6.1" OLED front glass panel and notch dimensions. Tempered glass is 100% interchangeable.', NULL, TRUE, 'Apple Certified Tech', '2023-10-15'),
('pair-iphone13-iphone14-case', 'apple-iphone-13', 'apple-iphone-14', 'phone_case', 'HIGHLY_LIKELY', 88, 'TPU and silicone cases fit with high compliance. iPhone 14 is 0.15mm thicker and power button sits ~1mm lower.', 'Rigid hard plastic cases may fit tightly around the camera bump.', TRUE, 'Store Staff', '2023-11-01'),
('pair-samsung-a05s-a05-screen', 'samsung-a05s', 'samsung-a05', 'screen_protector', 'CONFIRMED_COMPATIBLE', 97, 'Both feature flat 6.7" PLS LCD panels with Infinity-U notch. Screen protectors match 100%.', 'Phone cases are NOT fully interchangeable: A05s has 3 camera rings, A05 has 2 camera rings.', TRUE, 'Samsung Retail Tech', '2023-12-10'),
('pair-samsung-a14-4g-5g-screen', 'samsung-a14-5g', 'samsung-a14-4g', 'all_accessories', 'EXACT_MATCH', 100, 'Identical 167.7 x 78.0 x 9.1 mm chassis and 6.6" 20:9 front glass. Cases and screen glass 100% interchangeable.', NULL, TRUE, 'Senior Technician', '2024-01-22'),
('pair-samsung-a15-a25-screen', 'samsung-a25', 'samsung-a15', 'screen_protector', 'CONFIRMED_COMPATIBLE', 97, 'Identical 6.5" 19.5:9 Super AMOLED front glass with Infinity-U notch.', 'Case fit: Key Island buttons align, but A25 has slightly thicker camera rings (+0.1mm). TPU cases fit well.', TRUE, 'Store Tech', '2024-02-18'),
('pair-samsung-a35-a55-screen', 'samsung-a55', 'samsung-a35', 'screen_protector', 'CONFIRMED_COMPATIBLE', 96, 'Both utilize identical 6.6" 19.5:9 120Hz flat Super AMOLED panels with center punch-hole.', 'Phone cases are slightly different in width (77.4mm vs 78.0mm). Soft TPU cases fit with mild flex.', TRUE, 'Store Lead Tech', '2024-03-25')
ON CONFLICT (id) DO NOTHING;
