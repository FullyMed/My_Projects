document.addEventListener('DOMContentLoaded', function() {
  initializeSmoothScroll();
  initializeSelectMenus();
  initializeImages();
  initializeProductCards();
});

function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function initializeSelectMenus() {
  const selects = document.querySelectorAll('select');
  selects.forEach(function(select) {
    select.addEventListener('change', function() {
      if (this.form) {
        this.form.submit();
      }
    });
  });
}

function initializeImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src;
          img.removeAttribute('loading');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(function(img) {
      imageObserver.observe(img);
    });
  }
}

function initializeProductCards() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(function(card, index) {
    card.style.animationDelay = (index * 50) + 'ms';
  });
}

window.addEventListener('load', function() {
  updateActiveNavigation();
});

function updateActiveNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav a');

  navLinks.forEach(function(link) {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100);
}

function handleProductCardHover() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleProductCardHover);
} else {
  handleProductCardHover();
}
