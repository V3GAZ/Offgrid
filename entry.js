(() => {
  const screen = document.querySelector('#entry-screen');
  const button = document.querySelector('#enter-portfolio');
  let leaving = false;
  document.documentElement.classList.add('entry-active');
  screen.showModal();
  // The entry is deliberately transient: no cookie or web-storage state.
  screen.addEventListener('cancel', event => event.preventDefault());
  document.addEventListener('keydown', event => {
    if (screen.open && event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  button.addEventListener('click', () => {
    if (leaving) return;
    leaving = true;
    screen.classList.add('is-leaving');
    const finish = () => {
      screen.close();
      document.documentElement.classList.remove('entry-active');
      window.scrollTo({top:0,behavior:'instant'});
      document.querySelector('.wordmark').focus({preventScroll:true});
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else setTimeout(finish, 650);
  });
})();
