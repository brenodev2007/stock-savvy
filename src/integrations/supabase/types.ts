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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_lots: {
        Row: {
          cost: number
          created_at: string
          expiry_date: string | null
          id: string
          lot_number: string
          manufacture_date: string | null
          product_id: string
          quantity: number
        }
        Insert: {
          cost?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          lot_number: string
          manufacture_date?: string | null
          product_id: string
          quantity?: number
        }
        Update: {
          cost?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          lot_number?: string
          manufacture_date?: string | null
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cost: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          min_stock: number
          name: string
          price: number
          sku: string
          unit: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number
          name: string
          price?: number
          sku: string
          unit?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number
          name?: string
          price?: number
          sku?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopee_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          is_active: boolean | null
          refresh_token: string | null
          shop_id: number
          shop_name: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          shop_id: number
          shop_name: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          shop_id?: number
          shop_name?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopee_order_status_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          occurred_at: string
          order_id: string | null
          status: Database["public"]["Enums"]["shopee_shipment_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          occurred_at?: string
          order_id?: string | null
          status: Database["public"]["Enums"]["shopee_shipment_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          occurred_at?: string
          order_id?: string | null
          status?: Database["public"]["Enums"]["shopee_shipment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "shopee_order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shopee_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shopee_orders: {
        Row: {
          account_id: string | null
          actual_delivery: string | null
          carrier: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          estimated_delivery: string | null
          id: string
          order_sn: string
          order_total: number | null
          product_name: string
          purchase_date: string
          shipping_address: string | null
          shopee_data: Json | null
          sku: string | null
          status: Database["public"]["Enums"]["shopee_shipment_status"]
          tracking_code: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          actual_delivery?: string | null
          carrier?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          estimated_delivery?: string | null
          id?: string
          order_sn: string
          order_total?: number | null
          product_name: string
          purchase_date: string
          shipping_address?: string | null
          shopee_data?: Json | null
          sku?: string | null
          status?: Database["public"]["Enums"]["shopee_shipment_status"]
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          actual_delivery?: string | null
          carrier?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          estimated_delivery?: string | null
          id?: string
          order_sn?: string
          order_total?: number | null
          product_name?: string
          purchase_date?: string
          shipping_address?: string | null
          shopee_data?: Json | null
          sku?: string | null
          status?: Database["public"]["Enums"]["shopee_shipment_status"]
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopee_orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "shopee_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      shopee_sync_logs: {
        Row: {
          account_id: string | null
          completed_at: string | null
          error_message: string | null
          id: string
          orders_synced: number | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          account_id?: string | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          orders_synced?: number | null
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          account_id?: string | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          orders_synced?: number | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopee_sync_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "shopee_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_balances: {
        Row: {
          id: string
          product_id: string
          quantity: number
          warehouse_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          warehouse_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_balances_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          lot_id: string | null
          product_id: string
          quantity: number
          reason: string | null
          reference: string | null
          type: Database["public"]["Enums"]["movement_type"]
          user_id: string
          warehouse_from_id: string | null
          warehouse_to_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lot_id?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          reference?: string | null
          type: Database["public"]["Enums"]["movement_type"]
          user_id: string
          warehouse_from_id?: string | null
          warehouse_to_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lot_id?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          reference?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
          user_id?: string
          warehouse_from_id?: string | null
          warehouse_to_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "product_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_from_id_fkey"
            columns: ["warehouse_from_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_to_id_fkey"
            columns: ["warehouse_to_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
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
      warehouses: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "operator"
      movement_type: "IN" | "OUT" | "TRANSFER" | "ADJUST"
      shopee_shipment_status:
        | "AGUARDANDO_ENVIO"
        | "ENVIADO"
        | "EM_TRANSPORTE"
        | "ENTREGUE"
        | "CANCELADO"
        | "DEVOLVIDO"
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
      app_role: ["admin", "manager", "operator"],
      movement_type: ["IN", "OUT", "TRANSFER", "ADJUST"],
      shopee_shipment_status: [
        "AGUARDANDO_ENVIO",
        "ENVIADO",
        "EM_TRANSPORTE",
        "ENTREGUE",
        "CANCELADO",
        "DEVOLVIDO",
      ],
    },
  },
} as const
