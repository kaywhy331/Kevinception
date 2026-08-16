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
  it('offers the direct Saito exchange, synchronized audit, consent, and optional provenance in 2030', () => {
    const experienceActions = actions();
    render(<ExperienceActionsProvider value={experienceActions}><FutureTextExperience year="2030" /></ExperienceActionsProvider>);

    expect(screen.getByRole('heading', { name: 'Morning, Together' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /10:36Studio table/ }));
    expect(screen.getByRole('heading', { name: 'An idea finds its edge' })).toBeInTheDocument();
    expect(screen.getByText(/changed that paragraph nine times/)).toBeInTheDocument();
    expect(screen.getByText(/PROJECT-ONLY INPUTS/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Inspect the full observable agent record').closest('summary')!);
    expect(screen.getByRole('heading', { name: 'Inputs, interpretation, authority, action, and retention' })).toBeInTheDocument();
    expect(screen.getByText(/Recommend · do not rewrite/)).toBeInTheDocument();
    expect(screen.getByText(/Saito cannot alter the draft/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /I know. I’m missing the edge/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ask Saito what it sees' }));
    fireEvent.click(screen.getByRole('button', { name: /Put it beside the draft/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Hear Saito’s answer' }));
    expect(screen.getByText(/I disagree with the elegant version/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Let it end here' }));
    expect(screen.getByText('Gone. The room remembers nothing.')).toBeInTheDocument();
    expect(experienceActions.discover).toHaveBeenCalledWith('human-gate', '2030');
    fireEvent.click(screen.getByRole('button', { name: 'Open infrastructure receipt' }));
    expect(screen.getByText(/carried on TokenPak/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ten years pass/ }));
    expect(experienceActions.navigateToYear).toHaveBeenCalledWith('2040');
  });

  it('provides the same behavior loop, conjecture boundary, and final permission in 2040', () => {
    const experienceActions = actions();
    const { container } = render(<ExperienceActionsProvider value={experienceActions}><FutureTextExperience year="2040" /></ExperienceActionsProvider>);

    expect(container).not.toHaveTextContent(/Saito/i);
    fireEvent.click(screen.getByRole('button', { name: /An unfinished sentence/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Pull the sentence to its source' }));
    expect(screen.getByText(/inference frays here/)).toBeInTheDocument();
    for (let step = 0; step < 4; step += 1) fireEvent.click(screen.getByRole('button', { name: 'Continue Kevin’s thought' }));
    expect(screen.getByRole('group', { name: '“May I keep this?”' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Yes—only this encounter' }));
    expect(screen.getByText('Then I will remember that you chose to stay.')).toBeInTheDocument();
    expect(experienceActions.discover).toHaveBeenCalledWith('next-layer-message', '2040');
    expect(screen.getByRole('link', { name: 'What Kevin made' })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: 'Reach the living Kevin' })).toHaveAttribute('href', '/contact');
  });
});
