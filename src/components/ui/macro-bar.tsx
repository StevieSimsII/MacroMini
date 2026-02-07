import { cn } from '@/lib/utils';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export default function MacroBar({ label, current, target, unit = 'g' }: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className={cn('tabular-nums', over && 'font-semibold')}>
          {Math.round(current)}{unit !== 'kcal' ? unit : ''} / {target}{unit !== 'kcal' ? unit : ''}{' '}
          {unit === 'kcal' ? 'kcal' : ''}
        </span>
      </div>
      <div className="macro-bar">
        <div
          className={cn('macro-bar-fill', over && 'bg-[var(--color-muted)]')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
