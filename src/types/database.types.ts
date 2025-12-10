// Database types for Supabase tables - matches your exact schema
export interface Database {
  public: {
    Tables: {
      caregivers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string | null;
          created_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          name: string;
          avatar: string | null;
          phone: string | null;
          guardian_phone: string | null;
          caregiver_id: string | null;
          pairing_code: string | null;
          current_location: unknown | null; // PostgreSQL POINT type
          is_navigating: boolean;
          is_deviated: boolean;
          deviation_distance: number | null;
          last_location_update: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar?: string | null;
          phone?: string | null;
          guardian_phone?: string | null;
          caregiver_id?: string | null;
          pairing_code?: string | null;
          current_location?: unknown | null;
          is_navigating?: boolean;
          is_deviated?: boolean;
          deviation_distance?: number | null;
          last_location_update?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string | null;
          phone?: string | null;
          guardian_phone?: string | null;
          caregiver_id?: string | null;
          pairing_code?: string | null;
          current_location?: unknown | null;
          is_navigating?: boolean;
          is_deviated?: boolean;
          deviation_distance?: number | null;
          last_location_update?: string | null;
          created_at?: string;
        };
      };
      saved_destinations: {
        Row: {
          id: string;
          patient_id: string;
          name: string;
          address: string;
          coordinates: unknown | null; // PostgreSQL POINT type
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          name: string;
          address: string;
          coordinates: unknown | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          name?: string;
          address?: string;
          coordinates?: unknown | null;
          category?: string | null;
          created_at?: string;
        };
      };
      route_deviations: {
        Row: {
          id: string;
          patient_id: string;
          deviation_distance: number;
          location: unknown | null; // PostgreSQL POINT type
          acknowledged_at: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          deviation_distance: number;
          location?: unknown | null;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          deviation_distance?: number;
          location?: unknown | null;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
