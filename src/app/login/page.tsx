'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  async function handleMagicLink() {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">MacroMini</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Snap. Analyze. Track.
          </p>
        </div>

        {magicLinkSent ? (
          <div className="card text-center">
            <p className="text-sm">Check your email for a login link.</p>
            <button
              className="mt-3 text-xs text-[var(--color-muted)] underline"
              onClick={() => setMagicLinkSent(false)}
            >
              Try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <p className="rounded bg-[var(--color-surface)] px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)' }}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)' }}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>

            <div className="divider" />

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={!email || loading}
              className="w-full text-center text-xs text-[var(--color-muted)] hover:underline disabled:opacity-50"
            >
              Or sign in with magic link
            </button>
          </form>
        )}

        <p className="text-center text-xs text-[var(--color-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
