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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

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
    alert("You are not logged in. Redirecting to login page...");
    window.location.href = "Login.html";
    return;
  }

  dashboardLoadingState?.classList.add("hidden");
  dashboardContainer?.classList.remove("hidden");

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
    return `
      <div class="booking-card">
        <p><strong>Date:</strong> ${escapeHtml(b.date)}</p>
        <p><strong>Time:</strong> ${escapeHtml(b.start_time)} - ${escapeHtml(b.end_time)}</p>
        <p><strong>People:</strong> ${escapeHtml(b.people)}</p>
        ${withCancel ? `<button class="cancelBtn" data-id="${escapeHtml(b.id)}" style="margin-top:10px;">Cancel</button>` : ""}
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
        upcomingContainer.innerHTML = "<p>Error fetching bookings.</p>";
        historyContainer.innerHTML = "";
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      upcomingContainer.innerHTML = "<p>Server error.</p>";
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
      ? "<p>No upcoming bookings.</p>"
      : upcomingBookings.map(b => bookingCard(b, new Date(`${b.date}T${b.start_time}`) > now)).join("");

    // Most recent first
    historyContainer.innerHTML = history.length === 0
      ? "<p>No past bookings found.</p>"
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
    } else {
      alert(`You have reached the cancel limit (${cancelLimit}/month). Cannot cancel more bookings.`);
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
            avatarMsg.innerHTML = `<p style="color:green;">Avatar updated successfully!</p>`;
            setTimeout(() => avatarMsg.innerHTML = "", 3000);
          } else {
            avatarMsg.innerHTML = `<p style="color:red;">${escapeHtml(result.error || "Failed to update avatar.")}</p>`;
          }
        } catch (err) {
          console.error("Avatar update error:", err);
          clearButtonLoading(submitBtn);
          avatarMsg.innerHTML = `<p style="color:red;">Server error.</p>`;
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
          alert("Booking cancelled successfully.");
        } else {
          alert("Failed to cancel booking: " + (result.error || "Unknown error."));
        }
        fetchBookingsFromServer();
      } catch (err) {
        console.error("Cancel booking error:", err);
        clearButtonLoading(confirmCancel);
        alert("Server error.");
      }
    });
  }

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
          alert("You have been logged out.");
          window.location.href = "Login.html";
        } else {
          alert("Logout failed.");
        }
      } catch (err) {
        console.error("Logout error:", err);
        alert("Server error during logout.");
      }
    });
  }

  updateUserInfo();
  fetchBookingsFromServer();
});
