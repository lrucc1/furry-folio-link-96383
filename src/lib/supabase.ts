import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          phone: string | null
          suburb: string | null
          emergency_contact: string | null
          premium_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          phone?: string | null
          suburb?: string | null
          emergency_contact?: string | null
          premium_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          phone?: string | null
          suburb?: string | null
          emergency_contact?: string | null
          premium_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          user_id: string
          name: string
          species: string
          breed: string | null
          colour: string | null
          sex: string | null
          date_of_birth: string | null
          desexed: boolean
          microchip_number: string | null
          registry_name: string | null
          registry_link: string | null
          vet_clinic: string | null
          insurance_provider: string | null
          insurance_policy: string | null
          notes: string | null
          photo_url: string | null
          is_lost: boolean
          public_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          species: string
          breed?: string | null
          colour?: string | null
          sex?: string | null
          date_of_birth?: string | null
          desexed?: boolean
          microchip_number?: string | null
          registry_name?: string | null
          registry_link?: string | null
          vet_clinic?: string | null
          insurance_provider?: string | null
          insurance_policy?: string | null
          notes?: string | null
          photo_url?: string | null
          is_lost?: boolean
          public_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          species?: string
          breed?: string | null
          colour?: string | null
          sex?: string | null
          date_of_birth?: string | null
          desexed?: boolean
          microchip_number?: string | null
          registry_name?: string | null
          registry_link?: string | null
          vet_clinic?: string | null
          insurance_provider?: string | null
          insurance_policy?: string | null
          notes?: string | null
          photo_url?: string | null
          is_lost?: boolean
          public_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      vaccinations: {
        Row: {
          id: string
          pet_id: string
          name: string
          date: string
          due_date: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          name: string
          date: string
          due_date?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          name?: string
          date?: string
          due_date?: string | null
          file_url?: string | null
          created_at?: string
        }
      }
    }
  }
}