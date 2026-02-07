'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/services/client';

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpgrade() {
    try {
      setLoading(true);
      setError('');

      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Create checkout session
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await res.json();

      if (!url) {
        throw new Error('Failed to get checkout URL');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Upgrade to Pro" />

      <main className="mx-auto max-w-lg space-y-5 px-4 py-5">
        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Free Tier */}
        <Card className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="text-sm text-[var(--color-muted)]">
                Perfect for trying out MacroMini
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">$0</div>
              <div className="text-xs text-[var(--color-muted)]">forever</div>
            </div>
          </div>

          <hr className="divider" />

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>10 analyses per month</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Photo capture & upload</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Macro tracking dashboard</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Meal history</span>
            </li>
          </ul>
        </Card>

        {/* Pro Tier */}
        <Card className="relative space-y-3 border-2 border-[var(--color-accent)]">
          <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-2 py-1 text-[10px] font-medium text-white">
            <Sparkles size={12} />
            RECOMMENDED
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="text-sm text-[var(--color-muted)]">
                Unlimited analyses for serious trackers
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">$9.99</div>
              <div className="text-xs text-[var(--color-muted)]">per month</div>
            </div>
          </div>

          <hr className="divider" />

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span className="font-medium">Unlimited analyses</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>All free features</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span>Early access to new features</span>
            </li>
          </ul>

          <Button
            onClick={handleUpgrade}
            loading={loading}
            className="w-full"
            size="lg"
          >
            Upgrade to Pro
          </Button>
        </Card>

        <p className="text-center text-xs text-[var(--color-muted)]">
          Cancel anytime. No questions asked.
        </p>
      </main>
    </>
  );
}
