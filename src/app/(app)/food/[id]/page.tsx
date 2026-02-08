import Header from '@/components/layout/header';
import { getFoodItem } from '@/services/data';
import FoodDetailClient from './food-detail-client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FoodDetailPage({ params }: Props) {
  const { id } = await params;
  const foodItem = await getFoodItem(id);

  if (!foodItem) {
    notFound();
  }

  return (
    <>
      <Header title="Food Detail" />
      <FoodDetailClient item={foodItem} />
    </>
  );
}
