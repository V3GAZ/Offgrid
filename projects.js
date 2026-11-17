(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const details = document.querySelector('#project-details');
  const discover = document.querySelector('#discover-project');
  const videosCard = document.querySelector('#videos-card');
  const gallery = document.querySelector('#video-gallery');
  const players = [...gallery.querySelectorAll('video')];
  const brochure = document.querySelector('#brochure-dialog');
  let projectTimer;
  let galleryTimer;

  function scrollToElement(element) {
    element.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  }
  function focusAndScroll(element) {
    element.focus({ preventScroll: true });
    scrollToElement(element);
  }
  function setExpanded(region, control, open) {
    control.setAttribute('aria-expanded', String(open));
    if (control === discover) { control.firstElementChild.textContent = open ? 'PROJEKT EINKLAPPEN' : 'PROJEKT ENTDECKEN'; control.lastElementChild.textContent = open ? '↑' : '↓'; }
    region.setAttribute('aria-hidden', String(!open));
    region.inert = !open;
    region.classList.toggle('is-open', open);
  }
  function setGallery(open) {
    clearTimeout(galleryTimer);
    setExpanded(gallery, videosCard, open);
    if (open) {
      players.forEach(video => {
        if (!video.hasAttribute('src')) {
          video.src = video.dataset.src;
          video.preload = 'metadata';
          video.load();
        }
      });
      galleryTimer = setTimeout(() => focusAndScroll(document.querySelector('#gallery-title')), reduced.matches ? 0 : 510);
    } else {
      players.forEach(resetPlayer);
      if (gallery.contains(document.activeElement)) videosCard.focus({ preventScroll: true });
    }
  }
  function setProject(open) {
    clearTimeout(projectTimer);
    setExpanded(details, discover, open);
    if (open) {
      projectTimer = setTimeout(() => focusAndScroll(document.querySelector('#project-title')), reduced.matches ? 0 : 610);
    } else {
      setGallery(false);
      discover.focus({ preventScroll: true });
      scrollToElement(document.querySelector('#aloeglow'));
    }
  }
  discover.addEventListener('click', () => setProject(discover.getAttribute('aria-expanded') !== 'true'));
  document.querySelector('.collapse-project').addEventListener('click', () => setProject(false));
  videosCard.addEventListener('click', () => setGallery(videosCard.getAttribute('aria-expanded') !== 'true'));
  document.querySelector('.gallery-close').addEventListener('click', () => setGallery(false));

  function resetPlayer(video) {
    video.pause();
    if (video.readyState > 0) video.currentTime = 0;
    video.controls = false;
    video.tabIndex = -1;
    const film = video.closest('.film');
    film.classList.add('is-preview');
    film.classList.remove('is-engaged');
    // The poster overlay restores the exact preview without reloading the MP4.
    if (document.fullscreenElement === video) document.exitFullscreen().catch(() => {});
    if (video.webkitDisplayingFullscreen) video.webkitExitFullscreen?.();
  }
  function showPlayer(video) {
    video.closest('.film').classList.remove('is-preview', 'is-engaged');
    video.controls = true;
    video.tabIndex = 0;
  }
  players.forEach(video => {
    resetPlayer(video);
    const film = video.closest('.film');
    const close = document.createElement('button'); close.className = 'video-close'; close.textContent = 'Video schließen ×'; close.addEventListener('click', () => { resetPlayer(video); film.querySelector('.film-start').focus({preventScroll:true}); }); film.querySelector('.film-caption').append(close);
    const start = film.querySelector('.film-start');
    const media = film.querySelector('.film-media');
    media.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && film.classList.contains('is-preview')) film.classList.add('is-engaged');
    });
    media.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse') film.classList.remove('is-engaged');
    });
    start.addEventListener('click', async event => {
      // First touch reveals the play affordance; keyboard activation plays directly.
      if (event.detail !== 0 && matchMedia('(hover: none)').matches && !film.classList.contains('is-engaged')) {
        film.classList.add('is-engaged');
        return;
      }
      showPlayer(video);
      try {
        await video.play();
        video.focus({ preventScroll: true });
      } catch {
        resetPlayer(video);
        const status = film.querySelector('.video-status');
        status.textContent = 'Das Video konnte nicht gestartet werden. Bitte versuche es erneut.';
        status.hidden = false;
      }
    });
    video.addEventListener('play', () => {
      showPlayer(video);
      players.forEach(other => { if (other !== video) other.pause(); });
    });
    video.addEventListener('ended', () => resetPlayer(video));
    video.addEventListener('error', () => {
      const status = video.closest('.film').querySelector('.video-status');
      status.textContent = 'Das Video konnte nicht geladen werden. Bitte versuche es später erneut.';
      status.hidden = false;
    });
  });
  document.querySelectorAll('[data-video]').forEach(button => {
    button.addEventListener('click', async () => {
      const video = document.getElementById(button.dataset.video);
      try {
        showPlayer(video);
        if (video.requestFullscreen) await video.requestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        else throw new Error('fullscreen unavailable');
      } catch {
        const status = video.closest('.film').querySelector('.video-status');
        status.textContent = 'Bitte nutze die Vollbildfunktion in den Videosteuerungen.';
        status.hidden = false;
      }
    });
  });

  document.querySelector('#extras-card').addEventListener('click', () => brochure.showModal());
  brochure.querySelector('.close').addEventListener('click', () => brochure.close());
  brochure.addEventListener('click', event => {
    if (event.target !== brochure) return;
    const bounds = brochure.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) brochure.close();
  });
  brochure.addEventListener('close', () => document.querySelector('#extras-card').focus({ preventScroll: true }));

  window.offgridProject = { setProject, setGallery, resetPlayer };
})();
