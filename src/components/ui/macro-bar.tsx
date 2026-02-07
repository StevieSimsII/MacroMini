import { cn, MACRO_COLORS } from '@/lib/utils';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  macro?: 'calories' | 'protein' | 'carbs' | 'fat';
}

export default function MacroBar({ label, current, target, unit = 'g', macro }: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target;

  // Resolve the bar color from the macro type
  const barColor = over
    ? 'var(--color-danger)'
    : macro
      ? MACRO_COLORS[macro]
      : 'var(--color-accent)';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium" style={macro ? { color: MACRO_COLORS[macro] } : undefined}>
          {label}
        </span>
        <span className={cn('tabular-nums', over && 'font-semibold text-[var(--color-danger)]')}>
          {Math.round(current)}{unit !== 'kcal' ? unit : ''} / {target}{unit !== 'kcal' ? unit : ''}{' '}
          {unit === 'kcal' ? 'kcal' : ''}
        </span>
      </div>
      <div className="macro-bar">
        <div
          className="macro-bar-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
