import Header from '@/components/layout/header';
import { getMealTotalsToday, getTodayLogEntries } from '@/services/data';
import MealsClient from './meals-client';

export default async function MealsPage() {
  const [mealTotals, todayEntries] = await Promise.all([
    getMealTotalsToday(),
    getTodayLogEntries(),
  ]);

  return (
    <>
      <Header title="Meals" />
      <MealsClient mealTotals={mealTotals} entries={todayEntries} />
    </>
  );
}
