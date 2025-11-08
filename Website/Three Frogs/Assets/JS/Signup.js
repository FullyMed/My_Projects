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
        resultBox.innerHTML = `<p style="color:red;"><strong>Invalid email format.</strong></p>`;
        return;
      }

      const name = document.getElementById("signupName").value;
      if (!name.trim()) {
        resultBox.innerHTML = `<p style="color:red;"><strong>Name cannot be empty.</strong></p>`;
        return;
      }

      const password = document.getElementById("signupPassword").value;
      if (password.length < 8) {
        resultBox.innerHTML = `<p style="color:red;"><strong>Password must be at least 8 characters long.</strong></p>`;
        return;
      }

      const formData = new FormData(signupForm);

      try {
        const response = await fetch("Assets/PHP/signup.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          resultBox.innerHTML = `
            <h3>Sign Up Successful!</h3>
            <p>Welcome, <strong>${result.user.name}</strong>. Redirecting to homepage...</p>
          `;
          setTimeout(() => window.location.href = "index.html", 1500);
          signupForm.reset();
        } else {
          resultBox.innerHTML = `<p style="color:red;"><strong>${result.error || "Signup failed."}</strong></p>`;
        }
      } catch (err) {
        resultBox.innerHTML = `<p style="color:red;"><strong>Server error. Please try again later.</strong></p>`;
        console.error("Signup error:", err);
      }
    });
  }

  // Toggle Show/Hide Password
  const toggleBtn = document.getElementById("toggleSignupPassword");
  const passwordInput = document.getElementById("signupPassword");

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";
      toggleBtn.textContent = isVisible ? "👁️" : "🙈";
    });
  }
});