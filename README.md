# MacroMini

> Snap a photo → get macros → track your nutrition.

A mobile-first responsive web app for food photography, AI-powered nutritional analysis, and macro tracking — built with **Next.js**, **Supabase**, and a clean monochrome UI.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [UI Spec](#ui-spec)
- [Getting Started](#getting-started)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Example Analysis JSON](#example-analysis-json)
- [Build Plan](#build-plan)
- [Design System](#design-system)

---

## Features

| Feature | Description |
|---------|------------|
| 📸 **Capture / Upload** | Take a photo or upload from gallery |
| 🤖 **AI Analysis** | GPT-4o Vision analyzes food for macros |
| ✏️ **Editable Results** | Review and edit nutrition before saving |
| 📊 **Dashboard** | Today's totals, macro progress bars, meal rollups |
| 🍽 **Meal Tracking** | Breakfast / Lunch / Dinner / Snack with rollups |
| 📈 **Trends** | Daily & weekly charts (calories, protein, carbs, fat) |
| 🏷 **Log Statuses** | Consumed · About to eat · About to buy |
| 📤 **Export** | Download all data as JSON |
| 🔒 **Secure** | Supabase RLS — users only see their own data |
| 📱 **Mobile-first** | Responsive, minimal, monochrome design |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (Postgres + Auth + Storage) |
| AI | OpenAI GPT-4o Vision |
| Charts | Recharts |
| Icons | Lucide React |
| State | Zustand (available), React state |

---

## UI Spec

**Design language:** Clean, GitHub-like monochrome

| Token | Value |
|-------|-------|
| Background | `#ffffff` |
| Surface | `#f6f6f6` |
| Border | `#e2e2e2` |
| Muted text | `#8b8b8b` |
| Primary text | `#1a1a1a` |
| Secondary text | `#555555` |
| Radius | `6px` |
| Shadows | Subtle (`0 1px 3px rgba(0,0,0,0.04)`) |

### Core Screens

1. **Dashboard** — Today's macro progress bars, quick-add button, meal rollup cards, recent items list
2. **Capture** — Camera/upload → preview → analyzing spinner → editable results → log options → save
3. **Food Detail** — Full image, nutrition table, health notes, allergens, edit mode, re-log panel
4. **Meals** — Expandable meal sections with item lists, delete items
5. **History/Trends** — Tab switcher (daily/weekly), bar + line charts, data tables
6. **Settings** — Profile, macro targets, diet preference, export, sign out

### States
- **Loading:** Skeleton shimmer animations
- **Empty:** Centered icon + message + action button
- **Error:** Alert box with retry option

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/StevieSimsII/MacroMini.git
cd MacroMini/macro-mini

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.local.example .env.local
# → Fill in your Supabase URL, anon key, and OpenAI key

# 4. Set up Supabase
# → Run supabase/schema.sql in Supabase SQL Editor

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

### 1. Create Project
Go to [supabase.com](https://supabase.com) → New Project.

### 2. Run Schema
Copy contents of `supabase/schema.sql` into the SQL Editor and execute. This creates:
- Custom enums (`meal_type`, `log_status`)
- Tables (`profiles`, `food_items`, `log_entries`)
- SQL Views (`meal_totals_today`, `daily_totals`, `weekly_trends`)
- Indexes for performance
- RLS policies for security
- Storage bucket (`food-images`) with policies
- Auto-create profile trigger on signup

### 3. Enable Auth
- Go to Authentication → Providers → Enable Email
- (Optional) Enable Magic Link

### 4. Storage
The schema SQL auto-creates the `food-images` bucket. Verify in Storage dashboard.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
```

---

## Project Structure

```
macro-mini/
├── supabase/
│   └── schema.sql              # Full DB schema + RLS + storage
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx            # Root redirect (→ dashboard or login)
│   │   ├── not-found.tsx       # 404 page
│   │   ├── globals.css         # Design tokens + custom CSS
│   │   ├── login/page.tsx      # Email/password + magic link
│   │   ├── signup/page.tsx     # Registration
│   │   ├── auth/callback/route.ts  # OAuth/magic link callback
│   │   ├── api/
│   │   │   └── analyze/route.ts    # AI analysis endpoint
│   │   └── (app)/              # Authenticated layout group
│   │       ├── layout.tsx      # Shell with bottom nav
│   │       ├── dashboard/      # Dashboard (server + client)
│   │       ├── capture/        # Photo capture + analysis
│   │       ├── food/[id]/      # Food detail + edit
│   │       ├── meals/          # Meal list + rollups
│   │       ├── history/        # Charts + trends
│   │       └── settings/       # Profile + targets + export
│   ├── components/
│   │   ├── layout/
│   │   │   ├── bottom-nav.tsx  # Mobile bottom navigation
│   │   │   └── header.tsx      # Sticky page header
│   │   └── ui/
│   │       ├── button.tsx      # Primary/secondary/ghost
│   │       ├── card.tsx        # Bordered card
│   │       ├── macro-bar.tsx   # Progress bar for macros
│   │       ├── spinner.tsx     # Loading spinner
│   │       ├── skeleton.tsx    # Skeleton loading states
│   │       ├── error-box.tsx   # Error display + retry
│   │       └── empty-state.tsx # Empty state placeholder
│   ├── lib/
│   │   ├── types.ts            # TypeScript types + Database type
│   │   ├── utils.ts            # Helpers, constants, formatters
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       ├── server.ts       # Server Supabase client
│   │       └── middleware.ts   # Session refresh + auth guard
│   ├── services/
│   │   ├── data.ts             # Server-side data fetching
│   │   └── client.ts           # Client-side mutations + auth
│   └── middleware.ts           # Next.js middleware (auth guard)
├── .env.local.example
├── package.json
└── README.md
```

---

## Data Model

### Tables

```
profiles
├── id (uuid PK → auth.users)
├── name, avatar_url
├── calorie_target, protein_target_g, carbs_target_g, fat_target_g
├── diet_preference
└── created_at, updated_at

food_items
├── id (uuid PK)
├── user_id (FK → auth.users)
├── name, brand, image_url, thumbnail_url, serving_size
├── calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg
├── ingredients, allergens, health_notes, confidence
└── created_at, updated_at

log_entries
├── id (uuid PK)
├── user_id (FK → auth.users)
├── food_item_id (FK → food_items)
├── logged_at, status (enum), meal_type (enum)
├── quantity, notes
└── created_at
```

### Enums
- `meal_type`: breakfast | lunch | dinner | snack
- `log_status`: consumed | about_to_consume | about_to_purchase

### SQL Views (computed rollups)
- `meal_totals_today` — per-meal totals for today
- `daily_totals` — daily sums grouped by date
- `weekly_trends` — weekly averages grouped by ISO week

### RLS Policies
All tables: `auth.uid() = user_id` (or `= id` for profiles)
Storage: `(storage.foldername(name))[1] = auth.uid()::text`

---

## API Reference

### `POST /api/analyze`

**Request:**
```json
{ "imageUrl": "https://...supabase.co/storage/v1/object/public/food-images/..." }
```

**Response:** See Example Analysis JSON below.

### Supabase Client Operations

| Operation | Function | File |
|-----------|----------|------|
| Upload image | `uploadFoodImage(userId, file)` | `services/client.ts` |
| AI analysis | `analyzeImage(imageUrl)` | `services/client.ts` |
| Create food | `createFoodItem(item)` | `services/client.ts` |
| Update food | `updateFoodItem(id, updates)` | `services/client.ts` |
| Create log | `createLogEntry(entry)` | `services/client.ts` |
| Delete log | `deleteLogEntry(id)` | `services/client.ts` |
| Update profile | `updateProfile(userId, updates)` | `services/client.ts` |
| Export data | `exportUserData(userId)` | `services/client.ts` |

---

## Example Analysis JSON

```json
{
  "name": "Grilled Chicken Breast",
  "brand": null,
  "serving_size": "1 breast (174g)",
  "calories": 284,
  "protein_g": 53.4,
  "carbs_g": 0,
  "fat_g": 6.2,
  "fiber_g": 0,
  "sugar_g": 0,
  "sodium_mg": 404,
  "ingredients": null,
  "allergens": null,
  "health_notes": "High protein, low carb. Good source of lean protein. Watch sodium if on restricted diet.",
  "confidence": 0.72
}
```

---

## Build Plan

### MVP (v0.1) ✅
- [x] Next.js + Supabase + Tailwind scaffolding
- [x] Authentication (email/password + magic link)
- [x] Supabase schema with RLS
- [x] Photo capture / upload
- [x] AI analysis with GPT-4o Vision
- [x] Editable results before save
- [x] Dashboard with today's totals
- [x] Meal rollups
- [x] Food detail view
- [x] Settings with macro targets
- [x] Export data

### v1.0
- [ ] Thumbnail generation (Supabase Edge Function)
- [ ] Barcode scanner integration
- [ ] Search existing food items (re-log without photo)
- [ ] Offline support (PWA)
- [ ] Push notifications for meal reminders
- [ ] Dark mode support

### v2.0
- [ ] Social features (share meals)
- [ ] AI meal suggestions based on remaining macros
- [ ] Recipe builder (combine food items)
- [ ] Integration with fitness trackers
- [ ] CSV export
- [ ] Multi-language support

---

## Design System

### Typography
- Font: Geist Sans (variable)
- Headings: font-semibold, tracking-tight
- Body: text-sm (14px)
- Captions: text-xs (12px), text-[10px]

### Components
- **Button**: primary (black), secondary (bordered), ghost
- **Card**: 1px border, 6px radius, subtle shadow
- **MacroBar**: 6px height progress bar
- **Divider**: 1px horizontal line
- **Skeleton**: shimmer animation for loading

### Spacing
- Page padding: 16px horizontal, 20px vertical
- Card padding: 16px
- Section gaps: 20px
- Max width: 512px (max-w-lg)

---

## License

MIT