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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          hero_image_url: string | null
          id: string
          is_featured: boolean
          published_at: string
          reading_time: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string
          reading_time?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string
          reading_time?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      couple_invites: {
        Row: {
          accepted_at: string | null
          couple_id: string
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          invited_email: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          couple_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invited_by: string
          invited_email: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          couple_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_email?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_invites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_profile_drafts: {
        Row: {
          couple_id: string
          created_at: string
          generated_about_us: string | null
          generated_display_name: string | null
          generated_shared_interests: string[] | null
          id: string
          is_applied: boolean
          updated_at: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          generated_about_us?: string | null
          generated_display_name?: string | null
          generated_shared_interests?: string[] | null
          id?: string
          is_applied?: boolean
          updated_at?: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          generated_about_us?: string | null
          generated_display_name?: string | null
          generated_shared_interests?: string[] | null
          id?: string
          is_applied?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_profile_drafts_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: true
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          about_us: string | null
          created_at: string
          display_name: string | null
          id: string
          is_complete: boolean
          is_discoverable: boolean
          preferred_meetup_times: string | null
          shared_interests: string[] | null
          updated_at: string
        }
        Insert: {
          about_us?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_complete?: boolean
          is_discoverable?: boolean
          preferred_meetup_times?: string | null
          shared_interests?: string[] | null
          updated_at?: string
        }
        Update: {
          about_us?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_complete?: boolean
          is_discoverable?: boolean
          preferred_meetup_times?: string | null
          shared_interests?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          availability: string | null
          city: string | null
          couple_id: string
          created_at: string
          energy_style: string | null
          first_name: string | null
          id: string
          interests: string[] | null
          is_owner: boolean
          is_profile_complete: boolean
          social_settings: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          city?: string | null
          couple_id: string
          created_at?: string
          energy_style?: string | null
          first_name?: string | null
          id?: string
          interests?: string[] | null
          is_owner?: boolean
          is_profile_complete?: boolean
          social_settings?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          city?: string | null
          couple_id?: string
          created_at?: string
          energy_style?: string | null
          first_name?: string | null
          id?: string
          interests?: string[] | null
          is_owner?: boolean
          is_profile_complete?: boolean
          social_settings?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_couples: {
        Row: {
          created_at: string
          id: string
          saved_couple_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          saved_couple_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          saved_couple_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_couples_saved_couple_id_fkey"
            columns: ["saved_couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
