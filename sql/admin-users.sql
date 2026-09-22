-- =========================================================
-- admin-users.sql — accounts for the Cycology admin dashboard
-- ---------------------------------------------------------
-- Run this once in cPanel → phpMyAdmin (select your database,
-- open the "SQL" tab, paste, click "Go").
--
-- NO account is created here on purpose — shipping a default
-- password would be a way in for anyone who reads this file.
-- Instead, the first time you open /pages/admin-login.html it
-- offers to create the first account; you confirm you own the
-- server by pasting the `admin_token` from api/config.php.
--
-- Passwords are stored as bcrypt hashes (PHP password_hash),
-- never as plain text.
-- =========================================================

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(60)  NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name`          VARCHAR(120) NOT NULL DEFAULT '',
  `email`         VARCHAR(200) NOT NULL DEFAULT '',
  `last_login_at` DATETIME     NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Failed sign-in attempts, so the login can slow down anyone
-- guessing passwords. Rows older than the lockout window are
-- cleaned up automatically by api/auth.php.
CREATE TABLE IF NOT EXISTS `admin_login_attempts` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip`         VARCHAR(45)  NOT NULL,
  `username`   VARCHAR(60)  NOT NULL DEFAULT '',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_attempts_ip_time` (`ip`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
