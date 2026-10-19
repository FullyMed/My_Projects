document.addEventListener("DOMContentLoaded", async () => {
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");
  const upcomingContainer = document.getElementById("upcomingBookings");
  const historyContainer = document.getElementById("bookingHistory");
  const popup = document.getElementById("cancelPopup");
  const cancelText = document.getElementById("cancelText");
  const confirmCancel = document.getElementById("confirmCancel");
  const closePopup = document.getElementById("closePopup");
  const changeAvatarForm = document.getElementById("changeAvatarForm");
  const avatarMsg = document.getElementById("avatarUpdateMessage");

  const editAvatarBtn = document.getElementById("editAvatarBtn");
  const avatarChangeContainer = document.getElementById("avatarChangeContainer");

  if (editAvatarBtn && avatarChangeContainer) {
    const toggleAvatarPicker = () => avatarChangeContainer.classList.toggle("hidden");
    editAvatarBtn.addEventListener("click", toggleAvatarPicker);
    editAvatarBtn.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAvatarPicker();
      }
    });
  }

  const currentAvatar = document.getElementById("currentAvatar");
  const dashboardLoadingState = document.getElementById("dashboardLoadingState");
  const dashboardContainer = document.querySelector(".dashboard-container");

  let loggedInUser = null;
  let upcomingBookings = [];
  let selectedBooking = null;
  let remainingCancels = 2;
  let cancelLimit = 2;
  let csrfToken = null;

  async function checkSession() {
    try {
      const response = await fetch("Assets/PHP/check_session.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const result = await response.json();
      csrfToken = result.csrfToken || null;
      if (result.loggedIn) {
        return result.user;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Session check failed:", error);
      return null;
    }
  }

  loggedInUser = await checkSession();
  if (!loggedInUser) {
    redirectWithMessage("Login.html", "login_required", "Dashboard.html");
    return;
  }

  dashboardLoadingState?.classList.add("hidden");
  dashboardContainer?.classList.remove("hidden");

  const verifyNotice = document.getElementById("verifyNotice");
  if (!loggedInUser.emailVerified) verifyNotice?.classList.remove("hidden");
  wireResendVerification(
    document.getElementById("resendVerificationBtn"),
    document.getElementById("resendVerificationResult"),
    async () => { await checkSession(); return csrfToken; },
    () => {
      verifyNotice?.classList.add("hidden");
      showToast("Your email is already verified, so you're all set to book.", "success");
    }
  );

  function updateUserInfo() {
    if (currentAvatar) currentAvatar.src = loggedInUser.avatar;
    userInfo.innerHTML = `
      <p><strong>Name:</strong> ${escapeHtml(loggedInUser.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(loggedInUser.email)}</p>
    `;
    // Pre-select the user's current avatar in the picker
    const currentRadio = [...document.querySelectorAll('input[name="newAvatar"]')]
      .find(radio => radio.value === loggedInUser.avatar);
    if (currentRadio) currentRadio.checked = true;
  }

  function bookingCard(b, withCancel) {
    const cancelledByCafe = b.status === "cancelled_by_cafe";
    return `
      <div class="booking-card${cancelledByCafe ? " is-cancelled" : ""}">
        <p><strong>Date:</strong> ${escapeHtml(b.date)}</p>
        <p><strong>Time:</strong> ${escapeHtml(b.start_time)} - ${escapeHtml(b.end_time)}</p>
        <p><strong>People:</strong> ${escapeHtml(b.people)}</p>
        ${cancelledByCafe ? `<span class="status-badge">Cancelled by the café</span>` : ""}
        ${withCancel && !cancelledByCafe ? `<button class="cancelBtn" data-id="${escapeHtml(b.id)}">Cancel</button>` : ""}
      </div>
    `;
  }

  async function fetchBookingsFromServer() {
    upcomingContainer.innerHTML = `<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Loading your bookings…</div>`;
    historyContainer.innerHTML = "";

    try {
      const response = await fetch("Assets/PHP/get_bookings.php", { method: "POST" });
      const result = await response.json();
      if (result.success) {
        remainingCancels = result.remaining_cancels ?? remainingCancels;
        cancelLimit = result.cancel_limit ?? cancelLimit;
        renderBookings(result.bookings);
      } else {
        upcomingContainer.innerHTML = "<p>We couldn't load your bookings. Please refresh the page.</p>";
        historyContainer.innerHTML = "";
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      upcomingContainer.innerHTML = "<p>We couldn't reach the server. Please try again in a moment.</p>";
      historyContainer.innerHTML = "";
    }
  }

  function renderBookings(bookings) {
    const now = new Date();
    const history = [];
    upcomingBookings = [];

    bookings.forEach(b => {
      const end = new Date(`${b.date}T${b.end_time}`);
      if (end > now) upcomingBookings.push(b);
      else history.push(b);
    });

    // Bookings that have already started stay in "Upcoming" until they end,
    // but can no longer be cancelled (cancel_booking.php enforces the same rule).
    upcomingContainer.innerHTML = upcomingBookings.length === 0
      ? `<p>No upcoming bookings. <a href="Booking.html">Book a table</a></p>`
      : upcomingBookings.map(b => bookingCard(b, new Date(`${b.date}T${b.start_time}`) > now)).join("");

    // Most recent first
    historyContainer.innerHTML = history.length === 0
      ? "<p>No past bookings yet.</p>"
      : history.reverse().map(b => bookingCard(b, false)).join("");
  }

  // One delegated listener survives every re-render of the list
  upcomingContainer.addEventListener("click", e => {
    const btn = e.target.closest(".cancelBtn");
    if (!btn) return;

    selectedBooking = upcomingBookings.find(b => String(b.id) === btn.dataset.id);
    if (!selectedBooking) return;

    if (remainingCancels > 0) {
      cancelText.textContent =
        `Cancel your booking on ${selectedBooking.date}, ${selectedBooking.start_time} - ${selectedBooking.end_time}? ` +
        `You have ${remainingCancels} of ${cancelLimit} cancellations left this month.`;
      popup.classList.remove("hidden");
      // Start on the safe choice, so Enter or Space can't cancel by accident
      closePopup?.focus();
    } else {
      showToast(`You've already used your ${cancelLimit} cancellations this month, so you can't cancel this one online.`, "error");
    }
  });

  // Avatar change
  if (changeAvatarForm) {
    changeAvatarForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newAvatar = document.querySelector('input[name="newAvatar"]:checked')?.value;
      if (newAvatar) {
        if (!csrfToken) {
          await checkSession();
        }
        const formData = new FormData();
        formData.append("avatar", newAvatar);
        formData.append("csrf_token", csrfToken);

        const submitBtn = changeAvatarForm.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, "Updating...");

        try {
          const response = await fetch("Assets/PHP/update_avatar.php", {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          clearButtonLoading(submitBtn);
          if (result.success) {
            loggedInUser.avatar = newAvatar;
            updateUserInfo();
            avatarMsg.innerHTML = `<p class="form-success">Avatar saved.</p>`;
            setTimeout(() => avatarMsg.innerHTML = "", 3000);
          } else {
            avatarMsg.innerHTML = `<p class="form-error">${escapeHtml(result.error || "We couldn't save your avatar.")}</p>`;
          }
        } catch (err) {
          console.error("Avatar update error:", err);
          clearButtonLoading(submitBtn);
          avatarMsg.innerHTML = `<p class="form-error">We couldn't reach the server. Please try again in a moment.</p>`;
        }
      }
    });
  }

  // Confirm Cancel
  if (confirmCancel) {
    confirmCancel.addEventListener("click", async () => {
      if (!selectedBooking) return;
      if (!csrfToken) {
        await checkSession();
      }
      setButtonLoading(confirmCancel, "Cancelling...");
      try {
        const res = await fetch("Assets/PHP/cancel_booking.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: selectedBooking.id,
            csrf_token: csrfToken
          })
        });

        const result = await res.json();
        clearButtonLoading(confirmCancel);
        popup.classList.add("hidden");
        selectedBooking = null;
        if (result.success) {
          remainingCancels = result.remaining_cancels ?? Math.max(0, remainingCancels - 1);
          showToast("Booking cancelled.", "success");
        } else {
          showToast("Couldn't cancel the booking. " + (result.error || "Please try again."), "error");
        }
        fetchBookingsFromServer();
      } catch (err) {
        console.error("Cancel booking error:", err);
        clearButtonLoading(confirmCancel);
        showToast("We couldn't reach the server. Please try again in a moment.", "error");
      }
    });
  }

  // Escape closes the confirm dialog
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !popup.classList.contains("hidden")) {
      popup.classList.add("hidden");
      selectedBooking = null;
    }
  });

  if (closePopup) {
    closePopup.addEventListener("click", () => {
      popup.classList.add("hidden");
      selectedBooking = null;
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("Assets/PHP/logout.php", {
          method: "POST",
        });
        const result = await response.json();
        if (result.success) {
          redirectWithMessage("Login.html", "logged_out");
        } else {
          showToast("We couldn't log you out. Please try again.", "error");
        }
      } catch (err) {
        console.error("Logout error:", err);
        showToast("We couldn't reach the server. Please try again in a moment.", "error");
      }
    });
  }

  updateUserInfo();
  fetchBookingsFromServer();
});
