/* ═══════════════════════════════════════════════
   MATTHIASDEV — Site JS
   ═══════════════════════════════════════════════ */

'use strict';

/* ── Nav scroll behaviour ── */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── Hamburger / mobile menu ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
}

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal-up');
if (revealEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Contact form ── */
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (form && formNote) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    try {
      const data = new FormData(form);
      const response = await fetch('https://formspree.io/f/mdapbdbp', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formNote.className = 'form-note form-note--success';
        formNote.textContent = '✓ Message sent! I\'ll reply within 24 hours.';
        form.reset();
      } else {
        formNote.className = 'form-note form-note--error';
        formNote.textContent = 'Something went wrong. Please try again or email me directly.';
      }
    } catch {
      formNote.className = 'form-note form-note--error';
      formNote.textContent = 'Something went wrong. Please try again or email me directly.';
    }

    btn.disabled = false;
    btn.querySelector('span').textContent = 'Send message';
    setTimeout(() => { formNote.textContent = ''; formNote.className = 'form-note'; }, 6000);
  });
}

/* ── Hero carousel (infinite forward loop) ── */
const carousel = document.getElementById('heroCarousel');
if (carousel) {
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const slides = Array.from(track.children);
  const total = slides.length;
  let current = 0;
  let timer = null;
  let transitioning = false;

  const clone = slides[0].cloneNode(true);
  track.appendChild(clone);

  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle('active', i === current % total));
  }

  function slideTo(index, animate) {
    if (animate === false) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1)';
    }
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
  }

  function next() {
    if (transitioning) return;
    transitioning = true;
    current++;
    slideTo(current, true);
    updateDots();
  }

  track.addEventListener('transitionend', () => {
    if (current >= total) {
      current = 0;
      slideTo(0, false);
      void track.offsetHeight;
    }
    transitioning = false;
  });

  function resetAutoplay() {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      if (transitioning) return;
      current = parseInt(dot.dataset.index, 10);
      slideTo(current, true);
      updateDots();
      resetAutoplay();
    });
  });

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (transitioning) return;
    current = (current - 1 + total) % total;
    slideTo(current, true);
    updateDots();
    resetAutoplay();
  });

  timer = setInterval(next, 5000);
}

/* ── Lightbox ── */
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');

if (lightbox && lightboxImage) {
  document.addEventListener('click', e => {
    const img = e.target.closest('.lightbox-img');
    if (img) {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ── iframe preview scaling ── */
function scaleIframePreviews() {
  document.querySelectorAll('.project-preview iframe, .showcase-frame iframe, .website-preview-frame iframe').forEach(iframe => {
    const wrap = iframe.parentElement;
    if (!wrap) return;
    const scale = wrap.offsetWidth / 1440;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.width = '1440px';
    iframe.style.height = '810px';
  });
}

scaleIframePreviews();
window.addEventListener('resize', scaleIframePreviews, { passive: true });
window.addEventListener('load', scaleIframePreviews);
