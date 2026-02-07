import { SkeletonList } from '@/components/ui/skeleton';
import Header from '@/components/layout/header';

export default function HistoryLoading() {
  return (
    <>
      <Header title="Trends" />
      <main className="mx-auto max-w-lg space-y-5 px-4 py-5">
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-48 w-full" />
        <SkeletonList count={2} />
      </main>
    </>
  );
}
