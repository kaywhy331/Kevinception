'use client';

import { useMemo, useState } from 'react';

const intents = ['Consulting or advisory', 'Product or project leadership', 'Systems and automation', 'AI and agent workflows', 'Creative collaboration', 'Other'];

export function ContactForm() {
  const [intent, setIntent] = useState(intents[0]);
  const [details, setDetails] = useState('');
  const [copied, setCopied] = useState(false);
  const brief = useMemo(() => `Kevinception conversation request\n\nIntent: ${intent}\n\nContext:\n${details || '[Add your context here]'}\n\nDesired outcome:\n[What would a useful result look like?]`, [intent, details]);
  async function copyBrief() {
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return (
    <section className="contact-builder">
      <label>What would you like to discuss?<select value={intent} onChange={(event) => setIntent(event.target.value)}>{intents.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Give Kevin enough context to recognize the real problem.<textarea rows={7} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="What are you trying to build, improve, decide, or untangle?" /></label>
      <div className="contact-preview"><p className="eyebrow">Conversation brief</p><pre>{brief}</pre></div>
      <div className="button-row"><button className="primary-action" type="button" onClick={copyBrief}>{copied ? 'Copied' : 'Copy brief'}</button><a className="secondary-action" href="https://github.com/kaywhy331">Open Kevin’s GitHub</a></div>
      <p className="form-note">A public contact email has not been assumed. Add the preferred address in <code>src/content/data.ts</code> or connect this form to a secure endpoint before launch.</p>
    </section>
  );
}
