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
      ambassador_applications: {
        Row: {
          admin_notes: string | null
          business_affiliation_details: string | null
          city_country: string
          city_google_place_id: string | null
          city_name: string
          city_state: string | null
          created_at: string
          email: string
          has_business_affiliation: boolean | null
          id: string
          local_knowledge: string
          motivation: string | null
          name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_links: string | null
          specific_places: string | null
          status: string
          tenure: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_affiliation_details?: string | null
          city_country?: string
          city_google_place_id?: string | null
          city_name?: string
          city_state?: string | null
          created_at?: string
          email: string
          has_business_affiliation?: boolean | null
          id?: string
          local_knowledge: string
          motivation?: string | null
          name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: string | null
          specific_places?: string | null
          status?: string
          tenure?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_affiliation_details?: string | null
          city_country?: string
          city_google_place_id?: string | null
          city_name?: string
          city_state?: string | null
          created_at?: string
          email?: string
          has_business_affiliation?: boolean | null
          id?: string
          local_knowledge?: string
          motivation?: string | null
          name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: string | null
          specific_places?: string | null
          status?: string
          tenure?: string
          user_id?: string | null
        }
        Relationships: []
      }
      canonical_tags: {
        Row: {
          applicable_google_types: string[] | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          has_page: boolean | null
          id: string
          is_active: boolean | null
          is_sensitive: boolean | null
          label: string
          slug: string
        }
        Insert: {
          applicable_google_types?: string[] | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          has_page?: boolean | null
          id?: string
          is_active?: boolean | null
          is_sensitive?: boolean | null
          label: string
          slug: string
        }
        Update: {
          applicable_google_types?: string[] | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          has_page?: boolean | null
          id?: string
          is_active?: boolean | null
          is_sensitive?: boolean | null
          label?: string
          slug?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          auto_launch_threshold: number
          country: string
          created_at: string
          founders_promo_code: string | null
          founders_promo_code_id: string | null
          founders_slots_total: number | null
          founders_slots_used: number | null
          google_place_id: string | null
          id: string
          lat: number | null
          launched_at: string | null
          launched_by: string | null
          lng: number | null
          metro_id: string | null
          name: string
          state: string | null
          status: Database["public"]["Enums"]["city_status"]
          target_anchor_count: number
          target_place_count: number
          updated_at: string
        }
        Insert: {
          auto_launch_threshold?: number
          country?: string
          created_at?: string
          founders_promo_code?: string | null
          founders_promo_code_id?: string | null
          founders_slots_total?: number | null
          founders_slots_used?: number | null
          google_place_id?: string | null
          id?: string
          lat?: number | null
          launched_at?: string | null
          launched_by?: string | null
          lng?: number | null
          metro_id?: string | null
          name: string
          state?: string | null
          status?: Database["public"]["Enums"]["city_status"]
          target_anchor_count?: number
          target_place_count?: number
          updated_at?: string
        }
        Update: {
          auto_launch_threshold?: number
          country?: string
          created_at?: string
          founders_promo_code?: string | null
          founders_promo_code_id?: string | null
          founders_slots_total?: number | null
          founders_slots_used?: number | null
          google_place_id?: string | null
          id?: string
          lat?: number | null
          launched_at?: string | null
          launched_by?: string | null
          lng?: number | null
          metro_id?: string | null
          name?: string
          state?: string | null
          status?: Database["public"]["Enums"]["city_status"]
          target_anchor_count?: number
          target_place_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_metro_id_fkey"
            columns: ["metro_id"]
            isOneToOne: false
            referencedRelation: "geo_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      city_suggestions: {
        Row: {
          country: string
          created_at: string
          google_place_id: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state: string | null
          status: string
          submitted_by: string
        }
        Insert: {
          country?: string
          created_at?: string
          google_place_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string | null
          status?: string
          submitted_by: string
        }
        Update: {
          country?: string
          created_at?: string
          google_place_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string | null
          status?: string
          submitted_by?: string
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
      cron_job_runs: {
        Row: {
          cities_processed: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          job_name: string
          started_at: string
          status: string | null
        }
        Insert: {
          cities_processed?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_name: string
          started_at?: string
          status?: string | null
        }
        Update: {
          cities_processed?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_name?: string
          started_at?: string
          status?: string | null
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
          posted_by: string | null
          social_energy_level: number | null
          source: Database["public"]["Enums"]["place_source"]
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
          stripe_subscription_id: string | null
          submitted_by: string | null
          updated_at: string
          venue_place_id: string
          visibility_end_at: string | null
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
          posted_by?: string | null
          social_energy_level?: number | null
          source?: Database["public"]["Enums"]["place_source"]
          start_at: string
          status?: Database["public"]["Enums"]["event_status"]
          stripe_subscription_id?: string | null
          submitted_by?: string | null
          updated_at?: string
          venue_place_id: string
          visibility_end_at?: string | null
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
          posted_by?: string | null
          social_energy_level?: number | null
          source?: Database["public"]["Enums"]["place_source"]
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          stripe_subscription_id?: string | null
          submitted_by?: string | null
          updated_at?: string
          venue_place_id?: string
          visibility_end_at?: string | null
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
      founders_redemptions: {
        Row: {
          city_id: string | null
          couple_id: string | null
          created_at: string | null
          id: string
          redeemed_at: string | null
          stripe_promo_code_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          city_id?: string | null
          couple_id?: string | null
          created_at?: string | null
          id?: string
          redeemed_at?: string | null
          stripe_promo_code_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          city_id?: string | null
          couple_id?: string | null
          created_at?: string | null
          id?: string
          redeemed_at?: string | null
          stripe_promo_code_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founders_redemptions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founders_redemptions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_seeding_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founders_redemptions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "launched_cities_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founders_redemptions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
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
      metro_counties: {
        Row: {
          country_code: string
          county_name: string
          created_at: string | null
          id: string
          metro_id: string
          state_code: string
        }
        Insert: {
          country_code?: string
          county_name: string
          created_at?: string | null
          id?: string
          metro_id: string
          state_code: string
        }
        Update: {
          country_code?: string
          county_name?: string
          created_at?: string | null
          id?: string
          metro_id?: string
          state_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "metro_counties_metro_id_fkey"
            columns: ["metro_id"]
            isOneToOne: false
            referencedRelation: "geo_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      overlap_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          initiator_id: string
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          location_set_by: string | null
          location_state: string | null
          partner_id: string | null
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          initiator_id: string
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_set_by?: string | null
          location_state?: string | null
          partner_id?: string | null
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          initiator_id?: string
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_set_by?: string | null
          location_state?: string | null
          partner_id?: string | null
          status?: string
          token?: string
        }
        Relationships: []
      }
      paid_tuning_definitions: {
        Row: {
          confidence_cap: number | null
          created_at: string | null
          description: string | null
          domain: string
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          maps_to_categories: string[]
          sort_order: number | null
          tuning_key: string
        }
        Insert: {
          confidence_cap?: number | null
          created_at?: string | null
          description?: string | null
          domain: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          maps_to_categories: string[]
          sort_order?: number | null
          tuning_key: string
        }
        Update: {
          confidence_cap?: number | null
          created_at?: string | null
          description?: string | null
          domain?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          maps_to_categories?: string[]
          sort_order?: number | null
          tuning_key?: string
        }
        Relationships: []
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
      place_context_density: {
        Row: {
          city_id: string
          context_key: string
          density_score: number
          id: string
          last_updated: string | null
          meets_k_threshold: boolean
          place_id: string
        }
        Insert: {
          city_id: string
          context_key: string
          density_score?: number
          id?: string
          last_updated?: string | null
          meets_k_threshold?: boolean
          place_id: string
        }
        Update: {
          city_id?: string
          context_key?: string
          density_score?: number
          id?: string
          last_updated?: string | null
          meets_k_threshold?: boolean
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_context_density_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_context_density_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_seeding_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_context_density_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "launched_cities_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_context_density_context_key_fkey"
            columns: ["context_key"]
            isOneToOne: false
            referencedRelation: "admin_outdoor_preference_debug"
            referencedColumns: ["preference"]
          },
          {
            foreignKeyName: "place_context_density_context_key_fkey"
            columns: ["context_key"]
            isOneToOne: false
            referencedRelation: "pro_context_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "place_context_density_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_context_priors: {
        Row: {
          city_id: string
          confidence: number
          context_key: string
          created_at: string | null
          id: string
          place_id: string
          updated_at: string | null
        }
        Insert: {
          city_id: string
          confidence: number
          context_key: string
          created_at?: string | null
          id?: string
          place_id: string
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          confidence?: number
          context_key?: string
          created_at?: string | null
          id?: string
          place_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_context_priors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_context_priors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_seeding_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_context_priors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "launched_cities_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_context_priors_context_key_fkey"
            columns: ["context_key"]
            isOneToOne: false
            referencedRelation: "admin_outdoor_preference_debug"
            referencedColumns: ["preference"]
          },
          {
            foreignKeyName: "place_context_priors_context_key_fkey"
            columns: ["context_key"]
            isOneToOne: false
            referencedRelation: "pro_context_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "place_context_priors_place_id_fkey"
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
      place_niche_tags: {
        Row: {
          confidence: number | null
          created_at: string | null
          evidence_ref: string | null
          evidence_type: string | null
          id: string
          place_id: string
          tag: string
          updated_at: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          evidence_ref?: string | null
          evidence_type?: string | null
          id?: string
          place_id: string
          tag: string
          updated_at?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          evidence_ref?: string | null
          evidence_type?: string | null
          id?: string
          place_id?: string
          tag?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_niche_tags_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_tag_aggregates: {
        Row: {
          id: string
          last_computed: string | null
          meets_k_threshold: boolean
          place_id: string
          tag_slug: string
          unique_taggers: number
        }
        Insert: {
          id?: string
          last_computed?: string | null
          meets_k_threshold?: boolean
          place_id: string
          tag_slug: string
          unique_taggers?: number
        }
        Update: {
          id?: string
          last_computed?: string | null
          meets_k_threshold?: boolean
          place_id?: string
          tag_slug?: string
          unique_taggers?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_tag_aggregates_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_tag_aggregates_tag_slug_fkey"
            columns: ["tag_slug"]
            isOneToOne: false
            referencedRelation: "canonical_tags"
            referencedColumns: ["slug"]
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
          allows_dogs: boolean | null
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
          has_restroom: boolean | null
          id: string
          is_active: boolean | null
          last_fetched_at: string | null
          lat: number | null
          lng: number | null
          name: string
          national_park_id: string | null
          opening_hours: Json | null
          outdoor_seating: boolean | null
          phone_number: string | null
          photos: Json | null
          photos_stored_at: string | null
          price_level: number | null
          primary_category: string
          rating: number | null
          secondary_categories: string[] | null
          source: Database["public"]["Enums"]["place_source"]
          state: string | null
          status: Database["public"]["Enums"]["place_status"]
          stored_photo_urls: string[] | null
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
          wheelchair_accessible_entrance: boolean | null
          wheelchair_accessible_restroom: boolean | null
          wheelchair_accessible_seating: boolean | null
        }
        Insert: {
          allows_dogs?: boolean | null
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
          has_restroom?: boolean | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          national_park_id?: string | null
          opening_hours?: Json | null
          outdoor_seating?: boolean | null
          phone_number?: string | null
          photos?: Json | null
          photos_stored_at?: string | null
          price_level?: number | null
          primary_category: string
          rating?: number | null
          secondary_categories?: string[] | null
          source?: Database["public"]["Enums"]["place_source"]
          state?: string | null
          status?: Database["public"]["Enums"]["place_status"]
          stored_photo_urls?: string[] | null
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
          wheelchair_accessible_entrance?: boolean | null
          wheelchair_accessible_restroom?: boolean | null
          wheelchair_accessible_seating?: boolean | null
        }
        Update: {
          allows_dogs?: boolean | null
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
          has_restroom?: boolean | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          national_park_id?: string | null
          opening_hours?: Json | null
          outdoor_seating?: boolean | null
          phone_number?: string | null
          photos?: Json | null
          photos_stored_at?: string | null
          price_level?: number | null
          primary_category?: string
          rating?: number | null
          secondary_categories?: string[] | null
          source?: Database["public"]["Enums"]["place_source"]
          state?: string | null
          status?: Database["public"]["Enums"]["place_status"]
          stored_photo_urls?: string[] | null
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
          wheelchair_accessible_entrance?: boolean | null
          wheelchair_accessible_restroom?: boolean | null
          wheelchair_accessible_seating?: boolean | null
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
      post_places: {
        Row: {
          context_note: string | null
          created_at: string
          id: string
          place_id: string
          post_id: string
          sort_order: number
        }
        Insert: {
          context_note?: string | null
          created_at?: string
          id?: string
          place_id: string
          post_id: string
          sort_order?: number
        }
        Update: {
          context_note?: string | null
          created_at?: string
          id?: string
          place_id?: string
          post_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_places_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          created_at: string | null
          id: string
          interest_id: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_id: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string | null
          city_id: string
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          excerpt: string | null
          external_url: string | null
          id: string
          is_recurring: boolean
          meta_description: string | null
          place_id: string | null
          recurrence_text: string | null
          slug: string | null
          start_date: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          city_id: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          excerpt?: string | null
          external_url?: string | null
          id?: string
          is_recurring?: boolean
          meta_description?: string | null
          place_id?: string | null
          recurrence_text?: string | null
          slug?: string | null
          start_date?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          city_id?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          excerpt?: string | null
          external_url?: string | null
          id?: string
          is_recurring?: boolean
          meta_description?: string | null
          place_id?: string | null
          recurrence_text?: string | null
          slug?: string | null
          start_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_seeding_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "launched_cities_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      preference_definitions: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          label: string
          maps_to_primary_categories: string[] | null
          maps_to_taxonomy_slugs: string[] | null
          preference_key: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          label: string
          maps_to_primary_categories?: string[] | null
          maps_to_taxonomy_slugs?: string[] | null
          preference_key: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          label?: string
          maps_to_primary_categories?: string[] | null
          maps_to_taxonomy_slugs?: string[] | null
          preference_key?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pro_context_definitions: {
        Row: {
          created_at: string | null
          default_confidence_cap: number
          description: string | null
          domain: string
          icon: string | null
          id: string
          influence_mode: string
          input_type: string | null
          is_active: boolean | null
          is_sensitive: boolean | null
          key: string
          label: string | null
          legacy_key: string | null
          maps_to_google_types: string[] | null
          section: string | null
          show_condition: Json | null
          sort_order: number | null
          step: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_confidence_cap?: number
          description?: string | null
          domain: string
          icon?: string | null
          id?: string
          influence_mode?: string
          input_type?: string | null
          is_active?: boolean | null
          is_sensitive?: boolean | null
          key: string
          label?: string | null
          legacy_key?: string | null
          maps_to_google_types?: string[] | null
          section?: string | null
          show_condition?: Json | null
          sort_order?: number | null
          step?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_confidence_cap?: number
          description?: string | null
          domain?: string
          icon?: string | null
          id?: string
          influence_mode?: string
          input_type?: string | null
          is_active?: boolean | null
          is_sensitive?: boolean | null
          key?: string
          label?: string | null
          legacy_key?: string | null
          maps_to_google_types?: string[] | null
          section?: string | null
          show_condition?: Json | null
          sort_order?: number | null
          step?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          couple_id: string
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          canceled_at?: string | null
          couple_id: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          canceled_at?: string | null
          couple_id?: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: true
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_pages: {
        Row: {
          body_markdown: string
          created_at: string | null
          external_link_label: string | null
          external_link_url: string | null
          id: string
          is_published: boolean | null
          seo_description: string | null
          seo_title: string | null
          subtitle: string | null
          tag_slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          body_markdown: string
          created_at?: string | null
          external_link_label?: string | null
          external_link_url?: string | null
          id?: string
          is_published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          subtitle?: string | null
          tag_slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          body_markdown?: string
          created_at?: string | null
          external_link_label?: string | null
          external_link_url?: string | null
          id?: string
          is_published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          subtitle?: string | null
          tag_slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tag_pages_tag_slug_fkey"
            columns: ["tag_slug"]
            isOneToOne: true
            referencedRelation: "canonical_tags"
            referencedColumns: ["slug"]
          },
        ]
      }
      tag_signals: {
        Row: {
          action: string
          created_at: string | null
          id: string
          place_id: string
          tag_slug: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          place_id: string
          tag_slug: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          place_id?: string
          tag_slug?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_signals_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_signals_tag_slug_fkey"
            columns: ["tag_slug"]
            isOneToOne: false
            referencedRelation: "canonical_tags"
            referencedColumns: ["slug"]
          },
        ]
      }
      tag_suggestions: {
        Row: {
          created_at: string | null
          id: string
          merged_into_slug: string | null
          place_id: string | null
          rationale: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          suggested_category: string | null
          suggested_label: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          merged_into_slug?: string | null
          place_id?: string | null
          rationale?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_category?: string | null
          suggested_label: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          merged_into_slug?: string | null
          place_id?: string | null
          rationale?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_category?: string | null
          suggested_label?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_suggestions_merged_into_slug_fkey"
            columns: ["merged_into_slug"]
            isOneToOne: false
            referencedRelation: "canonical_tags"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "tag_suggestions_place_id_fkey"
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
      trail_blazer_acknowledgements: {
        Row: {
          ack_link_review: boolean
          ack_no_promotion_required: boolean
          ack_no_public_profile: boolean
          ack_place_focus: boolean
          acknowledged_at: string | null
          application_id: string
          id: string
        }
        Insert: {
          ack_link_review?: boolean
          ack_no_promotion_required?: boolean
          ack_no_public_profile?: boolean
          ack_place_focus?: boolean
          acknowledged_at?: string | null
          application_id: string
          id?: string
        }
        Update: {
          ack_link_review?: boolean
          ack_no_promotion_required?: boolean
          ack_no_public_profile?: boolean
          ack_place_focus?: boolean
          acknowledged_at?: string | null
          application_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_blazer_acknowledgements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "ambassador_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_blazer_context_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          key: string
          label: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          label: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          label?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      trail_blazer_expertise_signals: {
        Row: {
          application_id: string
          created_at: string | null
          expertise_areas: string[]
          id: string
          other_expertise_description: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          expertise_areas?: string[]
          id?: string
          other_expertise_description?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          expertise_areas?: string[]
          id?: string
          other_expertise_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trail_blazer_expertise_signals_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "ambassador_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_blazer_identity_signals: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          other_role_description: string | null
          role_types: string[]
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          other_role_description?: string | null
          role_types?: string[]
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          other_role_description?: string | null
          role_types?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "trail_blazer_identity_signals_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "ambassador_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_blazer_permissions: {
        Row: {
          can_attach_external_links: boolean | null
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_attach_external_links?: boolean | null
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_attach_external_links?: boolean | null
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trail_blazer_place_references: {
        Row: {
          admin_place_notes: string | null
          application_id: string
          created_at: string | null
          directory_place_id: string | null
          formatted_address: string | null
          google_place_id: string
          id: string
          place_name: string
          place_status: string
          place_types: string[] | null
        }
        Insert: {
          admin_place_notes?: string | null
          application_id: string
          created_at?: string | null
          directory_place_id?: string | null
          formatted_address?: string | null
          google_place_id: string
          id?: string
          place_name: string
          place_status?: string
          place_types?: string[] | null
        }
        Update: {
          admin_place_notes?: string | null
          application_id?: string
          created_at?: string | null
          directory_place_id?: string | null
          formatted_address?: string | null
          google_place_id?: string
          id?: string
          place_name?: string
          place_status?: string
          place_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "trail_blazer_place_references_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "ambassador_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trail_blazer_place_references_directory_place_id_fkey"
            columns: ["directory_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_blazer_portfolio_links: {
        Row: {
          application_id: string
          content_type: string
          created_at: string | null
          id: string
          notes: string | null
          submitted_order: number
          url: string
        }
        Insert: {
          application_id: string
          content_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          submitted_order?: number
          url: string
        }
        Update: {
          application_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          submitted_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_blazer_portfolio_links_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "ambassador_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_blazer_submissions: {
        Row: {
          admin_notes: string | null
          context_text: string
          context_types: string[]
          created_at: string | null
          external_content_type: string | null
          external_summary: string | null
          external_url: string | null
          google_place_id: string
          has_external_link: boolean | null
          id: string
          place_address: string | null
          place_id: string | null
          place_name: string
          place_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revision_feedback: string | null
          status:
            | Database["public"]["Enums"]["trail_blazer_submission_status"]
            | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          context_text: string
          context_types: string[]
          created_at?: string | null
          external_content_type?: string | null
          external_summary?: string | null
          external_url?: string | null
          google_place_id: string
          has_external_link?: boolean | null
          id?: string
          place_address?: string | null
          place_id?: string | null
          place_name: string
          place_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_feedback?: string | null
          status?:
            | Database["public"]["Enums"]["trail_blazer_submission_status"]
            | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          context_text?: string
          context_types?: string[]
          created_at?: string | null
          external_content_type?: string | null
          external_summary?: string | null
          external_url?: string | null
          google_place_id?: string
          has_external_link?: boolean | null
          id?: string
          place_address?: string | null
          place_id?: string | null
          place_name?: string
          place_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_feedback?: string | null
          status?:
            | Database["public"]["Enums"]["trail_blazer_submission_status"]
            | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_blazer_submissions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_favorites: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          park_id: string
          trail_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          park_id: string
          trail_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          park_id?: string
          trail_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_favorites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      user_place_affinity: {
        Row: {
          affinity_score: number
          confidence: number | null
          id: string
          last_updated: string | null
          overlap_boost: number | null
          place_category: string
          supporting_signals_count: number | null
          taxonomy_node_id: string | null
          user_id: string
        }
        Insert: {
          affinity_score?: number
          confidence?: number | null
          id?: string
          last_updated?: string | null
          overlap_boost?: number | null
          place_category: string
          supporting_signals_count?: number | null
          taxonomy_node_id?: string | null
          user_id: string
        }
        Update: {
          affinity_score?: number
          confidence?: number | null
          id?: string
          last_updated?: string | null
          overlap_boost?: number | null
          place_category?: string
          supporting_signals_count?: number | null
          taxonomy_node_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_place_affinity_taxonomy_node_id_fkey"
            columns: ["taxonomy_node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preference_profiles: {
        Row: {
          confidence: number | null
          created_at: string | null
          derived_from: string
          id: string
          last_computed_at: string | null
          preference_domain: string
          preference_key: string
          user_id: string
          weight: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          derived_from?: string
          id?: string
          last_computed_at?: string | null
          preference_domain: string
          preference_key: string
          user_id: string
          weight?: number
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          derived_from?: string
          id?: string
          last_computed_at?: string | null
          preference_domain?: string
          preference_key?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          activities: string[] | null
          allow_place_visibility: boolean | null
          choice_priority: Json | null
          created_at: string
          display_name: string | null
          distance_preference: string | null
          gear_readiness: string | null
          geo_affinity: string | null
          id: string
          intent_preferences: Json | null
          openness: string[] | null
          place_usage: string[] | null
          planning_horizon: string | null
          preferences_updated_at: string | null
          profile_photo_url: string | null
          prompts_shown: Json | null
          return_preference: string | null
          sensory_sensitivity: Json | null
          time_preference: string | null
          timing_preferences: string[] | null
          uncertainty_tolerance: string | null
          updated_at: string
          user_id: string
          vibe_preference: string | null
          weather_flexibility: string | null
        }
        Insert: {
          activities?: string[] | null
          allow_place_visibility?: boolean | null
          choice_priority?: Json | null
          created_at?: string
          display_name?: string | null
          distance_preference?: string | null
          gear_readiness?: string | null
          geo_affinity?: string | null
          id?: string
          intent_preferences?: Json | null
          openness?: string[] | null
          place_usage?: string[] | null
          planning_horizon?: string | null
          preferences_updated_at?: string | null
          profile_photo_url?: string | null
          prompts_shown?: Json | null
          return_preference?: string | null
          sensory_sensitivity?: Json | null
          time_preference?: string | null
          timing_preferences?: string[] | null
          uncertainty_tolerance?: string | null
          updated_at?: string
          user_id: string
          vibe_preference?: string | null
          weather_flexibility?: string | null
        }
        Update: {
          activities?: string[] | null
          allow_place_visibility?: boolean | null
          choice_priority?: Json | null
          created_at?: string
          display_name?: string | null
          distance_preference?: string | null
          gear_readiness?: string | null
          geo_affinity?: string | null
          id?: string
          intent_preferences?: Json | null
          openness?: string[] | null
          place_usage?: string[] | null
          planning_horizon?: string | null
          preferences_updated_at?: string | null
          profile_photo_url?: string | null
          prompts_shown?: Json | null
          return_preference?: string | null
          sensory_sensitivity?: Json | null
          time_preference?: string | null
          timing_preferences?: string[] | null
          uncertainty_tolerance?: string | null
          updated_at?: string
          user_id?: string
          vibe_preference?: string | null
          weather_flexibility?: string | null
        }
        Relationships: []
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
      user_signals: {
        Row: {
          confidence: number | null
          context_json: Json | null
          created_at: string
          id: string
          signal_key: string
          signal_type: string
          signal_value: string | null
          source: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          context_json?: Json | null
          created_at?: string
          id?: string
          signal_key: string
          signal_type: string
          signal_value?: string | null
          source?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          context_json?: Json | null
          created_at?: string
          id?: string
          signal_key?: string
          signal_type?: string
          signal_value?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_dashboard_stats: {
        Row: {
          active_couples: number | null
          approved_events: number | null
          approved_places: number | null
          avg_favorites_per_couple: number | null
          draft_cities: number | null
          last_refreshed: string | null
          launched_cities: number | null
          new_couples_7d: number | null
          pending_events: number | null
          pending_places: number | null
          ready_to_launch_cities: number | null
          rejected_places: number | null
          total_couples: number | null
        }
        Relationships: []
      }
      admin_outdoor_preference_debug: {
        Row: {
          mapped_types: string[] | null
          matched_place_names: string[] | null
          matched_types: string[] | null
          matching_favorites: number | null
          preference: string | null
          preference_label: string | null
          user_id: string | null
        }
        Relationships: []
      }
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
          metro_id: string | null
          name: string | null
          pending_place_count: number | null
          state: string | null
          status: Database["public"]["Enums"]["city_status"] | null
          target_anchor_count: number | null
          target_place_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_metro_id_fkey"
            columns: ["metro_id"]
            isOneToOne: false
            referencedRelation: "geo_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      launched_cities_summary: {
        Row: {
          country: string | null
          id: string | null
          lat: number | null
          lng: number | null
          name: string | null
          place_count: number | null
          state: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_overlap_sessions: { Args: never; Returns: undefined }
      compute_overlap_affinity: { Args: { _session_id: string }; Returns: Json }
      compute_place_aggregates: { Args: never; Returns: undefined }
      compute_tag_aggregates: { Args: never; Returns: undefined }
      compute_user_affinity:
        | {
            Args: { _user_id: string }
            Returns: {
              affinity_score: number
              category: string
              source_type: string
            }[]
          }
        | { Args: { _is_pro?: boolean; _user_id: string }; Returns: undefined }
      count_founders_redemptions: {
        Args: { _city_id?: string }
        Returns: number
      }
      create_couple_for_current_user: {
        Args: { unit_type?: string }
        Returns: string
      }
      create_overlap_session: { Args: never; Returns: Json }
      end_overlap_session: { Args: { _session_id: string }; Returns: undefined }
      find_metro_for_county: {
        Args: {
          _country_code?: string
          _county_name: string
          _state_code: string
        }
        Returns: {
          metro_id: string
          metro_lat: number
          metro_lng: number
          metro_name: string
          primary_city_name: string
          primary_city_state: string
        }[]
      }
      get_active_overlap_session: { Args: never; Returns: Json }
      get_admin_dashboard_stats: {
        Args: never
        Returns: {
          active_couples: number
          approved_events: number
          approved_places: number
          computed_at: string
          draft_cities: number
          launched_cities: number
          paused_cities: number
          pending_events: number
          pending_places: number
          ready_to_launch_cities: number
          total_cities: number
          total_couples: number
          total_favorites: number
          total_members: number
          total_posts: number
        }[]
      }
      get_admin_user_stats: {
        Args: never
        Returns: {
          active_couples: number
          ambassador_count: number
          complete_profiles: number
          pending_ambassadors: number
          pro_subscribers: number
          total_users: number
        }[]
      }
      get_admin_users_list: {
        Args: {
          _limit?: number
          _offset?: number
          _role_filter?: string
          _search?: string
        }
        Returns: {
          ambassador_status: string
          city: string
          couple_display_name: string
          couple_id: string
          couple_is_complete: boolean
          created_at: string
          email: string
          first_name: string
          is_profile_complete: boolean
          roles: string[]
          state: string
          subscription_status: string
          user_id: string
        }[]
      }
      get_founders_redemptions_with_emails: {
        Args: { _city_id?: string; _limit?: number; _offset?: number }
        Returns: {
          city_id: string
          city_name: string
          city_state: string
          couple_id: string
          created_at: string
          id: string
          redeemed_at: string
          stripe_promo_code_id: string
          stripe_subscription_id: string
          user_email: string
          user_id: string
        }[]
      }
      get_pending_overlap_session: {
        Args: { _session_id: string }
        Returns: Json
      }
      get_preference_aligned_places: {
        Args: { _user_id: string }
        Returns: {
          alignment_boost: number
          place_id: string
        }[]
      }
      get_public_events: {
        Args: { _limit?: number; _status?: string; _venue_place_id?: string }
        Returns: {
          category_tags: string[]
          commitment_level: number
          cost_type: string
          created_at: string
          description: string
          end_at: string
          event_format: string
          event_type: string
          id: string
          is_recurring: boolean
          name: string
          social_energy_level: number
          source: Database["public"]["Enums"]["place_source"]
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue_place_id: string
        }[]
      }
      get_public_posts: {
        Args: { _city_id?: string; _limit?: number }
        Returns: {
          body: string
          city_id: string
          cover_image_url: string
          created_at: string
          end_date: string
          external_url: string
          id: string
          is_recurring: boolean
          place_id: string
          recurrence_text: string
          start_date: string
          status: string
          title: string
          type: string
          updated_at: string
        }[]
      }
      get_user_couple_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_overlap_session: { Args: { _token: string }; Returns: Json }
      nightly_rebuild_context_density: { Args: never; Returns: undefined }
      rebuild_place_context_density: {
        Args: { _city_id?: string }
        Returns: undefined
      }
      record_signals_batch: { Args: { _signals: Json }; Returns: number }
      record_user_signal: {
        Args: {
          _confidence?: number
          _context?: Json
          _signal_key: string
          _signal_type: string
          _signal_value?: string
          _source?: string
        }
        Returns: string
      }
      refresh_admin_dashboard_stats: { Args: never; Returns: undefined }
      update_overlap_session_location: {
        Args: {
          _city: string
          _lat: number
          _lng: number
          _session_id: string
          _state: string
        }
        Returns: undefined
      }
    }
    Enums: {
      affinity_type: "regular" | "occasional" | "aspirational"
      app_role: "admin" | "user" | "ambassador"
      city_status: "draft" | "launched" | "paused"
      couple_status: "onboarding" | "pending_match" | "active" | "paused"
      event_status: "approved" | "pending" | "rejected"
      member_onboarding_step: "profile_pending" | "profile_complete"
      place_cadence: "weekly" | "monthly" | "rare"
      place_source: "google_places" | "admin" | "user_submitted"
      place_status: "approved" | "pending" | "rejected"
      trail_blazer_submission_status:
        | "pending"
        | "approved"
        | "needs_revision"
        | "declined"
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
      app_role: ["admin", "user", "ambassador"],
      city_status: ["draft", "launched", "paused"],
      couple_status: ["onboarding", "pending_match", "active", "paused"],
      event_status: ["approved", "pending", "rejected"],
      member_onboarding_step: ["profile_pending", "profile_complete"],
      place_cadence: ["weekly", "monthly", "rare"],
      place_source: ["google_places", "admin", "user_submitted"],
      place_status: ["approved", "pending", "rejected"],
      trail_blazer_submission_status: [
        "pending",
        "approved",
        "needs_revision",
        "declined",
      ],
    },
  },
} as const
