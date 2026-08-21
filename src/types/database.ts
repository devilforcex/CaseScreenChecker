/** Generated-compatible public schema surface used by the browser client. */
export type Database = {
  public: {
    Tables: {
      phone_models: { Row: { id: string; slug: string; brand: string; name: string; full_name: string; release_year: number | null; height_mm: number; width_mm: number; thickness_mm: number; weight_g: number | null; screen_diagonal_in: number; screen_curvature: string; notch_type: string; aspect_ratio: string | null; has_curved_edges: boolean; camera_shape: string; camera_lens_count: number; camera_bump_height_mm: number | null; camera_island_width_mm: number | null; camera_island_height_mm: number | null; camera_position: string; has_headphone_jack: boolean; fingerprint_sensor: string; port_type: string; button_layout: string; notes: string | null; image_url: string | null; }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: []; };
      phone_aliases: { Row: { id: string; model_id: string; alias: string; alias_kind: string; }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: []; };
      accessory_categories: { Row: { id: string; slug: string; name: string; description: string | null; is_active: boolean; }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: []; };
      compatibility_relationships: { Row: { id: string; device_a_id: string; device_b_id: string; category_id: string; relationship_status: string; confidence_level: string; confidence_score: number; fit_notes: string; caveats: string | null; origin: string; verification_status: string; verified_by: string | null; verified_at: string | null; }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: []; };
      compatibility_evidence: { Row: { id: string; relationship_id: string | null; device_id: string | null; source_type: string; source_url: string | null; source_title: string | null; claim: string | null; evidence_text: string | null; confidence_score: number | null; verification_state: string; }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: []; };
      profiles: { Row: { id: string; role: 'viewer' | 'staff' | 'admin' | null; }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: []; };
    };
    Views: Record<string, never>; Functions: Record<string, never>; Enums: Record<string, never>; CompositeTypes: Record<string, never>;
  };
};
