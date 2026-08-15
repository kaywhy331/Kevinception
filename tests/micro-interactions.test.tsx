import fs from 'node:fs';
import path from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calculateCardTilt,
  calculateMagneticOffset,
  MicroInteractions
} from '@/components/MicroInteractions';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

function installMatchMedia({ finePointer, reducedMotion }: { finePointer: boolean; reducedMotion: boolean }) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : finePointer,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, 'matchMedia');
  vi.restoreAllMocks();
});

describe('standard-page micro interactions', () => {
  it('bounds magnetic and tilt math around the element center', () => {
    const rect = { left: 0, top: 0, width: 100, height: 50 };
    expect(calculateMagneticOffset(50, 25, rect)).toEqual({ x: 0, y: 0 });
    expect(calculateMagneticOffset(100, 50, rect)).toEqual({ x: 6, y: 4 });
    expect(calculateCardTilt(50, 25, rect)).toEqual({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
    expect(calculateCardTilt(100, 0, rect)).toEqual({ rotateX: 2.2, rotateY: 2.2, glowX: 100, glowY: 0 });
  });

  it('drives one delegated fine-pointer enhancement and resets on exit', () => {
    installMatchMedia({ finePointer: true, reducedMotion: false });
    render(
      <>
        <MicroInteractions />
        <main className="site-shell">
          <a className="primary-action" href="/contact/"><span>Start</span></a>
          <article data-interactive-card="true"><span>Card</span></article>
        </main>
      </>
    );

    const action = screen.getByRole('link', { name: 'Start' });
    const actionLabel = screen.getByText('Start');
    vi.spyOn(action, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 50 } as DOMRect);
    fireEvent.pointerMove(actionLabel, { clientX: 100, clientY: 50 });
    expect(action).toHaveAttribute('data-magnetic-active', 'true');
    expect(action).toHaveStyle({ '--magnet-x': '6.00px', '--magnet-y': '4.00px' });

    const card = screen.getByText('Card').closest('article');
    expect(card).not.toBeNull();
    vi.spyOn(card as HTMLElement, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 } as DOMRect);
    fireEvent.pointerMove(screen.getByText('Card'), { clientX: 100, clientY: 0 });
    expect(card).toHaveAttribute('data-tilt-active', 'true');
    expect(card).toHaveStyle({ '--tilt-x': '2.20deg', '--tilt-y': '2.20deg', '--glow-x': '100.0%', '--glow-y': '0.0%' });
    expect(action).not.toHaveAttribute('data-magnetic-active');

    fireEvent.pointerOut(document.body, { relatedTarget: null });
    expect(card).not.toHaveAttribute('data-tilt-active');
    expect(card).not.toHaveStyle({ '--tilt-x': '2.20deg' });
  });

  it.each([
    { label: 'reduced motion', finePointer: true, reducedMotion: true },
    { label: 'coarse pointer', finePointer: false, reducedMotion: false }
  ])('does not add spatial motion for $label', ({ finePointer, reducedMotion }) => {
    installMatchMedia({ finePointer, reducedMotion });
    render(<><MicroInteractions /><a className="primary-action" href="/contact/">Start</a></>);
    const action = screen.getByRole('link', { name: 'Start' });
    fireEvent.pointerMove(action, { clientX: 100, clientY: 50 });
    expect(action).not.toHaveAttribute('data-magnetic-active');
    expect(action.style.getPropertyValue('--magnet-x')).toBe('');
  });

  it('leaves immersive controls under the experience motion preference', () => {
    installMatchMedia({ finePointer: true, reducedMotion: false });
    render(<><MicroInteractions /><main className="experience-root"><button className="primary-action">Enter</button></main></>);
    const action = screen.getByRole('button', { name: 'Enter' });
    fireEvent.pointerMove(action, { clientX: 100, clientY: 50 });
    expect(action).not.toHaveAttribute('data-magnetic-active');
  });

  it('documents the easing vocabulary and non-spatial capability boundary', () => {
    const css = read('app/micro-interactions.css');
    const motion = read('docs/MOTION.md');
    const roadmap = read('docs/ROADMAP.md');
    const projectCard = read('src/components/ProjectCard.tsx');

    expect(css).toContain('--ease-spring: cubic-bezier(.2, .8, .2, 1.18)');
    expect(css).toContain('@media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)');
    expect(motion).toContain('one passive delegated pointer listener');
    expect(motion).toContain('Magnetism and tilt never encode state or gate an action');
    expect(roadmap).toContain('4.1 Micro-interactions');
    expect(roadmap).toContain('Status 2026-08-15: ✅ Implemented');
    expect(projectCard).toContain('data-interactive-card');
  });
});
