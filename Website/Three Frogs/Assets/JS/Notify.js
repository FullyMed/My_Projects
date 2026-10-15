// ================================
// Shared UI helpers — included on every page, before every other script.
//   escapeHtml(value)          — for any text inserted via innerHTML
//   showToast(message, type)   — on-page message instead of alert(); type: "success" | "error" | "info"
//   redirectWithMessage(page, msgKey, next) — navigate, then show a message on arrival
//   safeNextPage()             — the ?next= page to return to after login, if it's one of ours
// ================================

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Messages that can be passed between pages as ?msg=<key> (never free text,
// so a crafted link can't put arbitrary words on the page).
const FLASH_MESSAGES = {
  login_required: ["Please log in to continue.", "info"],
  logged_out: ["You're logged out. See you soon!", "success"],
  session_error: ["We couldn't check your session. Please log in again.", "error"],
  password_reset: ["Password changed. Log in with your new one.", "success"]
};

function showToast(message, type = "info") {
  let region = document.getElementById("toastRegion");
  if (!region) {
    region = document.createElement("div");
    region.id = "toastRegion";
    region.className = "toast-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  region.appendChild(toast);

  // Errors stay a little longer so they can be read
  setTimeout(() => {
    toast.classList.add("toast-leaving");
    setTimeout(() => toast.remove(), 300);
  }, type === "error" ? 6000 : 4000);
}

// Only bare page names like "Booking.html" — never another site or a path.
function isSafePage(page) {
  return typeof page === "string" && /^[A-Za-z-]+\.html$/.test(page);
}

function redirectWithMessage(page, msgKey, next) {
  const params = new URLSearchParams();
  if (msgKey) params.set("msg", msgKey);
  if (next && isSafePage(next)) params.set("next", next);
  const query = params.toString();
  window.location.href = query ? `${page}?${query}` : page;
}

function safeNextPage() {
  const next = new URLSearchParams(window.location.search).get("next");
  return isSafePage(next) ? next : null;
}

function currentPageName() {
  const name = window.location.pathname.split("/").pop();
  return isSafePage(name) ? name : null;
}

// Show any ?msg= flash message, then drop it from the address bar so a
// refresh doesn't repeat it (?next= is kept for Login.js).
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("msg");
  if (!key) return;
  if (FLASH_MESSAGES[key]) showToast(...FLASH_MESSAGES[key]);
  params.delete("msg");
  const query = params.toString();
  history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);
});
