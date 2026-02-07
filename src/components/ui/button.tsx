import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-accent)] disabled:opacity-50 disabled:pointer-events-none';

    const variants: Record<string, string> = {
      primary: 'bg-[var(--color-accent)] text-white hover:bg-blue-700',
      secondary: 'border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-hover)]',
      ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]',
    };

    const sizes: Record<string, string> = {
      sm: 'text-xs px-3 py-1.5 rounded',
      md: 'text-sm px-4 py-2 rounded-md',
      lg: 'text-sm px-6 py-2.5 rounded-md',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
