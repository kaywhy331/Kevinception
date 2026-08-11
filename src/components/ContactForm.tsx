'use client';

import { useMemo, useState } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

const intents = ['Consulting or advisory', 'Product or project leadership', 'Systems and automation', 'AI and agent workflows', 'Creative collaboration', 'Other'];

type Errors = Partial<Record<'name' | 'email' | 'context' | 'message', string>>;

export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [intent, setIntent] = useState(intents[0]);
  const [context, setContext] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');
  const brief = useMemo(() => `Kevinception conversation request\n\nFrom: ${name || '[Your name]'}\nReply email: ${replyEmail || '[Your email]'}\nIntent: ${intent}\n\nContext:\n${context || '[What are you trying to build, improve, decide, or untangle?]'}\n\nMessage / desired outcome:\n${message || '[What would a useful result look like?]'}`, [context, intent, message, name, replyEmail]);
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(intent)}&body=${encodeURIComponent(brief)}`;

  function validate() {
    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = 'Enter your name.';
    if (!replyEmail.trim()) nextErrors.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail)) nextErrors.email = 'Enter a valid email address.';
    if (!context.trim()) nextErrors.context = 'Add a little context about the situation.';
    if (!message.trim()) nextErrors.message = 'Describe the outcome or response you need.';
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
    setStatus('Your email app is opening with this brief. You can review it before sending.');
    trackAnalyticsEvent('brief_email', { intent });
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setStatus('Conversation brief copied to your clipboard.');
    } catch {
      setStatus('Clipboard access is unavailable. Select the preview text to copy it manually.');
    }
  }

  return (
    <section className="contact-builder" aria-labelledby="contact-builder-title">
      <h2 id="contact-builder-title">Build a conversation brief</h2>
      <form noValidate onSubmit={(event) => event.preventDefault()}>
        <div className="contact-builder__identity">
          <div>
            <label htmlFor="contact-name">Name <span aria-hidden="true">*</span></label>
            <input id="contact-name" name="name" autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); clearError('name'); }} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
            {errors.name && <p className="field-error" id="contact-name-error">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="contact-email">Email <span aria-hidden="true">*</span></label>
            <input id="contact-email" name="email" type="email" autoComplete="email" value={replyEmail} onChange={(event) => { setReplyEmail(event.target.value); clearError('email'); }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
            {errors.email && <p className="field-error" id="contact-email-error">{errors.email}</p>}
          </div>
        </div>
        <label htmlFor="contact-intent">What would you like to discuss?</label>
        <select id="contact-intent" value={intent} onChange={(event) => setIntent(event.target.value)}>{intents.map((item) => <option key={item}>{item}</option>)}</select>
        <label htmlFor="contact-context">Context <span aria-hidden="true">*</span></label>
        <textarea id="contact-context" rows={5} value={context} onChange={(event) => { setContext(event.target.value); clearError('context'); }} placeholder="What are you trying to build, improve, decide, or untangle?" aria-invalid={Boolean(errors.context)} aria-describedby={errors.context ? 'contact-context-error' : undefined} />
        {errors.context && <p className="field-error" id="contact-context-error">{errors.context}</p>}
        <label htmlFor="contact-message">Message or desired outcome <span aria-hidden="true">*</span></label>
        <textarea id="contact-message" rows={5} value={message} onChange={(event) => { setMessage(event.target.value); clearError('message'); }} placeholder="What would a useful result or response look like?" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
        {errors.message && <p className="field-error" id="contact-message-error">{errors.message}</p>}
      </form>
      <div className="contact-preview"><p className="eyebrow">Conversation brief</p><pre>{brief}</pre></div>
      <div className="button-row"><a className="primary-action" href={mailtoHref} onClick={prepareEmail}>Email this brief</a><button className="secondary-action" type="button" onClick={copyBrief}>Copy brief</button><a className="text-link" href="https://github.com/kaywhy331">Open my GitHub</a></div>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
      <p className="form-note">Privacy: this static site does not submit or store your entries. “Email this brief” opens your own email app, where you can review everything before sending.</p>
      <p className="form-note">Prefer a blank message? Email me directly at <a href={`mailto:${email}`}>{email}</a>.</p>
    </section>
  );
}
