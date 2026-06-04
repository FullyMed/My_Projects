// ================================
// Dynamic Navbar + Hamburger Toggle
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.getElementById("navLinks");
  const navToggle = document.getElementById("navToggle");
  const scrollBtn = document.getElementById("scrollTopBtn");

  if (!navLinks) {
    console.error("navLinks element not found");
    return;
  }

  fetch("Assets/PHP/check_session.php")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const userName = data.loggedIn && data.user?.name ? data.user.name : "User";

      navLinks.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="Booking.html">Booking</a></li>
        <li><a href="About.html">About</a></li>
        ${
          data.loggedIn
            ? `<li><a href="Dashboard.html">👤 ${userName}</a></li>
               <li><a href="#" class="logout-link">Logout</a></li>`
            : `<li><a href="Login.html">Login</a></li>
               <li><a href="Signup.html">Sign Up</a></li>`
        }
      `;

      // Logout handler
      const logoutLink = document.querySelector(".logout-link");
      if (logoutLink) {
        logoutLink.addEventListener("click", e => {
          e.preventDefault();
          fetch("Assets/PHP/logout.php", { method: "POST" })
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                window.location.href = "Login.html";
              } else {
                alert("Logout failed.");
              }
            })
            .catch(err => {
              console.error("Logout error:", err);
              alert("Server error during logout.");
            });
        });
      }

      // Close mobile nav when a link is tapped
      navLinks.addEventListener("click", e => {
        if (e.target.tagName === "A") closeMobileNav();
      });
    })
    .catch(err => {
      console.error("Error checking session:", err);
      navLinks.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="Booking.html">Booking</a></li>
        <li><a href="About.html">About</a></li>
        <li><a href="Login.html">Login</a></li>
        <li><a href="Signup.html">Sign Up</a></li>
      `;
    });

  // ── Hamburger toggle ──
  function openMobileNav() {
    navLinks.classList.add("nav-open");
    navToggle?.setAttribute("aria-expanded", "true");
    navToggle?.setAttribute("aria-label", "Close navigation menu");
  }

  function closeMobileNav() {
    navLinks.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open navigation menu");
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.contains("nav-open");
      isOpen ? closeMobileNav() : openMobileNav();
    });
  }

  // Close nav when tapping outside
  document.addEventListener("click", e => {
    if (
      navLinks.classList.contains("nav-open") &&
      !navLinks.contains(e.target) &&
      !navToggle?.contains(e.target)
    ) {
      closeMobileNav();
    }
  });

  // Close nav on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && navLinks.classList.contains("nav-open")) {
      closeMobileNav();
      navToggle?.focus();
    }
  });

  // ── Scroll-to-top button ──
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.style.display =
        (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300)
          ? "flex"
          : "none";
    }, { passive: true });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
