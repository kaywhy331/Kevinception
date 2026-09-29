'use client';

import { useMemo, useState } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

const intents = ['Consulting or advisory', 'Product or project leadership', 'Systems and automation', 'AI and agent workflows', 'Creative collaboration', 'Other'];

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

function RequiredMark() {
  return <span className="field-required" aria-hidden="true">*</span>;
}

export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [intent, setIntent] = useState(intents[0]);
  const [context, setContext] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');
  const brief = useMemo(() => {
    const lines = ['Kevinception conversation request', '', `From: ${name || '[Your name]'}`];
    if (replyEmail.trim()) lines.push(`Reply email: ${replyEmail}`);
    lines.push(`Intent: ${intent}`);
    if (context.trim()) lines.push('', 'Context:', context);
    lines.push('', 'Message:', message || '[What would a useful result look like?]');
    return lines.join('\n');
  }, [context, intent, message, name, replyEmail]);
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(intent)}&body=${encodeURIComponent(brief)}`;

  function validate() {
    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = 'Enter your name.';
    if (replyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail)) nextErrors.email = 'Enter a valid email address, or leave it blank.';
    if (!message.trim()) nextErrors.message = 'Write a line or two about what you need.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function clearError(field: keyof Errors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus('');
  }

  function prepareEmail(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!validate()) {
      event.preventDefault();
      setStatus('Please correct the highlighted fields before opening your email app.');
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setStatus(`Opening your email app with this brief. If nothing opened, copy the brief and send it to ${email}.`);
    trackAnalyticsEvent('brief_email', { intent });
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setStatus(`Brief copied to your clipboard. Paste it into an email to ${email}.`);
    } catch {
      setStatus('Clipboard access is unavailable. Select the preview text to copy it manually.');
    }
  }

  return (
    <section className="contact-builder" aria-labelledby="contact-builder-title">
      <h2 id="contact-builder-title">Or build a short brief</h2>
      <p className="form-note" id="contact-required-note"><RequiredMark /> Required: name and message. Everything else is optional.</p>
      <form noValidate onSubmit={(event) => event.preventDefault()} aria-describedby="contact-required-note">
        <div className="contact-builder__identity">
          <div>
            <label htmlFor="contact-name">Name <RequiredMark /></label>
            <input id="contact-name" name="name" autoComplete="name" required aria-required="true" value={name} onChange={(event) => { setName(event.target.value); clearError('name'); }} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
            {errors.name && <p className="field-error" id="contact-name-error">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="contact-email">Email for replies</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" value={replyEmail} onChange={(event) => { setReplyEmail(event.target.value); clearError('email'); }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
            {errors.email && <p className="field-error" id="contact-email-error">{errors.email}</p>}
          </div>
        </div>
        <label htmlFor="contact-intent">What would you like to discuss?</label>
        <select id="contact-intent" value={intent} onChange={(event) => setIntent(event.target.value)}>{intents.map((item) => <option key={item}>{item}</option>)}</select>
        <label htmlFor="contact-message">Message <RequiredMark /></label>
        <textarea id="contact-message" rows={5} required aria-required="true" value={message} onChange={(event) => { setMessage(event.target.value); clearError('message'); }} placeholder="What would a useful result or response look like?" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
        {errors.message && <p className="field-error" id="contact-message-error">{errors.message}</p>}
        <label htmlFor="contact-context">Context</label>
        <textarea id="contact-context" rows={4} value={context} onChange={(event) => setContext(event.target.value)} placeholder="Optional: what are you trying to build, improve, decide, or untangle?" />
      </form>
      <div className="contact-preview"><p className="eyebrow">Brief preview</p><pre>{brief}</pre></div>
      <div className="button-row"><a className="primary-action" href={mailtoHref} onClick={prepareEmail}>Email this brief</a><button className="secondary-action" type="button" onClick={copyBrief}>Copy brief</button></div>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
      <p className="form-note">Privacy: this site does not submit or store anything you type. “Email this brief” opens your own email app, where you can review everything before sending.</p>
    </section>
  );
}
