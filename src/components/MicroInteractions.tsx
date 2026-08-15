'use client';

import { useEffect } from 'react';

type InteractionRect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;

const MAGNET_STRENGTH = 0.16;
const MAGNET_LIMIT = 6;
const CARD_TILT_LIMIT = 2.2;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateMagneticOffset(clientX: number, clientY: number, rect: InteractionRect) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return {
    x: clamp((clientX - centerX) * MAGNET_STRENGTH, -MAGNET_LIMIT, MAGNET_LIMIT),
    y: clamp((clientY - centerY) * MAGNET_STRENGTH, -MAGNET_LIMIT, MAGNET_LIMIT)
  };
}

export function calculateCardTilt(clientX: number, clientY: number, rect: InteractionRect) {
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  const normalizedX = clamp((clientX - rect.left) / width, 0, 1);
  const normalizedY = clamp((clientY - rect.top) / height, 0, 1);
  return {
    rotateX: (0.5 - normalizedY) * CARD_TILT_LIMIT * 2,
    rotateY: (normalizedX - 0.5) * CARD_TILT_LIMIT * 2,
    glowX: normalizedX * 100,
    glowY: normalizedY * 100
  };
}

function resetMagnetic(element: HTMLElement | null) {
  if (!element) return;
  element.style.removeProperty('--magnet-x');
  element.style.removeProperty('--magnet-y');
  delete element.dataset.magneticActive;
}

function resetCard(element: HTMLElement | null) {
  if (!element) return;
  element.style.removeProperty('--tilt-x');
  element.style.removeProperty('--tilt-y');
  element.style.removeProperty('--glow-x');
  element.style.removeProperty('--glow-y');
  delete element.dataset.tiltActive;
}

export function MicroInteractions() {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = finePointer.matches && !reducedMotion.matches;
    let magneticTarget: HTMLElement | null = null;
    let cardTarget: HTMLElement | null = null;

    const resetAll = () => {
      resetMagnetic(magneticTarget);
      resetCard(cardTarget);
      magneticTarget = null;
      cardTarget = null;
    };

    const syncCapability = () => {
      enabled = finePointer.matches && !reducedMotion.matches;
      if (!enabled) resetAll();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!enabled || !(event.target instanceof Element)) {
        resetAll();
        return;
      }

      const nextMagnetic = event.target.closest<HTMLElement>('.primary-action');
      const eligibleMagnetic = nextMagnetic && !nextMagnetic.closest('.experience-root') ? nextMagnetic : null;
      if (magneticTarget !== eligibleMagnetic) resetMagnetic(magneticTarget);
      magneticTarget = eligibleMagnetic;
      if (magneticTarget) {
        const offset = calculateMagneticOffset(event.clientX, event.clientY, magneticTarget.getBoundingClientRect());
        magneticTarget.style.setProperty('--magnet-x', `${offset.x.toFixed(2)}px`);
        magneticTarget.style.setProperty('--magnet-y', `${offset.y.toFixed(2)}px`);
        magneticTarget.dataset.magneticActive = 'true';
      }

      const nextCard = event.target.closest<HTMLElement>('[data-interactive-card]');
      if (cardTarget !== nextCard) resetCard(cardTarget);
      cardTarget = nextCard;
      if (cardTarget) {
        const tilt = calculateCardTilt(event.clientX, event.clientY, cardTarget.getBoundingClientRect());
        cardTarget.style.setProperty('--tilt-x', `${tilt.rotateX.toFixed(2)}deg`);
        cardTarget.style.setProperty('--tilt-y', `${tilt.rotateY.toFixed(2)}deg`);
        cardTarget.style.setProperty('--glow-x', `${tilt.glowX.toFixed(1)}%`);
        cardTarget.style.setProperty('--glow-y', `${tilt.glowY.toFixed(1)}%`);
        cardTarget.dataset.tiltActive = 'true';
      }
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) resetAll();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') resetAll();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerout', onPointerOut, { passive: true });
    window.addEventListener('blur', resetAll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    finePointer.addEventListener('change', syncCapability);
    reducedMotion.addEventListener('change', syncCapability);

    return () => {
      resetAll();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', resetAll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      finePointer.removeEventListener('change', syncCapability);
      reducedMotion.removeEventListener('change', syncCapability);
    };
  }, []);

  return null;
}
