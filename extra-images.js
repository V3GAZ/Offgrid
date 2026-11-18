(() => {
  const dialog = document.querySelector('#extra-image-dialog');
  let opener;
  document.querySelectorAll('.extra-preview').forEach(preview => {
    const image = preview.querySelector('img');
    const button = document.createElement('button');
    const title = preview.closest('.extra-item').querySelector('h3').textContent;
    button.setAttribute('aria-label', title + ' vergrößern');
    button.setAttribute('aria-haspopup', 'dialog');
    preview.append(button); button.append(image);
    button.addEventListener('click', () => {
      opener = button;
      dialog.querySelector('h2').textContent = title;
      const full = dialog.querySelector('img'); full.src = image.src; full.alt = image.alt;
      dialog.showModal();
    });
  });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
  dialog.addEventListener('click', event => {
    const r=dialog.getBoundingClientRect();
    if(event.target===dialog && (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)) dialog.close();
  });
})();
