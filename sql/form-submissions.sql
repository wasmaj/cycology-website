-- =========================================================
-- form-submissions.sql — stores every contact / membership
-- form submission so nothing is lost if an email goes astray.
-- ---------------------------------------------------------
-- Run this once in cPanel → phpMyAdmin (select your database,
-- open the "SQL" tab, paste, click "Go").
--
-- Written by  /api/send-form.php
-- Read by     /api/submissions.php  →  /pages/admin-submissions.html
-- =========================================================

CREATE TABLE IF NOT EXISTS `form_submissions` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `form`       VARCHAR(40)  NOT NULL,                  -- 'contact' or 'membership'
  `name`       VARCHAR(200) NOT NULL DEFAULT '',       -- pulled out for the admin list
  `email`      VARCHAR(200) NOT NULL DEFAULT '',
  `phone`      VARCHAR(60)  NOT NULL DEFAULT '',
  `data`       MEDIUMTEXT   NOT NULL,                  -- every submitted field, as JSON
  `emailed`    TINYINT(1)   NOT NULL DEFAULT 0,        -- 0 = the email failed to send
  `ip`         VARCHAR(45)  NOT NULL DEFAULT '',
  `page`       VARCHAR(300) NOT NULL DEFAULT '',       -- which page it was sent from
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_submissions_form_date` (`form`, `created_at`),
  KEY `ix_submissions_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
