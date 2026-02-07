'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { updateProfile, exportUserData, signOut, getCurrentUser } from '@/services/client';
import { LogOut, Download, Save } from 'lucide-react';
import type { Profile } from '@/lib/types';

const DIET_OPTIONS = ['none', 'keto', 'vegan', 'vegetarian', 'paleo', 'mediterranean', 'low-carb', 'high-protein'];

export default function SettingsClient({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: profile?.name ?? '',
    calorie_target: profile?.calorie_target ?? 2000,
    protein_target_g: profile?.protein_target_g ?? 150,
    carbs_target_g: profile?.carbs_target_g ?? 250,
    fat_target_g: profile?.fat_target_g ?? 65,
    diet_preference: profile?.diet_preference ?? 'none',
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile(profile.id, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
    setSaving(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      const data = await exportUserData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `macromini-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently handle
    }
    setExporting(false);
  };

  return (
    <main className="mx-auto max-w-lg space-y-5 px-4 py-5 animate-fade-in">
      {error && (
        <p className="rounded bg-[var(--color-surface)] px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      {/* Profile */}
      <Card className="space-y-4">
        <h3 className="text-xs font-semibold">Profile</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Diet preference</label>
          <select
            value={form.diet_preference}
            onChange={(e) => setForm({ ...form, diet_preference: e.target.value })}
            className="w-full appearance-none rounded-md border bg-white px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {DIET_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d === 'none' ? 'No preference' : d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Macro targets */}
      <Card className="space-y-4">
        <h3 className="text-xs font-semibold">Daily Macro Targets</h3>
        {([
          ['calorie_target', 'Calories (kcal)'],
          ['protein_target_g', 'Protein (g)'],
          ['carbs_target_g', 'Carbs (g)'],
          ['fat_target_g', 'Fat (g)'],
        ] as const).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium">{label}</label>
            <input
              type="number"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
              className="w-full rounded-md border px-3 py-2 text-sm tabular-nums"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
        ))}
      </Card>

      {/* Save */}
      <Button onClick={handleSave} loading={saving} className="w-full">
        <Save size={16} className="mr-1.5" />
        {saved ? 'Saved ✓' : 'Save settings'}
      </Button>

      <hr className="divider" />

      {/* Export */}
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Export data</p>
          <p className="text-xs text-[var(--color-muted)]">Download all your food & log data as JSON</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} loading={exporting}>
          <Download size={14} className="mr-1" />
          Export
        </Button>
      </Card>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-hover)]"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <LogOut size={16} />
        Sign out
      </button>

      <p className="text-center text-[10px] text-[var(--color-muted)]">MacroMini v0.1.0</p>
    </main>
  );
}
