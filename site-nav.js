(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const toggle = header.querySelector('.site-header__toggle');
  const panel = header.querySelector('.site-header__panel');
  const close = (restoreFocus = false) => {
    if (panel.hidden) return;
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.site-header__toggle-label').textContent = 'Menu';
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    if (!panel.hidden) { close(); return; }
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('.site-header__toggle-label').textContent = 'Close';
    panel.querySelector('a').focus();
  });
  panel.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(true); });
  document.addEventListener('click', e => { if (!header.contains(e.target)) close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) close(); });
  const path = location.pathname.split('/').pop() || 'index.html';
  header.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href.includes('#') && href === path && href !== 'index.html') link.setAttribute('aria-current', 'page');
  });
})();
