// Auto-maintained TypeScript types matching the Supabase schema
// Update this file when the schema changes

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ─── Enums ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'new'
  | 'in_progress'
  | 'ready'
  | 'done'
  | 'cancelled'
  | 'payment_failed'

export type OrderType = 'delivery' | 'pickup'
export type PaymentMethod = 'stripe' | 'cash'
export type UserRole = 'customer' | 'admin'
export type ModifierSelectionType = 'single' | 'multiple'

// ─── Database Table Types ─────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          updated_at?: string
        }
      }

      restaurant_settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          value?: Json
          description?: string | null
          updated_at?: string
        }
      }

      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
      }

      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          image_path: string | null
          is_available: boolean
          is_featured: boolean
          display_order: number
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          image_path?: string | null
          is_available?: boolean
          is_featured?: boolean
          display_order?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          image_path?: string | null
          is_available?: boolean
          is_featured?: boolean
          display_order?: number
          tags?: string[]
          updated_at?: string
        }
      }

      modifier_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          selection_type: ModifierSelectionType
          is_required: boolean
          min_selections: number
          max_selections: number | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          selection_type?: ModifierSelectionType
          is_required?: boolean
          min_selections?: number
          max_selections?: number | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          selection_type?: ModifierSelectionType
          is_required?: boolean
          min_selections?: number
          max_selections?: number | null
          display_order?: number
          updated_at?: string
        }
      }

      modifier_options: {
        Row: {
          id: string
          modifier_group_id: string
          name: string
          price_delta: number
          is_default: boolean
          is_available: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          modifier_group_id: string
          name: string
          price_delta?: number
          is_default?: boolean
          is_available?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          name?: string
          price_delta?: number
          is_default?: boolean
          is_available?: boolean
          display_order?: number
        }
      }

      menu_item_modifier_groups: {
        Row: {
          menu_item_id: string
          modifier_group_id: string
          display_order: number
        }
        Insert: {
          menu_item_id: string
          modifier_group_id: string
          display_order?: number
        }
        Update: {
          display_order?: number
        }
      }

      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          status: OrderStatus
          type: OrderType
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address: DeliveryAddress | null
          subtotal: number
          delivery_fee: number
          tax: number
          tip: number
          total: number
          payment_method: PaymentMethod
          stripe_payment_intent_id: string | null
          stripe_payment_status: string | null
          special_instructions: string | null
          estimated_ready_at: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id?: string | null
          status?: OrderStatus
          type: OrderType
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address?: DeliveryAddress | null
          subtotal: number
          delivery_fee?: number
          tax?: number
          tip?: number
          total: number
          payment_method: PaymentMethod
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          special_instructions?: string | null
          estimated_ready_at?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          estimated_ready_at?: string | null
          admin_notes?: string | null
          updated_at?: string
        }
      }

      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          item_name: string
          item_description: string | null
          base_price: number
          quantity: number
          unit_price: number
          subtotal: number
          special_instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          item_name: string
          item_description?: string | null
          base_price: number
          quantity: number
          unit_price: number
          subtotal: number
          special_instructions?: string | null
          created_at?: string
        }
        Update: never
      }

      order_item_modifiers: {
        Row: {
          id: string
          order_item_id: string
          modifier_option_id: string | null
          group_name: string
          option_name: string
          price_delta: number
        }
        Insert: {
          id?: string
          order_item_id: string
          modifier_option_id?: string | null
          group_name: string
          option_name: string
          price_delta?: number
        }
        Update: never
      }

      order_status_history: {
        Row: {
          id: string
          order_id: string
          from_status: OrderStatus | null
          to_status: OrderStatus
          changed_by: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          from_status?: OrderStatus | null
          to_status: OrderStatus
          changed_by?: string | null
          note?: string | null
          created_at?: string
        }
        Update: never
      }
    }

    Views: {
      menu_with_modifiers: {
        Row: MenuItemWithModifiers
      }
      orders_summary: {
        Row: OrderSummary
      }
    }

    Functions: {
      get_revenue_summary: {
        Args: { start_date?: string; end_date?: string }
        Returns: RevenueSummaryRow[]
      }
      get_top_items: {
        Args: { limit_count?: number }
        Returns: TopItemRow[]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}

// ─── Shared / Derived Types ───────────────────────────────────────────────────

export interface DeliveryAddress {
  street: string
  unit?: string
  city: string
  state: string
  zip: string
  instructions?: string
}

export interface BusinessHours {
  open: string   // "HH:MM"
  close: string  // "HH:MM"
  closed: boolean
}

export interface RestaurantSettings {
  is_accepting_orders: boolean
  delivery_fee: number
  min_order_delivery: number
  min_order_pickup: number
  tax_rate: number
  estimated_pickup_min: number
  estimated_delivery_min: number
  max_delivery_radius_miles: number
  restaurant_name: string
  restaurant_phone: string
  restaurant_address: { street: string; city: string; state: string; zip: string }
  business_hours: Record<string, BusinessHours>
}

export interface ModifierOptionFull {
  id: string
  name: string
  price_delta: number
  is_default: boolean
  is_available: boolean
  display_order: number
}

export interface ModifierGroupFull {
  id: string
  name: string
  description: string | null
  selection_type: ModifierSelectionType
  is_required: boolean
  min_selections: number
  max_selections: number | null
  display_order: number
  options: ModifierOptionFull[]
}

export interface MenuItemWithModifiers {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  display_order: number
  tags: string[]
  category_id: string
  category_name: string
  category_order: number
  modifier_groups: ModifierGroupFull[]
}

// Cart item (client-side, includes selected modifiers)
export interface CartItem {
  id: string                        // unique cart entry ID (not menu_item_id)
  menu_item_id: string
  name: string
  description: string | null
  base_price: number
  unit_price: number                // base_price + sum of modifier price_deltas
  quantity: number
  image_url: string | null
  selected_modifiers: SelectedModifier[]
  special_instructions?: string
}

export interface SelectedModifier {
  group_id: string
  group_name: string
  option_id: string
  option_name: string
  price_delta: number
}

// Order summary for admin list view
export interface OrderSummary {
  id: string
  order_number: string
  user_id: string | null
  status: OrderStatus
  type: OrderType
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: DeliveryAddress | null
  subtotal: number
  delivery_fee: number
  tax: number
  tip: number
  total: number
  payment_method: PaymentMethod
  stripe_payment_intent_id: string | null
  stripe_payment_status: string | null
  special_instructions: string | null
  estimated_ready_at: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  item_count: number
  items: {
    id: string
    name: string
    quantity: number
    subtotal: number
    modifiers: { group: string; option: string; price_delta: number }[] | null
  }[]
}

export interface RevenueSummaryRow {
  date: string
  order_count: number
  gross_revenue: number
  avg_order_value: number
}

export interface TopItemRow {
  menu_item_id: string | null
  item_name: string
  total_qty: number
  total_revenue: number
}

// Stripe-related
export interface CreatePaymentIntentRequest {
  order_id: string
  amount: number      // in cents
  currency?: string   // default 'usd'
}

export interface CreatePaymentIntentResponse {
  client_secret: string
  payment_intent_id: string
}
