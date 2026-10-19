document.addEventListener("DOMContentLoaded", async () => {
  async function checkSession() {
    try {
      const response = await fetch("Assets/PHP/check_session.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const result = await response.json();
      return result.loggedIn ? result.user : null;
    } catch (error) {
      console.error("Session check failed:", error);
      return null;
    }
  }

  const currentUser = await checkSession();
  if (currentUser) {
    window.location.href = "Dashboard.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const token  = params.get("token");

  if (token) {
    document.getElementById("requestStep").classList.add("hidden");
    document.getElementById("resetStep").classList.remove("hidden");
  }

  // ── Step 1: request reset link ──
  const requestForm   = document.getElementById("requestForm");
  const requestResult = document.getElementById("requestResult");

  if (requestForm) {
    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email     = document.getElementById("resetEmail").value.trim();
      const submitBtn = requestForm.querySelector("button[type='submit']");

      setButtonLoading(submitBtn, "Sending...");

      try {
        const formData = new FormData();
        formData.append("email", email);
        const response = await fetch("Assets/PHP/request_reset.php", { method: "POST", body: formData });
        const result   = await response.json();
        if (result.success) {
          requestResult.innerHTML = `<p class="form-success"><strong>If we have an account with that email, we've sent it a reset link. Check your inbox and spam folder.</strong></p>`;
          requestForm.reset();
        } else {
          requestResult.innerHTML = `<p class="form-error">${escapeHtml(result.error || "Something went wrong. Please try again in a moment.")}</p>`;
        }
      } catch (err) {
        requestResult.innerHTML = `<p class="form-error">We couldn't reach the server. Please try again in a moment.</p>`;
        console.error("Request reset error:", err);
      } finally {
        clearButtonLoading(submitBtn);
      }
    });
  }

  // ── Step 2: execute reset ──
  const forgotForm   = document.getElementById("forgotForm");
  const forgotResult = document.getElementById("forgotResult");

  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const password  = document.getElementById("newPassword").value;
      const submitBtn = forgotForm.querySelector("button[type='submit']");

      if (password.length < 8) {
        forgotResult.innerHTML = `<p class="form-error"><strong>Your password needs at least 8 characters.</strong></p>`;
        return;
      }

      setButtonLoading(submitBtn, "Resetting...");

      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", password);

      try {
        const response = await fetch("Assets/PHP/forgot_password.php", { method: "POST", body: formData });
        const result   = await response.json();

        if (result.success) {
          forgotResult.innerHTML = `
            <h3>Password changed</h3>
            <p>Taking you to the login page…</p>
          `;
          setTimeout(() => redirectWithMessage("Login.html", "password_reset"), 1500);
        } else {
          forgotResult.innerHTML = `<p class="form-error">${escapeHtml(result.error || "We couldn't reset your password. Please try again.")}</p>`;
          clearButtonLoading(submitBtn);
        }
      } catch (err) {
        forgotResult.innerHTML = `<p class="form-error">We couldn't reach the server. Please try again in a moment.</p>`;
        console.error("Reset password error:", err);
        clearButtonLoading(submitBtn);
      }
    });
  }

  // Show/hide password button (Notify.js)
  wirePasswordToggle("toggleForgotPassword", "newPassword");
});
