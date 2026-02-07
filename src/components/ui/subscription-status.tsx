'use client';

import Link from 'next/link';
import Card from './card';
import { Sparkles, TrendingUp } from 'lucide-react';
import type { Profile } from '@/lib/types';

interface SubscriptionStatusProps {
  profile: Profile;
}

export default function SubscriptionStatus({ profile }: SubscriptionStatusProps) {
  const FREE_TIER_LIMIT = 10;
  const isFreeTier = profile.subscription_tier === 'free';
  const usagePercentage = isFreeTier
    ? Math.min((profile.analyses_count / FREE_TIER_LIMIT) * 100, 100)
    : 0;
  const remaining = Math.max(FREE_TIER_LIMIT - profile.analyses_count, 0);

  // Don't show for pro users unless they're close to renewal
  if (!isFreeTier) {
    return null;
  }

  return (
    <Card
      className={`space-y-3 ${
        usagePercentage >= 80 ? 'border-2 border-amber-500' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Free Tier</h3>
          <p className="text-xs text-[var(--color-muted)]">
            {remaining} analyses remaining this month
          </p>
        </div>
        {usagePercentage >= 80 && (
          <TrendingUp size={20} className="text-amber-600" />
        )}
      </div>

      {/* Usage bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
        <div
          className={`h-full transition-all ${
            usagePercentage >= 100
              ? 'bg-red-500'
              : usagePercentage >= 80
              ? 'bg-amber-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${usagePercentage}%` }}
        />
      </div>

      <div className="text-xs text-[var(--color-muted)]">
        {profile.analyses_count} of {FREE_TIER_LIMIT} used
      </div>

      {usagePercentage >= 50 && (
        <>
          <hr className="divider" />
          <Link
            href="/upgrade"
            className="flex items-center justify-center gap-1.5 rounded bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <Sparkles size={14} />
            Upgrade to Pro for unlimited
          </Link>
        </>
      )}
    </Card>
  );
}
