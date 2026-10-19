document.addEventListener("DOMContentLoaded", async () => {
  const bookingForm = document.getElementById("bookingForm");
  const bookingSection = document.querySelector(".booking-form");
  const popup = document.getElementById("authPopup");
  const bookingResult = document.getElementById("bookingResult");
  const bookingLoadingState = document.getElementById("bookingLoadingState");
  const verifyNotice = document.getElementById("verifyNotice");

  // Keep in sync with Assets/PHP/booking_rules.php
  const OPEN_TIME = "12:00";
  const CLOSE_TIME = "22:00";
  const MAX_PEOPLE = 8;
  const MAX_DAYS_AHEAD = 30;

  document.getElementById("authPopupLoginBtn")?.addEventListener("click", () => {
    window.location.href = "Login.html?next=Booking.html";
  });
  document.getElementById("authPopupSignupBtn")?.addEventListener("click", () => {
    window.location.href = "Signup.html";
  });

  function showError(message) {
    bookingResult.innerHTML = `<p class="form-error"><strong>${escapeHtml(message)}</strong></p>`;
  }

  function todayLocal() {
    return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  }

  function lastBookableDate() {
    const d = new Date();
    d.setDate(d.getDate() + MAX_DAYS_AHEAD);
    return d.toLocaleDateString("en-CA");
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
    document.getElementById("authPopupLoginBtn")?.focus();
    return;
  }

  // Unverified accounts see the "verify your email" notice instead of the form.
  function showVerifyNotice() {
    bookingSection?.classList.add("hidden");
    document.getElementById("verifyNoticeEmail").textContent = currentUser.email;
    verifyNotice.classList.remove("hidden");
  }

  wireResendVerification(
    document.getElementById("resendVerificationBtn"),
    document.getElementById("resendVerificationResult"),
    async () => { await checkSession(); return csrfToken; },
    () => window.location.reload()
  );

  if (currentUser && !currentUser.emailVerified) {
    showVerifyNotice();
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
    const nameField = document.getElementById("name");
    if (nameField && !nameField.value) nameField.value = currentUser.name;
    if (dateField) {
      dateField.min = todayLocal();
      dateField.max = lastBookableDate();
    }

    bookingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const date = dateField.value;
      const start = document.getElementById("start-time").value.slice(0, 5);
      const end = document.getElementById("end-time").value.slice(0, 5);
      const peopleRaw = document.getElementById("people").value;
      const people = Number(peopleRaw);

      if (!name || !date || !start || !end || peopleRaw === "") {
        showError("Please fill in every field.");
        return;
      }

      if (date < todayLocal()) {
        showError("That date has already passed.");
        return;
      }

      if (date > lastBookableDate()) {
        showError(`You can book up to ${MAX_DAYS_AHEAD} days ahead.`);
        return;
      }

      if (start < OPEN_TIME || end > CLOSE_TIME) {
        showError(`We take bookings between ${OPEN_TIME} and ${CLOSE_TIME}.`);
        return;
      }

      if (end <= start) {
        showError("The end time needs to be after the start time.");
        return;
      }

      if (date === todayLocal() && start <= nowHHMM()) {
        showError("That start time has already passed today. Pick a later one.");
        return;
      }

      if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) {
        showError(`A booking can be for 1 to ${MAX_PEOPLE} people.`);
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
            ? `<p>We've emailed a confirmation to <strong>${escapeHtml(currentUser.email)}</strong>.</p>`
            : `<p>You can see this booking any time on your <a href="Dashboard.html">Dashboard</a>.</p>`;
          bookingResult.innerHTML = `
            <h3>You're booked!</h3>
            <p>Thanks, <strong>${escapeHtml(name)}</strong>. We've saved a table for <strong>${escapeHtml(b.people)} ${b.people === 1 ? "person" : "people"}</strong> on <strong>${escapeHtml(b.date)}</strong>, <strong>${escapeHtml(b.start)}</strong> to <strong>${escapeHtml(b.end)}</strong>.</p>
            ${emailLine}
          `;
          bookingForm.reset();
          // Re-populate the locked email field that reset() clears
          lockEmailField();
          nameField.value = currentUser.name;
        } else if (result.code === "email_unverified") {
          showVerifyNotice();
        } else {
          showError(result.error || "We couldn't make that booking. Please try again.");
        }
      } catch (error) {
        console.error("Booking error:", error);
        clearButtonLoading(submitBtn);
        showError("We couldn't reach the server. Please try again in a moment.");
      }
    });
  }
});
