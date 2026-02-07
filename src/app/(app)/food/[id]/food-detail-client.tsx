'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import MacroBar from '@/components/ui/macro-bar';
import { updateFoodItem, createLogEntry, getCurrentUser } from '@/services/client';
import { capitalize, MEAL_ORDER, STATUS_LABELS, formatNumber } from '@/lib/utils';
import { Pencil, RotateCcw, ChevronDown } from 'lucide-react';
import type { FoodItem, MealType, LogStatus } from '@/lib/types';

export default function FoodDetailClient({ item }: { item: FoodItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Re-log state
  const [showRelog, setShowRelog] = useState(false);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [status, setStatus] = useState<LogStatus>('consumed');
  const [quantity, setQuantity] = useState(1);

  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      await updateFoodItem(item.id, {
        name: form.name,
        serving_size: form.serving_size,
        calories: form.calories,
        protein_g: form.protein_g,
        carbs_g: form.carbs_g,
        fat_g: form.fat_g,
        fiber_g: form.fiber_g,
        sugar_g: form.sugar_g,
        sodium_mg: form.sodium_mg,
        health_notes: form.health_notes,
      });
      setEditing(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
    setSaving(false);
  };

  const handleRelog = async () => {
    setSaving(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      await createLogEntry({
        user_id: user.id,
        food_item_id: item.id,
        status,
        meal_type: mealType,
        quantity,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Log failed');
    }
    setSaving(false);
  };

  const macros = [
    { label: 'Calories', value: form.calories, unit: 'kcal' },
    { label: 'Protein', value: form.protein_g, unit: 'g' },
    { label: 'Carbs', value: form.carbs_g, unit: 'g' },
    { label: 'Fat', value: form.fat_g, unit: 'g' },
    { label: 'Fiber', value: form.fiber_g, unit: 'g' },
    { label: 'Sugar', value: form.sugar_g, unit: 'g' },
    { label: 'Sodium', value: form.sodium_mg, unit: 'mg' },
  ];

  return (
    <main className="mx-auto max-w-lg space-y-5 px-4 py-5 animate-fade-in">
      {/* Image */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="h-52 w-full rounded-md object-cover"
        />
      ) : (
        <div className="flex h-52 w-full items-center justify-center rounded-md bg-[var(--color-surface)] text-3xl">
          🍽
        </div>
      )}

      {/* Title + confidence */}
      <div className="flex items-start justify-between">
        <div>
          {editing ? (
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border-b text-lg font-semibold outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            />
          ) : (
            <h2 className="text-lg font-semibold">{item.name}</h2>
          )}
          {item.brand && <p className="text-xs text-[var(--color-muted)]">{item.brand}</p>}
          {item.serving_size && (
            <p className="text-xs text-[var(--color-muted)]">Serving: {item.serving_size}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="rounded border p-1.5 transition-colors hover:bg-[var(--color-hover)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setShowRelog(!showRelog)}
            className="rounded border p-1.5 transition-colors hover:bg-[var(--color-hover)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {item.confidence > 0 && (
        <span className="inline-block rounded bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-medium">
          AI Confidence: {Math.round(item.confidence * 100)}%
        </span>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Nutrition */}
      <Card className="space-y-3">
        <h3 className="text-xs font-semibold">Nutrition</h3>
        {editing ? (
          <div className="grid grid-cols-2 gap-3">
            {macros.map(({ label, value, unit }) => {
              const key = label.toLowerCase().replace(' ', '_') as keyof typeof form;
              return (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] text-[var(--color-muted)]">{label} ({unit})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) =>
                      setForm({ ...form, [key]: parseFloat(e.target.value) || 0 } as typeof form)
                    }
                    className="w-full rounded border px-2 py-1 text-sm tabular-nums"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {macros.map(({ label, value, unit }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">{label}</span>
                <span className="font-medium tabular-nums">
                  {formatNumber(Number(value), 1)}{unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Health notes */}
      {(item.health_notes || editing) && (
        <Card className="space-y-2">
          <h3 className="text-xs font-semibold">Health Notes</h3>
          {editing ? (
            <textarea
              value={form.health_notes ?? ''}
              onChange={(e) => setForm({ ...form, health_notes: e.target.value })}
              rows={3}
              className="w-full resize-none rounded border px-2 py-1 text-xs"
              style={{ borderColor: 'var(--color-border)' }}
            />
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {item.health_notes}
            </p>
          )}
        </Card>
      )}

      {/* Allergens / Ingredients */}
      {item.allergens && (
        <Card className="space-y-1">
          <h3 className="text-xs font-semibold">Allergens</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">{item.allergens}</p>
        </Card>
      )}

      {/* Edit save button */}
      {editing && (
        <Button onClick={handleSaveEdits} loading={saving} className="w-full">
          Save changes
        </Button>
      )}

      {/* Re-log panel */}
      {showRelog && (
        <Card className="space-y-4">
          <h3 className="text-xs font-semibold">Log again</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['consumed', 'about_to_consume', 'about_to_purchase'] as LogStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  status === s
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-hover)]'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full appearance-none rounded border bg-white px-3 py-1.5 pr-8 text-sm"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {MEAL_ORDER.map((m) => (
                  <option key={m} value={m}>{capitalize(m)}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            </div>
            <input
              type="number"
              min={0.25}
              step={0.25}
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
              className="w-16 rounded border px-2 py-1.5 text-sm tabular-nums"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
          <Button onClick={handleRelog} loading={saving} className="w-full">
            Log this item
          </Button>
        </Card>
      )}
    </main>
  );
}
