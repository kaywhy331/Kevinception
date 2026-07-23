'use client';

import { useRef, useState } from 'react';
import type { YearId } from '@/content/data';

type SpeechRecognitionEventLike = Event & { results: ArrayLike<{ 0: { transcript: string } }> };
type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; abort(): void; onresult: ((event: SpeechRecognitionEventLike) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export function DeviceInteractionLayer({ year, targetFrame }: { year: YearId; targetFrame: HTMLIFrameElement | null }) {
  const [listening, setListening] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognition = useRef<Recognition | null>(null);
  if (year !== '2030' && year !== '2040') return null;

  const fieldName = year === '2030' ? 'objective' : 'thought';
  const submitToDevice = (value: string) => {
    const document = targetFrame?.contentDocument;
    const field = document?.querySelector<HTMLTextAreaElement | HTMLInputElement>(`[name="${fieldName}"]`);
    if (!field || !value.trim()) return;
    field.value = value.trim();
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.closest('form')?.requestSubmit();
  };
  const stop = () => { recognition.current?.abort(); recognition.current = null; setListening(false); };
  const listen = () => {
    const SpeechRecognition = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) { setFallbackOpen(true); return; }
    const instance = new SpeechRecognition();
    recognition.current = instance;
    instance.lang = 'en-US'; instance.interimResults = false; instance.continuous = false;
    instance.onresult = (event) => { const value = event.results[0]?.[0]?.transcript ?? ''; setTranscript(value); submitToDevice(value); };
    instance.onerror = () => { setFallbackOpen(true); setListening(false); };
    instance.onend = () => setListening(false);
    setListening(true); instance.start();
  };
  return (
    <aside className={`device-voice-console ${listening ? 'is-listening' : ''}`} aria-label={`${year} optional voice interface`}>
      {year === '2030' && <div className="device-mobile-mission" aria-label="Nexus mission status and roles"><span>Mission phase · Objective</span><b>5 active roles</b><em>Human gate armed</em></div>}
      <button type="button" onClick={listening ? stop : listen} aria-pressed={listening}><span aria-hidden="true">{listening ? '◼' : '◉'}</span>{listening ? 'Cancel listening' : year === '2030' ? 'Brief Nexus by voice' : 'Ask Kevin Echo by voice'}</button>
      <button type="button" onClick={() => setFallbackOpen((open) => !open)} aria-expanded={fallbackOpen}>Use text instead</button>
      {listening && <div className="device-waveform" role="status" aria-live="polite"><i></i><i></i><i></i><i></i><span>Listening… microphone input stays in this browser.</span></div>}
      {transcript && <p className="device-transcript"><span>Heard</span> {transcript}</p>}
      {fallbackOpen && <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const value = String(form.get('device-command') ?? ''); setTranscript(value); submitToDevice(value); }}><label>{year === '2030' ? 'Mission objective' : 'Question for the reconstruction'}<textarea name="device-command" required rows={2} placeholder={year === '2030' ? 'Turn an ambiguous idea into a practical product plan…' : 'What remains human?'} /></label><div><button type="submit">Send to {year === '2030' ? 'Nexus' : 'Echo'}</button><button type="button" onClick={() => setFallbackOpen(false)}>Cancel</button></div></form>}
      <small>Voice is optional. No microphone permission is required to complete this chapter.</small>
    </aside>
  );
}
