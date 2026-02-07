'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, ChevronRight } from 'lucide-react';
import MacroBar from '@/components/ui/macro-bar';
import Card from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import SubscriptionStatus from '@/components/ui/subscription-status';
import { capitalize, MEAL_ORDER, STATUS_LABELS, formatNumber } from '@/lib/utils';
import type { Profile, MealTotalToday, LogEntry, FoodItem } from '@/lib/types';

interface DashboardClientProps {
  profile: Profile | null;
  todayTotals: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
  mealTotals: MealTotalToday[];
  todayEntries: (LogEntry & { food_item: FoodItem })[];
}

export default function DashboardClient({
  profile,
  todayTotals,
  mealTotals,
  todayEntries,
}: DashboardClientProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const targets = {
    calories: profile?.calorie_target ?? 2000,
    protein_g: profile?.protein_target_g ?? 150,
    carbs_g: profile?.carbs_target_g ?? 250,
    fat_g: profile?.fat_target_g ?? 65,
  };

  return (
    <main className="mx-auto max-w-lg space-y-5 px-4 py-5 animate-fade-in">
      {/* ---- Today's Totals ---- */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Today</h2>
          <span className="text-xs text-[var(--color-muted)] tabular-nums">
            {formatNumber(todayTotals.calories)} / {formatNumber(targets.calories)} kcal
          </span>
        </div>
        <div className="space-y-2">
          <MacroBar label="Calories" current={todayTotals.calories} target={targets.calories} unit="kcal" macro="calories" />
          <MacroBar label="Protein" current={todayTotals.protein_g} target={targets.protein_g} macro="protein" />
          <MacroBar label="Carbs" current={todayTotals.carbs_g} target={targets.carbs_g} macro="carbs" />
          <MacroBar label="Fat" current={todayTotals.fat_g} target={targets.fat_g} macro="fat" />
        </div>
      </section>

      {/* ---- Subscription Status ---- */}
      {profile && <SubscriptionStatus profile={profile} />}

      <hr className="divider" />

      {/* ---- Quick Add ---- */}
      <Link
        href="/capture"
        className="flex items-center justify-center gap-2 rounded-md border border-dashed py-3 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-light)]"
        style={{ borderColor: 'var(--color-accent)' }}
      >
        <Camera size={18} />
        Snap or upload a food item
      </Link>

      <hr className="divider" />

      {/* ---- Meal Rollups ---- */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Meals</h2>
        {mealTotals.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)]">No meals logged yet today.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {MEAL_ORDER.map((mt) => {
              const meal = mealTotals.find((m) => m.meal_type === mt);
              if (!meal) return null;
              return (
                <Link key={mt} href={`/meals?meal=${mt}`}>
                  <Card className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{capitalize(mt)}</span>
                      <ChevronRight size={14} className="text-[var(--color-muted)]" />
                    </div>
                    <p className="text-lg font-bold tabular-nums">{formatNumber(Number(meal.total_calories))}</p>
                    <p className="text-[10px] text-[var(--color-muted)]">
                      P {formatNumber(Number(meal.total_protein_g))}g · C {formatNumber(Number(meal.total_carbs_g))}g · F {formatNumber(Number(meal.total_fat_g))}g
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <hr className="divider" />

      {/* ---- Recent Items ---- */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Recent</h2>
        {todayEntries.length === 0 ? (
          <EmptyState
            title="No items yet"
            description="Snap a photo to log your first food item."
            action={
              <Link
                href="/capture"
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-white"
              >
                <Camera size={14} />
                Add food
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {todayEntries.slice(0, 8).map((entry) => (
              <Link key={entry.id} href={`/food/${entry.food_item_id}`}>
                <Card className="flex items-center gap-3">
                  {entry.food_item?.thumbnail_url && !failedImages.has(entry.id) ? (
                    <img
                      src={entry.food_item.thumbnail_url}
                      alt={entry.food_item.name}
                      className="h-10 w-10 rounded object-cover"
                      onError={() => {
                        setFailedImages(prev => new Set(prev).add(entry.id));
                      }}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--color-surface)] text-xs text-[var(--color-muted)]">
                      🍽
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{entry.food_item?.name}</p>
                    <p className="text-[10px] text-[var(--color-muted)]">
                      {capitalize(entry.meal_type)} · {STATUS_LABELS[entry.status]}
                      {entry.quantity > 1 && ` · ×${entry.quantity}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatNumber(Number(entry.food_item?.calories ?? 0) * entry.quantity)}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
