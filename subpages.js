/* subpages.js — shared JS for all sub-pages */
(function () {
  'use strict';

  /* ── Mobile menu ── */
  const burger  = document.getElementById('spBurger');
  const overlay = document.getElementById('spOverlay');
  const closeBtn = document.getElementById('spOverlayClose');

  let menuRevision = 0;

  function openMenu() {
    const revision = ++menuRevision;
    overlay.classList.add('sp-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    /* Double rAF: first gives display:flex a paint tick, second triggers the CSS transition */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (revision !== menuRevision || burger.getAttribute('aria-expanded') !== 'true') return;
        overlay.classList.add('sp-visible');
        const firstLink = overlay.querySelector('a, button');
        if (firstLink) firstLink.focus();
      });
    });
  }

  function closeMenu() {
    const revision = ++menuRevision;
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (noMotion || !overlay.classList.contains('sp-visible')) {
      /* Reduced motion: skip the CSS transition, hide immediately */
      overlay.classList.remove('sp-visible', 'sp-open');
    } else {
      overlay.classList.remove('sp-visible');
      /* Wait for opacity fade before removing display:flex */
      const finishClose = () => {
        if (revision === menuRevision && burger.getAttribute('aria-expanded') === 'false') {
          overlay.classList.remove('sp-open');
        }
      };
      overlay.addEventListener('transitionend', finishClose, { once: true });
      setTimeout(finishClose, 450);
    }
    burger.focus();
  }

  if (burger && overlay) {
    burger.addEventListener('click', () => {
      burger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    /* Close on Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    /* Close on overlay link click */
    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    /* Close when viewport widens past the hamburger breakpoint */
    window.addEventListener('resize', () => {
      if (window.innerWidth > 680 && burger.getAttribute('aria-expanded') === 'true') {
        /* Instant hide — no need for the animation when resizing to desktop */
        ++menuRevision;
        overlay.classList.remove('sp-visible', 'sp-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }, { passive: true });

    /* Focus trap inside overlay */
    overlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        overlay.querySelectorAll('a[href], button:not([disabled])')
      ).filter(el => !el.closest('[hidden]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ── Scroll progress bar ── */
  const bar = document.getElementById('spProgressBar');
  if (bar) {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = Math.min(100, pct) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Scroll-reveal (intersection observer) ── */
  if ('IntersectionObserver' in window) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      document.querySelectorAll('[data-reveal]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        el.style.transition = 'opacity .7s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1)';
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
    }
  }

  /* ── Highlight current-page nav links ── */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sp-links a, .sp-overlay a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0].split('/').pop();
    if (href && href === path) a.setAttribute('aria-current', 'page');
  });

})();
