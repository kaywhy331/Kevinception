'use client';

import { useState } from 'react';

export function CopyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus('Email address copied.');
    } catch {
      setStatus('Copy is unavailable here. Select the address to copy it.');
    }
  }

  return (
    <div className="contact-direct__email">
      <a href={`mailto:${email}`}>{email}</a>
      <button type="button" className="secondary-action contact-direct__copy" onClick={copy}>Copy email</button>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
