document.addEventListener("DOMContentLoaded", async () => {
  const bookingForm = document.getElementById("bookingForm");
  const popup = document.getElementById("authPopup");
  const bookingResult = document.getElementById("bookingResult");

  async function checkSession() {
    try {
      const response = await fetch("Assets/PHP/check_session.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const result = await response.json();
      return result.loggedIn ? result.user : null;
    } catch (error) {
      console.error("Session check failed:", error);
      return null;
    }
  }

  const currentUser = await checkSession();

  if (!currentUser && bookingForm) {
    bookingForm.style.display = "none";
    popup.classList.remove("hidden");
    return;
  }

  if (bookingForm && currentUser) {
    const emailField = document.getElementById("email");
    if (emailField) {
      emailField.value = currentUser.email;
      emailField.readOnly = true;
    }

    bookingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const date = document.getElementById("date").value;
      const start = document.getElementById("start-time").value;
      const end = document.getElementById("end-time").value;
      const people = document.getElementById("people").value;

      const openTime = "12:00";
      const closeTime = "22:00";
      const today = new Date().toLocaleDateString("en-CA");

      if (date < today) {
        bookingResult.innerHTML = `<p style="color:red;"><strong>Booking date cannot be in the past.</strong></p>`;
        return;
      }

      if (end <= start) {
        bookingResult.innerHTML = `<p style="color:red;"><strong>End time must be later than start time.</strong></p>`;
        return;
      }

      if (start < openTime || end > closeTime) {
        bookingResult.innerHTML = `<p style="color:red;"><strong>Booking must be between 12:00 and 22:00.</strong></p>`;
        return;
      }

      if (isNaN(people) || people <= 0) {
        bookingResult.innerHTML = `<p style="color:red;"><strong>Number of people must be a positive number.</strong></p>`;
        return;
      }      

      try {
        const response = await fetch("Assets/PHP/booking.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: currentUser.email,
            date,
            start,
            end,
            people
          })
        });

        const result = await response.json();

        if (result.success) {
          bookingResult.innerHTML = `
            <h3>Booking Confirmed!</h3>
            <p>Thank you, <strong>${name}</strong>.</p>
            <p>Your booking on <strong>${date}</strong> from <strong>${start}</strong> to <strong>${end}</strong> for <strong>${people} people</strong> is received.</p>
            <p>We've sent a confirmation to <strong>${currentUser.email}</strong>.</p>
          `;
          bookingForm.reset();
        } else {
          bookingResult.innerHTML = `<p style="color:red;">${result.error}</p>`;
        }
      } catch (error) {
        console.error("Booking error:", error);
        bookingResult.innerHTML = `<p style="color:red;">Server error. Please try again later.</p>`;
      }
    });
  }
});