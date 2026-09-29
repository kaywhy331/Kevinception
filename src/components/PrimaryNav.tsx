'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ariaCurrentFor, type NavItem } from '@/components/navigation';

export function PrimaryNav({ items, label, className }: { items: readonly NavItem[]; label: string; className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={className} aria-label={label}>
      {items.map((item) => (
        <Link key={item.href} className={item.cta ? 'site-header__cta' : undefined} href={item.href} aria-current={ariaCurrentFor(pathname, item.href)}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
