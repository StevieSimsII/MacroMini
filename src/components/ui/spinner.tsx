import { Loader2 } from 'lucide-react';

export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-[var(--color-muted)]" />;
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size={28} />
    </div>
  );
}
