import { describe, expect, it } from 'vitest';
import { eraConfigs, getAdjacentYear, getYearFromPath, transitionBetween, yearDistance, YEAR_ORDER } from '@/experience/config';

describe('experience configuration', () => {
  it('has one complete manifest per year', () => {
    expect(Object.keys(eraConfigs)).toEqual(YEAR_ORDER);
    for (const year of YEAR_ORDER) {
      expect(eraConfigs[year].legacyPath).toContain(`/experience/${year}/index.html`);
      expect(eraConfigs[year].stationX).toBeTypeOf('number');
    }
  });
  it('parses routes and adjacent years', () => {
    expect(getYearFromPath('/experience/2020/')).toBe('2020');
    expect(getYearFromPath('/portfolio/')).toBeNull();
    expect(getAdjacentYear('1990', -1)).toBeNull();
    expect(getAdjacentYear('1990', 1)).toBe('2000');
  });
  it('uses authored transitions for adjacent eras and a temporal jump for distant eras', () => {
    expect(transitionBetween('1990', '2000')).toBe('static-modem');
    expect(transitionBetween('2030', '2040')).toBe('agents-to-echo');
    expect(transitionBetween('1990', '2040')).toBe('time-jump');
    expect(yearDistance('1990', '2040')).toBe(5);
  });
});
