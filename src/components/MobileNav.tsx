'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

export type MobileNavItem = {
  href: string;
  label: string;
  cta?: boolean;
};

export function MobileNav({ items }: { items: readonly MobileNavItem[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <div className="site-header__mobile-nav">
      <button
        ref={buttonRef}
        className="site-header__menu-button"
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="site-header__menu-icon" aria-hidden="true" />
        <span>Menu</span>
      </button>
      <nav id={menuId} className="site-header__mobile-panel" aria-label="Mobile primary navigation" hidden={!open}>
        {items.map((item) => (
          <Link key={item.href} className={item.cta ? 'site-header__cta' : undefined} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
