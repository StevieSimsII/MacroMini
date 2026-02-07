/* ============================================================
   MacroMini — TypeScript types (mirrors Supabase schema)
   ============================================================ */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type LogStatus = 'consumed' | 'about_to_consume' | 'about_to_purchase';

/* ---------- Database row types ---------- */

export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  diet_preference: string;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  serving_size: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  ingredients: string | null;
  allergens: string | null;
  health_notes: string | null;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface LogEntry {
  id: string;
  user_id: string;
  food_item_id: string;
  logged_at: string;
  status: LogStatus;
  meal_type: MealType;
  quantity: number;
  notes: string | null;
  created_at: string;
  // joined
  food_item?: FoodItem;
}

/* ---------- View types ---------- */

export interface MealTotalToday {
  user_id: string;
  meal_type: MealType;
  item_count: number;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
  total_sodium_mg: number;
}

export interface DailyTotal {
  user_id: string;
  log_date: string;
  item_count: number;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
  total_sodium_mg: number;
}

export interface WeeklyTrend {
  user_id: string;
  week_start: string;
  days_logged: number;
  item_count: number;
  avg_daily_calories: number;
  avg_daily_protein_g: number;
  avg_daily_carbs_g: number;
  avg_daily_fat_g: number;
}

/* ---------- AI analysis result ---------- */

export interface AnalysisResult {
  name: string;
  brand?: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  ingredients?: string;
  allergens?: string;
  health_notes?: string;
  confidence: number;
}

/* ---------- Supabase generated helper ---------- */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      food_items: {
        Row: FoodItem;
        Insert: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<FoodItem>;
      };
      log_entries: {
        Row: LogEntry;
        Insert: Omit<LogEntry, 'id' | 'created_at'> & { id?: string };
        Update: Partial<LogEntry>;
      };
    };
    Views: {
      meal_totals_today: { Row: MealTotalToday };
      daily_totals: { Row: DailyTotal };
      weekly_trends: { Row: WeeklyTrend };
    };
    Enums: {
      meal_type: MealType;
      log_status: LogStatus;
    };
  };
};
