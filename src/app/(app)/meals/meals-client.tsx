'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import { capitalize, MEAL_ORDER, STATUS_LABELS, formatNumber } from '@/lib/utils';
import { deleteLogEntry } from '@/services/client';
import { Trash2, UtensilsCrossed } from 'lucide-react';
import type { MealTotalToday, LogEntry, FoodItem, MealType } from '@/lib/types';

interface Props {
  mealTotals: MealTotalToday[];
  entries: (LogEntry & { food_item: FoodItem })[];
}

export default function MealsClient({ mealTotals, entries }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMeal = (searchParams.get('meal') as MealType) || null;
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(initialMeal);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleDelete = async (entryId: string) => {
    if (!confirm('Remove this item from the meal?')) return;
    setDeleting(entryId);
    try {
      await deleteLogEntry(entryId);
      router.refresh();
    } catch {
      // handled silently
    }
    setDeleting(null);
  };

  if (mealTotals.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-5">
        <EmptyState
          icon={<UtensilsCrossed size={32} className="text-[var(--color-muted)]" />}
          title="No meals today"
          description="Add your first food item to start tracking meals."
          action={
            <Link
              href="/capture"
              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-white"
            >
              Add food
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg space-y-4 px-4 py-5 animate-fade-in">
      {MEAL_ORDER.map((mt) => {
        const meal = mealTotals.find((m) => m.meal_type === mt);
        if (!meal) return null;

        const mealEntries = entries.filter((e) => e.meal_type === mt);
        const isExpanded = expandedMeal === mt;

        return (
          <section key={mt}>
            <button
              onClick={() => setExpandedMeal(isExpanded ? null : mt)}
              className="w-full text-left"
            >
              <Card className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{capitalize(mt)}</h3>
                  <p className="text-[10px] text-[var(--color-muted)]">
                    {meal.item_count} item{meal.item_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums">{formatNumber(Number(meal.total_calories))}</p>
                  <p className="text-[10px] text-[var(--color-muted)]">
                    P {formatNumber(Number(meal.total_protein_g))}g · C {formatNumber(Number(meal.total_carbs_g))}g · F {formatNumber(Number(meal.total_fat_g))}g
                  </p>
                </div>
              </Card>
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-1.5 pl-2">
                {mealEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded border px-3 py-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {entry.food_item?.thumbnail_url && !failedImages.has(entry.id) ? (
                      <img
                        src={entry.food_item.thumbnail_url}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                        onError={() => {
                          setFailedImages(prev => new Set(prev).add(entry.id));
                        }}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-surface)] text-xs">
                        🍽
                      </div>
                    )}
                    <Link href={`/food/${entry.food_item_id}`} className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{entry.food_item?.name}</p>
                      <p className="text-[10px] text-[var(--color-muted)]">
                        {STATUS_LABELS[entry.status]}
                        {entry.quantity > 1 && ` · ×${entry.quantity}`}
                      </p>
                    </Link>
                    <span className="text-sm font-medium tabular-nums">
                      {formatNumber(Number(entry.food_item?.calories ?? 0) * entry.quantity)}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-hover)] disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {mealEntries.length === 0 && (
                  <p className="px-3 py-2 text-xs text-[var(--color-muted)]">No items in this meal.</p>
                )}
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}
