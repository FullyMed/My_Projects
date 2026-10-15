<?php
// Booking business rules — the single server-side source for booking.php and
// the staff endpoints. Keep in sync with Booking.js, Booking.html, and the
// booking section (§4) of Terms-of-Use.html.
const TABLE_COUNT      = 4;       // bookings that may overlap at any moment (one booking = one table)
const MAX_PEOPLE       = 8;       // per booking / table
const OPEN_TIME        = "12:00";
const CLOSE_TIME       = "22:00";
const MAX_DAYS_AHEAD   = 30;      // latest bookable date = today + this many days
const MAX_UPCOMING     = 3;       // bookings per account that haven't ended yet
const CANCEL_LIMIT     = 2;       // customer self-cancellations per calendar month
