import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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

const seen = (text: RegExp | string) => expect(screen.getAllByText(text).length).toBeGreaterThan(0);

beforeEach(() => useExperienceStore.setState({ futureJourney: createInitialFutureJourney(), viewMode: 'text' }));
afterEach(cleanup);

describe('future functional text experience', () => {
  it('tells 2030 in the same order and words as the visual path', () => {
    const experienceActions = actions();
    render(<ExperienceActionsProvider value={experienceActions}><FutureTextExperience year="2030" /></ExperienceActionsProvider>);

    expect(screen.getByRole('heading', { name: 'Morning, Together' })).toBeInTheDocument();
    expect(screen.getByText(/2030 · Co-Existence · Imagined/)).toBeInTheDocument();
    expect(screen.getByText(/Saito is the home’s AI companion/)).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'A day with Saito' })).getAllByRole('button')).toHaveLength(6);

    fireEvent.click(screen.getByRole('button', { name: /10:36Studio table/ }));
    expect(screen.getByRole('heading', { name: 'An idea finds its edge' })).toBeInTheDocument();
    seen(/changed that paragraph nine times/);
    expect(screen.getByText(/PROJECT-ONLY INPUTS/)).toBeInTheDocument();
    // The seed is a reveal, not a spoiler.
    expect(screen.queryByText('First said')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('What Saito may do on its own').closest('summary')!);
    expect(screen.getByText('Refundable holds at most; spending is always Kevin’s call.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('What Saito did and didn’t do').closest('summary')!);
    expect(screen.getByText(/Recommend · do not rewrite/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Skip to the question' }));
    expect(screen.getByText('First said')).toBeInTheDocument();
    seen(/I disagree with the elegant version/);
    expect(screen.getByText('Grant pre-application drafted for Friday’s deadline')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Let it end here' }));
    expect(screen.getByText('Gone. The room remembers nothing.')).toBeInTheDocument();
    expect(experienceActions.discover).toHaveBeenCalledWith('human-gate', '2030');
    fireEvent.click(screen.getByRole('button', { name: /Next moment · 13:48 Window desk/ }));
    expect(screen.getByRole('button', { name: /13:48Window desk/ })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Built on TokenPak' }));
    expect(screen.getByRole('link', { name: 'Read the TokenPak case study' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ten years pass/ }));
    expect(experienceActions.navigateToYear).toHaveBeenCalledWith('2040');
  });

  it('provides the same behavior loop, conjecture boundary, and closing payoff in 2040', () => {
    const experienceActions = actions();
    const { container } = render(<ExperienceActionsProvider value={experienceActions}><FutureTextExperience year="2040" /></ExperienceActionsProvider>);

    expect(container).not.toHaveTextContent(/Saito/i);
    expect(container).not.toHaveTextContent(/cyberpunk/i);
    expect(screen.getByText(/You allowed nothing—yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /An unfinished sentence/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Pull the sentence to its source' }));
    expect(screen.getByText(/thread ends here/)).toBeInTheDocument();
    for (const label of ['Let Kevin recall', 'Let Kevin deliberate', 'Let Kevin act', 'Let Kevin continue']) {
      fireEvent.click(screen.getByRole('button', { name: label }));
    }
    expect(screen.getByRole('group', { name: '“May I keep this?”' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Yes—only this encounter' }));
    expect(screen.getByText('“Then I will remember that you chose to stay.”')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The interfaces changed. The pattern did not.' })).toBeInTheDocument();
    expect(experienceActions.discover).toHaveBeenCalledWith('next-layer-message', '2040');
    expect(screen.getByRole('link', { name: 'See what Kevin made' })).toHaveAttribute('href', expect.stringContaining('/work'));
    expect(screen.getByRole('link', { name: 'Reach the living Kevin' })).toHaveAttribute('href', expect.stringContaining('/contact'));
    fireEvent.click(screen.getByRole('button', { name: 'Start again at 1990' }));
    expect(experienceActions.navigateToYear).toHaveBeenCalledWith('1990');
  });
});
