'use client';

import { useEffect, useRef, useState } from 'react';
import type { YearId } from '@/content/data';
import { eraConfigs } from '../config';
import { deviceExperiences } from './contracts';
import { DeviceInteractionLayer } from './DeviceInteractionLayer';
import { DeviceScreenSurface } from './DeviceScreenSurface';
import { DeviceViewport } from './DeviceViewport';
import { SpatialHotspotLayer } from './SpatialHotspotLayer';

const contextCopy: Record<YearId, { location: string; response: string; detail: string }> = {
  '1990': { location: 'Living room · tube television · cartridge console', response: 'The room warms as the phosphor signal resolves.', detail: 'Remote, channel dial, console controls' },
  '2000': { location: 'Personal desk · CRT · modem · keyboard and mouse', response: 'Monitor light and modem rhythm turn the room into a connected place.', detail: 'Mouse, keyboard, dial-up sign-on' },
  '2010': { location: 'Connected workspace · laptop · Wi-Fi', response: 'Notifications and public activity subtly lift the laptop glow.', detail: 'Trackpad, window controls, public identity' },
  '2020': { location: 'Creator studio · mounted phone · ring light', response: 'Active clips drive the ring light, signal rhythm, and evidence display.', detail: 'Touch, swipe, local drafts and transcripts' },
  '2030': { location: 'Autonomous Systems Lab · orchestration table', response: 'Paths, stations, and approval light follow the finite mission state.', detail: 'Voice or text, spatial inspection, human gate' },
  '2040': { location: 'Continuity Sanctuary · projection plinth', response: 'Memory shards and provenance rings shape the reconstructed figure.', detail: 'Voice or text, finite response, inspectable provenance' }
};

export function DeviceStage({ activeYear, mountedYears, loadedYears, visible, onFrameLoad }: {
  activeYear: YearId;
  mountedYears: YearId[];
  loadedYears: Partial<Record<YearId, boolean>>;
  visible: boolean;
  onFrameLoad: (year: YearId, frame: HTMLIFrameElement) => void;
}) {
  const device = deviceExperiences[activeYear];
  const [appOpen, setAppOpen] = useState<Record<YearId, boolean>>({ '1990': true, '2000': true, '2010': false, '2020': false, '2030': true, '2040': true });
  const [maximized, setMaximized] = useState(false);
  const [frames, setFrames] = useState<Partial<Record<YearId, HTMLIFrameElement>>>({});
  const previousYear = useRef(activeYear);

  useEffect(() => {
    if (previousYear.current !== activeYear) { previousYear.current = activeYear; setMaximized(false); }
  }, [activeYear]);

  const isApplicationOpen = appOpen[activeYear];
  const context = contextCopy[activeYear];
  const referenceEra = activeYear === '1990' || activeYear === '2000';
  return (
    <div className={`device-stage device-stage--${activeYear} ${referenceEra ? 'device-stage--reference' : ''}`} data-device-stage={activeYear} data-environment-visible="true" style={{ '--era-accent': eraConfigs[activeYear].accent } as React.CSSProperties}>
      <div className="device-stage__environment" aria-hidden="true"><i></i><i></i><i></i><span>{device.environmentMode}</span></div>
      <aside className="interface-context device-stage__context" aria-label={`${activeYear} physical context`}>
        <p className="eyebrow">You are standing in front of</p><h2>{device.deviceLabel}</h2><p>{context.location}</p><dl><div><dt>Interaction</dt><dd>{context.detail}</dd></div><div><dt>Environment response</dt><dd>{context.response}</dd></div></dl>
      </aside>
      <div className={`interface-mode__device device-hardware device-hardware--${activeYear}`} data-device-frame-visible="true" data-operating-layer={device.operatingLayer} data-application={device.applicationLabel}>
        <div className="device-hardware__camera" aria-hidden="true"></div>
        <div className="device-hardware__speaker" aria-hidden="true"></div>
        <DeviceScreenSurface year={activeYear} device={device} appOpen={isApplicationOpen} maximized={maximized} onOpen={() => setAppOpen((state) => ({ ...state, [activeYear]: true }))} onClose={() => setAppOpen((state) => ({ ...state, [activeYear]: false }))} onMaximize={() => setMaximized((value) => !value)}>
          {mountedYears.map((year) => {
            const active = visible && year === activeYear && (appOpen[year] || (year !== '2010' && year !== '2020'));
            return <DeviceViewport key={year} year={year} src={eraConfigs[year].legacyPath} title={deviceExperiences[year].applicationLabel} active={active} loaded={Boolean(loadedYears[year])} onLoad={(frame) => { setFrames((current) => current[year] === frame ? current : { ...current, [year]: frame }); onFrameLoad(year, frame); }} />;
          })}
        </DeviceScreenSurface>
        <SpatialHotspotLayer year={activeYear} />
        <div className="device-hardware__body" aria-hidden="true"><span></span><i></i><i></i><b>{activeYear === '2010' ? 'W7' : activeYear === '2020' ? 'K' : activeYear === '2030' ? 'NEXUS' : activeYear === '2040' ? 'ECHO' : 'KEVINCEPTION'}</b></div>
      </div>
      <DeviceInteractionLayer year={activeYear} targetFrame={frames[activeYear] ?? null} />
      <p className="device-stage__hierarchy" aria-label={`Experience hierarchy: ${device.environmentMode}, ${device.deviceLabel}, ${device.operatingLayer}, ${device.applicationLabel}`}><span>{device.environmentMode}</span><i>→</i><span>{device.deviceLabel}</span><i>→</i><span>{device.operatingLayer}</span><i>→</i><b>{device.applicationLabel}</b></p>
    </div>
  );
}
