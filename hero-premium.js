/* Background animation only. Quotation and tracking logic stays in app.js. */
(() => {
  'use strict';
  const video = document.getElementById('heroCinemaVideo');
  const button = document.getElementById('heroMotionControl');
  if (!video || !button) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let wantsPlayback = !reducedMotion.matches && !(connection && connection.saveData);
  let inView = true;
  video.muted = true;
  video.defaultMuted = true;
  button.hidden = false;
  const label = () => { button.textContent = video.paused ? 'Play animation' : 'Pause animation'; };
  const sync = () => {
    if (!wantsPlayback || !inView || document.hidden) { video.pause(); label(); return; }
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    const attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(() => { label(); });
  };
  video.addEventListener('playing', () => { video.classList.add('is-ready'); label(); });
  video.addEventListener('pause', label);
  video.addEventListener('error', () => { video.classList.remove('is-ready'); wantsPlayback = false; label(); });
  button.addEventListener('click', () => { wantsPlayback = video.paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  const preferenceChanged = () => { wantsPlayback = !reducedMotion.matches && !(connection && connection.saveData); sync(); };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', preferenceChanged);
  else if (reducedMotion.addListener) reducedMotion.addListener(preferenceChanged);
  if (connection && connection.addEventListener) connection.addEventListener('change', preferenceChanged);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.05 }).observe(video.closest('.hero-cinema'));
  }
  sync();
})();
