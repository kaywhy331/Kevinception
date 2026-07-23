'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AccessibleDialog({
  open,
  onClose,
  title,
  className = 'modal-card',
  children
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const explicitReturnFocus = document.querySelector<HTMLElement>('[data-dialog-return-focus]');
    const previousFocus = explicitReturnFocus ?? (activeElement && activeElement !== document.body ? activeElement : null);
    const background = document.querySelector<HTMLElement>('.experience-root');
    const previousAriaHidden = background?.getAttribute('aria-hidden');
    if (background) {
      background.inert = true;
      background.setAttribute('aria-hidden', 'true');
    }
    window.requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog.current) return;
      const focusable = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => !element.hidden);
      if (!focusable.length) {
        event.preventDefault();
        dialog.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (background) {
        background.inert = false;
        if (previousAriaHidden == null) background.removeAttribute('aria-hidden');
        else background.setAttribute('aria-hidden', previousAriaHidden);
      }
      window.setTimeout(() => {
        const returnTarget = previousFocus?.isConnected ? previousFocus : document.querySelector<HTMLElement>('[data-dialog-return-focus]');
        returnTarget?.focus();
      }, 0);
    };
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialog} className={className} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label={`Close ${title}`}>×</button></header>
        {children}
      </section>
    </div>,
    document.body
  );
}
