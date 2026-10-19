// Staff.html — every booking for one date, with café-initiated cancellation.
// Access is decided by the server (staff_bookings.php checks users.is_staff
// in the DB), not by the session's isStaff flag, so a newly granted or
// revoked staff role is respected immediately.
document.addEventListener("DOMContentLoaded", async () => {
  const loadingState = document.getElementById("staffLoadingState");
  const deniedSection = document.getElementById("staffDenied");
  const panel = document.getElementById("staffPanel");
  const dateInput = document.getElementById("staffDate");
  const summary = document.getElementById("staffSummary");
  const hoursGrid = document.getElementById("staffHours");
  const list = document.getElementById("staffBookings");
  const popup = document.getElementById("staffCancelPopup");
  const popupText = document.getElementById("staffCancelText");
  const reasonInput = document.getElementById("staffCancelReason");
  const confirmBtn = document.getElementById("staffConfirmCancel");

  let csrfToken = null;
  let bookings = [];
  let selected = null;

  async function checkSession() {
    try {
      const response = await fetch("Assets/PHP/check_session.php", { method: "POST" });
      const result = await response.json();
      csrfToken = result.csrfToken || null;
      return result.loggedIn ? result.user : null;
    } catch (err) {
      console.error("Session check failed:", err);
      return null;
    }
  }

  // Dates as local YYYY-MM-DD strings (no UTC shifting)
  function toISO(d) { return d.toLocaleDateString("en-CA"); }
  function shiftDate(iso, days) {
    const [y, m, d] = iso.split("-").map(Number);
    return toISO(new Date(y, m - 1, d + days));
  }
  function prettyDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  const user = await checkSession();
  if (!user) {
    redirectWithMessage("Login.html", "login_required", "Staff.html");
    return;
  }

  // Returns false if the server says this account isn't staff.
  async function loadDate(iso) {
    dateInput.value = iso;
    list.innerHTML = `<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Loading bookings…</div>`;

    const response = await fetch("Assets/PHP/staff_bookings.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: iso })
    });
    const result = await response.json();

    if (response.status === 401 || response.status === 403) return false;
    if (!result.success) {
      list.innerHTML = `<p>${escapeHtml(result.error || "We couldn't load the bookings.")}</p>`;
      return true;
    }

    bookings = result.bookings;
    const t = result.totals;
    summary.textContent = `${prettyDate(iso)}: ${t.bookings} booking${t.bookings === 1 ? "" : "s"}, ${t.people} ${t.people === 1 ? "person" : "people"}`;

    hoursGrid.innerHTML = Object.entries(result.hourly).map(([hour, used]) => `
      <div class="staff-hour${used >= result.tableCount ? " is-full" : ""}">
        ${escapeHtml(hour)}
        <strong>${used}/${result.tableCount}</strong>
      </div>
    `).join("");

    list.innerHTML = bookings.length === 0
      ? "<p>No bookings for this date.</p>"
      : bookings.map(b => {
          const cancelled = b.status === "cancelled_by_cafe";
          const differentName = b.account_name && b.account_name !== b.name;
          return `
            <div class="booking-card${cancelled ? " is-cancelled" : ""}">
              <p><strong>${escapeHtml(b.start_time)} - ${escapeHtml(b.end_time)}</strong> · ${escapeHtml(b.people)} ${Number(b.people) === 1 ? "person" : "people"}</p>
              <p><strong>Name:</strong> ${escapeHtml(b.name)}${differentName ? ` <span class="text-muted">(account: ${escapeHtml(b.account_name)})</span>` : ""}</p>
              <p><strong>Email:</strong> <a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></p>
              ${cancelled ? `<span class="status-badge">Cancelled by the café</span>` : ""}
              ${!cancelled && b.not_ended ? `<button class="cancelBtn" data-id="${escapeHtml(b.id)}">Cancel booking</button>` : ""}
            </div>
          `;
        }).join("");
    return true;
  }

  async function safeLoad(iso) {
    try {
      return await loadDate(iso);
    } catch (err) {
      console.error("Staff bookings error:", err);
      list.innerHTML = "<p>We couldn't reach the server. Please try again in a moment.</p>";
      return true;
    }
  }

  const allowed = await safeLoad(toISO(new Date()));
  loadingState.classList.add("hidden");
  if (!allowed) {
    deniedSection.classList.remove("hidden");
    return;
  }
  panel.classList.remove("hidden");

  dateInput.addEventListener("change", () => { if (dateInput.value) safeLoad(dateInput.value); });
  document.getElementById("prevDayBtn").addEventListener("click", () => safeLoad(shiftDate(dateInput.value, -1)));
  document.getElementById("nextDayBtn").addEventListener("click", () => safeLoad(shiftDate(dateInput.value, 1)));
  document.getElementById("todayBtn").addEventListener("click", () => safeLoad(toISO(new Date())));

  list.addEventListener("click", e => {
    const btn = e.target.closest(".cancelBtn");
    if (!btn) return;
    selected = bookings.find(b => String(b.id) === btn.dataset.id);
    if (!selected) return;
    popupText.textContent = `${selected.name}, ${selected.start_time} - ${selected.end_time} (${selected.people} people). We'll email the customer, and it won't count toward their monthly cancellations.`;
    reasonInput.value = "";
    popup.classList.remove("hidden");
    document.getElementById("staffClosePopup").focus();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !popup.classList.contains("hidden")) {
      popup.classList.add("hidden");
      selected = null;
    }
  });

  document.getElementById("staffClosePopup").addEventListener("click", () => {
    popup.classList.add("hidden");
    selected = null;
  });

  confirmBtn.addEventListener("click", async () => {
    if (!selected) return;
    await checkSession(); // fresh CSRF token
    setButtonLoading(confirmBtn, "Cancelling...");
    try {
      const response = await fetch("Assets/PHP/staff_cancel_booking.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, reason: reasonInput.value, csrf_token: csrfToken })
      });
      const result = await response.json();
      clearButtonLoading(confirmBtn);
      popup.classList.add("hidden");
      selected = null;
      if (result.success) {
        showToast(result.emailSent
          ? "Booking cancelled. We've emailed the customer."
          : "Booking cancelled, but the email didn't go through. Please contact the customer yourself.",
          result.emailSent ? "success" : "error");
      } else {
        showToast(result.error || "Couldn't cancel the booking.", "error");
      }
      safeLoad(dateInput.value);
    } catch (err) {
      console.error("Staff cancel error:", err);
      clearButtonLoading(confirmBtn);
      showToast("We couldn't reach the server. Please try again in a moment.", "error");
    }
  });
});
