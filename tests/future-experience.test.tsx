import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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

function renderYear(year: '2030' | '2040', experienceActions = actions()) {
  const view = render(<ExperienceActionsProvider value={experienceActions}><FutureExperience year={year} /></ExperienceActionsProvider>);
  return { ...view, experienceActions };
}

const wing2030 = () => screen.getByRole('region', { name: 'Morning, Together' });
const wing2040 = () => screen.getByRole('region', { name: 'Morning, After' });
const advance = () => fireEvent.click(screen.getByRole('button', { name: /^(Speak|Continue|Next)/ }));
/** Spoken lines also reach a polite status region, so they can appear twice. */
const seen = (text: RegExp | string) => expect(screen.getAllByText(text).length).toBeGreaterThan(0);

beforeEach(() => {
  window.plausible = undefined;
  useExperienceStore.setState({ futureJourney: createInitialFutureJourney(), sound: false, motion: 'full' });
});

afterEach(cleanup);

describe('2030 · Morning, Together', () => {
  it('frames the chapter as imagined and introduces Saito in one line', () => {
    renderYear('2030');
    expect(screen.getByRole('heading', { level: 1, name: 'Morning, Together' })).toBeInTheDocument();
    expect(within(wing2030()).getAllByText('Imagined').length).toBeGreaterThan(0);
    expect(screen.getByText(/Saito is the home’s AI companion\. Chapters 5 and 6 are imagined/)).toBeInTheDocument();
    // The shell owns the page's <main>; the wing is a labelled region inside it.
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('plays one beat at a time: exchange, reveal, the question, then rest', () => {
    const { experienceActions } = renderYear('2030');
    expect(wing2030()).toHaveAttribute('data-beat', 'exchange');
    seen(/I let the alarm fall away/);
    expect(screen.getByText(/Seed held · 9 days/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Saito: Morning. I let the alarm fall away');

    for (let beat = 0; beat < 3; beat += 1) advance();
    expect(wing2030()).toHaveAttribute('data-beat', 'reveal');
    expect(screen.getByText('Training run offered inside the 8:40 dry window')).toBeInTheDocument();
    expect(screen.getByText(/First said nine days ago/)).toBeInTheDocument();

    advance();
    expect(wing2030()).toHaveAttribute('data-beat', 'consent');
    seen(/zero messages read/);
    expect(screen.queryByRole('button', { name: 'Skip to the question' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep it with me' }));
    expect(screen.getByText('Carried—with permission.')).toBeInTheDocument();
    expect(wing2030()).toHaveAttribute('data-beat', 'settled');
    expect(experienceActions.discover).toHaveBeenCalledWith('human-gate', '2030');
    expect(useExperienceStore.getState().futureJourney.coexistence.keptMoments).toEqual(['morning']);
  });

  it('lets the visitor skip to the question and walk to the next open moment', () => {
    const { experienceActions } = renderYear('2030');
    fireEvent.click(screen.getByRole('button', { name: 'Skip to the question' }));
    expect(wing2030()).toHaveAttribute('data-beat', 'consent');
    expect(screen.getByText('Four sealed envelopes—reading them stays behind Kevin’s rule')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Let it end here' }));
    expect(screen.getByText('Gone. The room remembers nothing.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next moment · 10:36 Studio table/ }));
    expect(screen.getByRole('heading', { name: 'An idea finds its edge' })).toBeInTheDocument();
    expect(wing2030()).toHaveAttribute('data-beat', 'exchange');
    fireEvent.click(screen.getByRole('button', { name: 'Skip to the question' }));
    seen(/I disagree with the elegant version/);
    fireEvent.click(screen.getByRole('button', { name: 'Keep it with me' }));

    // The dinner-table anchor holds its seed back until Saito reveals it.
    fireEvent.click(within(screen.getByRole('navigation', { name: 'A day with Saito' })).getByRole('button', { name: /20:15/ }));
    expect(screen.getByRole('heading', { name: 'A sentence becomes a year' })).toBeInTheDocument();
    expect(screen.getByText(/Seed held · 63 days/)).toBeInTheDocument();
    expect(wing2030().querySelector('[data-future-part="seed"]')).not.toHaveTextContent(/Asia/);

    fireEvent.click(screen.getByRole('button', { name: /Ten years pass.*Enter Morning, After/ }));
    expect(experienceActions.enterYear).toHaveBeenCalledWith('2040');
  });

  it('restarts the conversation whenever the moment changes from outside (e.g. the 3D room)', () => {
    renderYear('2030');
    fireEvent.click(screen.getByRole('button', { name: 'Skip to the question' }));
    expect(wing2030()).toHaveAttribute('data-beat', 'consent');
    act(() => useExperienceStore.getState().selectCoexistenceMoment('work'));
    expect(wing2030()).toHaveAttribute('data-beat', 'exchange');
  });

  it('keeps room objects as pointer shortcuts and the dayline as the keyboard control', () => {
    renderYear('2030');
    expect(screen.getByRole('button', { name: /Warm mug on the kitchen table/ })).toHaveAttribute('tabindex', '-1');
    const daylineButtons = within(screen.getByRole('navigation', { name: 'A day with Saito' })).getAllByRole('button');
    expect(daylineButtons).toHaveLength(6);
    expect(daylineButtons.every((button) => !button.hasAttribute('tabindex'))).toBe(true);
  });

  it('offers auto-play beside Continue, with fixed labels and aria-pressed state', () => {
    renderYear('2030');
    const autoplay = screen.getByRole('button', { name: /Auto-play/ });
    expect(autoplay).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(autoplay);
    expect(screen.getByRole('button', { name: /Auto-play/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Next/ })).toBeInTheDocument();
    const sound = screen.getByRole('button', { name: /Sound/ });
    expect(sound).toHaveAttribute('aria-pressed', 'false');
    expect(sound.textContent?.trim()).toMatch(/Sound$/);
  });

  it('opens the boundary lens as a modal dialog whose Escape never reaches the shell', () => {
    renderYear('2030');
    // Mimic the shell: a window bubble listener that exits the interface on Escape
    // unless something already handled it.
    const closeInterface = vi.fn();
    const shellKeyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) closeInterface();
    };
    window.addEventListener('keydown', shellKeyHandler);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /What Saito did/ });
    fireEvent.click(toggle);
    const lens = screen.getByRole('dialog', { name: 'What Saito did and didn’t do' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toBe(within(lens).getByRole('heading', { name: 'What Saito did and didn’t do' }));
    expect(within(lens).getByText('What Saito may do on its own')).toBeInTheDocument();
    expect(within(lens).getByText('Refundable holds at most; spending is always Kevin’s call.')).toBeInTheDocument();
    expect(within(lens).getByRole('link', { name: 'Read the TokenPak case study' })).toHaveAttribute('href', expect.stringContaining('/work/tokenpak'));
    expect(lens).not.toHaveTextContent(/TIP|PAK context/);
    fireEvent.click(within(lens).getByRole('button', { name: /Check authority.*Reversible only/ }));
    expect(within(lens).getByRole('heading', { name: 'Room comfort may change; communication may not.' })).toBeInTheDocument();

    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    act(() => { lens.dispatchEvent(escape); });
    expect(escape.defaultPrevented).toBe(true);
    expect(closeInterface).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /What Saito did/ }));
    window.removeEventListener('keydown', shellKeyHandler);
  });

  it('carries the in-app reduced-motion setting onto the wing', () => {
    useExperienceStore.setState({ motion: 'reduced' });
    renderYear('2030');
    expect(wing2030()).toHaveAttribute('data-motion', 'reduced');
    cleanup();
    renderYear('2040');
    expect(wing2040()).toHaveAttribute('data-motion', 'reduced');
  });
});

describe('2040 · Morning, After', () => {
  it('asks the visitor to live the morning first when nothing was witnessed', () => {
    const { container } = renderYear('2040');
    expect(screen.getByRole('heading', { level: 1, name: 'Morning, After' })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/Saito/i);
    expect(screen.getByRole('img', { name: '0 of 6 memories permitted' })).toBeInTheDocument();
    expect(screen.getByText(/You allowed nothing—yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go live the morning first' })).toBeInTheDocument();
    expect(container.querySelectorAll('.consciousness-portrait__band')).toHaveLength(6);
    // The portrait is decoration, not a second control for the same action.
    expect(screen.queryByRole('button', { name: /Kevin hologram/ })).not.toBeInTheDocument();
  });

  it('makes blanks feel earned once 2030 has been lived', () => {
    useExperienceStore.getState().resolveCompanionConsent('kept');
    renderYear('2040');
    expect(screen.getByText('You kept 1 of 6 moments; this is all he has.')).toBeInTheDocument();
    expect(screen.queryByText(/You allowed nothing/)).not.toBeInTheDocument();
  });

  it('lets Kevin deliberate, refuse invention, expose a frayed source, and ask permission', () => {
    const { experienceActions } = renderYear('2040');
    fireEvent.click(screen.getByRole('button', { name: /conjecture.*An unfinished sentence/ }));
    seen(/sentence stops after/);
    fireEvent.click(screen.getByRole('button', { name: 'Pull the sentence to its source' }));
    expect(screen.getByText(/thread ends here/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Turn on sound to hear Kevin' })).toBeEnabled();

    for (const label of ['Let Kevin recall', 'Let Kevin deliberate', 'Let Kevin act', 'Let Kevin continue']) {
      fireEvent.click(screen.getByRole('button', { name: label }));
    }
    expect(experienceActions.discover).toHaveBeenCalledWith('next-layer-message', '2040');
    expect(screen.getByRole('group', { name: '“May I keep this?”' })).toBeInTheDocument();
    seen(/Your unfinished thought is not my permission/);
  });

  it('treats “let me disappear” as final and closes on the six-era payoff', () => {
    const { experienceActions } = renderYear('2040');
    for (let step = 0; step < 4; step += 1) fireEvent.click(screen.getByRole('button', { name: /^Let Kevin/ }));
    fireEvent.click(screen.getByRole('button', { name: 'No—let me disappear' }));

    expect(wing2040()).toHaveAttribute('data-retention', 'released');
    expect(screen.getByText('“Then this is the last trace. Goodbye.”')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The interfaces changed. The pattern did not.' })).toBeInTheDocument();
    const eras = screen.getByRole('list', { name: 'The six chapters' });
    expect(within(eras).getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByText(/You found \d of 5 artifacts along the way/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See what Kevin made' })).toHaveAttribute('href', expect.stringContaining('/work'));
    expect(screen.getByRole('link', { name: 'Reach the living Kevin' })).toHaveAttribute('href', expect.stringContaining('/contact'));

    // Nothing can summon him again.
    expect(screen.queryByRole('button', { name: /^Let Kevin/ })).not.toBeInTheDocument();
    const cues = within(screen.getByRole('navigation', { name: 'Things Kevin can notice' })).getAllByRole('button');
    expect(cues.every((cue) => (cue as HTMLButtonElement).disabled)).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Start again at 1990' }));
    expect(experienceActions.navigateToYear).toHaveBeenCalledWith('1990');
    fireEvent.click(screen.getByRole('button', { name: 'Live the morning again' }));
    expect(experienceActions.enterYear).toHaveBeenCalledWith('2030');
    expect(useExperienceStore.getState().futureJourney.consciousness.encounterRetention).toBe('unasked');
  });

  it('keeps him present after “only this encounter”; noticing something else begins again', () => {
    renderYear('2040');
    for (let step = 0; step < 4; step += 1) fireEvent.click(screen.getByRole('button', { name: /^Let Kevin/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes—only this encounter' }));
    expect(screen.getByText('“Then I will remember that you chose to stay.”')).toBeInTheDocument();
    expect(screen.getByText(/Notice something else in the room/)).toBeInTheDocument();
    const cueIndex = screen.getByRole('navigation', { name: 'Things Kevin can notice' });
    fireEvent.click(within(cueIndex).getByRole('button', { name: /Rain on black glass/ }));
    expect(screen.getByRole('heading', { name: 'Rain on black glass' })).toBeInTheDocument();
    expect(wing2040()).toHaveAttribute('data-retention', 'unasked');
  });
});
