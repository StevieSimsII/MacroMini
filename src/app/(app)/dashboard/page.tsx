import Header from '@/components/layout/header';
import { getProfile, getMealTotalsToday, getTodayLogEntries } from '@/services/data';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [profile, mealTotals, todayEntries] = await Promise.all([
    getProfile(),
    getMealTotalsToday(),
    getTodayLogEntries(),
  ]);

  // Compute today totals from meal totals
  const todayTotals = {
    calories: mealTotals.reduce((s, m) => s + Number(m.total_calories), 0),
    protein_g: mealTotals.reduce((s, m) => s + Number(m.total_protein_g), 0),
    carbs_g: mealTotals.reduce((s, m) => s + Number(m.total_carbs_g), 0),
    fat_g: mealTotals.reduce((s, m) => s + Number(m.total_fat_g), 0),
  };

  return (
    <>
      <Header title="MacroMini" />
      <DashboardClient
        profile={profile}
        todayTotals={todayTotals}
        mealTotals={mealTotals}
        todayEntries={todayEntries}
      />
    </>
  );
}
