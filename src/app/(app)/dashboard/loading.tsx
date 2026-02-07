import { SkeletonList } from '@/components/ui/skeleton';
import Header from '@/components/layout/header';

export default function DashboardLoading() {
  return (
    <>
      <Header title="MacroMini" />
      <main className="mx-auto max-w-lg space-y-5 px-4 py-5">
        <div className="space-y-2">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-2 w-full" />
          <div className="skeleton h-2 w-full" />
          <div className="skeleton h-2 w-full" />
          <div className="skeleton h-2 w-full" />
        </div>
        <div className="skeleton h-12 w-full" />
        <SkeletonList count={4} />
      </main>
    </>
  );
}
