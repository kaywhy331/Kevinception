import { ImageResponse } from 'next/og';

export const alt = 'Kevinception — one evolving mind through six defining interfaces';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        background: 'linear-gradient(135deg, #07090e 0%, #11172a 58%, #201737 100%)',
        color: '#f7f8fb',
        display: 'flex',
        fontFamily: 'Arial, sans-serif',
        height: '100%',
        justifyContent: 'space-between',
        padding: '72px 82px',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 780 }}>
        <div style={{ color: '#64e8ff', fontSize: 24, letterSpacing: 8, textTransform: 'uppercase' }}>Kevinception</div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 70, fontWeight: 800, letterSpacing: -4, lineHeight: 1.02 }}>
          <span>One evolving mind.</span>
          <span>Six defining interfaces.</span>
        </div>
        <div style={{ color: '#b7c1d2', fontSize: 28, lineHeight: 1.35 }}>A lifetime of turning curiosity into systems people can use.</div>
      </div>
      <div style={{ alignItems: 'center', border: '2px solid #64e8ff', borderRadius: 999, boxShadow: '0 0 80px rgba(100,232,255,.28)', display: 'flex', fontSize: 112, fontWeight: 900, height: 250, justifyContent: 'center', width: 250 }}>K</div>
    </div>,
    size
  );
}
