(() => {
  const list = document.querySelector('.ts-tabs');
  if (!list) return;
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const activeCue = list.dataset.cueActive || 'Showing issues';
  const idleCue = list.dataset.cueIdle || 'View issues';
  const activate = (tab, focus = false) => {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      item.querySelector('.ts-tabs__cue').textContent = active ? activeCue : idleCue;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activate(tab);
      if (window.innerWidth <= 700) {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        requestAnimationFrame(() => panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }));
      }
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next], true);
    });
  });
})();

(() => {
  const track = document.querySelector('.ts-review-grid');
  if (!track) return;
  const cards = [...track.querySelectorAll('.ts-review-card')];
  const pauseButton = document.querySelector('[data-review-pause]');
  const stacked = window.matchMedia('(max-width: 700px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DELAY = 5500;
  let timer = null;
  let autoDirection = 1;
  let userPaused = reduceMotion.matches;
  let hovering = false;
  let focused = false;

  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const prevButton = document.querySelector('[data-review-prev]');
  const nextButton = document.querySelector('[data-review-next]');
  const syncArrows = () => {
    const current = track.scrollLeft;
    if (prevButton) prevButton.disabled = current <= 3;
    if (nextButton) nextButton.disabled = current >= maxScroll() - 3;
  };
  const go = direction => {
    const offsets = cards.map(card => card.offsetLeft - cards[0].offsetLeft);
    const current = track.scrollLeft;
    const end = maxScroll();
    const target = direction > 0
      ? Math.min(offsets.find(offset => offset > current + 5) ?? end, end)
      : Math.max(offsets.filter(offset => offset < current - 5).pop() ?? 0, 0);
    if (Math.abs(target - current) < 2) return;
    track.scrollTo({ left: target, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  };

  const canRun = () => !userPaused && !hovering && !focused && !document.hidden && !stacked.matches && maxScroll() > 5;
  const schedule = () => {
    clearInterval(timer);
    timer = canRun() ? setInterval(() => {
      if (track.scrollLeft >= maxScroll() - 3) autoDirection = -1;
      else if (track.scrollLeft <= 3) autoDirection = 1;
      go(autoDirection);
    }, DELAY) : null;
  };
  const syncPauseButton = () => {
    if (!pauseButton) return;
    pauseButton.dataset.paused = String(userPaused);
    pauseButton.setAttribute('aria-label', userPaused ? 'Play automatic scrolling' : 'Pause automatic scrolling');
  };

  prevButton?.addEventListener('click', () => { autoDirection = -1; go(-1); schedule(); });
  nextButton?.addEventListener('click', () => { autoDirection = 1; go(1); schedule(); });
  pauseButton?.addEventListener('click', () => { userPaused = !userPaused; syncPauseButton(); schedule(); });
  track.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  track.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  track.addEventListener('focusin', () => { focused = true; schedule(); });
  track.addEventListener('focusout', event => { if (!track.contains(event.relatedTarget)) { focused = false; schedule(); } });
  track.addEventListener('touchstart', () => { userPaused = true; syncPauseButton(); schedule(); }, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  stacked.addEventListener?.('change', schedule);
  track.addEventListener('scroll', syncArrows, { passive: true });
  window.addEventListener('resize', syncArrows);

  track.querySelectorAll('.ts-review-more').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.ts-review-card');
      const expanded = card.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? 'Show less' : 'Read full review';
    });
  });

  syncPauseButton();
  syncArrows();
  schedule();
})();

document.querySelectorAll('[data-ts-form]').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements._gotcha.value) return;
    const status = form.querySelector('.ts-form-status');
    const button = form.querySelector('button[type="submit"]');
    const isReview = form.dataset.tsForm === 'review';
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      status.textContent = isReview
        ? 'Thank you for sharing your experience. Your review has been sent.'
        : 'Thanks for getting in touch. I’ll reply as soon as I can.';
    } catch {
      status.textContent = 'Something went wrong. Please email hello@matthias.com.au instead.';
    } finally {
      button.disabled = false;
    }
  });
});
