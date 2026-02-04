// Database types for Supabase

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          member_count: number;
          pets: unknown;
          holiday_mode: boolean;
          holiday_until: string | null;
          streak_paused_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code?: string;
          member_count?: number;
          pets?: unknown;
          holiday_mode?: boolean;
          holiday_until?: string | null;
          streak_paused_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          member_count?: number;
          pets?: unknown;
          holiday_mode?: boolean;
          holiday_until?: string | null;
          streak_paused_at?: string | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          clerk_id: string;
          name: string | null;
          avatar_url: string | null;
          household_id: string | null;
          total_points: number;
          current_streak: number;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          name?: string | null;
          avatar_url?: string | null;
          household_id?: string | null;
          total_points?: number;
          current_streak?: number;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          name?: string | null;
          avatar_url?: string | null;
          household_id?: string | null;
          total_points?: number;
          current_streak?: number;
        };
      };
      rooms: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          icon: string;
          color: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          icon?: string;
          color?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          name?: string;
          icon?: string;
          color?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          room_id: string;
          name: string;
          cleaning_level: string;
          effort_points: number;
          suggested_frequency: string | null;
          suggested_level: string | null;
          recurrence_type: string | null;
          recurrence_days: number[] | null;
          recurrence_interval: number;
          last_completed: string | null;
          assigned_to: string | null;
          is_from_library: boolean;
        };
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          cleaning_level?: string;
          effort_points?: number;
          suggested_frequency?: string | null;
          suggested_level?: string | null;
          recurrence_type?: string | null;
          recurrence_days?: number[] | null;
          recurrence_interval?: number;
          last_completed?: string | null;
          assigned_to?: string | null;
          is_from_library?: boolean;
        };
        Update: {
          id?: string;
          room_id?: string;
          name?: string;
          cleaning_level?: string;
          effort_points?: number;
          suggested_frequency?: string | null;
          suggested_level?: string | null;
          recurrence_type?: string | null;
          recurrence_days?: number[] | null;
          recurrence_interval?: number;
          last_completed?: string | null;
          assigned_to?: string | null;
          is_from_library?: boolean;
        };
      };
      completions: {
        Row: {
          id: string;
          task_id: string;
          completed_by: string;
          completed_at: string;
          points_earned: number;
        };
        Insert: {
          id?: string;
          task_id: string;
          completed_by: string;
          completed_at?: string;
          points_earned?: number;
        };
        Update: {
          id?: string;
          task_id?: string;
          completed_by?: string;
          completed_at?: string;
          points_earned?: number;
        };
      };
    };
  };
}
