import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-sm text-[var(--color-muted)]">Page not found.</p>
      <Link
        href="/dashboard"
        className="rounded-md bg-[var(--color-text)] px-4 py-2 text-sm font-medium text-white"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
