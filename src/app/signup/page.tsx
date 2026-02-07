'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-sm text-center">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            We sent a confirmation link to <strong>{email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Start tracking your macros today.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <p className="rounded bg-[var(--color-surface)] px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)' }}
              placeholder="Your name"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)' }}
              placeholder="At least 6 characters"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-center text-xs text-[var(--color-muted)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
