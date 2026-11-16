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
      admin_actions: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          detail: Json
          id: number
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          detail?: Json
          id?: never
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          detail?: Json
          id?: never
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          note: string
          user_id: string
        }
        Insert: {
          created_at?: string
          note?: string
          user_id: string
        }
        Update: {
          created_at?: string
          note?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          description: string
          emoji: string
          name: string
          rule: Json
        }
        Insert: {
          code: string
          description: string
          emoji?: string
          name: string
          rule: Json
        }
        Update: {
          code?: string
          description?: string
          emoji?: string
          name?: string
          rule?: Json
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id?: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: number
          room_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: never
          room_id: string
          sender_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: never
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          item_id: string
          last_message: string | null
          last_message_at: string | null
          seller_id: string
        }
        Insert: {
          buyer_id?: string
          created_at?: string
          id?: string
          item_id: string
          last_message?: string | null
          last_message_at?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          item_id?: string
          last_message?: string | null
          last_message_at?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "used_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_month: string
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          birth_month: string
          created_at?: string
          id?: string
          parent_id?: string
        }
        Update: {
          birth_month?: string
          created_at?: string
          id?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_fact_check: boolean
          is_hidden: boolean
          post_id: string
          source: string | null
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          id?: string
          is_fact_check?: boolean
          is_hidden?: boolean
          post_id: string
          source?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_fact_check?: boolean
          is_hidden?: boolean
          post_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_templates: {
        Row: {
          created_at: string
          funded_by: string
          grant_level: number | null
          id: string
          is_active: boolean
          kind: string
          min_order: number
          name: string
          seller_id: string | null
          seller_share_pct: number
          valid_days: number
          value: number
        }
        Insert: {
          created_at?: string
          funded_by: string
          grant_level?: number | null
          id?: string
          is_active?: boolean
          kind: string
          min_order?: number
          name: string
          seller_id?: string | null
          seller_share_pct?: number
          valid_days?: number
          value: number
        }
        Update: {
          created_at?: string
          funded_by?: string
          grant_level?: number | null
          id?: string
          is_active?: boolean
          kind?: string
          min_order?: number
          name?: string
          seller_id?: string | null
          seller_share_pct?: number
          valid_days?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupon_templates_grant_level_fkey"
            columns: ["grant_level"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["level"]
          },
          {
            foreignKeyName: "coupon_templates_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_levels: {
        Row: {
          description: string
          emoji: string
          level: number
          name: string
          rule: Json
        }
        Insert: {
          description: string
          emoji?: string
          level: number
          name: string
          rule: Json
        }
        Update: {
          description?: string
          emoji?: string
          level?: number
          name?: string
          rule?: Json
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          code: string
          dong: string
          sido: string
          sigungu: string
        }
        Insert: {
          code: string
          dong: string
          sido: string
          sigungu: string
        }
        Update: {
          code?: string
          dong?: string
          sido?: string
          sigungu?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          fulfillment_status: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          seller_id: string
          shipped_at: string | null
          tracking_number: string | null
          unit_price: number
        }
        Insert: {
          fulfillment_status?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          seller_id: string
          shipped_at?: string | null
          tracking_number?: string | null
          unit_price: number
        }
        Update: {
          fulfillment_status?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          seller_id?: string
          shipped_at?: string | null
          tracking_number?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          address_detail: string
          coupon_id: string | null
          created_at: string
          discount: number
          id: string
          is_demo: boolean
          items_total: number
          memo: string
          recipient_name: string
          recipient_phone: string
          shipping_fee: number
          status: string
          total: number
          user_id: string
        }
        Insert: {
          address: string
          address_detail?: string
          coupon_id?: string | null
          created_at?: string
          discount?: number
          id?: string
          is_demo?: boolean
          items_total: number
          memo?: string
          recipient_name: string
          recipient_phone: string
          shipping_fee: number
          status?: string
          total: number
          user_id: string
        }
        Update: {
          address?: string
          address_detail?: string
          coupon_id?: string | null
          created_at?: string
          discount?: number
          id?: string
          is_demo?: boolean
          items_total?: number
          memo?: string
          recipient_name?: string
          recipient_phone?: string
          shipping_fee?: number
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "user_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perk_entries: {
        Row: {
          created_at: string
          id: string
          period: string
          perk: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period: string
          perk: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period?: string
          perk?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perk_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          best_at: string | null
          board: string
          body: string
          category: string
          cohort_month: string | null
          comment_count: number
          created_at: string
          fact_check_status: string | null
          id: string
          is_hidden: boolean
          like_count: number
          neighborhood_code: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string
          best_at?: string | null
          board: string
          body: string
          category: string
          cohort_month?: string | null
          comment_count?: number
          created_at?: string
          fact_check_status?: string | null
          id?: string
          is_hidden?: boolean
          like_count?: number
          neighborhood_code: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          best_at?: string | null
          board?: string
          body?: string
          category?: string
          cohort_month?: string | null
          comment_count?: number
          created_at?: string
          fact_check_status?: string | null
          id?: string
          is_hidden?: boolean
          like_count?: number
          neighborhood_code?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_neighborhood_code_fkey"
            columns: ["neighborhood_code"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["code"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          deal_ends_at: string | null
          deal_opens_at: string | null
          delivery_label: string
          description: string
          early_access: boolean
          icon: string
          id: string
          image_url: string | null
          is_active: boolean
          is_deal: boolean
          name: string
          original_price: number
          price: number
          rating: number
          review_count: number
          seller_id: string
          seller_name: string
          sort_order: number
          stock: number
          subscribable: boolean
          tint: string
        }
        Insert: {
          category: string
          created_at?: string
          deal_ends_at?: string | null
          deal_opens_at?: string | null
          delivery_label?: string
          description?: string
          early_access?: boolean
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_deal?: boolean
          name: string
          original_price: number
          price: number
          rating?: number
          review_count?: number
          seller_id: string
          seller_name?: string
          sort_order?: number
          stock?: number
          subscribable?: boolean
          tint?: string
        }
        Update: {
          category?: string
          created_at?: string
          deal_ends_at?: string | null
          deal_opens_at?: string | null
          delivery_label?: string
          description?: string
          early_access?: boolean
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_deal?: boolean
          name?: string
          original_price?: number
          price?: number
          rating?: number
          review_count?: number
          seller_id?: string
          seller_name?: string
          sort_order?: number
          stock?: number
          subscribable?: boolean
          tint?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          adult_confirmed_at: string
          created_at: string
          id: string
          level: number
          level_updated_at: string | null
          neighborhood_code: string | null
          nickname: string | null
          terms_agreed_at: string
          updated_at: string
        }
        Insert: {
          adult_confirmed_at: string
          created_at?: string
          id: string
          level?: number
          level_updated_at?: string | null
          neighborhood_code?: string | null
          nickname?: string | null
          terms_agreed_at: string
          updated_at?: string
        }
        Update: {
          adult_confirmed_at?: string
          created_at?: string
          id?: string
          level?: number
          level_updated_at?: string | null
          neighborhood_code?: string | null
          nickname?: string | null
          terms_agreed_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_neighborhood_code_fkey"
            columns: ["neighborhood_code"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["code"]
          },
        ]
      }
      reports: {
        Row: {
          chat_room_id: string | null
          comment_id: string | null
          created_at: string
          detail: string | null
          id: string
          post_id: string | null
          reason: string
          reporter_id: string
          status: string
          used_item_id: string | null
        }
        Insert: {
          chat_room_id?: string | null
          comment_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reporter_id?: string
          status?: string
          used_item_id?: string | null
        }
        Update: {
          chat_room_id?: string | null
          comment_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reporter_id?: string
          status?: string
          used_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_used_item_id_fkey"
            columns: ["used_item_id"]
            isOneToOne: false
            referencedRelation: "used_items"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_contacts: {
        Row: {
          business_number: string | null
          contact_email: string
          contact_phone: string
          seller_id: string
        }
        Insert: {
          business_number?: string | null
          contact_email: string
          contact_phone: string
          seller_id: string
        }
        Update: {
          business_number?: string | null
          contact_email?: string
          contact_phone?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_contacts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_members: {
        Row: {
          created_at: string
          role: string
          seller_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          seller_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          seller_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_members_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          reviewed_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sterilization_requests: {
        Row: {
          address: string
          address_detail: string
          coupon_id: string | null
          created_at: string
          discount: number
          id: string
          items: string[]
          memo: string
          pickup_date: string
          price: number
          recipient_name: string
          recipient_phone: string
          status: string
          total: number
          user_id: string
        }
        Insert: {
          address: string
          address_detail?: string
          coupon_id?: string | null
          created_at?: string
          discount?: number
          id?: string
          items: string[]
          memo?: string
          pickup_date: string
          price: number
          recipient_name: string
          recipient_phone: string
          status?: string
          total: number
          user_id: string
        }
        Update: {
          address?: string
          address_detail?: string
          coupon_id?: string | null
          created_at?: string
          discount?: number
          id?: string
          items?: string[]
          memo?: string
          pickup_date?: string
          price?: number
          recipient_name?: string
          recipient_phone?: string
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sterilization_requests_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "user_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sterilization_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          address: string
          address_detail: string
          cancelled_at: string | null
          created_at: string
          id: string
          interval_weeks: number
          next_delivery_date: string
          product_id: string
          quantity: number
          recipient_name: string
          recipient_phone: string
          status: string
          user_id: string
        }
        Insert: {
          address: string
          address_detail?: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          interval_weeks: number
          next_delivery_date: string
          product_id: string
          quantity?: number
          recipient_name: string
          recipient_phone: string
          status?: string
          user_id: string
        }
        Update: {
          address?: string
          address_detail?: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          interval_weeks?: number
          next_delivery_date?: string
          product_id?: string
          quantity?: number
          recipient_name?: string
          recipient_phone?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      used_items: {
        Row: {
          buyer_id: string | null
          category: string
          chat_count: number
          condition: string
          created_at: string
          description: string
          fee_amount: number | null
          fee_coupon_id: string | null
          id: string
          image_paths: string[]
          is_hidden: boolean
          neighborhood_code: string
          price: number
          safe_pay_available: boolean
          seller_id: string
          size: string | null
          sold_at: string | null
          status: string
          title: string
          trade_method: string | null
          updated_at: string
          usage_period: string | null
        }
        Insert: {
          buyer_id?: string | null
          category: string
          chat_count?: number
          condition: string
          created_at?: string
          description?: string
          fee_amount?: number | null
          fee_coupon_id?: string | null
          id?: string
          image_paths: string[]
          is_hidden?: boolean
          neighborhood_code: string
          price: number
          safe_pay_available?: boolean
          seller_id?: string
          size?: string | null
          sold_at?: string | null
          status?: string
          title: string
          trade_method?: string | null
          updated_at?: string
          usage_period?: string | null
        }
        Update: {
          buyer_id?: string | null
          category?: string
          chat_count?: number
          condition?: string
          created_at?: string
          description?: string
          fee_amount?: number | null
          fee_coupon_id?: string | null
          id?: string
          image_paths?: string[]
          is_hidden?: boolean
          neighborhood_code?: string
          price?: number
          safe_pay_available?: boolean
          seller_id?: string
          size?: string | null
          sold_at?: string | null
          status?: string
          title?: string
          trade_method?: string | null
          updated_at?: string
          usage_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "used_items_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_items_fee_coupon_id_fkey"
            columns: ["fee_coupon_id"]
            isOneToOne: false
            referencedRelation: "user_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_items_neighborhood_code_fkey"
            columns: ["neighborhood_code"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "used_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_code: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_code: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_code?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coupons: {
        Row: {
          expires_at: string
          id: string
          issued_at: string
          template_id: string
          used_at: string | null
          used_for: string | null
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          issued_at?: string
          template_id: string
          used_at?: string | null
          used_for?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          issued_at?: string
          template_id?: string
          used_at?: string | null
          used_for?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "coupon_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_perk: { Args: { p_perk: string }; Returns: undefined }
      apply_seller: {
        Args: {
          p_business_number: string
          p_contact_email: string
          p_contact_phone: string
          p_description: string
          p_name: string
        }
        Returns: string
      }
      can_manage_product_folder: { Args: { folder: string }; Returns: boolean }
      can_report_chat_room: { Args: { p_room: string }; Returns: boolean }
      cancel_sterilization: { Args: { p_id: string }; Returns: undefined }
      cancel_subscription: { Args: { p_id: string }; Returns: undefined }
      complete_used_trade: {
        Args: { p_coupon_id?: string; p_method: string; p_room_id: string }
        Returns: number
      }
      deal_open_for: {
        Args: {
          member_level: number
          p: Database["public"]["Tables"]["products"]["Row"]
        }
        Returns: boolean
      }
      delete_my_account: { Args: never; Returns: undefined }
      grade_rule_met: { Args: { metrics: Json; rule: Json }; Returns: boolean }
      is_active_seller_member: { Args: { p_seller: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_api_request: { Args: never; Returns: boolean }
      is_block_between: { Args: { a: string; b: string }; Returns: boolean }
      is_order_seller: { Args: { p_order: string }; Returns: boolean }
      is_seller_member: { Args: { p_seller: string }; Returns: boolean }
      is_seller_owner: { Args: { p_seller: string }; Returns: boolean }
      member_level: { Args: { uid: string }; Returns: number }
      member_metrics: { Args: { uid: string }; Returns: Json }
      place_order: {
        Args: {
          p_address: string
          p_address_detail: string
          p_coupon_id: string
          p_items: Json
          p_memo: string
          p_recipient_name: string
          p_recipient_phone: string
        }
        Returns: string
      }
      refresh_my_level: { Args: never; Returns: Json }
      request_sterilization: {
        Args: {
          p_address: string
          p_address_detail: string
          p_coupon_id: string
          p_items: string[]
          p_memo: string
          p_pickup_date: string
          p_recipient_name: string
          p_recipient_phone: string
        }
        Returns: string
      }
      setting_int: {
        Args: { fallback: number; setting_key: string }
        Returns: number
      }
      subscribe_product: {
        Args: {
          p_address: string
          p_address_detail: string
          p_interval_weeks: number
          p_product_id: string
          p_quantity: number
          p_recipient_name: string
          p_recipient_phone: string
        }
        Returns: string
      }
      use_coupon: {
        Args: {
          p_coupon: string
          p_kinds: string[]
          p_used_for: string
          p_user: string
        }
        Returns: {
          created_at: string
          funded_by: string
          grant_level: number | null
          id: string
          is_active: boolean
          kind: string
          min_order: number
          name: string
          seller_id: string | null
          seller_share_pct: number
          valid_days: number
          value: number
        }
        SetofOptions: {
          from: "*"
          to: "coupon_templates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
