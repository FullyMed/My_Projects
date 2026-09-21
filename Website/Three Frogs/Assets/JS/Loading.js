// ================================
// Shared button loading-state helpers
// Included on every page with a form that makes an async request.
// ================================

function setButtonLoading(button, loadingText) {
  if (!button || button.dataset.loading === "true") return;
  button.dataset.loading = "true";
  button.dataset.originalHtml = button.innerHTML;
  button.disabled = true;
  button.classList.add("btn-loading");
  button.innerHTML = `<span class="spinner spinner-sm" aria-hidden="true"></span>${loadingText}`;
}

function clearButtonLoading(button) {
  if (!button) return;
  button.disabled = false;
  button.classList.remove("btn-loading");
  if (button.dataset.originalHtml !== undefined) {
    button.innerHTML = button.dataset.originalHtml;
  }
  delete button.dataset.loading;
  delete button.dataset.originalHtml;
}
