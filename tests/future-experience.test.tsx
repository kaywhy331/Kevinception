import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExperienceActionsProvider } from '@/experience/ExperienceContext';
import { FutureExperience } from '@/experience/future/FutureExperience';
import { createInitialFutureJourney } from '@/experience/future/futureJourney';
import { useExperienceStore } from '@/experience/store';

function actions() {
  return {
    navigateToYear: vi.fn(),
    enterYear: vi.fn(),
    showTimeline: vi.fn(),
    openInterface: vi.fn(),
    closeInterface: vi.fn(),
    showTextMode: vi.fn(),
    closeTextMode: vi.fn(),
    discover: vi.fn()
  };
}

beforeEach(() => {
  window.plausible = undefined;
  useExperienceStore.setState({ futureJourney: createInitialFutureJourney(), sound: false, motion: 'full' });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('native future experiences', () => {
  it('requires mission constraints, reaches the human gate, and transmits a real receipt', async () => {
    vi.useFakeTimers();
    const experienceActions = actions();
    render(<ExperienceActionsProvider value={experienceActions}><FutureExperience year="2030" /></ExperienceActionsProvider>);

    const initialize = screen.getByRole('button', { name: 'Initialize collaboration' });
    expect(initialize).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Fast learning' }));
    fireEvent.click(screen.getByRole('button', { name: 'Low' }));
    expect(initialize).toBeEnabled();
    fireEvent.click(initialize);

    for (let step = 0; step < 6; step += 1) {
      await act(async () => { vi.advanceTimersByTime(800); });
    }

    expect(screen.getByText('REVIEW REQUIRED')).toBeInTheDocument();
    expect(screen.getByText('CONFLICT SURFACED')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Revise and narrow' }));
    expect(screen.getByText(/NX-/)).toBeInTheDocument();
    expect(screen.getByText(/Fast learning · Low/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Transmit memory to 2040' }));
    expect(experienceActions.enterYear).toHaveBeenCalledWith('2040');
  });

  it('fails closed on unsupported thoughts and unlocks the authored ending after three memories', () => {
    const experienceActions = actions();
    render(<ExperienceActionsProvider value={experienceActions}><FutureExperience year="2040" /></ExperienceActionsProvider>);

    fireEvent.change(screen.getByLabelText('Transmit a thought'), { target: { value: 'What is your favorite color?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Interpret signal' }));
    expect(screen.getByText('Evidence boundary')).toBeInTheDocument();
    expect(screen.getByText(/not present in the verified records/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /1990.*Wonder/ }));
    fireEvent.click(screen.getByRole('button', { name: /2010.*Systems/ }));
    fireEvent.click(screen.getByRole('button', { name: /2030.*Orchestration/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Synthesize continuity' }));

    expect(screen.getByRole('dialog', { name: /The interfaces changed/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Kevin’s work' })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: 'Contact Kevin' })).toHaveAttribute('href', '/contact');
  });
});
