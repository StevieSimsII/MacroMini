-- ============================================================
-- MacroMini — Supabase Schema
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- 1. Custom ENUM types
create type meal_type   as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type log_status  as enum ('consumed', 'about_to_consume', 'about_to_purchase');

-- 2. Profiles (extends auth.users)
create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text,
  avatar_url text,
  calorie_target   int default 2000,
  protein_target_g int default 150,
  carbs_target_g   int default 250,
  fat_target_g     int default 65,
  diet_preference  text default 'none',  -- e.g. 'vegan','keto','none'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Food items (master catalog per user)
create table food_items (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users on delete cascade,
  name          text not null,
  brand         text,
  image_url     text,
  thumbnail_url text,
  serving_size  text,
  calories      numeric(7,1) default 0,
  protein_g     numeric(6,1) default 0,
  carbs_g       numeric(6,1) default 0,
  fat_g         numeric(6,1) default 0,
  fiber_g       numeric(6,1) default 0,
  sugar_g       numeric(6,1) default 0,
  sodium_mg     numeric(7,1) default 0,
  ingredients   text,
  allergens     text,
  health_notes  text,
  confidence    numeric(4,2) default 0,  -- AI confidence 0-1
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index idx_food_items_user on food_items(user_id);

-- 4. Log entries (each time a food is logged)
create table log_entries (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users on delete cascade,
  food_item_id  uuid not null references food_items on delete cascade,
  logged_at     timestamptz default now(),
  status        log_status not null default 'consumed',
  meal_type     meal_type not null default 'snack',
  quantity      numeric(5,2) default 1,
  notes         text,
  created_at    timestamptz default now()
);

create index idx_log_entries_user      on log_entries(user_id);
create index idx_log_entries_logged_at on log_entries(logged_at);
create index idx_log_entries_meal      on log_entries(user_id, meal_type, logged_at);

-- ============================================================
-- 5. SQL Views — rollups computed server-side
-- ============================================================

-- 5a. Today's meal totals (per meal_type)
create or replace view meal_totals_today as
select
  le.user_id,
  le.meal_type,
  count(*)::int                              as item_count,
  round(sum(fi.calories  * le.quantity), 1)  as total_calories,
  round(sum(fi.protein_g * le.quantity), 1)  as total_protein_g,
  round(sum(fi.carbs_g   * le.quantity), 1)  as total_carbs_g,
  round(sum(fi.fat_g     * le.quantity), 1)  as total_fat_g,
  round(sum(fi.fiber_g   * le.quantity), 1)  as total_fiber_g,
  round(sum(fi.sugar_g   * le.quantity), 1)  as total_sugar_g,
  round(sum(fi.sodium_mg * le.quantity), 1)  as total_sodium_mg
from log_entries le
join food_items fi on fi.id = le.food_item_id
where le.status = 'consumed'
  and le.logged_at::date = current_date
group by le.user_id, le.meal_type;

-- 5b. Daily totals (all meals combined, per day)
create or replace view daily_totals as
select
  le.user_id,
  le.logged_at::date                         as log_date,
  count(*)::int                              as item_count,
  round(sum(fi.calories  * le.quantity), 1)  as total_calories,
  round(sum(fi.protein_g * le.quantity), 1)  as total_protein_g,
  round(sum(fi.carbs_g   * le.quantity), 1)  as total_carbs_g,
  round(sum(fi.fat_g     * le.quantity), 1)  as total_fat_g,
  round(sum(fi.fiber_g   * le.quantity), 1)  as total_fiber_g,
  round(sum(fi.sugar_g   * le.quantity), 1)  as total_sugar_g,
  round(sum(fi.sodium_mg * le.quantity), 1)  as total_sodium_mg
from log_entries le
join food_items fi on fi.id = le.food_item_id
where le.status = 'consumed'
group by le.user_id, le.logged_at::date;

-- 5c. Weekly trends (aggregated by ISO week)
create or replace view weekly_trends as
select
  le.user_id,
  date_trunc('week', le.logged_at)::date     as week_start,
  count(distinct le.logged_at::date)::int     as days_logged,
  count(*)::int                               as item_count,
  round(avg(sub.daily_cal), 0)                as avg_daily_calories,
  round(avg(sub.daily_protein), 1)            as avg_daily_protein_g,
  round(avg(sub.daily_carbs), 1)              as avg_daily_carbs_g,
  round(avg(sub.daily_fat), 1)                as avg_daily_fat_g
from log_entries le
join food_items fi on fi.id = le.food_item_id
join lateral (
  select
    sum(fi2.calories  * le2.quantity) as daily_cal,
    sum(fi2.protein_g * le2.quantity) as daily_protein,
    sum(fi2.carbs_g   * le2.quantity) as daily_carbs,
    sum(fi2.fat_g     * le2.quantity) as daily_fat
  from log_entries le2
  join food_items fi2 on fi2.id = le2.food_item_id
  where le2.user_id = le.user_id
    and le2.status = 'consumed'
    and le2.logged_at::date = le.logged_at::date
) sub on true
where le.status = 'consumed'
group by le.user_id, date_trunc('week', le.logged_at)::date;

-- ============================================================
-- 6. Row Level Security (RLS)
-- ============================================================

alter table profiles    enable row level security;
alter table food_items  enable row level security;
alter table log_entries enable row level security;

-- Profiles: users can only see/edit their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Food items: users can only CRUD their own
create policy "Users can view own food items"
  on food_items for select using (auth.uid() = user_id);

create policy "Users can insert own food items"
  on food_items for insert with check (auth.uid() = user_id);

create policy "Users can update own food items"
  on food_items for update using (auth.uid() = user_id);

create policy "Users can delete own food items"
  on food_items for delete using (auth.uid() = user_id);

-- Log entries: users can only CRUD their own
create policy "Users can view own log entries"
  on log_entries for select using (auth.uid() = user_id);

create policy "Users can insert own log entries"
  on log_entries for insert with check (auth.uid() = user_id);

create policy "Users can update own log entries"
  on log_entries for update using (auth.uid() = user_id);

create policy "Users can delete own log entries"
  on log_entries for delete using (auth.uid() = user_id);

-- ============================================================
-- 7. Storage bucket + policies
-- ============================================================

-- Create the bucket (run in Supabase dashboard or via API)
insert into storage.buckets (id, name, public)
values ('food-images', 'food-images', false);

-- Users can upload to their own folder
create policy "Users can upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'food-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own images
create policy "Users can view own images"
  on storage.objects for select
  using (
    bucket_id = 'food-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own images
create policy "Users can delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'food-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 8. Trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
