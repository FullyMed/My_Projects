document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const resultBox = document.getElementById("loginResult");
  const errorMessage = document.getElementById("errorMessage");

  let csrfToken = null;
  async function fetchCsrfToken() {
    try {
      const response = await fetch("Assets/PHP/check_session.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const result = await response.json();
      csrfToken = result.csrfToken || null;
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }
  fetchCsrfToken();

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      // Only ever show the message for this attempt
      resultBox.innerHTML = "";
      errorMessage.classList.add("hidden");

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail) {
        resultBox.innerHTML = `<p class="form-error"><strong>That email address doesn't look right.</strong></p>`;
        return;
      }

      if (password.length < 8) {
        resultBox.innerHTML = `<p class="form-error"><strong>That password is too short. Passwords have at least 8 characters.</strong></p>`;
        return;
      }

      // Always re-fetch: on a first visit, this script's page-load call and
      // Navbar.js's run in parallel without a cookie and can each start a
      // different session — only one survives, so the token cached at page
      // load may belong to the other one. By submit time the cookie is settled.
      await fetchCsrfToken();

      const formData = new FormData(loginForm);
      if (csrfToken) formData.append("csrf_token", csrfToken);

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      setButtonLoading(submitBtn, "Logging in...");

      try {
        const response = await fetch("Assets/PHP/login.php", {
          method: "POST",
          body: formData,
          credentials: "include"
        });

        const result = await response.json();

        if (!response.ok) {
          clearButtonLoading(submitBtn);
          errorMessage.textContent = result.error || "That email and password don't match.";
          errorMessage.classList.remove("hidden");
          return;
        }

        // Back to the page that sent them here (e.g. Booking.html), if any
        window.location.href = safeNextPage() || "index.html";

      } catch (err) {
        console.error("Error during login:", err);
        clearButtonLoading(submitBtn);
        errorMessage.textContent = "We couldn't reach the server. Please try again in a moment.";
        errorMessage.classList.remove("hidden");
      }
    });
  }

  // Show/hide password button (Notify.js)
  wirePasswordToggle("toggleLoginPassword", "loginPassword");
});