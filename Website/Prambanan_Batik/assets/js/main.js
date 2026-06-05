document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initSmoothScroll();
  initScrollReveal();
  initProductCards();
  initSelectMenus();
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
      if (this.form) this.form.submit();
    });
  });
}
