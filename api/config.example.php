<?php
/* =========================================================
   config.example.php — copy this file to api/config.php and
   fill in your real values. config.php is git-ignored so your
   credentials never end up in the repository.

   Find DB values in cPanel → MySQL® Databases. The DB user
   must be added to the database with ALL PRIVILEGES.
   ========================================================= */

return array(
    // ---- MySQL (cPanel → MySQL Databases) ----
    'db_host' => 'localhost',
    'db_name' => 'cpaneluser_cycology',
    'db_user' => 'cpaneluser_cycology',
    'db_pass' => 'CHANGE-ME',

    // ---- Admin token ----
    // Used twice:
    //   1. ONCE, to create the first dashboard account at
    //      /pages/admin-login.html (it proves you can read files here).
    //   2. As an "X-Admin-Token" header, for scripts and curl that can't
    //      sign in. Day-to-day admin work uses the dashboard login instead.
    // Use a long random string, e.g. run:
    //   php -r "echo bin2hex(random_bytes(24));"
    'admin_token' => 'CHANGE-ME-TO-A-LONG-RANDOM-STRING',

    // ---- Contact / membership form mailer (api/send-form.php) ----
    // Everything below is OPTIONAL — the mailer works without this file at
    // all. Set 'mail_from' to an address on your own domain; hosts reject or
    // spam-bin mail claiming to come from someone else's domain.
    // 'mail_from'      => 'no-reply@cycology.com.ng',
    // 'mail_from_name' => 'Cycology Website',
    //
    // Debugging only: write messages to this file instead of sending them.
    // Comment it out again once mail is working.
    // 'mail_log'       => __DIR__ . '/mail-debug.log',
);
