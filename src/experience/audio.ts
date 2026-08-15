type InterfaceToneKind = 'click' | 'transition' | 'discover' | 'power';
export type FutureSoundCue =
  | 'mission-start' | 'task' | 'human-gate' | 'receipt' | 'signal' | 'memory' | 'synthesis' | 'handoff'
  | 'presence' | 'consent' | 'refusal' | 'notice' | 'agency' | 'conjecture';
export type FutureSoundYear = '2030' | '2040';

type ToneNote = {
  frequency: number;
  endFrequency?: number;
  offset?: number;
  duration: number;
  peak?: number;
  type?: OscillatorType;
};

type AtmosphereHandle = { stop: () => void };

const AUDIO_FLOOR = 0.0001;
let context: AudioContext | null = null;
let activeAtmosphere: AtmosphereHandle | null = null;

function getAudioContext(enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return null;
  const audioWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextConstructor = window.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) return null;
  context ??= new AudioContextConstructor();
  if (context.state === 'suspended') void context.resume().catch(() => undefined);
  return context;
}

function scheduleTone(audio: AudioContext, note: ToneNote, destination: AudioNode = audio.destination) {
  const start = audio.currentTime + (note.offset ?? 0);
  const attack = Math.min(0.025, note.duration * 0.22);
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = note.type ?? 'sine';
  oscillator.frequency.setValueAtTime(note.frequency, start);
  if (note.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(note.endFrequency, start + note.duration);
  gain.gain.setValueAtTime(AUDIO_FLOOR, start);
  gain.gain.exponentialRampToValueAtTime(note.peak ?? 0.035, start + attack);
  gain.gain.setValueAtTime(note.peak ?? 0.035, start + Math.max(attack, note.duration * 0.58));
  gain.gain.exponentialRampToValueAtTime(AUDIO_FLOOR, start + note.duration);
  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + note.duration + 0.03);
}

export function playInterfaceTone(kind: InterfaceToneKind, enabled: boolean) {
  const audio = getAudioContext(enabled);
  if (!audio) return;
  const tones: Record<InterfaceToneKind, ToneNote> = {
    click: { frequency: 520, duration: 0.045, peak: 0.05 },
    transition: { frequency: 180, endFrequency: 360, duration: 0.28, peak: 0.045, type: 'sawtooth' },
    discover: { frequency: 720, endFrequency: 1080, duration: 0.36, peak: 0.05 },
    power: { frequency: 110, endFrequency: 220, duration: 0.18, peak: 0.045, type: 'square' }
  };
  scheduleTone(audio, tones[kind]);
}

const futureCueNotes: Record<FutureSoundCue, ToneNote[]> = {
  presence: [
    { frequency: 174.61, endFrequency: 196, duration: .44, peak: .018, type: 'triangle' },
    { frequency: 261.63, endFrequency: 293.66, offset: .07, duration: .38, peak: .012 }
  ],
  consent: [
    { frequency: 220, endFrequency: 329.63, duration: .58, peak: .022, type: 'triangle' },
    { frequency: 329.63, endFrequency: 493.88, offset: .08, duration: .5, peak: .015 },
    { frequency: 659.25, offset: .2, duration: .3, peak: .008 }
  ],
  refusal: [
    { frequency: 146.83, endFrequency: 92.5, duration: .48, peak: .021, type: 'triangle' },
    { frequency: 293.66, endFrequency: 185, offset: .04, duration: .38, peak: .011 }
  ],
  notice: [
    { frequency: 246.94, endFrequency: 261.63, duration: .13, peak: .02, type: 'square' },
    { frequency: 493.88, offset: .035, duration: .1, peak: .009 }
  ],
  agency: [
    { frequency: 82.41, endFrequency: 164.81, duration: .42, peak: .027, type: 'sawtooth' },
    { frequency: 329.63, endFrequency: 415.3, offset: .06, duration: .32, peak: .012, type: 'triangle' }
  ],
  conjecture: [
    { frequency: 233.08, endFrequency: 207.65, duration: .19, peak: .017, type: 'sawtooth' },
    { frequency: 311.13, endFrequency: 277.18, offset: .11, duration: .17, peak: .012, type: 'square' },
    { frequency: 415.3, endFrequency: 369.99, offset: .24, duration: .14, peak: .007, type: 'sawtooth' }
  ],
  'mission-start': [
    { frequency: 146.83, endFrequency: 196, duration: 0.54, peak: 0.026, type: 'triangle' },
    { frequency: 220, endFrequency: 293.66, offset: 0.06, duration: 0.48, peak: 0.021 },
    { frequency: 293.66, endFrequency: 392, offset: 0.13, duration: 0.42, peak: 0.016 }
  ],
  task: [
    { frequency: 392, endFrequency: 523.25, duration: 0.13, peak: 0.025 },
    { frequency: 587.33, endFrequency: 659.25, offset: 0.055, duration: 0.14, peak: 0.015 }
  ],
  'human-gate': [
    { frequency: 110, endFrequency: 82.41, duration: 0.62, peak: 0.03, type: 'triangle' },
    { frequency: 220, duration: 0.46, peak: 0.018 },
    { frequency: 440, endFrequency: 392, offset: 0.08, duration: 0.38, peak: 0.012 }
  ],
  receipt: [
    { frequency: 261.63, endFrequency: 329.63, duration: 0.66, peak: 0.025, type: 'triangle' },
    { frequency: 392, endFrequency: 493.88, offset: 0.06, duration: 0.58, peak: 0.018 },
    { frequency: 659.25, endFrequency: 783.99, offset: 0.14, duration: 0.5, peak: 0.012 }
  ],
  signal: [
    { frequency: 329.63, endFrequency: 392, duration: 0.16, peak: 0.022 },
    { frequency: 493.88, endFrequency: 587.33, offset: 0.045, duration: 0.16, peak: 0.013 }
  ],
  memory: [
    { frequency: 196, endFrequency: 261.63, duration: 0.48, peak: 0.023, type: 'triangle' },
    { frequency: 293.66, endFrequency: 392, offset: 0.07, duration: 0.43, peak: 0.017 },
    { frequency: 440, endFrequency: 523.25, offset: 0.14, duration: 0.36, peak: 0.011 }
  ],
  synthesis: [
    { frequency: 130.81, endFrequency: 196, duration: 1.16, peak: 0.025, type: 'triangle' },
    { frequency: 196, endFrequency: 293.66, offset: 0.08, duration: 1.08, peak: 0.02 },
    { frequency: 261.63, endFrequency: 392, offset: 0.16, duration: 1, peak: 0.017 },
    { frequency: 329.63, endFrequency: 493.88, offset: 0.24, duration: 0.92, peak: 0.014 },
    { frequency: 392, endFrequency: 587.33, offset: 0.32, duration: 0.84, peak: 0.011 },
    { frequency: 523.25, endFrequency: 783.99, offset: 0.4, duration: 0.76, peak: 0.009 }
  ],
  handoff: [
    { frequency: 98, endFrequency: 146.83, duration: 0.64, peak: 0.03, type: 'triangle' },
    { frequency: 196, endFrequency: 293.66, offset: 0.04, duration: 0.6, peak: 0.021 },
    { frequency: 392, endFrequency: 587.33, offset: 0.11, duration: 0.52, peak: 0.014 },
    { frequency: 783.99, endFrequency: 987.77, offset: 0.2, duration: 0.42, peak: 0.009 }
  ]
};

