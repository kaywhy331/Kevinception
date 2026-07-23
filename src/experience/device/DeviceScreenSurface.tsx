'use client';

import type { ReactNode } from 'react';
import type { YearId } from '@/content/data';
import type { DeviceExperience } from './types';

export function DeviceScreenSurface({ year, device, appOpen, maximized, onOpen, onClose, onMaximize, children }: {
  year: YearId;
  device: DeviceExperience;
  appOpen: boolean;
  maximized: boolean;
  onOpen: () => void;
  onClose: () => void;
  onMaximize: () => void;
  children: ReactNode;
}) {
  const desktopOperatingSystem = year === '2010' || year === '2020';
  return (
    <div className={`device-screen-surface device-screen-surface--${year} ${maximized ? 'is-maximized' : ''}`} data-device-screen-surface data-device-year={year}>
      {year === '2010' && <div className="device-os-bar device-os-bar--windohs"><span>Windohs 7</span><span>Wi-Fi ◒ · Sound ◕ · 8:42 PM</span></div>}
      {year === '2020' && <div className="device-os-bar device-os-bar--kevos"><b>9:41</b><span>KevOS</span><span>●●● ◔</span></div>}
      {desktopOperatingSystem && !appOpen && (
        <div className={`device-home device-home--${year}`}>
          <button type="button" onClick={onOpen} aria-label={`Open ${device.applicationLabel} in ${device.operatingLayer}`}>
            <span aria-hidden="true">K</span><b>{device.applicationLabel}</b><small>Open in {device.operatingLayer}</small>
          </button>
          <p>{year === '2010' ? 'Connected · 4,096 public connections' : 'Creator studio linked · 8 local clips'}</p>
        </div>
      )}
      <div className={`device-app-window ${appOpen || !desktopOperatingSystem ? 'is-open' : 'is-closed'}`} aria-hidden={desktopOperatingSystem && !appOpen}>
        {year === '2010' && (
          <header className="device-window-chrome"><span aria-hidden="true">K</span><b>KevBook — Windohs Browser</b><nav aria-label="KevBook window controls"><button type="button" onClick={onClose} aria-label="Minimize KevBook">—</button><button type="button" onClick={onMaximize} aria-label={maximized ? 'Restore KevBook window' : 'Maximize KevBook within laptop screen'}>□</button><button type="button" onClick={onClose} aria-label="Close KevBook">×</button></nav></header>
        )}
        {children}
      </div>
      {year === '2010' && <footer className="device-taskbar"><button type="button" onClick={onOpen} aria-label="Open Windohs 7 start control">K</button><button type="button" onClick={onOpen} aria-label="Open KevBook from taskbar">KevBook</button></footer>}
      {year === '2020' && <button className="device-home-gesture" type="button" onClick={() => appOpen ? onClose() : onOpen()} aria-label={appOpen ? 'Return to KevOS home screen' : 'Open KevTok'}><span></span></button>}
    </div>
  );
}
