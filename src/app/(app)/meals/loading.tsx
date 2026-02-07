import { SkeletonList } from '@/components/ui/skeleton';
import Header from '@/components/layout/header';

export default function MealsLoading() {
  return (
    <>
      <Header title="Meals" />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <SkeletonList count={4} />
      </main>
    </>
  );
}
