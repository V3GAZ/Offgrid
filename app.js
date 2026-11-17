const dialog = document.querySelector('dialog');
const portfolio = document.querySelector('.portfolio');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const panels = {
  contact: { title: 'Contact', copy: 'Der Kontaktbereich wird in der nächsten Ausbaustufe ergänzt.' },
};
let previousFocus;
let openingTimer;

// Hero actions keep one entry point; the new sections replace preview placeholders.
function openPanel(name) {
  const destination = name === 'work' ? '#aloeglow-title' : name === 'about' ? '#about-title' : null;
  if (destination) {
    const heading = document.querySelector(destination);
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    return;
  }
  if (dialog.open) return;
  clearTimeout(openingTimer);
  previousFocus = document.activeElement;
  const panel = panels[name] || panels.contact;
  document.querySelector('#panel-title').textContent = panel.title;
  document.querySelector('#panel-copy').textContent = panel.copy;
  openingTimer = setTimeout(() => dialog.showModal(), reducedMotion.matches ? 0 : 180);
}
document.querySelectorAll('[data-panel]').forEach(button => {
  button.addEventListener('click', () => openPanel(button.dataset.panel));
});
dialog.querySelectorAll('.close, .panel-back').forEach(button => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  previousFocus?.focus();
});
// Measure the stationary wrapper, never the transformed image. One spring owns
// the entire transform; pointer events only update its target, not the DOM.
(() => {
  const surface = portfolio.parentElement;
  const current = [0, 0, 0, 0, 1];
  const velocity = [0, 0, 0, 0, 0];
  const target = [0, 0, 0, 0, 1];
  let frame = 0;
  let lastTime = 0;
  let bounds;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const allowed = () => finePointer.matches && !reducedMotion.matches && !document.hidden;

  function tick(time) {
    let remaining = Math.min((time - (lastTime || time - 16)) / 1000, .032);
    lastTime = time;
    // Bounded integration steps keep the spring stable on 30–144 Hz displays.
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 120);
      for (let i = 0; i < current.length; i++) {
        velocity[i] += ((target[i] - current[i]) * 170 - velocity[i] * 21) * dt;
        current[i] += velocity[i] * dt;
      }
      remaining -= dt;
    }
    const resting = current.every((value, i) => Math.abs(value - target[i]) < .0001 && Math.abs(velocity[i]) < .0002);
    if (resting) current.splice(0, 5, ...target);
    portfolio.style.transform = `perspective(1500px) translate3d(${current[0]}px,${current[1]}px,0) rotateX(${current[2]}deg) rotateY(${current[3]}deg) scale(${current[4]})`;
    if (!resting) frame = requestAnimationFrame(tick);
    else {
      frame = 0;
      lastTime = 0;
      portfolio.style.removeProperty('will-change');
      if (target[4] === 1) portfolio.style.removeProperty('transform');
    }
  }
  function animate() {
    if (!frame) {
      portfolio.style.willChange = 'transform';
      frame = requestAnimationFrame(tick);
    }
  }
  function reset(immediate = false) {
    bounds = undefined;
    target.splice(0, 5, 0, 0, 0, 0, 1);
    if (immediate || !allowed()) {
      cancelAnimationFrame(frame);
      frame = lastTime = 0;
      current.splice(0, 5, ...target);
      velocity.fill(0);
      portfolio.style.removeProperty('transform');
      portfolio.style.removeProperty('will-change');
    } else animate();
  }
  surface.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !allowed()) return;
    bounds = surface.getBoundingClientRect();
  });
  surface.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !allowed() || dialog.open) return;
    bounds ||= surface.getBoundingClientRect();
    const x = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    const y = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
    target.splice(0, 5, x * 6, y * 5, -y * .75, x * .85, 1.012);
    animate();
  });
  surface.addEventListener('pointerleave', () => reset());
  surface.addEventListener('pointercancel', () => reset());
  surface.addEventListener('animationend', () => { bounds = undefined; });
  window.addEventListener('resize', () => reset(true), { passive: true });
  window.addEventListener('scroll', () => reset(), { passive: true });
  window.addEventListener('blur', () => reset(true));
  document.addEventListener('visibilitychange', () => reset(true));
  reducedMotion.addEventListener('change', () => reset(true));
  finePointer.addEventListener('change', () => reset(true));
})();
