import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

afterEach(cleanup);

describe('native future experiences', () => {
  it('stages 2030 as a progressive conversation with one boundary lens for the audit', () => {
    const experienceActions = actions();
    render(<ExperienceActionsProvider value={experienceActions}><FutureExperience year="2030" /></ExperienceActionsProvider>);

    expect(screen.getByRole('heading', { name: 'Morning, Together' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Live off/ })).toBeInTheDocument();
    expect(screen.getByText(/I let the alarm fall away/)).toBeInTheDocument();
    expect(screen.getByText(/Seed held · 9 days/)).toBeInTheDocument();
    expect(screen.getByText('ASIA · fare corridor · day 63')).toBeInTheDocument();
    expect(screen.getAllByText(/LOCAL INPUTS · alarm dismissed/).length).toBeGreaterThan(0);
    expect(screen.getByRole('main')).toHaveAttribute('data-beat', 'exchange');

    // The audit never crowds the conversation: it lives behind one boundary lens.
    expect(screen.queryByText('Saito’s standing authority')).not.toBeInTheDocument();
    expect(screen.queryByText(/carried on TokenPak/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Inspect Saito’s boundary/ }));
    expect(screen.getByText('Saito’s standing authority')).toBeInTheDocument();
    expect(screen.getByText('Refundable holds at most; spend is always the dial.')).toBeInTheDocument();
    expect(screen.getByText(/Private incubations—family health, guests—never surface on shared glass/)).toBeInTheDocument();
    expect(screen.getByText(/SAITO-0712-MORNING/)).toBeInTheDocument();
    expect(screen.getByText(/carried on TokenPak · TIP authority · PAK context/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Check authority.*Reversible only/ }));
    expect(screen.getByRole('heading', { name: 'Room comfort may change; communication may not.' })).toBeInTheDocument();
    expect(screen.getByText(/Reading, ranking, replying to, or hiding message content requires Kevin/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close the boundary' }));
    expect(screen.queryByText('Saito’s standing authority')).not.toBeInTheDocument();

    for (let beat = 0; beat < 4; beat += 1) {
      fireEvent.click(screen.getByRole('button', { name: /^(Speak|Continue)/ }));
    }
    expect(screen.getByText(/zero messages read/)).toBeInTheDocument();
    expect(screen.getByText('Training run offered inside the 8:40 dry window')).toBeInTheDocument();
    expect(screen.getByText('Four sealed envelopes—reading them stays behind Kevin’s rule')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('data-beat', 'consent');
    fireEvent.click(screen.getByRole('button', { name: 'Keep it with me' }));
    expect(screen.getByText('Carried—with permission.')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('data-beat', 'settled');
    expect(useExperienceStore.getState().futureJourney.coexistence.keptMoments).toEqual(['morning']);

    fireEvent.click(screen.getByRole('button', { name: /Unfinished draft on the studio table/ }));
    expect(screen.getByRole('heading', { name: 'An idea finds its edge' })).toBeInTheDocument();
    expect(screen.getByText(/changed that paragraph nine times/)).toBeInTheDocument();
    for (let beat = 0; beat < 4; beat += 1) {
      fireEvent.click(screen.getByRole('button', { name: /^(Speak|Continue)/ }));
    }
    expect(screen.getByText(/I disagree with the elegant version/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Let it end here' }));
    expect(screen.getByText('Gone. The room remembers nothing.')).toBeInTheDocument();
    expect(experienceActions.discover).toHaveBeenCalledWith('human-gate', '2030');

    fireEvent.click(screen.getByRole('button', { name: /Dinner table after the plates are cleared/ }));
    expect(screen.getByRole('heading', { name: 'A sentence becomes a year' })).toBeInTheDocument();
    expect(screen.getByText(/Seed held · 63 days/)).toBeInTheDocument();
    expect(screen.queryByText('Seeded eleven weeks ago · This table')).not.toBeInTheDocument();
    for (let beat = 0; beat < 4; beat += 1) {
      fireEvent.click(screen.getByRole('button', { name: /^(Speak|Continue)/ }));
    }
    expect(screen.getByText('Seeded eleven weeks ago · This table')).toBeInTheDocument();
    expect(screen.getByText(/which two weeks of your life this becomes/)).toBeInTheDocument();
    expect(screen.getByText('Passport renewal drafted ahead of the March expiry')).toBeInTheDocument();
    expect(screen.getAllByText('Waits for Kevin').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Keep it with me' }));
    expect(useExperienceStore.getState().futureJourney.coexistence.keptMoments).toEqual(['morning', 'evening']);

    // The lens follows the active moment, so the receipt stays moment-specific.
    fireEvent.click(screen.getByRole('button', { name: /Inspect Saito’s boundary/ }));
    expect(screen.getByText(/carried on TokenPak · TIP authority · PAK context/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close the boundary' }));
    fireEvent.click(screen.getByRole('button', { name: /Ten years pass.*Enter Morning, After/ }));
    expect(experienceActions.enterYear).toHaveBeenCalledWith('2040');
  }, 30_000);

  it('lets holographic Kevin deliberate, refuse invention, expose a frayed source, and ask permission', () => {
    const experienceActions = actions();
    const { container } = render(<ExperienceActionsProvider value={experienceActions}><FutureExperience year="2040" /></ExperienceActionsProvider>);

    expect(screen.getByRole('heading', { name: 'Morning, After' })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/Saito/i);

    // The permission mechanic is legible on arrival: a constellation, not a caption,
    // and an explicit invitation when nothing was witnessed in 2030.
    expect(screen.getByRole('img', { name: '0 of 6 memories permitted' })).toBeInTheDocument();
    expect(screen.getByText(/You allowed nothing—yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go live the morning first' })).toBeInTheDocument();
    expect(container.querySelectorAll('.consciousness-portrait__band')).toHaveLength(6);

    fireEvent.click(screen.getAllByRole('button', { name: /An unfinished sentence/ })[0]);
    expect(screen.getByText(/sentence stops after/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pull the sentence to its source' }));
    expect(screen.getAllByText(/conjecture/)).toHaveLength(2);
    expect(screen.getByText(/thread ends here/)).toBeInTheDocument();

    for (let step = 0; step < 4; step += 1) fireEvent.click(screen.getByRole('button', { name: /Let Kevin/ }));
    expect(screen.getByRole('group', { name: '“May I keep this?”' })).toBeInTheDocument();
    expect(screen.getByText(/Your unfinished thought is not my permission/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'No—let me disappear' }));
    expect(screen.getByText('Then this is the last trace. Goodbye.')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('data-retention', 'released');
    expect(experienceActions.discover).toHaveBeenCalledWith('next-layer-message', '2040');
    expect(screen.getByRole('link', { name: 'What Kevin made' })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: 'Reach the living Kevin' })).toHaveAttribute('href', '/contact');
  });
});
