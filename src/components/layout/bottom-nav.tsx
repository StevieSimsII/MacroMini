'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Camera,
  UtensilsCrossed,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { href: '/capture', label: 'Add', icon: Camera },
  { href: '/history', label: 'Trends', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white"
         style={{ borderColor: 'var(--color-border)' }}>
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
              )}
            >
              {href === '/capture' ? (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                        background: active ? 'var(--color-accent)' : 'transparent',
                      }}>
                  <Icon size={20} color={active ? '#fff' : 'var(--color-muted)'} />
                </span>
              ) : (
                <Icon size={20} />
              )}
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
