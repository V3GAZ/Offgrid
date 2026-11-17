// One escape action per keypress, from the uppermost view back to the landing page.
(() => {
  const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  let fullscreenExit = -Infinity;
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) { fullscreenExit = performance.now(); document.querySelectorAll('video').forEach(v => { if (!v.paused) window.offgridProject.resetPlayer(v); }); }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.repeat || event.isComposing) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (document.fullscreenElement) { const el = document.fullscreenElement; if(el.tagName === 'VIDEO') window.offgridProject.resetPlayer(el); else document.exitFullscreen(); return; }
    if (performance.now() - fullscreenExit < 250) return;
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    if (dialogs.length) { const dialog = dialogs.at(-1); dialog.querySelectorAll('video').forEach(v=>v.pause()); dialog.close(); return; }
    const player = [...document.querySelectorAll('.film:not(.is-preview) video')].at(-1);
    if (player) { window.offgridProject.resetPlayer(player); player.closest('.film').querySelector('.film-start').focus({preventScroll:true}); return; }
    if (document.querySelector('#video-gallery').classList.contains('is-open')) { window.offgridProject.setGallery(false); return; }
    if (document.querySelector('#project-details').classList.contains('is-open')) { window.offgridProject.setProject(false); return; }
    document.querySelector('.wordmark').focus({preventScroll:true}); window.scrollTo({top:0,behavior:motion()});
  }, true);
})();
