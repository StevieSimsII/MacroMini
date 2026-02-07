'use client';

import { useState } from 'react';
import Card from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import { formatNumber, MACRO_COLORS } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { DailyTotal, WeeklyTrend } from '@/lib/types';

type Tab = 'daily' | 'weekly';

interface Props {
  dailyTotals: DailyTotal[];
  weeklyTrends: WeeklyTrend[];
}

export default function HistoryClient({ dailyTotals, weeklyTrends }: Props) {
  const [tab, setTab] = useState<Tab>('daily');

  const isEmpty = dailyTotals.length === 0 && weeklyTrends.length === 0;

  if (isEmpty) {
    return (
      <main className="mx-auto max-w-lg px-4 py-5">
        <EmptyState
          icon={<BarChart3 size={32} className="text-[var(--color-muted)]" />}
          title="No data yet"
          description="Start logging food to see your trends over time."
        />
      </main>
    );
  }

  const dailyChartData = dailyTotals.map((d) => ({
    date: format(parseISO(d.log_date), 'MMM d'),
    calories: Number(d.total_calories),
    protein: Number(d.total_protein_g),
    carbs: Number(d.total_carbs_g),
    fat: Number(d.total_fat_g),
  }));

  const weeklyChartData = weeklyTrends.map((w) => ({
    week: format(parseISO(w.week_start), 'MMM d'),
    avgCalories: Number(w.avg_daily_calories),
    avgProtein: Number(w.avg_daily_protein_g),
    avgCarbs: Number(w.avg_daily_carbs_g),
    avgFat: Number(w.avg_daily_fat_g),
    daysLogged: w.days_logged,
  }));

  return (
    <main className="mx-auto max-w-lg space-y-5 px-4 py-5 animate-fade-in">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-md bg-[var(--color-surface)] p-0.5">
        {(['daily', 'weekly'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t
                ? 'bg-white shadow-subtle'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t === 'daily' ? 'Daily' : 'Weekly'}
          </button>
        ))}
      </div>

      {/* Daily view */}
      {tab === 'daily' && (
        <>
          <Card className="space-y-3">
            <h3 className="text-xs font-semibold">Calories — Last 30 days</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted)" width={40} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid var(--color-border)',
                      boxShadow: 'none',
                    }}
                  />
                  <Bar dataKey="calories" fill={MACRO_COLORS.calories} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xs font-semibold">Macros — Last 30 days</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted)" width={40} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid var(--color-border)',
                      boxShadow: 'none',
                    }}
                  />
                  <Line type="monotone" dataKey="protein" stroke={MACRO_COLORS.protein} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="carbs" stroke={MACRO_COLORS.carbs} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fat" stroke={MACRO_COLORS.fat} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: MACRO_COLORS.protein }} />
                Protein
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: MACRO_COLORS.carbs }} />
                Carbs
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: MACRO_COLORS.fat }} />
                Fat
              </span>
            </div>
          </Card>

          {/* Daily table */}
          <Card>
            <h3 className="mb-3 text-xs font-semibold">Daily Breakdown</h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-[var(--color-muted)]" style={{ borderColor: 'var(--color-border)' }}>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium text-right">Cal</th>
                    <th className="pb-2 font-medium text-right">P</th>
                    <th className="pb-2 font-medium text-right">C</th>
                    <th className="pb-2 font-medium text-right">F</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTotals.slice().reverse().map((d) => (
                    <tr key={d.log_date} className="border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="py-1.5">{format(parseISO(d.log_date), 'MMM d')}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(Number(d.total_calories))}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(Number(d.total_protein_g))}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(Number(d.total_carbs_g))}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatNumber(Number(d.total_fat_g))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Weekly view */}
      {tab === 'weekly' && (
        <>
          <Card className="space-y-3">
            <h3 className="text-xs font-semibold">Avg Daily Calories — By Week</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted)" width={45} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid var(--color-border)',
                      boxShadow: 'none',
                    }}
                  />
                  <Bar dataKey="avgCalories" fill={MACRO_COLORS.calories} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-xs font-semibold">Weekly Summary</h3>
            <div className="space-y-3">
              {weeklyChartData.slice().reverse().map((w) => (
                <div key={w.week} className="flex items-center justify-between border-b pb-2 last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <p className="text-sm font-medium">Week of {w.week}</p>
                    <p className="text-[10px] text-[var(--color-muted)]">{w.daysLogged} days logged</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">{formatNumber(w.avgCalories)} avg kcal</p>
                    <p className="text-[10px] text-[var(--color-muted)]">
                      P {formatNumber(w.avgProtein)}g · C {formatNumber(w.avgCarbs)}g · F {formatNumber(w.avgFat)}g
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </main>
  );
}
