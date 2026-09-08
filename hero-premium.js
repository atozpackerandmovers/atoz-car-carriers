/* Motion remains visible when mobile video playback is unavailable. */
(() => {
  'use strict';
  const video = document.getElementById('heroCinemaVideo');
  const button = document.getElementById('heroMotionControl');
  if (!video || !button) return;
  const hero = video.closest('.hero-cinema');
  const media = video.closest('.hero-cinema-media');
  const poster = media.querySelector('.hero-cinema-poster');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let userChoice = null;
  let inView = true;
  let playPending = false;
  let videoUnavailable = false;
  let fallbackOnly = false;
  let attemptId = 0;
  let posterReady = false;
  const wantsMotion = () => userChoice === null ? !reducedMotion.matches : userChoice;
  const shouldMove = () => wantsMotion() && inView && !document.hidden;
  const useVideo = () => posterReady && !videoUnavailable && !fallbackOnly && !(connection && connection.saveData);
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.autoplay = false; // Set only after preferences and visibility are checked.
  button.hidden = false;

  const updateControl = () => {
    const moving = shouldMove();
    hero.classList.toggle('is-motion-running', moving);
    button.textContent = moving ? 'Pause animation' : 'Play animation';
  };

  const sync = () => {
    updateControl();
    if (!shouldMove() || !useVideo()) {
      attemptId += 1;
      playPending = false;
      video.autoplay = false;
      if (shouldMove()) video.classList.remove('is-ready');
      video.pause();
      return;
    }
    video.autoplay = true;
    if (!video.getAttribute('src')) {
      video.preload = 'auto';
      video.src = video.dataset.src;
    }
    if (playPending || !video.paused) return;
    const currentAttempt = ++attemptId;
    playPending = true;
    try {
      const attempt = video.play();
      if (attempt && attempt.then) {
        attempt.then(() => {
          if (currentAttempt !== attemptId) return;
          playPending = false;
          if (!shouldMove()) video.pause();
        }).catch(() => {
          if (currentAttempt !== attemptId) return;
          playPending = false;
          fallbackOnly = true;
          video.autoplay = false;
          video.classList.remove('is-ready');
          updateControl(); // CSS motion continues with the existing poster.
        });
      } else playPending = false;
    } catch (_) {
      playPending = false;
      fallbackOnly = true;
      video.classList.remove('is-ready');
      updateControl();
    }
  };

  video.addEventListener('playing', () => {
    if (!shouldMove() || !useVideo()) { video.pause(); return; }
    // Keep the poster visible until a decoded video frame can replace it.
    const revealFrame = () => {
      if (shouldMove() && useVideo() && !video.paused) video.classList.add('is-ready');
    };
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(revealFrame);
    else requestAnimationFrame(revealFrame);
    updateControl();
  });
  video.addEventListener('error', () => {
    videoUnavailable = true;
    video.classList.remove('is-ready');
    sync();
  });
  button.addEventListener('click', () => {
    userChoice = !wantsMotion();
    if (userChoice) fallbackOnly = false;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', sync);
  else if (reducedMotion.addListener) reducedMotion.addListener(sync);
  if (connection && connection.addEventListener) connection.addEventListener('change', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.01 }).observe(media);
  }
  // Give the high-priority poster a paint before downloading the decorative video.
  const revealVideo = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    posterReady = true;
    sync();
  }));
  if (!poster || poster.complete) revealVideo();
  else {
    poster.addEventListener('load', revealVideo, { once: true });
    poster.addEventListener('error', revealVideo, { once: true });
  }
  sync();
})();
