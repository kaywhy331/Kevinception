'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';

const palettes = [
  ['#07130e', '#69ffb0', '#173425'],
  ['#d6cfb8', '#275fa8', '#f5edd5'],
  ['#dfeaff', '#3566b8', '#ffffff'],
  ['#100811', '#ff5c8a', '#5b2cff'],
  ['#031519', '#64e8ff', '#0d5662'],
  ['#080710', '#a88cff', '#64e8ff']
] as const;

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function draw1990(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const unit = Math.min(width, height);
  context.fillStyle = '#07130e';
  context.fillRect(0, 0, width, height);
  context.save();
  context.translate(width * .12, height * .15);
  roundedRect(context, 0, 0, width * .76, height * .66, unit * .055);
  context.fillStyle = '#19241f';
  context.fill();
  roundedRect(context, width * .055, height * .06, width * .57, height * .5, unit * .035);
  context.fillStyle = '#06170f';
  context.fill();
  context.strokeStyle = '#69ffb0';
  context.lineWidth = Math.max(1, unit * .004);
  context.stroke();
  context.fillStyle = '#69ffb0';
  context.font = `700 ${Math.round(unit * .18)}px ui-monospace`;
  context.textAlign = 'center';
  context.fillText('K', width * .34, height * .36 + Math.sin(time * 2) * 3);
  context.globalAlpha = .2;
  for (let y = height * .08; y < height * .55; y += Math.max(4, unit * .012)) context.fillRect(width * .07, y, width * .54, 1);
  context.globalAlpha = 1;
  context.fillStyle = '#d7bf83';
  context.beginPath();
  context.arc(width * .69, height * .18, unit * .035, 0, Math.PI * 2);
  context.arc(width * .69, height * .3, unit * .035, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function draw2000(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = '#d6cfb8';
  context.fillRect(0, 0, width, height);
  const windows = [[.11, .13, .66, .47], [.28, .29, .61, .48], [.08, .52, .45, .3]];
  windows.forEach(([x, y, w, h], index) => {
    roundedRect(context, width * x, height * y, width * w, height * h, 5);
    context.fillStyle = index === 1 ? '#f5edd5' : '#ebe3cb';
    context.fill();
    context.strokeStyle = '#6c6557';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#275fa8';
    context.fillRect(width * x + 3, height * y + 3, width * w - 6, Math.max(20, height * .055));
    context.fillStyle = '#fff';
    context.font = `700 ${Math.max(10, width * .026)}px ui-sans-serif`;
    context.textAlign = 'left';
    context.fillText(index === 1 ? 'Kevin Online' : index === 0 ? 'Buddy List' : 'K-Mail', width * x + 12, height * y + Math.max(17, height * .04));
  });
  context.fillStyle = '#275fa8';
  context.fillRect(0, height * .91, width, height * .09);
}

function draw2010(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = '#dfeaff';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#3566b8';
  context.fillRect(0, 0, width, height * .13);
  context.fillStyle = '#fff';
  roundedRect(context, width * .09, height * .18, width * .28, height * .67, 9);
  context.fill();
  roundedRect(context, width * .41, height * .18, width * .5, height * .28, 9);
  context.fill();
  roundedRect(context, width * .41, height * .5, width * .5, height * .35, 9);
  context.fill();
  context.fillStyle = '#3566b8';
  context.beginPath();
  context.arc(width * .23, height * .34, width * .075, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#aab9d0';
  for (const y of [.27, .33, .59, .66, .73]) context.fillRect(width * .46, height * y, width * (y < .4 ? .34 : .37), 5);
}

function draw2020(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#100811');
  gradient.addColorStop(.55, '#35113d');
  gradient.addColorStop(1, '#08070c');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  roundedRect(context, width * .28, height * .07, width * .44, height * .86, width * .055);
  context.fillStyle = '#07070a';
  context.fill();
  context.strokeStyle = '#ff5c8a';
  context.lineWidth = 3;
  context.stroke();
  roundedRect(context, width * .305, height * .11, width * .37, height * .72, width * .025);
  context.save();
  context.clip();
  const feed = context.createLinearGradient(width * .3, height * .1, width * .68, height * .82);
  feed.addColorStop(0, '#ff5c8a');
  feed.addColorStop(1, '#5b2cff');
  context.fillStyle = feed;
  context.fillRect(width * .3, height * .1, width * .38, height * .74);
  context.fillStyle = 'rgba(255,255,255,.8)';
  context.beginPath();
  context.arc(width * (.49 + Math.sin(time) * .03), height * .42, width * .1, 0, Math.PI * 2);
  context.fill();
  context.restore();
  context.fillStyle = '#fff';
  for (let i = 0; i < 4; i += 1) context.beginPath(), context.arc(width * .64, height * (.28 + i * .09), 4, 0, Math.PI * 2), context.fill();
}

function draw2030(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  context.fillStyle = '#031519';
  context.fillRect(0, 0, width, height);
  const points = [[.18, .25], [.48, .17], [.78, .3], [.28, .62], [.58, .53], [.82, .72], [.46, .82]];
  context.strokeStyle = 'rgba(100,232,255,.38)';
  context.lineWidth = 2;
  points.forEach(([x, y], index) => {
    const next = points[(index + 2) % points.length];
    context.beginPath();
    context.moveTo(width * x, height * y);
    context.lineTo(width * next[0], height * next[1]);
    context.stroke();
  });
  points.forEach(([x, y], index) => {
    const pulse = 1 + Math.sin(time * 2 + index) * .18;
    context.beginPath();
    context.arc(width * x, height * y, width * .035 * pulse, 0, Math.PI * 2);
    context.fillStyle = index === 4 ? '#fff' : '#64e8ff';
    context.shadowColor = '#64e8ff';
    context.shadowBlur = 22;
    context.fill();
  });
  context.shadowBlur = 0;
}

function draw2040(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const gradient = context.createRadialGradient(width * .5, height * .46, 0, width * .5, height * .46, width * .62);
  gradient.addColorStop(0, '#221b42');
  gradient.addColorStop(.46, '#080710');
  gradient.addColorStop(1, '#020207');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.save();
  context.translate(width * .5, height * .48);
  context.rotate(time * .08);
  for (let ring = 0; ring < 4; ring += 1) {
    context.beginPath();
    context.ellipse(0, 0, width * (.13 + ring * .08), height * (.2 + ring * .07), ring * .34, 0, Math.PI * 2);
    context.strokeStyle = ring % 2 ? 'rgba(100,232,255,.45)' : 'rgba(168,140,255,.6)';
    context.lineWidth = 2;
    context.stroke();
  }
  for (let index = 0; index < 28; index += 1) {
    const angle = index * 1.91 + time * .18;
    const radius = width * (.12 + (index % 9) * .035);
    context.fillStyle = index % 2 ? '#a88cff' : '#64e8ff';
    context.fillRect(Math.cos(angle) * radius, Math.sin(angle) * radius * .72, 2.5, 2.5);
  }
  context.restore();
}

function drawEra(context: CanvasRenderingContext2D, width: number, height: number, index: number, time: number) {
  context.clearRect(0, 0, width, height);
  [draw1990, draw2000, draw2010, draw2020, draw2030, draw2040][index](context, width, height, time);
  const wash = context.createLinearGradient(0, 0, 0, height);
  wash.addColorStop(0, 'rgba(255,255,255,.04)');
  wash.addColorStop(.65, 'rgba(0,0,0,0)');
  wash.addColorStop(1, 'rgba(0,0,0,.36)');
  context.fillStyle = wash;
  context.fillRect(0, 0, width, height);
}

export function EraPortalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeYear = YEAR_ORDER[activeIndex];
  const active = eraConfigs[activeYear];

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => setActiveIndex((value) => (value + 1) % YEAR_ORDER.length), 2800);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    let start = performance.now();
    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(1, Math.round(rect.width * ratio));
      const pixelHeight = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawEra(context, rect.width, rect.height, activeIndex, reducedMotion ? 0 : (now - start) / 1000);
      if (!reducedMotion) frame = window.requestAnimationFrame(render);
    };
    const observer = new ResizeObserver(() => render(performance.now()));
    observer.observe(canvas);
    render(start);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [activeIndex, reducedMotion]);

  return (
    <div className="era-portal" role="region" style={{ '--portal-accent': active.accent, '--portal-bg': palettes[activeIndex][0] } as React.CSSProperties} aria-label="Live preview of the six timeline interfaces">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="era-portal__scan" aria-hidden="true"></div>
      <div className="era-portal__hud">
        <p><span>Live signal</span> {activeYear}</p>
        <strong>{active.chapterName}</strong>
        <small>{active.experienceName} · {active.medium}</small>
      </div>
      <div className="era-portal__controls">
        <div role="group" aria-label="Preview an era">
          {YEAR_ORDER.map((year, index) => <button key={year} type="button" className={index === activeIndex ? 'is-active' : ''} onClick={() => setActiveIndex(index)} aria-label={`Preview ${year}: ${eraConfigs[year].chapterName}`} aria-pressed={index === activeIndex}><span>{year}</span></button>)}
        </div>
        <Link href={`/experience/?year=${activeYear}`} data-analytics-event="timeline_enter" data-analytics-source="home_portal" data-analytics-year={activeYear}>Enter {active.experienceName} <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  );
}
