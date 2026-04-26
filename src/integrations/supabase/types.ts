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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      context_members: {
        Row: {
          context_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["context_role"]
          user_id: string
        }
        Insert: {
          context_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["context_role"]
          user_id: string
        }
        Update: {
          context_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["context_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "context_members_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      contexts: {
        Row: {
          calibration: Json
          code: string
          created_at: string
          created_by: string
          currency: string
          flag_emoji: string | null
          id: string
          locale: string
          name: string
          owner_org: string | null
          status: Database["public"]["Enums"]["context_status"]
          updated_at: string
        }
        Insert: {
          calibration?: Json
          code: string
          created_at?: string
          created_by: string
          currency?: string
          flag_emoji?: string | null
          id?: string
          locale?: string
          name: string
          owner_org?: string | null
          status?: Database["public"]["Enums"]["context_status"]
          updated_at?: string
        }
        Update: {
          calibration?: Json
          code?: string
          created_at?: string
          created_by?: string
          currency?: string
          flag_emoji?: string | null
          id?: string
          locale?: string
          name?: string
          owner_org?: string | null
          status?: Database["public"]["Enums"]["context_status"]
          updated_at?: string
        }
        Relationships: []
      }
      datasets: {
        Row: {
          context_id: string
          created_at: string
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["dataset_kind"]
          notes: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["dataset_status"]
          version: number
        }
        Insert: {
          context_id: string
          created_at?: string
          created_by: string
          id?: string
          kind: Database["public"]["Enums"]["dataset_kind"]
          notes?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["dataset_status"]
          version?: number
        }
        Update: {
          context_id?: string
          created_at?: string
          created_by?: string
          id?: string
          kind?: Database["public"]["Enums"]["dataset_kind"]
          notes?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["dataset_status"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "datasets_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_runs: {
        Row: {
          actor_id: string
          context_id: string
          created_at: string
          dataset_id: string | null
          errors: Json
          file_name: string | null
          id: string
          kind: Database["public"]["Enums"]["dataset_kind"]
          rows_err: number
          rows_in: number
          rows_ok: number
        }
        Insert: {
          actor_id: string
          context_id: string
          created_at?: string
          dataset_id?: string | null
          errors?: Json
          file_name?: string | null
          id?: string
          kind: Database["public"]["Enums"]["dataset_kind"]
          rows_err?: number
          rows_in?: number
          rows_ok?: number
        }
        Update: {
          actor_id?: string
          context_id?: string
          created_at?: string
          dataset_id?: string | null
          errors?: Json
          file_name?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["dataset_kind"]
          rows_err?: number
          rows_in?: number
          rows_ok?: number
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_runs_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_runs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_indicators: {
        Row: {
          age_band: string | null
          dataset_id: string
          id: string
          indicator_code: string
          sex: string | null
          value: number | null
          year: number
        }
        Insert: {
          age_band?: string | null
          dataset_id: string
          id?: string
          indicator_code: string
          sex?: string | null
          value?: number | null
          year: number
        }
        Update: {
          age_band?: string | null
          dataset_id?: string
          id?: string
          indicator_code?: string
          sex?: string | null
          value?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "labor_indicators_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_resources: {
        Row: {
          cost: number | null
          dataset_id: string
          duration_h: number | null
          id: string
          language: string | null
          provider: string | null
          skill_codes: string[]
          title: string
          url: string | null
        }
        Insert: {
          cost?: number | null
          dataset_id: string
          duration_h?: number | null
          id?: string
          language?: string | null
          provider?: string | null
          skill_codes?: string[]
          title: string
          url?: string | null
        }
        Update: {
          cost?: number | null
          dataset_id?: string
          duration_h?: number | null
          id?: string
          language?: string | null
          provider?: string | null
          skill_codes?: string[]
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      occupations: {
        Row: {
          automation_risk: number | null
          code: string
          dataset_id: string
          id: string
          isco_major: string | null
          title: string
        }
        Insert: {
          automation_risk?: number | null
          code: string
          dataset_id: string
          id?: string
          isco_major?: string | null
          title: string
        }
        Update: {
          automation_risk?: number | null
          code?: string
          dataset_id?: string
          id?: string
          isco_major?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "occupations_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          dataset_id: string
          employer: string | null
          id: string
          region: string | null
          remote: boolean
          sector: string | null
          skills: string[]
          title: string
          url: string | null
        }
        Insert: {
          dataset_id: string
          employer?: string | null
          id?: string
          region?: string | null
          remote?: boolean
          sector?: string | null
          skills?: string[]
          title: string
          url?: string | null
        }
        Update: {
          dataset_id?: string
          employer?: string | null
          id?: string
          region?: string | null
          remote?: boolean
          sector?: string | null
          skills?: string[]
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      taxonomy_skills: {
        Row: {
          code: string
          dataset_id: string
          id: string
          label: string
          level: number
          parent_code: string | null
          source: string | null
        }
        Insert: {
          code: string
          dataset_id: string
          id?: string
          label: string
          level?: number
          parent_code?: string | null
          source?: string | null
        }
        Update: {
          code?: string
          dataset_id?: string
          id?: string
          label?: string
          level?: number
          parent_code?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_skills_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
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
      can_edit_context: {
        Args: { _context_id: string; _user_id: string }
        Returns: boolean
      }
      dataset_context: { Args: { _dataset_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_context_member: {
        Args: { _context_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "viewer"
      context_role: "owner" | "editor" | "viewer"
      context_status: "draft" | "active" | "archived"
      dataset_kind:
        | "taxonomy"
        | "occupations"
        | "labor"
        | "opportunities"
        | "learning"
      dataset_status: "draft" | "live" | "archived"
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
      app_role: ["admin", "operator", "viewer"],
      context_role: ["owner", "editor", "viewer"],
      context_status: ["draft", "active", "archived"],
      dataset_kind: [
        "taxonomy",
        "occupations",
        "labor",
        "opportunities",
        "learning",
      ],
      dataset_status: ["draft", "live", "archived"],
    },
  },
} as const
