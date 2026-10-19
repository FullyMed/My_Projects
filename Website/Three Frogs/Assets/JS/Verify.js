// ================================
// "Resend verification email" button — shared by Dashboard.html and Booking.html.
// Needs Notify.js (escapeHtml) and Loading.js loaded first.
// ================================

// getCsrfToken: async function returning a fresh CSRF token
// onVerified:   called if the server says the email is already verified
function wireResendVerification(button, resultEl, getCsrfToken, onVerified) {
  if (!button) return;

  button.addEventListener("click", async () => {
    setButtonLoading(button, "Sending...");
    resultEl.textContent = "";

    try {
      const formData = new FormData();
      formData.append("csrf_token", await getCsrfToken());
      const response = await fetch("Assets/PHP/resend_verification.php", { method: "POST", body: formData });
      const result = await response.json();
      clearButtonLoading(button);

      if (result.success && result.alreadyVerified) {
        if (onVerified) onVerified();
      } else if (result.success) {
        resultEl.innerHTML = `<span class="form-success">Sent. Check your inbox (and spam folder) for the new link.</span>`;
      } else {
        resultEl.innerHTML = `<span class="form-error">${escapeHtml(result.error || "We couldn't send the email.")}</span>`;
      }
    } catch (err) {
      console.error("Resend verification error:", err);
      clearButtonLoading(button);
      resultEl.innerHTML = `<span class="form-error">We couldn't reach the server. Please try again in a moment.</span>`;
    }
  });
}
