'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type BrowserViewTransition = { finished: Promise<void> };
type TransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => BrowserViewTransition;
};
type PendingNavigation = {
  destinationPath: string;
  resolve: () => void;
  timer: number;
};

export const REVEAL_SELECTOR = [
  '.site-shell main > .section-shell:not(:first-child)',
  '.site-shell .about-page > section',
  '.site-shell .resume-page > section',
  '.site-shell .case-study > section',
  '.site-shell .case-study-index__list > li',
  '.site-shell .current-work-editorial > article',
  '.site-shell .artifact-ledger > li'
].join(', ');

export function normalizeRoutePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

export function isStandardRoutePath(pathname: string) {
  return !normalizeRoutePath(pathname).startsWith('/experience');
}

export function shouldTransitionNavigation({
  currentHref,
  destinationHref,
  button,
  modified,
  target,
  download,
  optedOut
}: {
  currentHref: string;
  destinationHref: string;
  button: number;
  modified: boolean;
  target: string | null;
  download: boolean;
  optedOut: boolean;
}) {
  if (button !== 0 || modified || download || optedOut || (target && target !== '_self')) return false;
  try {
    const current = new URL(currentHref);
    const destination = new URL(destinationHref, current);
    if (current.origin !== destination.origin || destination.hash) return false;
    if (!isStandardRoutePath(current.pathname) || !isStandardRoutePath(destination.pathname)) return false;
    return normalizeRoutePath(current.pathname) !== normalizeRoutePath(destination.pathname);
  } catch {
    return false;
  }
}

function findAnchor(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null;
}

export function PageChoreography() {
  const pathname = usePathname();
  const router = useRouter();
  const pendingNavigation = useRef<PendingNavigation | null>(null);

  useEffect(() => {
    const pending = pendingNavigation.current;
    if (!pending || normalizeRoutePath(pathname) !== pending.destinationPath) return;
    const frame = window.requestAnimationFrame(() => {
      if (pendingNavigation.current !== pending) return;
      window.clearTimeout(pending.timer);
      pendingNavigation.current = null;
      pending.resolve();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const transitionDocument = document as TransitionDocument;

    const onClick = (event: MouseEvent) => {
      const anchor = findAnchor(event.target);
      if (!anchor || !transitionDocument.startViewTransition || reducedMotion.matches) return;
      if (!shouldTransitionNavigation({
        currentHref: window.location.href,
        destinationHref: anchor.href,
        button: event.button,
        modified: event.metaKey || event.ctrlKey || event.shiftKey || event.altKey,
        target: anchor.getAttribute('target'),
        download: anchor.hasAttribute('download'),
        optedOut: anchor.hasAttribute('data-no-view-transition')
      })) return;

      if (pendingNavigation.current) {
        window.clearTimeout(pendingNavigation.current.timer);
        pendingNavigation.current.resolve();
        pendingNavigation.current = null;
        return;
      }

      event.preventDefault();
      const destination = new URL(anchor.href, window.location.href);
      const href = `${destination.pathname}${destination.search}`;
      let settle = () => {};
      const ready = new Promise<void>((resolve) => { settle = resolve; });
      const pending: PendingNavigation = {
        destinationPath: normalizeRoutePath(destination.pathname),
        resolve: settle,
        timer: 0
      };
      pending.timer = window.setTimeout(() => {
        if (pendingNavigation.current === pending) pendingNavigation.current = null;
        pending.resolve();
      }, 2000);
      pendingNavigation.current = pending;
      document.documentElement.dataset.routeTransition = 'running';

      const cleanup = () => {
        if (document.documentElement.dataset.routeTransition === 'running') delete document.documentElement.dataset.routeTransition;
      };

      try {
        const transition = transitionDocument.startViewTransition(async () => {
          router.push(href);
          await ready;
        });
        void transition.finished.then(cleanup, cleanup);
      } catch {
        window.clearTimeout(pending.timer);
        pendingNavigation.current = null;
        pending.resolve();
        cleanup();
        router.push(href);
      }
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      const pending = pendingNavigation.current;
      if (pending) {
        window.clearTimeout(pending.timer);
        pending.resolve();
        pendingNavigation.current = null;
      }
      delete document.documentElement.dataset.routeTransition;
    };
  }, [router]);

  useEffect(() => {
    if (!isStandardRoutePath(pathname)) {
      delete document.documentElement.dataset.choreography;
      return;
    }

    let revealObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let frame = 0;

    const prepare = (element: HTMLElement) => {
      if (element.hasAttribute('data-reveal')) return;
      element.dataset.reveal = 'ready';
      const siblingIndex = element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : 0;
      element.style.setProperty('--reveal-delay', `${Math.min(Math.max(siblingIndex, 0), 4) * 45}ms`);
      if (revealObserver) revealObserver.observe(element);
      else element.dataset.revealed = 'true';
    };

    const scan = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(REVEAL_SELECTOR)) prepare(root);
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(prepare);
    };

    frame = window.requestAnimationFrame(() => {
      if ('IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const element = entry.target as HTMLElement;
            element.dataset.revealed = 'true';
            revealObserver?.unobserve(element);
          }
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      }
      scan(document);
      document.documentElement.dataset.choreography = 'ready';
      mutationObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) scan(node);
          });
        }
      });
      const main = document.querySelector('.site-shell main');
      if (main) mutationObserver.observe(main, { childList: true, subtree: true });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      mutationObserver?.disconnect();
      delete document.documentElement.dataset.choreography;
    };
  }, [pathname]);

  return null;
}
