import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      {icon ?? <Inbox size={32} className="text-[var(--color-muted)]" />}
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && (
        <p className="max-w-xs text-xs text-[var(--color-muted)]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
