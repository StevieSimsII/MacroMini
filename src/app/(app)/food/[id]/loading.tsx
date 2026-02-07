import { SkeletonCard } from '@/components/ui/skeleton';
import Header from '@/components/layout/header';

export default function FoodLoading() {
  return (
    <>
      <Header title="Food Detail" />
      <main className="mx-auto max-w-lg space-y-5 px-4 py-5">
        <div className="skeleton h-52 w-full" />
        <div className="skeleton h-6 w-48" />
        <SkeletonCard />
        <SkeletonCard />
      </main>
    </>
  );
}
