// ================================
// Dynamic Navbar Based on Login
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.getElementById("navLinks");
  const scrollBtn = document.getElementById("scrollTopBtn");
  
  if (!navLinks) {
    console.error("navLinks element not found");
    return;
  }
  
  fetch("Assets/PHP/check_session.php")
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("check_session response:", data);
    
    const userName = data.loggedIn && data.user && data.user.name ? data.user.name : "User";
    
    navLinks.innerHTML = `
        <li><a href="/">Home</a></li>
        <li><a href="Booking.html">Booking</a></li>
        <li><a href="About.html">About</a></li>
        ${
          data.loggedIn
            ? `
              <li><a href="Dashboard.html">👤 ${userName}</a></li>
              <li><a href="#" class="logout-link">Logout</a></li>
            `
            : `
              <li><a href="Login.html">Login</a></li>
              <li><a href="Signup.html">Sign Up</a></li>
            `
        }
      `;

      // Add event listener for logout
      const logoutLink = document.querySelector(".logout-link");
      if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault();
          fetch("Assets/PHP/logout.php", {
            method: "POST",
          })
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                alert("You have been logged out.");
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
    })
    .catch(err => {
      console.error("Error checking session:", err);
      // Fallback: Assume user is not logged in
      navLinks.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="Booking.html">Booking</a></li>
        <li><a href="About.html">About</a></li>
        <li><a href="Login.html">Login</a></li>
        <li><a href="Signup.html">Sign Up</a></li>
      `;
    });

  // Scroll to top button
  window.onscroll = function () {
    if (scrollBtn && (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300)) {
      scrollBtn.style.display = "block";
    } else if (scrollBtn) {
      scrollBtn.style.display = "none";
    }
  };

  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});