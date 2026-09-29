-- Three Frogs — full database schema.
--
-- Safe to re-run: every statement is CREATE TABLE IF NOT EXISTS, so running
-- this against a database that already has some of these tables (e.g. the
-- production DB, which predates password_reset_tokens and rate_limits) only
-- creates the missing ones and never touches existing data.
--
-- Not web-accessible: Data/.htaccess denies the whole folder, and the root
-- .htaccess also denies *.sql.

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  avatar     VARCHAR(255) NOT NULL DEFAULT 'Assets/Images/Avatars/Clam.jpg',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  date       DATE         NOT NULL,
  start_time TIME         NOT NULL,
  end_time   TIME         NOT NULL,
  people     INT          NOT NULL,
  status     VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date_status (date, status),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cancellations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  date        DATE         NOT NULL,
  start       TIME         NOT NULL,
  end         TIME         NOT NULL,
  cancel_time DATETIME     NOT NULL,
  INDEX idx_email_time (email, cancel_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  token      VARCHAR(64)  NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  INDEX idx_token (token),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rate_limits (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  action     VARCHAR(50)  NOT NULL,
  identifier VARCHAR(255) NOT NULL,
  created_at DATETIME     NOT NULL,
  INDEX idx_action_identifier_time (action, identifier, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
