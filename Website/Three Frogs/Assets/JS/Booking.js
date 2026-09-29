document.addEventListener("DOMContentLoaded", async () => {
  const bookingForm = document.getElementById("bookingForm");
  const bookingSection = document.querySelector(".booking-form");
  const popup = document.getElementById("authPopup");
  const bookingResult = document.getElementById("bookingResult");
  const bookingLoadingState = document.getElementById("bookingLoadingState");

  // Keep in sync with booking.php
  const OPEN_TIME = "12:00";
  const CLOSE_TIME = "22:00";
  const MAX_PEOPLE = 8;

  document.getElementById("authPopupLoginBtn")?.addEventListener("click", () => {
    window.location.href = "Login.html";
  });
  document.getElementById("authPopupSignupBtn")?.addEventListener("click", () => {
    window.location.href = "Signup.html";
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showError(message) {
    bookingResult.innerHTML = `<p style="color:red;"><strong>${escapeHtml(message)}</strong></p>`;
  }

  function todayLocal() {
    return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  }

  function nowHHMM() {
    return new Date().toTimeString().slice(0, 5);
  }

  let csrfToken = null;

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

  const currentUser = await checkSession();
  bookingLoadingState?.classList.add("hidden");

  if (!currentUser && bookingForm) {
    popup.classList.remove("hidden");
    return;
  }

  if (bookingForm && currentUser) {
    // The `hidden` class lives on the wrapping <section>, not the <form>.
    bookingSection?.classList.remove("hidden");

    const emailField = document.getElementById("email");
    const dateField = document.getElementById("date");

    function lockEmailField() {
      if (emailField) {
        emailField.value = currentUser.email;
        emailField.readOnly = true;
      }
    }
    lockEmailField();
    if (dateField) dateField.min = todayLocal();

    bookingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const date = dateField.value;
      const start = document.getElementById("start-time").value.slice(0, 5);
      const end = document.getElementById("end-time").value.slice(0, 5);
      const peopleRaw = document.getElementById("people").value;
      const people = Number(peopleRaw);

      if (!name || !date || !start || !end || peopleRaw === "") {
        showError("All fields are required.");
        return;
      }

      if (date < todayLocal()) {
        showError("Booking date cannot be in the past.");
        return;
      }

      if (start < OPEN_TIME || end > CLOSE_TIME) {
        showError(`Booking must be between ${OPEN_TIME} and ${CLOSE_TIME}.`);
        return;
      }

      if (end <= start) {
        showError("End time must be later than start time.");
        return;
      }

      if (date === todayLocal() && start <= nowHHMM()) {
        showError("That start time has already passed. Please choose a later time.");
        return;
      }

      if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) {
        showError(`Number of people must be between 1 and ${MAX_PEOPLE} per booking.`);
        return;
      }

      if (!csrfToken) {
        await checkSession();
      }

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      setButtonLoading(submitBtn, "Booking...");

      try {
        const response = await fetch("Assets/PHP/booking.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            date,
            start,
            end,
            people,
            csrf_token: csrfToken
          })
        });

        const result = await response.json();
        clearButtonLoading(submitBtn);

        if (result.success) {
          const b = result.booking;
          const emailLine = result.emailSent
            ? `<p>A confirmation has been sent to <strong>${escapeHtml(currentUser.email)}</strong>.</p>`
            : `<p>You can see this booking any time on your <a href="Dashboard.html">Dashboard</a>.</p>`;
          bookingResult.innerHTML = `
            <h3>Booking Confirmed!</h3>
            <p>Thank you, <strong>${escapeHtml(name)}</strong>.</p>
            <p>Your booking on <strong>${escapeHtml(b.date)}</strong> from <strong>${escapeHtml(b.start)}</strong> to <strong>${escapeHtml(b.end)}</strong> for <strong>${escapeHtml(b.people)} ${b.people === 1 ? "person" : "people"}</strong> is received.</p>
            ${emailLine}
          `;
          bookingForm.reset();
          // Re-populate the locked email field that reset() clears
          lockEmailField();
        } else {
          showError(result.error || "Booking failed. Please try again.");
        }
      } catch (error) {
        console.error("Booking error:", error);
        clearButtonLoading(submitBtn);
        showError("Server error. Please try again later.");
      }
    });
  }
});
