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
    // Required (as an "X-Admin-Token" header) for create / update / delete.
    // Reads are public. Use a long random string, e.g. run:
    //   php -r "echo bin2hex(random_bytes(24));"
    'admin_token' => 'CHANGE-ME-TO-A-LONG-RANDOM-STRING',
);
