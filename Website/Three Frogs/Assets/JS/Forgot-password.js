document.addEventListener("DOMContentLoaded", async () => {
  // Function to check session via backend
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

  // Check if user is already logged in
  const currentUser = await checkSession();
  if (currentUser) {
    window.location.href = "Dashboard.html";
    return;
  }

  // Handle forgot password form submission
  const forgotForm = document.getElementById("forgotForm");
  const resultBox = document.getElementById("forgotResult");

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("forgotEmail").value;
      const newPassword = document.getElementById("newPassword").value;

      if (!validateEmail(email)) {
        resultBox.innerHTML = `<p style="color:red;"><strong>Invalid email format.</strong></p>`;
        return;
      }

      if (newPassword.length < 8) {
        resultBox.innerHTML = `<p style="color:red;"><strong>Password must be at least 8 characters long.</strong></p>`;
        return;
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", newPassword);

      try {
        const response = await fetch("Assets/PHP/forgot_password.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          resultBox.innerHTML = `
            <h3>Password Reset Successful!</h3>
            <p>Password for <strong>${email}</strong> has been updated.</p>
            <p>Redirecting to login page...</p>
          `;
          setTimeout(() => {
            forgotForm.reset();
            window.location.href = "Login.html";
          }, 1500);
        } else {
          resultBox.innerHTML = `<p style="color:red;">${result.error}</p>`;
        }
      } catch (err) {
        resultBox.innerHTML = `<p style="color:red;">Server error. Please try again later.</p>`;
        console.error("Reset password error:", err);
      }
    });
  }

  // Toggle Show/Hide Password
  const toggleForgotPassword = document.getElementById("toggleForgotPassword");
  const forgotPasswordInput = document.getElementById("newPassword");

  if (toggleForgotPassword && forgotPasswordInput) {
    toggleForgotPassword.addEventListener("click", () => {
      const type = forgotPasswordInput.getAttribute("type") === "password" ? "text" : "password";
      forgotPasswordInput.setAttribute("type", type);
      toggleForgotPassword.textContent = type === "password" ? "👁️" : "🙈";
    });
  }
});