export function playFutureCue(cue: FutureSoundCue, enabled: boolean) {
  const audio = getAudioContext(enabled);
  if (!audio) return;
  const master = audio.createGain();
  const filter = audio.createBiquadFilter();
  master.gain.setValueAtTime(0.82, audio.currentTime);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cue === 'human-gate' ? 1450 : 2800, audio.currentTime);
  master.connect(filter).connect(audio.destination);
  futureCueNotes[cue].forEach((note) => scheduleTone(audio, note, master));
  const end = Math.max(...futureCueNotes[cue].map((note) => (note.offset ?? 0) + note.duration));
  window.setTimeout(() => { master.disconnect(); filter.disconnect(); }, (end + 0.12) * 1000);
}

export function stopFutureAtmosphere() {
  activeAtmosphere?.stop();
  activeAtmosphere = null;
}

export function startFutureAtmosphere(year: FutureSoundYear, enabled: boolean) {
  stopFutureAtmosphere();
  const audio = getAudioContext(enabled);
  if (!audio) return () => undefined;

  const now = audio.currentTime;
  const master = audio.createGain();
  const filter = audio.createBiquadFilter();
  const lfo = audio.createOscillator();
  const lfoDepth = audio.createGain();
  const base = year === '2030' ? 55 : 43.65;
  const voices = [
    { ratio: 1, gain: 0.48, type: 'sine' as OscillatorType },
    { ratio: year === '2030' ? 1.5 : 4 / 3, gain: 0.27, type: 'triangle' as OscillatorType },
    { ratio: year === '2030' ? 2.01 : 2.5, gain: 0.13, type: year === '2030' ? 'sine' as OscillatorType : 'sawtooth' as OscillatorType }
  ].map((voice, index) => {
    const oscillator = audio.createOscillator();
    const voiceGain = audio.createGain();
    oscillator.type = voice.type;
    oscillator.frequency.setValueAtTime(base * voice.ratio, now);
    oscillator.detune.setValueAtTime(index === 2 ? (year === '2030' ? 6 : -7) : 0, now);
    voiceGain.gain.setValueAtTime(voice.gain, now);
    oscillator.connect(voiceGain).connect(filter);
    oscillator.start(now);
    return { oscillator, voiceGain };
  });

  filter.type = 'lowpass';
  filter.Q.setValueAtTime(year === '2030' ? 0.8 : 1.4, now);
  filter.frequency.setValueAtTime(year === '2030' ? 620 : 540, now);
  master.gain.setValueAtTime(AUDIO_FLOOR, now);
  master.gain.exponentialRampToValueAtTime(year === '2030' ? 0.018 : 0.015, now + 0.8);
  filter.connect(master).connect(audio.destination);

  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(year === '2030' ? 0.12 : 0.08, now);
  lfoDepth.gain.setValueAtTime(year === '2030' ? 0.0028 : 0.0022, now);
  lfo.connect(lfoDepth).connect(master.gain);
  lfo.start(now);

  let stopped = false;
  const handle: AtmosphereHandle = {
    stop: () => {
      if (stopped) return;
      stopped = true;
      const stopAt = audio.currentTime;
      master.gain.cancelScheduledValues(stopAt);
      master.gain.setValueAtTime(Math.max(AUDIO_FLOOR, master.gain.value), stopAt);
      master.gain.exponentialRampToValueAtTime(AUDIO_FLOOR, stopAt + 0.22);
      voices.forEach(({ oscillator }) => oscillator.stop(stopAt + 0.25));
      lfo.stop(stopAt + 0.25);
      window.setTimeout(() => {
        voices.forEach(({ oscillator, voiceGain }) => { oscillator.disconnect(); voiceGain.disconnect(); });
        lfo.disconnect();
        lfoDepth.disconnect();
        filter.disconnect();
        master.disconnect();
      }, 320);
    }
  };
  activeAtmosphere = handle;
  return () => {
    if (activeAtmosphere === handle) activeAtmosphere = null;
    handle.stop();
  };
}
