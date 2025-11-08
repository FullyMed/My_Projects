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
    editAvatarBtn.addEventListener("click", () => {
      avatarChangeContainer.classList.toggle("hidden");
    });
  }

  const currentAvatar = document.getElementById("currentAvatar");

  let loggedInUser = null;
  let allBookings = [];
  let selectedBooking = null;
  let remainingCancels = 2;

  async function checkSession() {
    try {
      const response = await fetch("Assets/PHP/check_session.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const result = await response.json();
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

  function updateUserInfo() {
    document.getElementById("currentAvatar").src = loggedInUser.avatar;
    userInfo.innerHTML = `
      <p><strong>Name:</strong> ${loggedInUser.name}</p>
      <p><strong>Email:</strong> ${loggedInUser.email}</p>
    `;
    if (currentAvatar) currentAvatar.src = loggedInUser.avatar;
  }

  async function fetchBookingsFromServer() {
    try {

      const response = await fetch("Assets/PHP/get_bookings.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loggedInUser.email })
      });      

      const result = await response.json();
      if (result.success) {
        allBookings = result.bookings;
        remainingCancels = result.remaining_cancels ?? 2;
        renderBookings();
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

  function renderBookings() {
    const now = new Date();
    const userBookings = allBookings;
    const upcoming = [], history = [];

    userBookings.forEach(b => {
      const bookingDateTime = new Date(`${b.date}T${b.end_time}`);
      if (bookingDateTime > now) upcoming.push(b);
      else history.push(b);
    });

    upcomingContainer.innerHTML = upcoming.length === 0 ? "<p>No upcoming bookings.</p>" : "";
    upcoming.forEach((b, index) => {
      const card = document.createElement("div");
      card.className = "booking-card";
      card.innerHTML = `
        <p><strong>Date:</strong> ${b.date}</p>
        <p><strong>Time:</strong> ${b.start_time} - ${b.end_time}</p>
        <p><strong>People:</strong> ${b.people}</p>
        <button class="cancelBtn" data-index="${index}" style="margin-top:10px;">Cancel</button>
      `;
      upcomingContainer.appendChild(card);
    });

    document.querySelectorAll(".cancelBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        selectedBooking = upcoming[idx];

        if (remainingCancels > 0) {
          cancelText.textContent = `Are you sure? Cancel Remaining ${remainingCancels}/2`;
          popup.classList.remove("hidden");
        } else {
          alert("You have reached the cancel limit (2/month). Cannot cancel more bookings.");
        }
      });
    });

    historyContainer.innerHTML = history.length === 0
      ? "<p>No past bookings found.</p>"
      : history.map(b => `
        <div class="booking-card">
          <p><strong>Date:</strong> ${b.date}</p>
          <p><strong>Time:</strong> ${b.start_time} - ${b.end_time}</p>
          <p><strong>People:</strong> ${b.people}</p>
        </div>
      `).join("");
  }

  // Avatar change
  if (changeAvatarForm) {
    changeAvatarForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newAvatar = document.querySelector('input[name="newAvatar"]:checked')?.value;
      if (newAvatar) {
        const formData = new FormData();
        formData.append("avatar", newAvatar);
        try {
          const response = await fetch("Assets/PHP/update_avatar.php", {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          if (result.success) {
            loggedInUser.avatar = newAvatar;
            updateUserInfo();
            avatarMsg.innerHTML = `<p style="color:green;">Avatar updated successfully!</p>`;
            setTimeout(() => avatarMsg.innerHTML = "", 3000);
          } else {
            avatarMsg.innerHTML = `<p style="color:red;">${result.error}</p>`;
          }
        } catch (err) {
          console.error("Avatar update error:", err);
          avatarMsg.innerHTML = `<p style="color:red;">Server error.</p>`;
        }
      }
    });
  }

  // Confirm Cancel
  if (confirmCancel) {
    confirmCancel.addEventListener("click", async () => {
      try {
        const res = await fetch("Assets/PHP/cancel_booking.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: loggedInUser.email,
            date: selectedBooking.date,
            start: selectedBooking.start_time,
            end: selectedBooking.end_time
          })
        });        

        const result = await res.json();
        if (result.success) {
          popup.classList.add("hidden");
          remainingCancels--;
          fetchBookingsFromServer();
          alert("Booking cancelled successfully.");
        } else {
          alert("Failed to cancel booking: " + result.error);
        }
      } catch (err) {
        console.error("Cancel booking error:", err);
        alert("Server error.");
      }
    });
  }

  if (closePopup) {
    closePopup.addEventListener("click", () => {
      popup.classList.add("hidden");
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