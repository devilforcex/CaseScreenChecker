export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      accessory_categories: {
        Row: {
          created_at: string
          description: string | null
          device_kind: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          device_kind?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          device_kind?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      compatibility_evidence: {
        Row: {
          claim: string | null
          confidence_score: number | null
          created_at: string
          created_by: string | null
          device_id: string | null
          discovered_at: string | null
          evidence_text: string | null
          id: string
          relationship_id: string | null
          source_title: string | null
          source_type: string
          source_url: string | null
          verification_state: string
        }
        Insert: {
          claim?: string | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          discovered_at?: string | null
          evidence_text?: string | null
          id?: string
          relationship_id?: string | null
          source_title?: string | null
          source_type: string
          source_url?: string | null
          verification_state?: string
        }
        Update: {
          claim?: string | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          device_id?: string | null
          discovered_at?: string | null
          evidence_text?: string | null
          id?: string
          relationship_id?: string | null
          source_title?: string | null
          source_type?: string
          source_url?: string | null
          verification_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_evidence_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_evidence_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "phone_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_evidence_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "compatibility_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_relationships: {
        Row: {
          category_id: string
          caveats: string | null
          confidence_level: string
          confidence_score: number
          created_at: string
          created_by: string | null
          device_a_id: string
          device_b_id: string
          fit_notes: string
          id: string
          origin: string
          relationship_status: string
          updated_at: string
          updated_by: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category_id: string
          caveats?: string | null
          confidence_level: string
          confidence_score: number
          created_at?: string
          created_by?: string | null
          device_a_id: string
          device_b_id: string
          fit_notes: string
          id?: string
          origin?: string
          relationship_status: string
          updated_at?: string
          updated_by?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category_id?: string
          caveats?: string | null
          confidence_level?: string
          confidence_score?: number
          created_at?: string
          created_by?: string | null
          device_a_id?: string
          device_b_id?: string
          fit_notes?: string
          id?: string
          origin?: string
          relationship_status?: string
          updated_at?: string
          updated_by?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_relationships_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "accessory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_relationships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_relationships_device_a_id_fkey"
            columns: ["device_a_id"]
            isOneToOne: false
            referencedRelation: "phone_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_relationships_device_b_id_fkey"
            columns: ["device_b_id"]
            isOneToOne: false
            referencedRelation: "phone_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_relationships_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_relationships_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_aliases: {
        Row: {
          alias: string
          alias_kind: string
          created_at: string
          id: string
          model_id: string
        }
        Insert: {
          alias: string
          alias_kind?: string
          created_at?: string
          id?: string
          model_id: string
        }
        Update: {
          alias?: string
          alias_kind?: string
          created_at?: string
          id?: string
          model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_aliases_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "phone_models"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_models: {
        Row: {
          aspect_ratio: string | null
          brand: string
          button_layout: string
          camera_bump_height_mm: number | null
          camera_island_height_mm: number | null
          camera_island_width_mm: number | null
          camera_lens_count: number
          camera_position: string
          camera_shape: string
          created_at: string
          created_by: string | null
          fingerprint_sensor: string
          full_name: string
          has_curved_edges: boolean
          has_headphone_jack: boolean
          height_mm: number
          id: string
          image_url: string | null
          name: string
          notch_type: string
          notes: string | null
          port_type: string
          release_year: number | null
          screen_curvature: string
          screen_diagonal_in: number
          screen_corner_radius_mm: number | null
          screen_cutout_height_mm: number | null
          screen_cutout_width_mm: number | null
          edge_to_edge_compatible: boolean | null
          screen_geometry_source: string | null
          screen_geometry_verified_at: string | null
          screen_geometry_verified_by: string | null
          screen_height_mm: number | null
          screen_width_mm: number | null
          slug: string
          status: string
          thickness_mm: number
          updated_at: string
          updated_by: string | null
          weight_g: number | null
          width_mm: number
        }
        Insert: {
          aspect_ratio?: string | null
          brand: string
          button_layout?: string
          camera_bump_height_mm?: number | null
          camera_island_height_mm?: number | null
          camera_island_width_mm?: number | null
          camera_lens_count?: number
          camera_position?: string
          camera_shape?: string
          created_at?: string
          created_by?: string | null
          fingerprint_sensor?: string
          full_name: string
          has_curved_edges?: boolean
          has_headphone_jack?: boolean
          height_mm: number
          id?: string
          image_url?: string | null
          name: string
          notch_type?: string
          notes?: string | null
          port_type?: string
          release_year?: number | null
          screen_curvature?: string
          screen_diagonal_in: number
          screen_corner_radius_mm?: number | null
          screen_cutout_height_mm?: number | null
          screen_cutout_width_mm?: number | null
          edge_to_edge_compatible?: boolean | null
          screen_geometry_source?: string | null
          screen_geometry_verified_at?: string | null
          screen_geometry_verified_by?: string | null
          screen_height_mm?: number | null
          screen_width_mm?: number | null
          slug: string
          status?: string
          thickness_mm: number
          updated_at?: string
          updated_by?: string | null
          weight_g?: number | null
          width_mm: number
        }
        Update: {
          aspect_ratio?: string | null
          brand?: string
          button_layout?: string
          camera_bump_height_mm?: number | null
          camera_island_height_mm?: number | null
          camera_island_width_mm?: number | null
          camera_lens_count?: number
          camera_position?: string
          camera_shape?: string
          created_at?: string
          created_by?: string | null
          fingerprint_sensor?: string
          full_name?: string
          has_curved_edges?: boolean
          has_headphone_jack?: boolean
          height_mm?: number
          id?: string
          image_url?: string | null
          name?: string
          notch_type?: string
          notes?: string | null
          port_type?: string
          release_year?: number | null
          screen_curvature?: string
          screen_diagonal_in?: number
          screen_corner_radius_mm?: number | null
          screen_cutout_height_mm?: number | null
          screen_cutout_width_mm?: number | null
          edge_to_edge_compatible?: boolean | null
          screen_geometry_source?: string | null
          screen_geometry_verified_at?: string | null
          screen_geometry_verified_by?: string | null
          screen_height_mm?: number | null
          screen_width_mm?: number | null
          slug?: string
          status?: string
          thickness_mm?: number
          updated_at?: string
          updated_by?: string | null
          weight_g?: number | null
          width_mm?: number
        }
        Relationships: [
          {
            foreignKeyName: "phone_models_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_models_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_variants: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          model_a_id: string
          model_b_id: string
          note: string | null
          variant_kind: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          model_a_id: string
          model_b_id: string
          note?: string | null
          variant_kind: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          model_a_id?: string
          model_b_id?: string
          note?: string | null
          variant_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_variants_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_variants_model_a_id_fkey"
            columns: ["model_a_id"]
            isOneToOne: false
            referencedRelation: "phone_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_variants_model_b_id_fkey"
            columns: ["model_b_id"]
            isOneToOne: false
            referencedRelation: "phone_models"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["slug"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_phone_model_with_aliases: {
        Args: { aliases?: string[]; model_payload: Json }
        Returns: string
      }
      create_compatibility_relationship_with_evidence: {
        Args: { pair_payload: Json }
        Returns: string[]
      }
      get_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
