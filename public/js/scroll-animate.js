/**
 * Scroll Animation Handler
 * Progressively enhances capsule cards to fade in sequentially when scrolled into view.
 */
export function initScrollAnimate() {
  const container = document.querySelector('[data-scroll-stagger]');
  if (!container) {
    return;
  }

  const items = container.querySelectorAll('[data-capsule-item]');
  if (!items.length) {
    return;
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    return;
  }

  items.forEach(item => {
    item.classList.add('capsule-card--animated');
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach(item => {
            item.classList.add('is-visible');
          });
          obs.disconnect();
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  observer.observe(container);
}
