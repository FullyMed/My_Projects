document.addEventListener("DOMContentLoaded", async () => {
  let csrfToken = null;

  // Function to check session via backend
  async function checkSession() {
    try {
      const response = await fetch("Assets/PHP/check_session.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const result = await response.json();
      csrfToken = result.csrfToken || null;
      return result.loggedIn ? result.user : null;
    } catch (error) {
      console.error("Session check failed:", error);
      return null;
    }
  }

  // Check if user is already logged in
  const currentUser = await checkSession();
  if (currentUser) {
    window.location.href = "index.html";
    return;
  }

  // Handle signup form submission
  const signupForm = document.getElementById("signupForm");
  const resultBox = document.getElementById("signupResult");

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("signupEmail").value;
      if (!validateEmail(email)) {
        resultBox.innerHTML = `<p class="form-error"><strong>That email address doesn't look right.</strong></p>`;
        return;
      }

      const name = document.getElementById("signupName").value.trim().replace(/\s+/g, " ");
      if (!name) {
        resultBox.innerHTML = `<p class="form-error"><strong>Please enter your name.</strong></p>`;
        return;
      }
      // Same rule as signup.php: letters (any language), spaces, ' ’ - .
      if (!/^\p{L}[\p{L}\p{M} '’.\-]*$/u.test(name)) {
        resultBox.innerHTML = `<p class="form-error"><strong>Names can use letters, spaces, apostrophes ('), hyphens (-) and periods (.), and have to start with a letter.</strong></p>`;
        return;
      }

      const password = document.getElementById("signupPassword").value;
      if (password.length < 8) {
        resultBox.innerHTML = `<p class="form-error"><strong>Your password needs at least 8 characters.</strong></p>`;
        return;
      }

      // Always re-fetch — see the matching comment in Login.js (parallel
      // first-visit session checks can leave a token from a discarded session).
      await checkSession();

      const formData = new FormData(signupForm);
      if (csrfToken) formData.append("csrf_token", csrfToken);

      const submitBtn = signupForm.querySelector('button[type="submit"]');
      setButtonLoading(submitBtn, "Signing up...");

      try {
        const response = await fetch("Assets/PHP/signup.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          const emailNote = result.verificationEmailSent
            ? `We've sent a verification link to <strong>${escapeHtml(email)}</strong>. Open it before your first booking.`
            : `Please verify your email before your first booking. You can ask for the link on your Dashboard.`;
          resultBox.innerHTML = `
            <h3>Welcome, ${escapeHtml(result.user.name)}!</h3>
            <p>${emailNote}</p>
            <p>Taking you to your dashboard…</p>
          `;
          setTimeout(() => window.location.href = "Dashboard.html", 3500);
          signupForm.reset();
        } else {
          clearButtonLoading(submitBtn);
          resultBox.innerHTML = `<p class="form-error"><strong>${escapeHtml(result.error || "We couldn't create your account. Please try again.")}</strong></p>`;
        }
      } catch (err) {
        clearButtonLoading(submitBtn);
        resultBox.innerHTML = `<p class="form-error"><strong>We couldn't reach the server. Please try again in a moment.</strong></p>`;
        console.error("Signup error:", err);
      }
    });
  }

  // Show/hide password button (Notify.js)
  wirePasswordToggle("toggleSignupPassword", "signupPassword");
});