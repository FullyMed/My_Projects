-- One-time migration for databases created before 2026-10-15 (i.e. production).
-- Adds email verification + staff accounts. Fresh databases don't need this —
-- Data/schema.sql already includes everything below.
--
-- Run it ONCE, in phpMyAdmin → SQL, immediately before uploading the
-- 2026-10-15 PHP files (the new PHP reads these columns, so it can't go first;
-- any account created between running this and uploading the PHP would be
-- left unverified — they can verify via "Resend email" on their Dashboard).

-- 1. Email verification. Existing accounts are grandfathered in as verified,
--    so nobody who could book before this change is suddenly blocked.
ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL;
UPDATE users SET email_verified_at = NOW() WHERE email_verified_at IS NULL;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  token      VARCHAR(64)  NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  INDEX idx_token (token),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Staff accounts (Staff.html). Nobody is staff until you mark them:
--      UPDATE users SET is_staff = 1 WHERE email = 'staff-member@example.com';
--    They must log out and back in afterwards for the Staff link to appear.
ALTER TABLE users ADD COLUMN is_staff TINYINT(1) NOT NULL DEFAULT 0;
