/* Engel Worldwide - header + hero behaviour */
(function () {
  'use strict';

  const header = document.getElementById('siteHeader');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('primaryNav');
  const menus = document.querySelectorAll('.has-menu');
  const hotspots = document.querySelectorAll('.hotspot');
  const isMobile = () => window.matchMedia('(max-width: 960px)').matches;

  /* ---------- 1. Header shrinks on scroll ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 2. Dropdown menus ---------- */
  const closeMenus = (except) => {
    menus.forEach((li) => {
      if (li === except) return;
      li.classList.remove('open');
      li.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
    });
  };

  menus.forEach((li) => {
    const trigger = li.querySelector('.nav-trigger');
    let timer;

    const open = () => {
      clearTimeout(timer);
      closeMenus(li);
      li.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      li.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', () => {
      li.classList.contains('open') ? close() : open();
    });

    // Hover to open on desktop only
    li.addEventListener('mouseenter', () => { if (!isMobile()) open(); });
    li.addEventListener('mouseleave', () => { if (!isMobile()) timer = setTimeout(close, 150); });

    // Close when focus leaves the menu
    li.addEventListener('focusout', (e) => {
      if (!li.contains(e.relatedTarget)) close();
    });
  });

  /* ---------- 3. Mobile burger ---------- */
  const setNav = (open) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open && isMobile() ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a') && isMobile()) setNav(false);
  });
  window.addEventListener('resize', () => { if (!isMobile()) setNav(false); });

  /* ---------- 4. Hero hotspots (tap to reveal on mobile) ---------- */
  const closeHotspots = () => {
    hotspots.forEach((h) => {
      h.classList.remove('active');
      h.querySelector('.hs-dot').setAttribute('aria-expanded', 'false');
    });
  };

  hotspots.forEach((h) => {
    const dot = h.querySelector('.hs-dot');
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasActive = h.classList.contains('active');
      closeHotspots();
      if (!wasActive) {
        h.classList.add('active');
        dot.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- 5. Global dismiss: click outside / Escape ---------- */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-menu')) closeMenus();
    if (!e.target.closest('.hotspot')) closeHotspots();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMenus();
    closeHotspots();
    setNav(false);
  });

  /* ---------- 6. Cart badge helper ----------
     Call from your cart code:  EngelCart.setCount(3)  */
  const cartLink = document.querySelector('.action--cart');
  const cartCount = document.getElementById('cartCount');
  window.EngelCart = {
    setCount(n) {
      cartCount.textContent = n;
      cartLink.setAttribute('aria-label', 'Cart, ' + n + (n === 1 ? ' item' : ' items'));
      cartCount.classList.remove('bump');
      void cartCount.offsetWidth; // restart animation
      cartCount.classList.add('bump');
    }
  };
})();


/* TRENDING NOW: filter pills (paste into script.js, or load as its own file) */
(function () {
  'use strict';
  const pills = document.querySelectorAll('.trend-pill');
  const items = document.querySelectorAll('.trend-item');
  if (!pills.length) return;

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const group = pill.dataset.filter;

      pills.forEach((p) => p.setAttribute('aria-pressed', String(p === pill)));

      items.forEach((item) => {
        const show = group === 'all' || item.dataset.group === group;
        item.hidden = !show;
        if (show) {                       // replay the small entrance animation
          item.classList.remove('pop');
          void item.offsetWidth;
          item.classList.add('pop');
        }
      });
    });
  });
})();

/* CONTACT FORM (paste into script.js, or load as its own file) */
(function () {
  'use strict';
  const form = document.getElementById('contactForm');
  if (!form) return;

  const bar = document.getElementById('cfBar');
  const status = document.getElementById('cfStatus');
  const done = document.getElementById('cfDone');
  const doneTitle = document.getElementById('cfDoneTitle');
  const count = document.getElementById('cfCount');
  const btn = form.querySelector('.cf-submit');
  const name = form.elements.name, email = form.elements.email, msg = form.elements.message;

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const rules = [
    { el: name,  ok: (v) => v.trim().length >= 2,  text: 'Please tell us your name.' },
    { el: email, ok: emailOk,                      text: 'Please enter a valid email address.' },
    { el: msg,   ok: (v) => v.trim().length >= 10, text: 'Tell us a little more (at least 10 characters).' }
  ];

  const setError = (el, text) => {
    const field = el.closest('.field');
    field.classList.toggle('invalid', !!text);
    field.querySelector('.err').textContent = text || '';
  };

  /* Progress bar + friendly status as the three key fields are completed */
  const updateProgress = () => {
    const doneCount = rules.filter((r) => r.ok(r.el.value)).length;
    bar.style.width = (doneCount / rules.length) * 100 + '%';
    status.textContent =
      doneCount === 0 ? '3 quick fields and you’re done.' :
      doneCount === 1 ? 'Great start, 2 more to go.' :
      doneCount === 2 ? 'Almost there, just one more.' :
                        'All set. Ready to send!';
  };

  count.textContent = '0 / ' + msg.maxLength;
  form.addEventListener('input', (e) => {
    if (e.target === msg) count.textContent = msg.value.length + ' / ' + msg.maxLength;
    const rule = rules.find((r) => r.el === e.target);
    if (rule && rule.el.closest('.field').classList.contains('invalid') && rule.ok(rule.el.value)) setError(rule.el, '');
    updateProgress();
  });
  rules.forEach((r) => r.el.addEventListener('blur', () => {
    if (r.el.value) setError(r.el, r.ok(r.el.value) ? '' : r.text);
  }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.website.value) return;           // honeypot: bots only

    let firstBad = null;
    rules.forEach((r) => {
      const good = r.ok(r.el.value);
      setError(r.el, good ? '' : r.text);
      if (!good && !firstBad) firstBad = r.el;
    });
    if (firstBad) { firstBad.focus(); return; }

    btn.classList.add('loading');
    btn.querySelector('.cf-submit__text').textContent = 'Sending…';

    try {
      /* To receive messages, put your form endpoint in data-endpoint on the <form>
         (for example a Formspree URL or your own PHP/Node script). */
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        if (!res.ok) throw new Error('Request failed');
      } else {
        await new Promise((r) => setTimeout(r, 900));  // demo mode: no endpoint set yet
      }

      doneTitle.textContent = 'Thank you, ' + name.value.trim().split(' ')[0] + '!';
      form.hidden = true;
      done.hidden = false;
      bar.style.width = '100%';
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again or call us.';
    } finally {
      btn.classList.remove('loading');
      btn.querySelector('.cf-submit__text').textContent = 'Send message';
    }
  });

  document.getElementById('cfAgain').addEventListener('click', () => {
    form.reset();
    rules.forEach((r) => setError(r.el, ''));
    count.textContent = '0 / ' + msg.maxLength;
    updateProgress();
    done.hidden = true;
    form.hidden = false;
    name.focus();
  });
})();


/* FOOTER: current year + back-to-top with progress ring (paste into script.js) */
(function () {
  'use strict';
  const year = document.getElementById('footYear');
  if (year) year.textContent = new Date().getFullYear();

  const btn = document.getElementById('toTop');
  const ring = document.getElementById('toTopRing');
  if (!btn || !ring) return;

  const CIRC = 132; // matches stroke-dasharray in the CSS
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    ring.style.strokeDashoffset = CIRC - pct * CIRC;
    btn.classList.toggle('show', window.scrollY > 500);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();