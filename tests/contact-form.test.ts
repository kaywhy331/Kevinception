import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from '@/components/ContactForm';
import { CopyEmail } from '@/components/CopyEmail';

afterEach(cleanup);

describe('contact brief actions', () => {
  it('requires only name and message, and announces required fields', () => {
    render(createElement(ContactForm, { email: 'kevinception331@gmail.com' }));
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/^Message/)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/Email for replies/)).not.toHaveAttribute('aria-required');
    expect(screen.getByLabelText(/^Context/)).not.toHaveAttribute('aria-required');
    expect(screen.getByText(/Required: name and message/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Email this brief' }));
    expect(screen.getByRole('status')).toHaveTextContent('Please correct the highlighted fields');
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/^Message/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Email for replies/)).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText(/^Context/)).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('opens the brief with two fields and never claims the email app opened for sure', () => {
    render(createElement(ContactForm, { email: 'kevinception331@gmail.com' }));
    const emailAction = screen.getByRole('link', { name: 'Email this brief' });
    emailAction.addEventListener('click', (event) => event.preventDefault());
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Alex Example' } });
    fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: 'A useful next step' } });
    fireEvent.click(emailAction);
    expect(screen.getByRole('status')).toHaveTextContent('If nothing opened, copy the brief and send it to kevinception331@gmail.com');
  });

  it('keeps the email href in sync and copies the generated brief', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(createElement(ContactForm, { email: 'kevinception331@gmail.com' }));

    const emailAction = screen.getByRole('link', { name: 'Email this brief' });
    expect(emailAction).toHaveAttribute('href', expect.stringContaining('mailto:kevinception331@gmail.com?subject=Consulting%20or%20advisory'));

    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Alex Example' } });
    fireEvent.change(screen.getByLabelText(/Email for replies/), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'AI and agent workflows' } });
    fireEvent.change(screen.getByLabelText(/^Context/), { target: { value: 'A clear project brief' } });
    fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: 'A useful next step' } });
    const href = decodeURIComponent(emailAction.getAttribute('href') ?? '');
    expect(href).toContain('subject=AI and agent workflows&body=Kevinception conversation request');
    expect(href).toContain('Context:\nA clear project brief');
    expect(href).toContain('From: Alex Example');
    expect(href).toContain('Reply email: alex@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Copy brief' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Intent: AI and agent workflows')));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Message:\nA useful next step'));
    expect(screen.getByRole('status')).toHaveTextContent('copied to your clipboard');
  });

  it('offers the plain address with a copy button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(createElement(CopyEmail, { email: 'kevinception331@gmail.com' }));
    expect(screen.getByRole('link', { name: 'kevinception331@gmail.com' })).toHaveAttribute('href', 'mailto:kevinception331@gmail.com');
    fireEvent.click(screen.getByRole('button', { name: 'Copy email' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('kevinception331@gmail.com'));
    expect(screen.getByRole('status')).toHaveTextContent('Email address copied.');
  });
});
