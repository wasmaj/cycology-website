-- =========================================================
-- publications.sql — Cycology publications (blog / news) table
-- ---------------------------------------------------------
-- Run this once in cPanel → phpMyAdmin (select your database,
-- open the "SQL" tab, paste, click "Go").
--
-- The table is managed by /api/publications.php (CRUD) and the
-- admin screen at /pages/admin-publications.html.
-- =========================================================

CREATE TABLE IF NOT EXISTS `publications` (
  `id`           INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `title`        VARCHAR(200)     NOT NULL,
  `slug`         VARCHAR(220)     NOT NULL,                 -- URL-safe id, e.g. "post-covid-green-recovery"
  `excerpt`      VARCHAR(500)     NOT NULL DEFAULT '',      -- short teaser shown on the card
  `body`         MEDIUMTEXT       NULL,                     -- full article (plain text / HTML)
  `cover_image`  VARCHAR(300)     NOT NULL DEFAULT '',      -- path relative to site root, e.g. images/gallery/x/photo-001.jpg
  `author`       VARCHAR(120)     NOT NULL DEFAULT 'Cycology',
  `status`       ENUM('draft','published') NOT NULL DEFAULT 'draft',
  `published_at` DATE             NULL,                     -- date shown on the card
  `created_at`   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_publications_slug` (`slug`),
  KEY `ix_publications_status_date` (`status`, `published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: seed with the posts that used to be hard-coded in pages/blog.html.
-- INSERT IGNORE skips any slug that already exists, so it is safe to re-run.
INSERT IGNORE INTO `publications`
  (`title`, `slug`, `excerpt`, `cover_image`, `status`, `published_at`) VALUES
  ('Cycology Club Donates Bicycle to Accident Victim', 'cycology-donates-bicycle-to-accident-victim',
   'The club rallies behind a road accident survivor — putting them back on two wheels with a fully fitted bike and helmet.',
   'images/gallery/amazon-ride-2023/photo-010.jpg', 'published', '2020-11-22'),
  ('Cycology Club Canvasses Bicycle Lanes on Existing Roads', 'cycology-canvasses-bicycle-lanes',
   'Our policy push for dedicated cycling infrastructure in Lagos — and why every kilometre of bike lane saves lives.',
   'images/gallery/cycology-amazon-crit-2025/photo-001.jpg', 'published', '2020-11-23'),
  ('Lagos Residents with HIV Get NNPC, Others'' Intervention', 'lagos-residents-with-hiv-get-nnpc-intervention',
   'How the club joined a wider effort to support vulnerable Lagosians through the pandemic.',
   'images/gallery/amazon-ride-2023/photo-014.jpg', 'published', '2020-11-23'),
  ('Post Covid-19 Green Recovery', 'post-covid-19-green-recovery',
   'Cycling club advocates implementation of the non-motorised transport policy as part of a green recovery.',
   'images/gallery/cycology-amazon-crit-2025/photo-006.jpg', 'published', '2020-11-23'),
  ('Cape Argus — Let The Games Begin', 'cape-argus-let-the-games-begin',
   'A Cycology rider''s perspective on lining up for the Cape Town Cycle Tour.',
   'images/gallery/amazon-ride-2023/photo-007.jpg', 'published', '2020-07-05'),
  ('In the Zone', 'in-the-zone',
   'Finding flow on the long ride — and what training in zones really means for everyday cyclists.',
   'images/gallery/amazon-ride-2023/photo-009.jpg', 'published', '2020-07-05'),
  ('Is There Not a Cause?', 'is-there-not-a-cause',
   'Why cycling, for many of us, is never just about the bike.',
   'images/gallery/cycology-amazon-crit-2025/photo-012.jpg', 'published', '2020-07-05'),
  ('How Good Are These Guys Anyway?', 'how-good-are-these-guys-anyway',
   'A frank look at the Cycology peloton from a first-timer''s perspective.',
   'images/gallery/amazon-ride-2023/photo-022.jpg', 'published', '2020-06-30');
