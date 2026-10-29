/**
 * Hero Video Intro & FLIP Docking Transition
 * Orchestrates fullscreen video entrance and smooth transition into the hero area.
 */
export function initHeroIntro() {
  const heroSection = document.querySelector('[data-hero-section]');
  const container = document.querySelector('[data-hero-video-container]');
  const video = document.querySelector('[data-hero-video]');
  const skipBtn = document.querySelector('[data-hero-skip]');
  const contentBox = document.querySelector('[data-hero-content]');

  if (!heroSection || !container || !video) {
    return;
  }

  // Ensure video begins playing immediately
  video.play().catch(() => {
    // Autoplay might be deferred until user interaction on strict browsers
  });

  // Skip animation if user prefers reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.classList.add('is-docked');
    if (contentBox) {
      contentBox.classList.add('is-visible');
    }
    return;
  }

  // Check if user already experienced the intro during this browser session
  const introSeen = sessionStorage.getItem('glitchattire_hero_intro_seen');
  if (introSeen) {
    container.classList.add('is-docked');
    if (contentBox) {
      contentBox.classList.add('is-visible');
    }
    return;
  }

  // Mark session so repeat navigations don't force a delay
  sessionStorage.setItem('glitchattire_hero_intro_seen', 'true');

  // Activate fullscreen intro state
  heroSection.classList.add('hero--intro-active');
  container.classList.add('is-fullscreen');

  let transitioned = false;

  function dockVideo() {
    if (transitioned) {
      return;
    }
    transitioned = true;

    // Remove window event listeners
    window.removeEventListener('scroll', onScrollOrKey);
    window.removeEventListener('keydown', onScrollOrKey);
    window.removeEventListener('wheel', onScrollOrKey);
    window.removeEventListener('touchmove', onScrollOrKey);

    // Fade out the skip button
    if (skipBtn) {
      skipBtn.style.opacity = '0';
      skipBtn.style.pointerEvents = 'none';
    }

    // Measure target hero section boundaries for FLIP transition
    const heroRect = heroSection.getBoundingClientRect();

    // Smoothly animate from fullscreen coordinates to hero boundaries
    container.style.transition =
      'top 1.1s cubic-bezier(0.16, 1, 0.3, 1), left 1.1s cubic-bezier(0.16, 1, 0.3, 1), width 1.1s cubic-bezier(0.16, 1, 0.3, 1), height 1.1s cubic-bezier(0.16, 1, 0.3, 1)';
    container.style.top = `${heroRect.top}px`;
    container.style.left = `${heroRect.left}px`;
    container.style.width = `${heroRect.width}px`;
    container.style.height = `${heroRect.height}px`;

    // Reveal hero content
    heroSection.classList.remove('hero--intro-active');
    if (contentBox) {
      contentBox.classList.add('is-visible');
    }

    // Once transition completes, dock permanently into standard layout flow
    const onTransitionEnd = () => {
      container.removeEventListener('transitionend', onTransitionEnd);
      container.classList.remove('is-fullscreen');
      container.classList.add('is-docked');
      container.style.top = '';
      container.style.left = '';
      container.style.width = '';
      container.style.height = '';
      container.style.transition = '';
    };

    container.addEventListener('transitionend', onTransitionEnd);
    // Safety fallback in case transitionend event doesn't fire
    setTimeout(onTransitionEnd, 1200);
  }

  function onScrollOrKey(e) {
    if (e.type === 'keydown' && e.key !== 'Escape' && e.key !== 'ArrowDown' && e.key !== ' ') {
      return;
    }
    dockVideo();
  }

  // User click on skip button or anywhere on container triggers immediate docking
  if (skipBtn) {
    skipBtn.addEventListener('click', e => {
      e.stopPropagation();
      dockVideo();
    });
  }

  container.addEventListener('click', () => {
    if (container.classList.contains('is-fullscreen')) {
      dockVideo();
    }
  });

  // Listen for scroll, touch or keydown
  window.addEventListener('scroll', onScrollOrKey, { passive: true });
  window.addEventListener('wheel', onScrollOrKey, { passive: true });
  window.addEventListener('touchmove', onScrollOrKey, { passive: true });
  window.addEventListener('keydown', onScrollOrKey);

  // Auto transition after 2.5 seconds
  setTimeout(dockVideo, 2500);
}
