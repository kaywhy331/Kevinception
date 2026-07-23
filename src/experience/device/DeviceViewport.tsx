'use client';

import type { YearId } from '@/content/data';

export function DeviceViewport({ year, src, title, active, loaded, onLoad }: {
  year: YearId;
  src: string;
  title: string;
  active: boolean;
  loaded: boolean;
  onLoad: (frame: HTMLIFrameElement) => void;
}) {
  return (
    <>
      {!loaded && active && <div className="interface-loading" role="status"><span></span><p>Waking {title}…</p></div>}
      <iframe
        className={`interface-mode__frame device-viewport__frame ${active ? 'is-active' : 'is-cached'}`}
        src={src}
        title={`${title}, contained inside its physical ${year} device`}
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-downloads allow-top-navigation-by-user-activation"
        loading={active ? 'eager' : 'lazy'}
        tabIndex={active ? 0 : -1}
        aria-hidden={!active}
        onLoad={(event) => onLoad(event.currentTarget)}
      />
    </>
  );
}
