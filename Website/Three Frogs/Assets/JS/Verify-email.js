// Verify-email.html — opened from the link in the verification email
// (Verify-email.html?token=...). POSTs the token to verify_email.php.
document.addEventListener("DOMContentLoaded", async () => {
  const loadingState = document.getElementById("verifyLoadingState");
  const resultBox = document.getElementById("verifyResult");
  const token = new URLSearchParams(window.location.search).get("token");

  function show(html) {
    loadingState.classList.add("hidden");
    resultBox.innerHTML = html;
  }

  if (!token) {
    show(`<p class="form-error">This verification link is incomplete. Please open the link from your email again.</p>`);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("token", token);
    const response = await fetch("Assets/PHP/verify_email.php", { method: "POST", body: formData });
    const result = await response.json();

    if (result.success) {
      show(`
        <h3>Email verified!</h3>
        <p>Thanks! Your account is all set, and you can book a table now.</p>
        <p><a href="Booking.html" class="see-more-button">Book a table</a></p>
      `);
    } else {
      show(`
        <p class="form-error">${escapeHtml(result.error || "This verification link didn't work.")}</p>
        <p><a href="Dashboard.html">Go to your Dashboard</a></p>
      `);
    }
  } catch (err) {
    console.error("Verify email error:", err);
    show(`<p class="form-error">We couldn't reach the server. Try the link again in a moment.</p>`);
  }
});
