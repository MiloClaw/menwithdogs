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
      couple_favorites: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          place_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          place_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_favorites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_favorites_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_interests: {
        Row: {
          couple_id: string
          created_at: string | null
          id: string
          interest_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          id?: string
          interest_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          id?: string
          interest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_interests_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
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
      couple_location_summary: {
        Row: {
          city: string
          country: string
          couple_id: string
          last_updated: string
          state: string | null
        }
        Insert: {
          city: string
          country?: string
          couple_id: string
          last_updated?: string
          state?: string | null
        }
        Update: {
          city?: string
          country?: string
          couple_id?: string
          last_updated?: string
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_location_summary_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: true
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_presence: {
        Row: {
          couple_id: string
          created_at: string | null
          ends_at: string
          event_id: string | null
          id: string
          place_id: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["presence_status"]
          updated_at: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          ends_at: string
          event_id?: string | null
          id?: string
          place_id?: string | null
          starts_at?: string | null
          status: Database["public"]["Enums"]["presence_status"]
          updated_at?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          ends_at?: string
          event_id?: string | null
          id?: string
          place_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["presence_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_presence_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_presence_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_presence_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
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
      couple_reveals: {
        Row: {
          context_type: Database["public"]["Enums"]["reveal_context"]
          couple_a_id: string
          couple_b_id: string
          created_at: string | null
          event_id: string | null
          expires_at: string
          id: string
          place_id: string | null
          state: Database["public"]["Enums"]["reveal_state"]
        }
        Insert: {
          context_type: Database["public"]["Enums"]["reveal_context"]
          couple_a_id: string
          couple_b_id: string
          created_at?: string | null
          event_id?: string | null
          expires_at: string
          id?: string
          place_id?: string | null
          state?: Database["public"]["Enums"]["reveal_state"]
        }
        Update: {
          context_type?: Database["public"]["Enums"]["reveal_context"]
          couple_a_id?: string
          couple_b_id?: string
          created_at?: string | null
          event_id?: string | null
          expires_at?: string
          id?: string
          place_id?: string | null
          state?: Database["public"]["Enums"]["reveal_state"]
        }
        Relationships: [
          {
            foreignKeyName: "couple_reveals_couple_a_id_fkey"
            columns: ["couple_a_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reveals_couple_b_id_fkey"
            columns: ["couple_b_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reveals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reveals_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          about_us: string | null
          confirmation_text: string | null
          confirmed_at: string | null
          created_at: string
          display_name: string | null
          id: string
          is_complete: boolean
          is_discoverable: boolean
          partner_first_name: string | null
          preferred_meetup_times: string | null
          profile_photo_url: string | null
          status: Database["public"]["Enums"]["couple_status"]
          updated_at: string
        }
        Insert: {
          about_us?: string | null
          confirmation_text?: string | null
          confirmed_at?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_complete?: boolean
          is_discoverable?: boolean
          partner_first_name?: string | null
          preferred_meetup_times?: string | null
          profile_photo_url?: string | null
          status?: Database["public"]["Enums"]["couple_status"]
          updated_at?: string
        }
        Update: {
          about_us?: string | null
          confirmation_text?: string | null
          confirmed_at?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_complete?: boolean
          is_discoverable?: boolean
          partner_first_name?: string | null
          preferred_meetup_times?: string | null
          profile_photo_url?: string | null
          status?: Database["public"]["Enums"]["couple_status"]
          updated_at?: string
        }
        Relationships: []
      }
      event_favorites: {
        Row: {
          couple_id: string
          created_at: string
          event_id: string
          id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          event_id: string
          id?: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_favorites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category_tags: string[] | null
          commitment_level: number | null
          cost_type: string | null
          created_at: string
          created_by_role: string | null
          description: string | null
          end_at: string | null
          event_format: string | null
          event_type: string | null
          id: string
          inference_confidence: number | null
          is_recurring: boolean | null
          name: string
          normalized_by_ai: boolean | null
          social_energy_level: number | null
          source: Database["public"]["Enums"]["place_source"]
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
          submitted_by: string | null
          updated_at: string
          venue_place_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category_tags?: string[] | null
          commitment_level?: number | null
          cost_type?: string | null
          created_at?: string
          created_by_role?: string | null
          description?: string | null
          end_at?: string | null
          event_format?: string | null
          event_type?: string | null
          id?: string
          inference_confidence?: number | null
          is_recurring?: boolean | null
          name: string
          normalized_by_ai?: boolean | null
          social_energy_level?: number | null
          source?: Database["public"]["Enums"]["place_source"]
          start_at: string
          status?: Database["public"]["Enums"]["event_status"]
          submitted_by?: string | null
          updated_at?: string
          venue_place_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category_tags?: string[] | null
          commitment_level?: number | null
          cost_type?: string | null
          created_at?: string
          created_by_role?: string | null
          description?: string | null
          end_at?: string | null
          event_format?: string | null
          event_type?: string | null
          id?: string
          inference_confidence?: number | null
          is_recurring?: boolean | null
          name?: string
          normalized_by_ai?: boolean | null
          social_energy_level?: number | null
          source?: Database["public"]["Enums"]["place_source"]
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          submitted_by?: string | null
          updated_at?: string
          venue_place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_place_id_fkey"
            columns: ["venue_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_categories: {
        Row: {
          icon: string | null
          id: string
          label: string
          sort_order: number | null
        }
        Insert: {
          icon?: string | null
          id: string
          label: string
          sort_order?: number | null
        }
        Update: {
          icon?: string | null
          id?: string
          label?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      interests: {
        Row: {
          category_id: string
          created_at: string | null
          google_mappings: Json | null
          id: string
          is_active: boolean | null
          label: string
          sort_order: number | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          google_mappings?: Json | null
          id: string
          is_active?: boolean | null
          label: string
          sort_order?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          google_mappings?: Json | null
          id?: string
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interest_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      member_interests: {
        Row: {
          created_at: string | null
          id: string
          interest_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
      member_profiles: {
        Row: {
          availability: string | null
          city: string | null
          city_lat: number | null
          city_lng: number | null
          city_place_id: string | null
          couple_id: string
          created_at: string
          energy_style: string | null
          first_name: string | null
          id: string
          is_owner: boolean
          is_profile_complete: boolean
          onboarding_step: Database["public"]["Enums"]["member_onboarding_step"]
          social_settings: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          city?: string | null
          city_lat?: number | null
          city_lng?: number | null
          city_place_id?: string | null
          couple_id: string
          created_at?: string
          energy_style?: string | null
          first_name?: string | null
          id?: string
          is_owner?: boolean
          is_profile_complete?: boolean
          onboarding_step?: Database["public"]["Enums"]["member_onboarding_step"]
          social_settings?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          city?: string | null
          city_lat?: number | null
          city_lng?: number | null
          city_place_id?: string | null
          couple_id?: string
          created_at?: string
          energy_style?: string | null
          first_name?: string | null
          id?: string
          is_owner?: boolean
          is_profile_complete?: boolean
          onboarding_step?: Database["public"]["Enums"]["member_onboarding_step"]
          social_settings?: string | null
          state?: string | null
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
      places: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          city: string | null
          country: string | null
          created_at: string
          formatted_address: string | null
          google_maps_url: string | null
          google_place_id: string
          google_primary_type: string | null
          google_primary_type_display: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          opening_hours: Json | null
          phone_number: string | null
          photos: Json | null
          price_level: number | null
          primary_category: string
          rating: number | null
          secondary_categories: string[] | null
          source: Database["public"]["Enums"]["place_source"]
          state: string | null
          status: Database["public"]["Enums"]["place_status"]
          submitted_by: string | null
          updated_at: string
          user_ratings_total: number | null
          vibe_conversation: boolean | null
          vibe_daytime: boolean | null
          vibe_energy: number | null
          vibe_evening: boolean | null
          vibe_formality: number | null
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          formatted_address?: string | null
          google_maps_url?: string | null
          google_place_id: string
          google_primary_type?: string | null
          google_primary_type_display?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          opening_hours?: Json | null
          phone_number?: string | null
          photos?: Json | null
          price_level?: number | null
          primary_category: string
          rating?: number | null
          secondary_categories?: string[] | null
          source?: Database["public"]["Enums"]["place_source"]
          state?: string | null
          status?: Database["public"]["Enums"]["place_status"]
          submitted_by?: string | null
          updated_at?: string
          user_ratings_total?: number | null
          vibe_conversation?: boolean | null
          vibe_daytime?: boolean | null
          vibe_energy?: number | null
          vibe_evening?: boolean | null
          vibe_formality?: number | null
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          formatted_address?: string | null
          google_maps_url?: string | null
          google_place_id?: string
          google_primary_type?: string | null
          google_primary_type_display?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          opening_hours?: Json | null
          phone_number?: string | null
          photos?: Json | null
          price_level?: number | null
          primary_category?: string
          rating?: number | null
          secondary_categories?: string[] | null
          source?: Database["public"]["Enums"]["place_source"]
          state?: string | null
          status?: Database["public"]["Enums"]["place_status"]
          submitted_by?: string | null
          updated_at?: string
          user_ratings_total?: number | null
          vibe_conversation?: boolean | null
          vibe_daytime?: boolean | null
          vibe_energy?: number | null
          vibe_evening?: boolean | null
          vibe_formality?: number | null
          website_url?: string | null
        }
        Relationships: []
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
      suggested_connections: {
        Row: {
          candidate_couple_id: string
          candidate_opt_in_at: string | null
          expires_at: string
          generated_at: string
          id: string
          recipient_couple_id: string
          recipient_opt_in_at: string | null
          resolved_at: string | null
          status: string
          surfaced_rank: number | null
          surfaced_reason: string | null
          surfaced_source: string | null
        }
        Insert: {
          candidate_couple_id: string
          candidate_opt_in_at?: string | null
          expires_at?: string
          generated_at?: string
          id?: string
          recipient_couple_id: string
          recipient_opt_in_at?: string | null
          resolved_at?: string | null
          status?: string
          surfaced_rank?: number | null
          surfaced_reason?: string | null
          surfaced_source?: string | null
        }
        Update: {
          candidate_couple_id?: string
          candidate_opt_in_at?: string | null
          expires_at?: string
          generated_at?: string
          id?: string
          recipient_couple_id?: string
          recipient_opt_in_at?: string | null
          resolved_at?: string | null
          status?: string
          surfaced_rank?: number | null
          surfaced_reason?: string | null
          surfaced_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggested_connections_candidate_couple_id_fkey"
            columns: ["candidate_couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_connections_recipient_couple_id_fkey"
            columns: ["recipient_couple_id"]
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
      event_presence_agg: {
        Row: {
          event_id: string | null
          interested_count: number | null
          open_count: number | null
          planning_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_presence_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      place_presence_agg: {
        Row: {
          interested_count: number | null
          open_count: number | null
          place_id: string | null
          planning_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_presence_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      revealed_couples_view: {
        Row: {
          context_type: Database["public"]["Enums"]["reveal_context"] | null
          couple_a_display_name: string | null
          couple_a_id: string | null
          couple_a_photo: string | null
          couple_b_display_name: string | null
          couple_b_id: string | null
          couple_b_photo: string | null
          event_id: string | null
          expires_at: string | null
          id: string | null
          place_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_reveals_couple_a_id_fkey"
            columns: ["couple_a_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reveals_couple_b_id_fkey"
            columns: ["couple_b_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reveals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_reveals_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      confirm_couple_intent: { Args: { p_couple_id: string }; Returns: boolean }
      create_couple_for_current_user: { Args: never; Returns: string }
      get_user_couple_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      affinity_type: "regular" | "occasional" | "aspirational"
      app_role: "admin" | "user"
      couple_status: "onboarding" | "pending_match" | "active" | "paused"
      event_status: "approved" | "pending" | "rejected"
      member_onboarding_step: "profile_pending" | "profile_complete"
      place_cadence: "weekly" | "monthly" | "rare"
      place_source: "google_places" | "admin"
      place_status: "approved" | "pending" | "rejected"
      presence_status: "interested" | "planning_to_attend" | "open_to_hello"
      reveal_context: "place" | "event"
      reveal_state: "eligible" | "revealed" | "expired"
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
      affinity_type: ["regular", "occasional", "aspirational"],
      app_role: ["admin", "user"],
      couple_status: ["onboarding", "pending_match", "active", "paused"],
      event_status: ["approved", "pending", "rejected"],
      member_onboarding_step: ["profile_pending", "profile_complete"],
      place_cadence: ["weekly", "monthly", "rare"],
      place_source: ["google_places", "admin"],
      place_status: ["approved", "pending", "rejected"],
      presence_status: ["interested", "planning_to_attend", "open_to_hello"],
      reveal_context: ["place", "event"],
      reveal_state: ["eligible", "revealed", "expired"],
    },
  },
} as const
