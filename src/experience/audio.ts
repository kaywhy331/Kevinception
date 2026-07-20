let context: AudioContext | null = null;

export function playInterfaceTone(kind: 'click' | 'transition' | 'discover' | 'power', enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;
  context ??= new AudioContext();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequencies = { click: [520, 0.045], transition: [180, 0.28], discover: [720, 0.36], power: [110, 0.18] } as const;
  const [frequency, duration] = frequencies[kind];
  oscillator.type = kind === 'transition' ? 'sawtooth' : kind === 'power' ? 'square' : 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  if (kind === 'transition') oscillator.frequency.exponentialRampToValueAtTime(360, now + duration);
  if (kind === 'discover') oscillator.frequency.exponentialRampToValueAtTime(1080, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
}
