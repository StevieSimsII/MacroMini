import { createClient } from '@/lib/supabase/server';
import type { FoodItem, LogEntry, MealTotalToday, DailyTotal, WeeklyTrend, Profile } from '@/lib/types';

/* ============================================================
   Server-side data fetching services
   ============================================================ */

// --- Profile ---
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

// --- Food Items ---
export async function getRecentFoodItems(limit = 10): Promise<FoodItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('food_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getFoodItem(id: string): Promise<FoodItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('food_items')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

// --- Log Entries ---
export async function getTodayLogEntries(): Promise<(LogEntry & { food_item: FoodItem })[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('log_entries')
    .select('*, food_item:food_items(*)')
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: false });

  return (data as (LogEntry & { food_item: FoodItem })[]) ?? [];
}

export async function getLogEntriesByDate(date: string): Promise<(LogEntry & { food_item: FoodItem })[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('log_entries')
    .select('*, food_item:food_items(*)')
    .gte('logged_at', `${date}T00:00:00`)
    .lte('logged_at', `${date}T23:59:59`)
    .order('logged_at', { ascending: false });

  return (data as (LogEntry & { food_item: FoodItem })[]) ?? [];
}

// --- Views / Rollups ---
export async function getMealTotalsToday(): Promise<MealTotalToday[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('meal_totals_today')
    .select('*');

  return (data as MealTotalToday[]) ?? [];
}

export async function getDailyTotals(days = 30): Promise<DailyTotal[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('daily_totals')
    .select('*')
    .gte('log_date', since.toISOString().split('T')[0])
    .order('log_date', { ascending: true });

  return (data as DailyTotal[]) ?? [];
}

export async function getWeeklyTrends(weeks = 12): Promise<WeeklyTrend[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const { data } = await supabase
    .from('weekly_trends')
    .select('*')
    .gte('week_start', since.toISOString().split('T')[0])
    .order('week_start', { ascending: true });

  return (data as WeeklyTrend[]) ?? [];
}
