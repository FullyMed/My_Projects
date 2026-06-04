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

      submitBtn.disabled    = true;
      submitBtn.textContent = "Sending...";

      try {
        const formData = new FormData();
        formData.append("email", email);
        await fetch("Assets/PHP/request_reset.php", { method: "POST", body: formData });
        requestResult.innerHTML = `<p style="color:green;"><strong>If that email is registered, a reset link has been sent. Check your inbox.</strong></p>`;
        requestForm.reset();
      } catch (err) {
        requestResult.innerHTML = `<p style="color:red;">Server error. Please try again later.</p>`;
        console.error("Request reset error:", err);
      } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = "Send Reset Link";
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
        forgotResult.innerHTML = `<p style="color:red;"><strong>Password must be at least 8 characters long.</strong></p>`;
        return;
      }

      submitBtn.disabled    = true;
      submitBtn.textContent = "Resetting...";

      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", password);

      try {
        const response = await fetch("Assets/PHP/forgot_password.php", { method: "POST", body: formData });
        const result   = await response.json();

        if (result.success) {
          forgotResult.innerHTML = `
            <h3>Password Reset Successful!</h3>
            <p>Your password has been updated. Redirecting to login...</p>
          `;
          setTimeout(() => { window.location.href = "Login.html"; }, 1500);
        } else {
          forgotResult.innerHTML    = `<p style="color:red;">${result.error}</p>`;
          submitBtn.disabled        = false;
          submitBtn.textContent     = "Reset Password";
        }
      } catch (err) {
        forgotResult.innerHTML = `<p style="color:red;">Server error. Please try again later.</p>`;
        console.error("Reset password error:", err);
        submitBtn.disabled    = false;
        submitBtn.textContent = "Reset Password";
      }
    });
  }

  // ── Toggle password visibility ──
  const toggleBtn   = document.getElementById("toggleForgotPassword");
  const passwordInput = document.getElementById("newPassword");

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");
      toggleBtn.textContent = isPassword ? "🙈" : "👁️";
    });
  }
});
