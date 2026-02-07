import Header from '@/components/layout/header';
import { getDailyTotals, getWeeklyTrends } from '@/services/data';
import HistoryClient from './history-client';

export default async function HistoryPage() {
  const [dailyTotals, weeklyTrends] = await Promise.all([
    getDailyTotals(30),
    getWeeklyTrends(12),
  ]);

  return (
    <>
      <Header title="Trends" />
      <HistoryClient dailyTotals={dailyTotals} weeklyTrends={weeklyTrends} />
    </>
  );
}
