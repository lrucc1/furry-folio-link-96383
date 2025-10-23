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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      family_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string | null
          member_email: string
          member_user_id: string | null
          owner_id: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          member_email: string
          member_user_id?: string | null
          owner_id: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          member_email?: string
          member_user_id?: string | null
          owner_id?: string
          status?: string | null
        }
        Relationships: []
      }
      health_reminders: {
        Row: {
          completed: boolean | null
          created_at: string
          description: string | null
          id: string
          pet_id: string
          reminder_date: string
          reminder_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          pet_id: string
          reminder_date: string
          reminder_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          pet_id?: string
          reminder_date?: string
          reminder_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_reminders_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_consents: {
        Row: {
          consent_type: string
          consented_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          version: string | null
        }
        Insert: {
          consent_type: string
          consented_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          version?: string | null
        }
        Update: {
          consent_type?: string
          consented_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pet_documents: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          pet_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          pet_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          pet_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_documents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_invites: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          pet_id: string
          role: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          pet_id: string
          role: string
          status?: string
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          pet_id?: string
          role?: string
          status?: string
          token?: string
        }
        Relationships: []
      }
      pet_memberships: {
        Row: {
          created_at: string | null
          id: string
          pet_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pet_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pet_id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          age_months: number | null
          age_years: number | null
          allergies: string | null
          breed: string | null
          clinic_address: string | null
          clinic_lat: number | null
          clinic_lng: number | null
          clinic_name: string | null
          clinic_postcode: string | null
          clinic_state: string | null
          clinic_suburb: string | null
          color: string | null
          created_at: string
          date_of_birth: string | null
          desexed: boolean | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: string | null
          id: string
          insurance_policy: string | null
          insurance_provider: string | null
          is_lost: boolean | null
          medical_conditions: string | null
          medications: string | null
          microchip_number: string | null
          name: string
          notes: string | null
          photo_url: string | null
          public_id: string
          registry_link: string | null
          registry_name: string | null
          species: string
          status: string | null
          updated_at: string
          user_id: string
          vet_email: string | null
          vet_name: string | null
          vet_phone: string | null
          weight_kg: number | null
        }
        Insert: {
          age_months?: number | null
          age_years?: number | null
          allergies?: string | null
          breed?: string | null
          clinic_address?: string | null
          clinic_lat?: number | null
          clinic_lng?: number | null
          clinic_name?: string | null
          clinic_postcode?: string | null
          clinic_state?: string | null
          clinic_suburb?: string | null
          color?: string | null
          created_at?: string
          date_of_birth?: string | null
          desexed?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          insurance_policy?: string | null
          insurance_provider?: string | null
          is_lost?: boolean | null
          medical_conditions?: string | null
          medications?: string | null
          microchip_number?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          public_id?: string
          registry_link?: string | null
          registry_name?: string | null
          species: string
          status?: string | null
          updated_at?: string
          user_id: string
          vet_email?: string | null
          vet_name?: string | null
          vet_phone?: string | null
          weight_kg?: number | null
        }
        Update: {
          age_months?: number | null
          age_years?: number | null
          allergies?: string | null
          breed?: string | null
          clinic_address?: string | null
          clinic_lat?: number | null
          clinic_lng?: number | null
          clinic_name?: string | null
          clinic_postcode?: string | null
          clinic_state?: string | null
          clinic_suburb?: string | null
          color?: string | null
          created_at?: string
          date_of_birth?: string | null
          desexed?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          insurance_policy?: string | null
          insurance_provider?: string | null
          is_lost?: boolean | null
          medical_conditions?: string | null
          medications?: string | null
          microchip_number?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          public_id?: string
          registry_link?: string | null
          registry_name?: string | null
          species?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          vet_email?: string | null
          vet_name?: string | null
          vet_phone?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      plan_audit: {
        Row: {
          action: string
          actor_id: string
          created_at: string | null
          id: number
          new_tier: string
          note: string | null
          target_id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string | null
          id?: number
          new_tier: string
          note?: string | null
          target_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string | null
          id?: number
          new_tier?: string
          note?: string | null
          target_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          deletion_scheduled: boolean | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          latest_invoice_id: string | null
          manual_override: boolean | null
          next_billing_at: string | null
          phone: string | null
          plan_expires_at: string | null
          plan_notes: string | null
          plan_source: string | null
          plan_tier: string | null
          plan_updated_at: string | null
          plan_v2: string | null
          role: string | null
          stripe_current_period_end: string | null
          stripe_customer_id: string | null
          stripe_status: string | null
          stripe_subscription_id: string | null
          stripe_tier: string | null
          subscription_status: string | null
          trial_end_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_scheduled?: boolean | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          latest_invoice_id?: string | null
          manual_override?: boolean | null
          next_billing_at?: string | null
          phone?: string | null
          plan_expires_at?: string | null
          plan_notes?: string | null
          plan_source?: string | null
          plan_tier?: string | null
          plan_updated_at?: string | null
          plan_v2?: string | null
          role?: string | null
          stripe_current_period_end?: string | null
          stripe_customer_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          stripe_tier?: string | null
          subscription_status?: string | null
          trial_end_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_scheduled?: boolean | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          latest_invoice_id?: string | null
          manual_override?: boolean | null
          next_billing_at?: string | null
          phone?: string | null
          plan_expires_at?: string | null
          plan_notes?: string | null
          plan_source?: string | null
          plan_tier?: string | null
          plan_updated_at?: string | null
          plan_v2?: string | null
          role?: string | null
          stripe_current_period_end?: string | null
          stripe_customer_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          stripe_tier?: string | null
          subscription_status?: string | null
          trial_end_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      smart_tag_interest: {
        Row: {
          comments: string | null
          created_at: string | null
          email: string
          features: string[] | null
          id: number
          likelihood: number
          name: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          email: string
          features?: string[] | null
          id?: number
          likelihood: number
          name?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          email?: string
          features?: string[] | null
          id?: number
          likelihood?: number
          name?: string | null
        }
        Relationships: []
      }
      storage_usage: {
        Row: {
          id: string
          total_bytes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          total_bytes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          total_bytes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          error: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          received_at: string | null
        }
        Insert: {
          error?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string | null
        }
        Update: {
          error?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string | null
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          max_pets: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_pets?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_pets?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          stripe_price_id?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          created_at: string | null
          id: string
          next_due_date: string | null
          notes: string | null
          pet_id: string
          updated_at: string | null
          user_id: string
          vaccine_date: string
          vaccine_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          updated_at?: string | null
          user_id: string
          vaccine_date: string
          vaccine_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          updated_at?: string | null
          user_id?: string
          vaccine_date?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_storage: { Args: { p_user_id: string }; Returns: number }
      can_edit_pet: {
        Args: { _pet_id: string; _user_id: string }
        Returns: boolean
      }
      get_admin_stats: { Args: never; Returns: Json }
      get_all_users_admin: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          pet_count: number
          plan_tier: string
          roles: string[]
          user_id: string
        }[]
      }
      get_database_stats: { Args: never; Returns: Json }
      get_system_activity_stats: { Args: never; Returns: Json }
      get_user_growth_stats: { Args: never; Returns: Json }
      get_user_plan: { Args: { p_user_id: string }; Returns: string }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_pet_access: {
        Args: { _pet_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "vet"
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
      app_role: ["admin", "moderator", "user", "vet"],
    },
  },
} as const
