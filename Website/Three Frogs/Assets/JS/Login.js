document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const resultBox = document.getElementById("loginResult");
  const errorMessage = document.getElementById("errorMessage");
  const forgotPrompt = document.getElementById("viewMorePrompt");

  if (forgotPrompt) {
    forgotPrompt.style.display = "block";
  }

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

      const formData = new FormData(loginForm);

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