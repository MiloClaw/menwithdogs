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
      admin_place_metadata: {
        Row: {
          created_at: string | null
          id: string
          internal_tags: string[] | null
          lgbtq_confidence: number | null
          notes: string | null
          place_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          internal_tags?: string[] | null
          lgbtq_confidence?: number | null
          notes?: string | null
          place_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          internal_tags?: string[] | null
          lgbtq_confidence?: number | null
          notes?: string | null
          place_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_place_metadata_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: true
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
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
      cities: {
        Row: {
          country: string
          created_at: string
          google_place_id: string | null
          id: string
          lat: number | null
          launched_at: string | null
          launched_by: string | null
          lng: number | null
          name: string
          state: string | null
          status: Database["public"]["Enums"]["city_status"]
          target_anchor_count: number
          target_place_count: number
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          google_place_id?: string | null
          id?: string
          lat?: number | null
          launched_at?: string | null
          launched_by?: string | null
          lng?: number | null
          name: string
          state?: string | null
          status?: Database["public"]["Enums"]["city_status"]
          target_anchor_count?: number
          target_place_count?: number
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          google_place_id?: string | null
          id?: string
          lat?: number | null
          launched_at?: string | null
          launched_by?: string | null
          lng?: number | null
          name?: string
          state?: string | null
          status?: Database["public"]["Enums"]["city_status"]
          target_anchor_count?: number
          target_place_count?: number
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
      couples: {
        Row: {
          about_us: string | null
          city_geo_area_id: string | null
          created_at: string
          display_name: string | null
          id: string
          is_complete: boolean
          partner_first_name: string | null
          preferred_meetup_times: string | null
          profile_photo_url: string | null
          status: Database["public"]["Enums"]["couple_status"]
          subscription_status: string
          type: string
          updated_at: string
        }
        Insert: {
          about_us?: string | null
          city_geo_area_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_complete?: boolean
          partner_first_name?: string | null
          preferred_meetup_times?: string | null
          profile_photo_url?: string | null
          status?: Database["public"]["Enums"]["couple_status"]
          subscription_status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          about_us?: string | null
          city_geo_area_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_complete?: boolean
          partner_first_name?: string | null
          preferred_meetup_times?: string | null
          profile_photo_url?: string | null
          status?: Database["public"]["Enums"]["couple_status"]
          subscription_status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "couples_city_geo_area_id_fkey"
            columns: ["city_geo_area_id"]
            isOneToOne: false
            referencedRelation: "geo_areas"
            referencedColumns: ["id"]
          },
        ]
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
      geo_areas: {
        Row: {
          bounds_json: Json | null
          centroid_lat: number | null
          centroid_lng: number | null
          created_at: string | null
          google_place_id: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          bounds_json?: Json | null
          centroid_lat?: number | null
          centroid_lng?: number | null
          created_at?: string | null
          google_place_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          bounds_json?: Json | null
          centroid_lat?: number | null
          centroid_lng?: number | null
          created_at?: string | null
          google_place_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geo_areas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "geo_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      google_type_mappings: {
        Row: {
          created_at: string | null
          google_type: string
          id: string
          is_active: boolean | null
          notes: string | null
          taxonomy_node_id: string
          updated_at: string | null
          version: number | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          google_type: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          taxonomy_node_id: string
          updated_at?: string | null
          version?: number | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          google_type?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          taxonomy_node_id?: string
          updated_at?: string | null
          version?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "google_type_mappings_taxonomy_node_id_fkey"
            columns: ["taxonomy_node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
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
      place_aggregates: {
        Row: {
          computed_at: string | null
          id: string
          label: string | null
          place_id: string
          save_count: number | null
          segment_json: Json | null
          time_window: string
          unique_savers_count: number | null
        }
        Insert: {
          computed_at?: string | null
          id?: string
          label?: string | null
          place_id: string
          save_count?: number | null
          segment_json?: Json | null
          time_window: string
          unique_savers_count?: number | null
        }
        Update: {
          computed_at?: string | null
          id?: string
          label?: string | null
          place_id?: string
          save_count?: number | null
          segment_json?: Json | null
          time_window?: string
          unique_savers_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "place_aggregates_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_geo_areas: {
        Row: {
          confidence: number | null
          created_at: string | null
          geo_area_id: string
          id: string
          place_id: string
          source: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          geo_area_id: string
          id?: string
          place_id: string
          source: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          geo_area_id?: string
          id?: string
          place_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_geo_areas_geo_area_id_fkey"
            columns: ["geo_area_id"]
            isOneToOne: false
            referencedRelation: "geo_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_geo_areas_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_taxonomy: {
        Row: {
          computed_at: string | null
          confidence: number | null
          id: string
          place_id: string
          source: string
          taxonomy_node_id: string
        }
        Insert: {
          computed_at?: string | null
          confidence?: number | null
          id?: string
          place_id: string
          source: string
          taxonomy_node_id: string
        }
        Update: {
          computed_at?: string | null
          confidence?: number | null
          id?: string
          place_id?: string
          source?: string
          taxonomy_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_taxonomy_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_taxonomy_taxonomy_node_id_fkey"
            columns: ["taxonomy_node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_status: string | null
          city: string | null
          country: string | null
          created_at: string
          fetch_version: number | null
          formatted_address: string | null
          google_maps_url: string | null
          google_place_id: string
          google_primary_type: string | null
          google_primary_type_display: string | null
          google_types: string[] | null
          id: string
          is_active: boolean | null
          last_fetched_at: string | null
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
          utc_offset_minutes: number | null
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
          business_status?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          fetch_version?: number | null
          formatted_address?: string | null
          google_maps_url?: string | null
          google_place_id: string
          google_primary_type?: string | null
          google_primary_type_display?: string | null
          google_types?: string[] | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
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
          utc_offset_minutes?: number | null
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
          business_status?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          fetch_version?: number | null
          formatted_address?: string | null
          google_maps_url?: string | null
          google_place_id?: string
          google_primary_type?: string | null
          google_primary_type_display?: string | null
          google_types?: string[] | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
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
          utc_offset_minutes?: number | null
          vibe_conversation?: boolean | null
          vibe_daytime?: boolean | null
          vibe_energy?: number | null
          vibe_evening?: boolean | null
          vibe_formality?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      places_google_snapshots: {
        Row: {
          created_at: string | null
          fetched_at: string
          id: string
          place_id: string
          raw_response: Json
          source: string
        }
        Insert: {
          created_at?: string | null
          fetched_at?: string
          id?: string
          place_id: string
          raw_response: Json
          source?: string
        }
        Update: {
          created_at?: string | null
          fetched_at?: string
          id?: string
          place_id?: string
          raw_response?: Json
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "places_google_snapshots_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      taxonomy_nodes: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          kind: string
          name: string
          parent_id: string | null
          slug: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          kind: string
          name: string
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          kind?: string
          name?: string
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
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
      city_seeding_progress: {
        Row: {
          approved_place_count: number | null
          completion_percentage: number | null
          country: string | null
          curated_place_count: number | null
          current_place_count: number | null
          google_place_id: string | null
          id: string | null
          is_ready_to_launch: boolean | null
          lat: number | null
          launched_at: string | null
          lng: number | null
          name: string | null
          pending_place_count: number | null
          state: string | null
          status: Database["public"]["Enums"]["city_status"] | null
          target_anchor_count: number | null
          target_place_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      compute_place_aggregates: { Args: never; Returns: undefined }
      create_couple_for_current_user:
        | { Args: never; Returns: string }
        | { Args: { unit_type?: string }; Returns: string }
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
      city_status: "draft" | "launched" | "paused"
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
      city_status: ["draft", "launched", "paused"],
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
