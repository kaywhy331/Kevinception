import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExperienceActionsProvider } from '@/experience/ExperienceContext';
import { FutureTextExperience } from '@/experience/future/FutureTextExperience';
import { createInitialFutureJourney } from '@/experience/future/futureJourney';
import { useExperienceStore } from '@/experience/store';

function actions() {
  return {
    navigateToYear: vi.fn(), enterYear: vi.fn(), showTimeline: vi.fn(), openInterface: vi.fn(), closeInterface: vi.fn(),
    showTextMode: vi.fn(), closeTextMode: vi.fn(), discover: vi.fn()
  };
}

beforeEach(() => useExperienceStore.setState({ futureJourney: createInitialFutureJourney(), viewMode: 'text' }));
afterEach(cleanup);

describe('future functional text experience', () => {
  it('runs the governed 2030 mission through its explicit human decision and receipt', () => {
    const experienceActions = actions();
    render(<ExperienceActionsProvider value={experienceActions}><FutureTextExperience year="2030" /></ExperienceActionsProvider>);

    const initialize = screen.getByRole('button', { name: 'Initialize collaboration' });
    expect(initialize).toBeDisabled();
    fireEvent.change(screen.getByLabelText('What matters first?'), { target: { value: 'Fast learning' } });
    fireEvent.change(screen.getByLabelText('Acceptable risk'), { target: { value: 'Low' } });
    fireEvent.click(initialize);
    for (let step = 0; step < 4; step += 1) fireEvent.click(screen.getByRole('button', { name: 'Run next collaboration step' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send to human decision gate' }));

    expect(screen.getByText(/Human decision gate · Review required/i)).toBeInTheDocument();
    expect(experienceActions.discover).toHaveBeenCalledWith('human-gate', '2030');
    fireEvent.click(screen.getByRole('button', { name: 'Revise and narrow' }));
    expect(screen.getByRole('heading', { name: /^NX-/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with this receipt in 2040' }));
    expect(experienceActions.navigateToYear).toHaveBeenCalledWith('2040');
  });

  it('fails closed, reconstructs three memories, and exposes the same authored finale in 2040', () => {
    const experienceActions = actions();
    render(<ExperienceActionsProvider value={experienceActions}><FutureTextExperience year="2040" /></ExperienceActionsProvider>);

    fireEvent.change(screen.getByLabelText('Transmit a thought'), { target: { value: 'What is your favorite color?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Interpret signal' }));
    expect(screen.getByText('Evidence boundary')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /1990Wonder/ }));
    fireEvent.click(screen.getByRole('button', { name: /2010Systems/ }));
    fireEvent.click(screen.getByRole('button', { name: /2030Orchestration/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Synthesize continuity' }));

    expect(screen.getByRole('heading', { name: 'The interfaces changed. The pattern did not.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Kevin’s work' })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: 'Contact Kevin' })).toHaveAttribute('href', '/contact');
    expect(experienceActions.discover).toHaveBeenCalledWith('next-layer-message', '2040');
  });
});
