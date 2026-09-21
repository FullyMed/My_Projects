document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initSmoothScroll();
  initScrollReveal();
  initProductCards();
  initSelectMenus();
  initImageLoading();
  initFormLoadingStates();
  initNavProgressBar();
});

/* ── Sticky header shadow on scroll ────────────────────────── */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Smooth anchor scroll ───────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── Scroll-reveal (IntersectionObserver) ───────────────────── */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: make everything visible immediately
    document.querySelectorAll('.reveal, .product-card').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  // Generic reveal elements
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  // Product cards — staggered within their grid
  const cardObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const card = entry.target;
        const siblings = Array.from(card.parentElement.children);
        const index = siblings.indexOf(card);
        setTimeout(function () {
          card.classList.add('is-visible');
        }, Math.min(index * 70, 350));
        cardObserver.unobserve(card);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.product-card').forEach(function (card) {
    cardObserver.observe(card);
  });
}

/* ── Product card — reviewer avatar initial ─────────────────── */
function initProductCards() {
  // Generate avatar initials for reviews
  document.querySelectorAll('.reviewer-avatar').forEach(function (el) {
    const name = el.dataset.name || '';
    const initial = name.trim().charAt(0).toUpperCase() || '?';
    el.textContent = initial;
  });
}

/* ── Auto-submit select menus ───────────────────────────────── */
function initSelectMenus() {
  document.querySelectorAll('.filter-group select').forEach(function (select) {
    select.addEventListener('change', function () {
      if (!this.form) return;
      // requestSubmit() (unlike submit()) fires a real 'submit' event, so the
      // nav progress bar picks up category-filter navigations too.
      if (this.form.requestSubmit) {
        this.form.requestSubmit();
      } else {
        this.form.submit();
      }
    });
  });
}

/* ── Image loading skeleton (product thumbnails + detail image) ──── */
function initImageLoading() {
  document.querySelectorAll('.product-image img, .product-image-section img').forEach(function (img) {
    const container = img.closest('.product-image, .product-image-section');
    if (container) container.classList.add('is-img-loading');

    function markDone() {
      if (container) container.classList.remove('is-img-loading');
      img.classList.add('img-loaded');
    }

    if (img.complete) {
      markDone();
    } else {
      img.addEventListener('load', markDone, { once: true });
      img.addEventListener('error', markDone, { once: true });
    }
  });
}

/* ── Form submit — disable + spinner on the submit button ───────── */
function initFormLoadingStates() {
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function () {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (!submitBtn || submitBtn.disabled) return;

      // Defer disabling until after the browser has captured the submitted
      // form data, so the clicked button's name/value still gets sent.
      window.setTimeout(function () {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
      }, 0);
    });
  });
}

/* ── Top-of-page navigation progress bar ─────────────────────────
   Every navigation here is a full page reload (no SPA router), so this
   is a simple nprogress-style bar: grow toward (not to) 100% on click/
   submit, then let the browser's own page load replace it. */
function initNavProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'nav-progress-bar';
  document.body.appendChild(bar);

  let started = false;
  function start() {
    if (started) return;
    started = true;
    // Two rAF ticks so the browser paints the 0%→width transition
    // instead of collapsing it into a single instant jump.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.classList.add('is-active');
      });
    });
  }

  document.addEventListener('click', function (e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;

    const link = e.target.closest('a[href]');
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    const href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;

    start();
  });

  document.addEventListener('submit', function (e) {
    if (!e.defaultPrevented) start();
  });

  // Restore the bar if the page is reached via back/forward cache.
  window.addEventListener('pageshow', function () {
    bar.classList.remove('is-active');
    started = false;
  });
}
