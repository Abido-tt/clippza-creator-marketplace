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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          brief: string
          client_id: string
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["clip_platform"]
          reference_url: string | null
          reward_description: string
          reward_rate: number | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_views: number | null
          title: string
          updated_at: string
        }
        Insert: {
          brief: string
          client_id: string
          created_at?: string
          id?: string
          platform: Database["public"]["Enums"]["clip_platform"]
          reference_url?: string | null
          reward_description?: string
          reward_rate?: number | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_views?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          brief?: string
          client_id?: string
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["clip_platform"]
          reference_url?: string | null
          reward_description?: string
          reward_rate?: number | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_views?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          banner_path: string | null
          bio: string
          created_at: string
          display_name: string
          display_name_changed_at: string | null
          id: string
          instagram_url: string | null
          tiktok_url: string | null
          username: string | null
          username_changed_at: string | null
          website_url: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_path?: string | null
          banner_path?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          display_name_changed_at?: string | null
          id: string
          instagram_url?: string | null
          tiktok_url?: string | null
          username?: string | null
          username_changed_at?: string | null
          website_url?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_path?: string | null
          banner_path?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          display_name_changed_at?: string | null
          id?: string
          instagram_url?: string | null
          tiktok_url?: string | null
          username?: string | null
          username_changed_at?: string | null
          website_url?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          campaign_id: string
          clip_url: string
          clipper_id: string
          created_at: string
          id: string
          note: string | null
          proposed_reward: number | null
          reported_views: number | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
        }
        Insert: {
          campaign_id: string
          clip_url: string
          clipper_id: string
          created_at?: string
          id?: string
          note?: string | null
          proposed_reward?: number | null
          reported_views?: number | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
        }
        Update: {
          campaign_id?: string
          clip_url?: string
          clipper_id?: string
          created_at?: string
          id?: string
          note?: string | null
          proposed_reward?: number | null
          reported_views?: number | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
        }
        Relationships: [
          {
            foreignKeyName: "submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      owns_campaign: { Args: { _id: string }; Returns: boolean }
      valid_public_link: { Args: { value: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "client" | "clipper"
      campaign_status: "draft" | "open" | "paused" | "closed"
      clip_platform: "tiktok" | "instagram" | "youtube" | "x" | "other"
      submission_status: "submitted" | "approved" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "client", "clipper"],
      campaign_status: ["draft", "open", "paused", "closed"],
      clip_platform: ["tiktok", "instagram", "youtube", "x", "other"],
      submission_status: ["submitted", "approved", "rejected"],
    },
  },
} as const
