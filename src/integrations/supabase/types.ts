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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      car_listing_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          listing_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          listing_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      car_listings: {
        Row: {
          admin_created: boolean
          availability_confirmed_at: string | null
          availability_status: string
          boost_approved_at: string | null
          boost_approved_by: string | null
          boosted_until: string | null
          color: string | null
          condition: string
          created_at: string
          description: string | null
          expires_at: string | null
          featured_until: string | null
          features: string[] | null
          fuel_type: string | null
          id: string
          images: string[] | null
          is_boosted: boolean | null
          is_featured: boolean | null
          is_top_listing: boolean | null
          listing_duration: number
          listing_plan: string
          listing_price: number
          location: string
          make: string
          mileage: string | null
          model: string
          payment_reference: string | null
          price: number
          sold_at: string | null
          status: string
          transmission: string | null
          updated_at: string
          user_id: string | null
          year: string
        }
        Insert: {
          admin_created?: boolean
          availability_confirmed_at?: string | null
          availability_status?: string
          boost_approved_at?: string | null
          boost_approved_by?: string | null
          boosted_until?: string | null
          color?: string | null
          condition: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          featured_until?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          is_boosted?: boolean | null
          is_featured?: boolean | null
          is_top_listing?: boolean | null
          listing_duration?: number
          listing_plan?: string
          listing_price?: number
          location: string
          make: string
          mileage?: string | null
          model: string
          payment_reference?: string | null
          price: number
          sold_at?: string | null
          status?: string
          transmission?: string | null
          updated_at?: string
          user_id?: string | null
          year: string
        }
        Update: {
          admin_created?: boolean
          availability_confirmed_at?: string | null
          availability_status?: string
          boost_approved_at?: string | null
          boost_approved_by?: string | null
          boosted_until?: string | null
          color?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          featured_until?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          is_boosted?: boolean | null
          is_featured?: boolean | null
          is_top_listing?: boolean | null
          listing_duration?: number
          listing_plan?: string
          listing_price?: number
          location?: string
          make?: string
          mileage?: string | null
          model?: string
          payment_reference?: string | null
          price?: number
          sold_at?: string | null
          status?: string
          transmission?: string | null
          updated_at?: string
          user_id?: string | null
          year?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      dealers: {
        Row: {
          address: string
          admin_created: boolean
          business_name: string
          cac_number: string
          contact_name: string
          created_at: string
          description: string
          email: string
          featured_until: string | null
          free_listings_used: number
          id: string
          id_card_number: string | null
          id_card_path: string | null
          id_card_type: string | null
          image_url: string | null
          is_featured: boolean | null
          monthly_inventory: string
          payment_reference: string | null
          payment_status: string | null
          phone: string
          state: string
          status: string
          tax_id: string | null
          updated_at: string
          user_id: string | null
          website: string | null
          year_established: string
        }
        Insert: {
          address: string
          admin_created?: boolean
          business_name: string
          cac_number: string
          contact_name: string
          created_at?: string
          description: string
          email: string
          featured_until?: string | null
          free_listings_used?: number
          id?: string
          id_card_number?: string | null
          id_card_path?: string | null
          id_card_type?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          monthly_inventory: string
          payment_reference?: string | null
          payment_status?: string | null
          phone: string
          state: string
          status?: string
          tax_id?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          year_established: string
        }
        Update: {
          address?: string
          admin_created?: boolean
          business_name?: string
          cac_number?: string
          contact_name?: string
          created_at?: string
          description?: string
          email?: string
          featured_until?: string | null
          free_listings_used?: number
          id?: string
          id_card_number?: string | null
          id_card_path?: string | null
          id_card_type?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          monthly_inventory?: string
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string
          state?: string
          status?: string
          tax_id?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          year_established?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      mid_identities: {
        Row: {
          created_at: string
          issued_by: string
          mid: string
          phone_verified: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          issued_by?: string
          mid: string
          phone_verified?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          issued_by?: string
          mid?: string
          phone_verified?: boolean
          user_id?: string
        }
        Relationships: []
      }
      mid_point_rules: {
        Row: {
          event_type: string
          label: string
          points: number
          version_id: number
        }
        Insert: {
          event_type: string
          label: string
          points: number
          version_id: number
        }
        Update: {
          event_type?: string
          label?: string
          points?: number
          version_id?: number
        }
        Relationships: []
      }
      mid_score_ledger: {
        Row: {
          config_version_id: number
          created_at: string
          event_key: string
          event_type: string
          id: number
          points: number
          source_ref: string | null
          user_id: string
        }
        Insert: {
          config_version_id: number
          created_at?: string
          event_key: string
          event_type: string
          id?: number
          points: number
          source_ref?: string | null
          user_id: string
        }
        Update: {
          config_version_id?: number
          created_at?: string
          event_key?: string
          event_type?: string
          id?: number
          points?: number
          source_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mid_tiers: {
        Row: {
          min_score: number
          title: string
          version_id: number
        }
        Insert: {
          min_score: number
          title: string
          version_id: number
        }
        Update: {
          min_score?: number
          title?: string
          version_id?: number
        }
        Relationships: []
      }
      platform_features: {
        Row: {
          feature: string
          mode: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          feature: string
          mode?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          feature?: string
          mode?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      score_config_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          is_active: boolean
          label: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: number
          is_active?: boolean
          label: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: number
          is_active?: boolean
          label?: string
        }
        Relationships: []
      }
      listing_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          details: string | null
          id: string
          listing_id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          listing_id: string
          reason: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          listing_id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_enhancement_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          duration_days: number
          enhancement_type: string
          id: string
          listing_id: string
          payment_reference: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          duration_days?: number
          enhancement_type: string
          id?: string
          listing_id: string
          payment_reference?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          duration_days?: number
          enhancement_type?: string
          id?: string
          listing_id?: string
          payment_reference?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allow_messages: boolean | null
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          monthly_listings_reset_date: string | null
          monthly_listings_used: number | null
          phone: string | null
          show_phone_number: boolean | null
          show_profile: boolean | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          allow_messages?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          monthly_listings_reset_date?: string | null
          monthly_listings_used?: number | null
          phone?: string | null
          show_phone_number?: boolean | null
          show_profile?: boolean | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          allow_messages?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          monthly_listings_reset_date?: string | null
          monthly_listings_used?: number | null
          phone?: string | null
          show_phone_number?: boolean | null
          show_profile?: boolean | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      assign_admin_role: {
        Args: { user_email: string }
        Returns: boolean
      }
      can_create_free_listing: {
        Args: { user_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          notification_message: string
          notification_metadata?: Json
          notification_title: string
          notification_type?: string
          target_user_id: string
        }
        Returns: string
      }
      expire_featured_listings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_public_dealer: {
        Args: { dealer_id: string }
        Returns: {
          address: string
          business_name: string
          created_at: string
          description: string
          id: string
          image_url: string
          is_featured: boolean
          phone: string
          state: string
          user_id: string
          website: string
          year_established: string
        }[]
      }
      get_public_mid: {
        Args: { _user_id: string }
        Returns: {
          cycles_sealed: number
          issued_by: string
          mid: string | null
          phone_verified: boolean
          score: number
          tier: string
        }[]
      }
      issue_my_mid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      publish_score_config: {
        Args: { _label: string; _rules: Json }
        Returns: number
      }
      get_public_dealer_by_seller: {
        Args: { seller_id: string }
        Returns: {
          business_name: string
          id: string
          state: string
        }[]
      }
      get_public_dealers: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_name: string
          created_at: string
          description: string
          id: string
          image_url: string
          is_featured: boolean
          state: string
          website: string
          year_established: string
        }[]
      }
      get_seller_info_for_listing: {
        Args: { listing_user_id: string }
        Returns: {
          first_name: string
          id: string
          last_name: string
          user_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      renew_listing: {
        Args: { listing_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
