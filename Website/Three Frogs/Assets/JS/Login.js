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

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail) {
        resultBox.innerHTML = `<p style="color:red;"><strong>Invalid email format.</strong></p>`;
        return;
      }

      if (password.length < 8) {
        resultBox.innerHTML = `<p style="color:red;"><strong>Password must be at least 8 characters long.</strong></p>`;
        return;
      }

      if (!csrfToken) {
        await fetchCsrfToken();
      }

      const formData = new FormData(loginForm);
      if (csrfToken) formData.append("csrf_token", csrfToken);

      try {
        const response = await fetch("Assets/PHP/login.php", {
          method: "POST",
          body: formData,
          credentials: "include"
        });

        const result = await response.json();

        if (!response.ok) {
          errorMessage.textContent = result.error || "Invalid email or password.";
          errorMessage.classList.remove("hidden");
          return;
        }

        alert("Login successful!");
        window.location.href = "index.html";

      } catch (err) {
        console.error("Error during login:", err);
        errorMessage.textContent = "Server error: " + err.message;
        errorMessage.classList.remove("hidden");
      }
    });
  }

  // Toggle Show/Hide Password
  const toggleBtn = document.getElementById("toggleLoginPassword");
  const passwordInput = document.getElementById("loginPassword");

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";
      toggleBtn.textContent = isVisible ? "👁️" : "🙈";
    });
  }
});