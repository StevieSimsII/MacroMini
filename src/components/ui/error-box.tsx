import { AlertTriangle } from 'lucide-react';

interface ErrorBoxProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorBox({
  message = 'Something went wrong.',
  onRetry,
}: ErrorBoxProps) {
  return (
    <div className="card flex flex-col items-center gap-3 py-8 text-center">
      <AlertTriangle size={28} className="text-[var(--color-muted)]" />
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-hover)]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
