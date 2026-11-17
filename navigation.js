(() => {
  const header = document.querySelector('.header');
  const home = header.parentElement;
  const hero = document.querySelector('.hero');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let floating = false;
  let frame = 0;

  function measureOffset() {
    if (floating) document.documentElement.style.setProperty('--navigation-offset', `${Math.ceil(header.getBoundingClientRect().height + 22)}px`);
    else document.documentElement.style.removeProperty('--navigation-offset');
  }
  function updateHeader() {
    frame = 0;
    const next = scrollY > 24;
    if (next === floating) return;
    const focus = header.contains(document.activeElement) ? document.activeElement : null;
    floating = next;
    header.classList.add('header-ready');
    header.classList.toggle('is-floating', next);
    // Move the same header out of the hero's containment; no duplicate navigation.
    if (next) document.body.append(header);
    else home.prepend(header);
    focus?.focus({ preventScroll: true });
    measureOffset();
  }
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(updateHeader);
  }, { passive: true });
  new ResizeObserver(measureOffset).observe(header);
  header.querySelector('.wordmark').addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  header.querySelector('.brand-caption').addEventListener('click', event => {
    event.preventDefault();
    const title = document.querySelector('#about-title');
    title.focus({ preventScroll: true });
    title.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  updateHeader();

  const cue = document.querySelector('.scroll-cue');
  const arrow = cue.querySelector('svg');
  const label = cue.querySelector('span');
  let visible = false;
  let timer;
  let animations = [];
  function stopCue() {
    clearTimeout(timer);
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function runCue() {
    if (!visible || document.hidden || reduced.matches || getComputedStyle(cue).display === 'none') return;
    animations.forEach(animation => animation.cancel());
    animations = [
        arrow.animate([
          { transform: 'translateY(0)', offset: 0 },
          { transform: 'translateY(4px)', offset: .13 },
          { transform: 'translateY(0)', offset: .28 },
          { transform: 'translateY(0)', offset: .72 },
          { transform: 'translateY(4px)', offset: .85 },
          { transform: 'translateY(0)', offset: 1 },
        ], { duration: 1400, easing: 'ease-in-out' }),
        label.animate([
          { opacity: 1, offset: 0 }, { opacity: 1, offset: .33 },
          { opacity: .65, offset: .4 }, { opacity: 1, offset: .46 },
          { opacity: .65, offset: .54 }, { opacity: 1, offset: .61 },
          { opacity: 1, offset: 1 },
        ], { duration: 1400 }),
      ];
    timer = setTimeout(runCue, 10000);
  }
  function scheduleCue() {
    stopCue();
    if (visible && !document.hidden && !reduced.matches) timer = setTimeout(runCue, 10000);
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    scheduleCue();
  }, { threshold: 0 }).observe(hero);
  reduced.addEventListener('change', scheduleCue);
  document.addEventListener('visibilitychange', scheduleCue);
})();
