'use client';

import type { YearId } from '@/content/data';

const stations = ['Clarifier', 'Researcher', 'Architect', 'Builder', 'Governor'];

export function SpatialHotspotLayer({ year }: { year: YearId }) {
  if (year === '2030') return <ol className="device-spatial-stations" aria-label="Five Nexus specialist stations">{stations.map((station, index) => <li key={station} data-agent-role={station.toLowerCase()}><span>{String(index + 1).padStart(2, '0')}</span><b>{station}</b>{station === 'Governor' && <small>Human gate</small>}</li>)}</ol>;
  if (year === '2040') return <div className="device-provenance-rings" aria-hidden="true"><i></i><i></i><i></i><i></i></div>;
  return null;
}
