import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from '@/components/ContactForm';

afterEach(cleanup);

describe('contact brief actions', () => {
  it('validates required fields with accessible errors', () => {
    render(createElement(ContactForm, { email: 'kevinception331@gmail.com' }));
    const emailAction = screen.getByRole('link', { name: 'Email this brief' });
    fireEvent.click(emailAction);
    expect(screen.getByRole('status')).toHaveTextContent('Please correct the highlighted fields');
    expect(screen.getByLabelText(/Name/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Context/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Message or desired outcome/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps the email href in sync and copies the generated brief', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(createElement(ContactForm, { email: 'kevinception331@gmail.com' }));

    const emailAction = screen.getByRole('link', { name: 'Email this brief' });
    expect(emailAction).toHaveAttribute('href', expect.stringContaining('mailto:kevinception331@gmail.com?subject=Consulting%20or%20advisory'));
    expect(screen.getByRole('link', { name: 'kevinception331@gmail.com' })).toHaveAttribute('href', 'mailto:kevinception331@gmail.com');

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Alex Example' } });
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'AI and agent workflows' } });
    fireEvent.change(screen.getByLabelText(/Context/), { target: { value: 'A clear project brief' } });
    fireEvent.change(screen.getByLabelText(/Message or desired outcome/), { target: { value: 'A useful next step' } });
    expect(decodeURIComponent(emailAction.getAttribute('href') ?? '')).toContain('subject=AI and agent workflows&body=Kevinception conversation request');
    expect(decodeURIComponent(emailAction.getAttribute('href') ?? '')).toContain('Context:\nA clear project brief');
    expect(decodeURIComponent(emailAction.getAttribute('href') ?? '')).toContain('From: Alex Example');

    fireEvent.click(screen.getByRole('button', { name: 'Copy brief' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Intent: AI and agent workflows')));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Context:\nA clear project brief'));
    expect(screen.getByRole('status')).toHaveTextContent('copied to your clipboard');
  });
});
