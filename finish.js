// Archive is an intentionally client-side access gate; no confidential data.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const passwordDialog = document.querySelector('#archive-password');
  const archive = document.querySelector('#archive-view');
  const form = document.querySelector('#archive-form');
  const input = document.querySelector('#archive-password-input');
  const error = document.querySelector('#password-error');
  const expectedHash = '496c6c141386f33e39b406c5046a11174edda617543e8c5af2ff97c142418ff2';
  let unlocked = false;

  const openArchive = () => archive.showModal();
  archive.addEventListener('close', () => { unlocked = false; document.querySelectorAll('.archive-folder').forEach(e => e.setAttribute('aria-pressed', 'false')); document.querySelector('.archive-access').focus({ preventScroll: true }); });
  document.querySelector('.archive-access').addEventListener('click', () => {
    if (unlocked) { openArchive(); return; }
    form.reset(); error.textContent = ''; input.removeAttribute('aria-invalid');
    passwordDialog.showModal(); input.focus();
  });
  input.addEventListener('input', () => { error.textContent = ''; input.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value));
      const hash = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
      if (!passwordDialog.open) return;
      if (hash !== expectedHash) {
        error.textContent = 'Das Passwort stimmt nicht. Bitte versuche es erneut.';
        input.setAttribute('aria-invalid', 'true'); input.focus(); input.select(); return;
      }
      unlocked = true;

      passwordDialog.close(); form.reset(); openArchive();
    } catch {
      error.textContent = 'Der Zugang konnte nicht geprüft werden. Bitte öffne die Website über HTTPS.';
    } finally { submit.disabled = false; }
  });
  document.querySelectorAll('.archive-folder').forEach(folder => folder.addEventListener('click', () => {
    document.querySelectorAll('.archive-folder').forEach(item => item.setAttribute('aria-pressed', String(item === folder)));
  }));
  document.querySelectorAll('#archive-password, #archive-view, #legal-dialog, #team-dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
  });
  const teamDialog = document.querySelector('#team-dialog');
  const teamLink = document.querySelector('.team-link');
  teamLink.addEventListener('click', () => teamDialog.showModal());
  teamDialog.addEventListener('close', () => teamLink.focus({ preventScroll: true }));
  document.querySelector('[data-contact]').addEventListener('click', () => {
    const title = document.querySelector('#contact-title');
    title.focus({ preventScroll: true }); title.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  });
  const contactDialog = document.querySelector('#contact-dialog');
  const contactTrigger = document.querySelector('#contact-action');
  const copyButton = contactDialog.querySelector('.contact-copy');
  let copyTimer;
  contactTrigger.addEventListener('click', () => contactDialog.showModal());
  contactDialog.querySelector('.close').addEventListener('click', () => contactDialog.close());
  contactDialog.addEventListener('click', event => {
    const r = contactDialog.getBoundingClientRect();
    if (event.target === contactDialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) contactDialog.close();
  });
  contactDialog.addEventListener('close', () => {
    clearTimeout(copyTimer); copyButton.textContent = 'KOPIEREN';
    contactTrigger.focus({ preventScroll: true });
  });
  copyButton.addEventListener('click', async () => {
    clearTimeout(copyTimer);
    const address = contactDialog.querySelector('.contact-address').textContent;
    let copied = false;
    try { await navigator.clipboard.writeText(address); copied = true; } catch {
      const field = document.createElement('textarea');
      field.value = address; field.readOnly = true;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      contactDialog.append(field); field.select();
      try { copied = document.execCommand('copy'); } catch { /* Leave selectable address visible. */ }
      field.remove(); copyButton.focus({ preventScroll: true });
    }
    copyButton.textContent = copied ? 'KOPIERT' : 'NICHT KOPIERT';
    copyTimer = setTimeout(() => { copyButton.textContent = 'KOPIEREN'; }, 1800);
  });
  const legal = document.querySelector('#legal-dialog');
  document.querySelectorAll('[data-legal]').forEach(button => button.addEventListener('click', () => {
    const imprint = button.dataset.legal === 'imprint';
    document.querySelector('#legal-title').textContent = imprint ? 'Impressum' : 'Datenschutz';
    document.querySelector('#legal-copy').textContent = imprint
      ? 'Angaben in Vorbereitung. OFFGRID ist das Portfolio unserer Marketing-Weiterbildungsgruppe. Die verantwortliche Person und die Kontaktangaben werden ergänzt.'
      : 'Datenschutzhinweise in Vorbereitung. Die Angaben zur verantwortlichen Person, zum Hosting und zur Datenverarbeitung werden vor der öffentlichen Veröffentlichung ergänzt.';
    legal.showModal();
  }));
})();
