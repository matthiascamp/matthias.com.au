
class HomePage {
  props = {};
  setState(next) { Object.assign(this.state, next); if (next.formNote !== undefined) document.getElementById("form-status").textContent = next.formNote; }
  state = { menuOpen: false, w: typeof window !== 'undefined' ? window.innerWidth : 1440, formNote: '' };

  componentDidMount() {
    this._onResize = () => this.setState({ w: window.innerWidth });
    window.addEventListener('resize', this._onResize);
    if (this.props.revealOnScroll !== false) this.setupReveal();
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.setupChrome();
    this.setupTiles();
    this.setupNav();
  }

  // fine grain + top scroll-progress hairline + parallax hero + nav scroll state
  setupChrome() {
    const root = document.querySelector('x-dc') || document.body;

const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:100%;transform:scaleX(0);transform-origin:left;z-index:200;pointer-events:none;background:linear-gradient(90deg,rgba(5,5,5,.25),#050505)';
    root.appendChild(bar);

    const nav = document.querySelector('[data-nav-full]');
    const heroImg = document.querySelector('section img');

    // condensed two-bubble state
    const cond = document.querySelector('[data-nav-condensed]');
    const bubbles = cond ? Array.from(cond.querySelectorAll('[data-bubble]')) : [];
    const mc = cond ? cond.querySelector('[data-mc]') : null;
    const spring = 'cubic-bezier(.34,1.46,.5,1)';
    if (cond) {
      cond.style.transition = 'opacity .28s ease';
      bubbles.forEach((b, i) => {
        b.style.transition = 'transform .62s ' + spring + ' ' + (i * 70) + 'ms, opacity .3s ease';
        b.style.willChange = 'transform';
      });
      if (mc) mc.style.transition = 'transform .68s ' + spring + ' 110ms';
      if (nav) nav.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1), opacity .3s ease';
    }
    this._condensed = false;
    this._phoneCondensed = false;
    const mobNav = document.querySelector('[data-nav-mobile]');
    if (mobNav) {
      mobNav.style.opacity = '0';
      mobNav.style.transform = 'translateY(-14px) scale(0.9)';
      mobNav.style.pointerEvents = 'none';
    }
    const setCondensed = on => {
      if (on === this._condensed || !cond || !nav) return;
      this._condensed = on;
      if (on) {
        nav.style.opacity = '0';
        nav.style.transform = 'translateY(-12px) scale(0.97)';
        nav.style.pointerEvents = 'none';
        cond.style.opacity = '1';
        cond.style.pointerEvents = 'none';
        bubbles.forEach(b => { b.style.transform = 'none'; });
        if (mc) { mc.style.transform = 'scale(1.12)'; setTimeout(() => { mc.style.transform = 'none'; }, 240); }
      } else {
        cond.style.opacity = '0';
        bubbles.forEach(b => { b.style.transform = 'translateY(-16px) scale(0.9)'; });
        nav.style.opacity = '1';
        nav.style.transform = 'none';
        nav.style.pointerEvents = 'auto';
      }
    };

    let raf = null;
    let navScrolled = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        // works whether the page scrolls the window or an ancestor container (standalone bundle)
        const rootEl = document.querySelector('x-dc') || document.body;
        const rect = rootEl.getBoundingClientRect();
        const y = Math.max(0, -rect.top);
        const docH = Math.max(rect.height, rootEl.scrollHeight || 0, document.documentElement.scrollHeight || 0, document.body ? document.body.scrollHeight : 0);
        const max = Math.max(1, docH - window.innerHeight);
        bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
        if (heroImg && !this.reduce && y < window.innerHeight * 1.2) {
          heroImg.style.transform = 'scale(1.08) translate3d(0,' + (y * 0.14).toFixed(1) + 'px,0)';
        }
        const phone = window.innerWidth < 861;
        const past = y > (this._condensed || this._phoneCondensed ? 70 : 130);
        if (!phone) setCondensed(past);
        else if (false && past !== this._phoneCondensed) {
          this._phoneCondensed = past;
          const mob = document.querySelector('[data-nav-mobile]');
          if (nav && mob) {
            nav.style.transition = 'opacity .3s ease, transform .55s ' + spring;
            mob.style.transition = 'opacity .3s ease, transform .6s ' + spring;
            if (past) {
              nav.style.opacity = '0';
              nav.style.transform = 'translateY(-12px) scale(0.96)';
              nav.style.pointerEvents = 'none';
              mob.style.opacity = '1';
              mob.style.transform = 'none';
              mob.style.pointerEvents = 'auto';
            } else {
              mob.style.opacity = '0';
              mob.style.transform = 'translateY(-14px) scale(0.9)';
              mob.style.pointerEvents = 'none';
              nav.style.opacity = '1';
              nav.style.transform = 'none';
              nav.style.pointerEvents = 'auto';
            }
          }
        }
        if (nav && navScrolled !== (y > 40)) {
          const on = y > 40;
          navScrolled = on;
          nav.style.background = on
            ? 'linear-gradient(180deg, rgba(245,243,240,0.92) 0%, rgba(232,230,226,0.82) 100%)'
            : 'linear-gradient(180deg, rgba(245,243,240,0.78) 0%, rgba(232,230,226,0.62) 100%)';
          nav.style.boxShadow = on
            ? '0 0.5px 0 rgba(255,255,255,0.95) inset, 0 -0.5px 0 rgba(5,5,5,0.06) inset, 0 18px 44px -26px rgba(5,5,5,0.5)'
            : '0 0.5px 0 rgba(255,255,255,0.9) inset, 0 -0.5px 0 rgba(5,5,5,0.05) inset, 0 1px 1px rgba(5,5,5,0.03), 0 14px 34px -24px rgba(5,5,5,0.42)';
        }
      });
    };
    this._onScroll = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    if (heroImg && !this.reduce) {
      heroImg.style.transition = 'transform .9s cubic-bezier(.22,.61,.36,1)';
      heroImg.style.transform = 'scale(1.08)';
      heroImg.style.willChange = 'transform';
    }
  }

  // pointer-tracked sheen, slow image zoom, staggered reveal
  setupTiles() {
    Array.from(document.querySelectorAll('img')).forEach(img => {
      const hide = () => { img.style.display = 'none'; };
      if (img.complete && img.naturalWidth === 0) hide();
      img.addEventListener('error', hide);
    });
    const tiles = Array.from(document.querySelectorAll('[data-tile]'));
    tiles.forEach((tile, i) => {
      const cardHref = tile.getAttribute('data-card-href');
      if (cardHref) {
        const openCard = () => { window.location.href = cardHref; };
        tile.addEventListener('click', e => {
          if (e.target.closest('a, button, input, select, textarea, label')) return;
          openCard();
        });
        tile.addEventListener('keydown', e => {
          if (e.target !== tile || (e.key !== 'Enter' && e.key !== ' ')) return;
          e.preventDefault();
          openCard();
        });
      }
      const dark = /background: #050505/.test(tile.getAttribute('style') || '');
      if (getComputedStyle(tile).position === 'static') tile.style.position = 'relative';
      tile.style.transitionDelay = Math.min(i % 3, 2) * 90 + 'ms';

      const img = tile.querySelector('img:not([data-site-preview])');
      if (img) { img.style.transition = 'transform 1.2s cubic-bezier(.22,.61,.36,1)'; }

      // a hairline that draws itself across the top of the photo on hover
      const line = document.createElement('span');
      line.style.cssText = 'position:absolute;left:0;right:0;top:0;height:1px;z-index:6;transform:scaleX(0);transform-origin:left;transition:transform .7s cubic-bezier(.22,.61,.36,1);background:' + (dark ? 'rgba(232,230,226,.5)' : 'rgba(5,5,5,.28)');
      tile.appendChild(line);

      if (this.reduce || window.matchMedia('(hover: none)').matches) return;
      tile.addEventListener('pointerenter', () => {
        line.style.transform = 'scaleX(1)';
        if (img) img.style.transform = 'scale(1.06)';
      });
      tile.addEventListener('pointerleave', () => {
        line.style.transform = 'scaleX(0)';
        if (img) img.style.transform = 'none';
      });
    });
  }

  // sliding indicator behind the nav links
  setupNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('a')).filter(a => {
      const st = a.getAttribute('style') || '';
      return /text-transform: uppercase/.test(st) && !/background: #0b0b0b/.test(st);
    });
    if (!links.length) return;

    nav.style.position = 'relative';
    const pill = document.createElement('span');
    pill.style.cssText = 'position:absolute;top:50%;left:0;height:36px;width:0;border-radius:100px;background:rgba(255,255,255,.72);box-shadow:0 1px 2px rgba(5,5,5,.05);opacity:0;transform:translateY(-50%);transition:opacity .3s ease, width .45s cubic-bezier(.22,.61,.36,1), left .45s cubic-bezier(.22,.61,.36,1);pointer-events:none;z-index:0';
    nav.insertBefore(pill, nav.firstChild);

    links.forEach(a => {
      a.style.position = 'relative';
      a.style.zIndex = '1';
      a.addEventListener('pointerenter', () => {
        const nr = nav.getBoundingClientRect();
        const r = a.getBoundingClientRect();
        pill.style.left = (r.left - nr.left) + 'px';
        pill.style.width = r.width + 'px';
        pill.style.opacity = '1';
      });
    });
    nav.addEventListener('pointerleave', () => { pill.style.opacity = '0'; });
  }

  // headline reveal: each line wipes up from a mask
  setupHeadlines() {
    if (this.reduce) return;
    const heads = Array.from(document.querySelectorAll('h1, h2'));
    heads.forEach(h => {
      const lines = window.innerWidth < 701
        ? [h.innerHTML.replace(/<br[^>]*>/gi, ' ')]
        : h.innerHTML.split(/<br[^>]*>/i);
      h.innerHTML = lines.map(l =>
        '<span style="display:block;overflow:hidden;"><span style="display:block;transform:translateY(105%);transition:transform 1.05s cubic-bezier(.19,1,.22,1);">' + l + '</span></span>'
      ).join('');
    });

    const play = h => Array.from(h.querySelectorAll('span > span')).forEach((inner, i) => {
      setTimeout(() => { inner.style.transform = 'none'; }, i * 110);
    });

    const h1 = document.querySelector('h1');
    if (h1) setTimeout(() => play(h1), 120);

    if (!('IntersectionObserver' in window)) {
      heads.forEach(play);
      return;
    }
    this._ioHead = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) { play(e.target); this._ioHead.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    heads.filter(h => h.tagName === 'H2').forEach(h => this._ioHead.observe(h));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll, { capture: true });
      document.removeEventListener('scroll', this._onScroll, { capture: true });
      window.removeEventListener('resize', this._onScroll);
    }
    if (this._io) this._io.disconnect();
  }

  setupReveal() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    nodes.forEach(n => {
      n.style.opacity = '0';
      n.style.transform = 'translateY(22px) scale(0.992)';
      n.style.transition = 'opacity 1s cubic-bezier(.22,.61,.36,1), transform 1s cubic-bezier(.22,.61,.36,1)';
    });
    this._io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          this._io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(n => this._io.observe(n));
  }

  setInterest(val) {
    const sel = document.getElementById('interest');
    if (sel && [...sel.options].some(o => o.value === val)) sel.value = val;
    const msg = document.getElementById('message');
    if (msg) setTimeout(() => msg.focus(), 420);
  }

  async submit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      this.setState({ formNote: 'Please add your name, a valid email, and a message.' });
      form.reportValidity();
      return;
    }
    this.setState({ formNote: 'Sending…' });
    try {
      const res = await fetch('https://formspree.io/f/mwvgjozj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      if (!res.ok) throw new Error('failed');
      this.setState({ formNote: "Thanks — your message has been sent. I'll reply the same business day." });
      form.reset();
    } catch {
      this.setState({ formNote: 'Something went wrong. Please email hello@matthias.com.au or call 0424 106 527.' });
    }
  }

  renderVals() {
    const ids = ['yieldpos', 'mcbook', 'mcflow', 'techsupport', 'website', 'customsoftware'];
    const pick = {};
    ids.forEach(id => { pick[id] = () => this.setInterest(id); });
    const isMobile = this.state.w < 860;
    return {
      isMobile,
      isDesktop: !isMobile,
      menuOpen: this.state.menuOpen,
      formNote: this.state.formNote,
      pick,
      toggleMenu: () => this.setState(s => ({ menuOpen: !s.menuOpen })),
      closeMenu: () => this.setState({ menuOpen: false }),
      onSubmit: e => this.submit(e),
      hideImg: e => { e.target.style.display = 'none'; }
    };
  }
}


const home = new HomePage();
home.componentDidMount();
document.getElementById("contact-form").addEventListener("submit", event => home.submit(event));
