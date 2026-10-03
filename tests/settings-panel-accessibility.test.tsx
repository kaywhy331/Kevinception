import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExperienceActionsProvider } from '@/experience/ExperienceContext';
import { ExperienceOverlay } from '@/experience/ExperienceOverlay';
import { useExperienceStore } from '@/experience/store';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }) }));

const groups = [
  {
    legend: 'Visual quality',
    name: 'experience-quality',
    stateKey: 'qualitySetting',
    options: [
      ['auto', 'Auto', 'Matches this device'],
      ['high', 'High', 'Shadows, glow, and live screen previews'],
      ['standard', 'Standard', 'Balanced detail'],
      ['lite', 'Lite', 'Fastest; simplified neighbouring rooms']
    ]
  },
  {
    legend: 'Motion',
    name: 'experience-motion',
    stateKey: 'motionSetting',
    options: [
      ['auto', 'Auto', 'Follows your system setting'],
      ['full', 'Full', 'Camera moves and era transitions'],
      ['reduced', 'Reduced', 'Short fades, no drifting or parallax'],
      ['minimal', 'Minimal', 'Instant changes, no animation']
    ]
  }
] as const;

function renderSettings() {
  const noop = vi.fn();
  render(
    <ExperienceActionsProvider value={{ navigateToYear: noop, enterYear: noop, showTimeline: noop, closeInterface: noop, showTextMode: noop, closeTextMode: noop, discover: noop }}>
      <ExperienceOverlay />
    </ExperienceActionsProvider>
  );
  return within(screen.getByRole('dialog', { name: 'Experience settings' }));
}

beforeEach(() => {
  window.history.replaceState(null, '', '/experience/');
  useExperienceStore.setState({ settingsOpen: true, qualitySetting: 'auto', quality: 'standard', motionSetting: 'auto', motion: 'full', sound: false });
});

afterEach(() => cleanup());

describe('settings panel radio labels', () => {
  for (const group of groups) {
    describe(group.legend, () => {
      it('is a named radio group whose inputs are each named by their visible option text', () => {
        const dialog = renderSettings();
        const fieldset = dialog.getByRole('group', { name: group.legend });
        const radios = within(fieldset).getAllByRole('radio') as HTMLInputElement[];
        expect(radios.map((radio) => radio.value)).toEqual(group.options.map(([value]) => value));
        radios.forEach((radio, index) => {
          const [, label, detail] = group.options[index];
          const wrapper = radio.closest('label');
          // Implicit association: the control is a descendant of exactly one label.
          expect(wrapper).not.toBeNull();
          expect(wrapper?.control).toBe(radio);
          expect(wrapper?.textContent).toContain(label);
          expect(wrapper?.textContent).toContain(detail);
          // Computed accessible name starts with the visible label and keeps the detail.
          expect(within(fieldset).getByRole('radio', { name: new RegExp(`^${label}`) })).toBe(radio);
          expect(radio).toHaveAccessibleName(expect.stringContaining(label));
          expect(radio).toHaveAccessibleName(expect.stringContaining(detail));
        });
      });

      it('selects an option by activating its label and leaves the other group alone', () => {
        const dialog = renderSettings();
        const other = groups.find((candidate) => candidate !== group)!;
        const before = useExperienceStore.getState()[other.stateKey];
        const fieldset = dialog.getByRole('group', { name: group.legend });
        const target = group.options[1];
        const label = within(fieldset).getByText(target[1]).closest('label') as HTMLLabelElement;
        fireEvent.click(label);
        expect(useExperienceStore.getState()[group.stateKey]).toBe(target[0]);
        const radios = within(fieldset).getAllByRole('radio') as HTMLInputElement[];
        expect(radios.filter((radio) => radio.checked).map((radio) => radio.value)).toEqual([target[0]]);
        expect(useExperienceStore.getState()[other.stateKey]).toBe(before);
        const otherChecked = (within(dialog.getByRole('group', { name: other.legend })).getAllByRole('radio') as HTMLInputElement[]).filter((radio) => radio.checked);
        expect(otherChecked.map((radio) => radio.value)).toEqual([before]);
      });

      it('shares one native radio group name so the browser handles arrow-key movement', () => {
        const dialog = renderSettings();
        const radios = within(dialog.getByRole('group', { name: group.legend })).getAllByRole('radio') as HTMLInputElement[];
        expect(new Set(radios.map((radio) => radio.name))).toEqual(new Set([group.name]));
      });
    });
  }

  it('reports the live resolved value in the Auto detail text', () => {
    const dialog = renderSettings();
    const quality = within(dialog.getByRole('group', { name: 'Visual quality' }));
    const motion = within(dialog.getByRole('group', { name: 'Motion' }));
    expect(quality.getByRole('radio', { name: /^Auto.*now standard/ })).toBeChecked();
    expect(motion.getByRole('radio', { name: /^Auto.*now full/ })).toBeChecked();
  });
});
