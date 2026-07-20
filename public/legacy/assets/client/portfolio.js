// @ts-nocheck
const signal = document.querySelector('.portfolio-hero__signal');
if (signal && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  signal.addEventListener('pointermove', (event) => {
    const rect = signal.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    signal.style.transform = `translate3d(${x * 7}px,${y * 7}px,0)`;
  });
  signal.addEventListener('pointerleave', () => { signal.style.transform = ''; });
}
