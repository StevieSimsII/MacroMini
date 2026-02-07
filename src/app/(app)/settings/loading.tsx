import { SkeletonCard } from '@/components/ui/skeleton';
import Header from '@/components/layout/header';

export default function SettingsLoading() {
  return (
    <>
      <Header title="Settings" />
      <main className="mx-auto max-w-lg space-y-5 px-4 py-5">
        <SkeletonCard />
        <SkeletonCard />
        <div className="skeleton h-10 w-full" />
      </main>
    </>
  );
}
