<?php
/* =========================================================
   api/db.php — shared database helper
   ---------------------------------------------------------
   cycology_config()  → the array from api/config.php (or an
                        empty array when that file is absent).
   cycology_db()      → a PDO handle, or NULL when the database
                        isn't configured or can't be reached.

   Returning NULL rather than throwing is deliberate: the
   contact form must still send email on a host where the
   database was never set up.
   ========================================================= */

function cycology_config() {
    static $config = null;
    if ($config !== null) return $config;

    $config = array();
    $file = __DIR__ . '/config.php';
    if (is_readable($file)) {
        $loaded = require $file;
        if (is_array($loaded)) $config = $loaded;
    }
    return $config;
}

function cycology_db() {
    static $db = false;                 // false = not tried yet, null = unavailable
    if ($db !== false) return $db;

    $c = cycology_config();
    if (empty($c['dsn']) && empty($c['db_name'])) return $db = null;

    try {
        // 'dsn' overrides the MySQL DSN (e.g. "sqlite:/path/dev.db" locally).
        $dsn = !empty($c['dsn']) ? $c['dsn']
             : 'mysql:host=' . $c['db_host'] . ';dbname=' . $c['db_name'] . ';charset=utf8mb4';
        $db = new PDO($dsn, isset($c['db_user']) ? $c['db_user'] : null,
                            isset($c['db_pass']) ? $c['db_pass'] : null, array(
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ));
    } catch (PDOException $e) {
        $db = null;
    }
    return $db;
}

/**
 * True when the caller is an administrator, by either route:
 *
 *   1. a signed-in dashboard session (pages/admin-login.html), or
 *   2. the admin_token from api/config.php, sent as an X-Admin-Token
 *      header or ?token= — kept for scripts, curl and older bookmarks.
 */
function cycology_is_admin() {
    // ---- 1. dashboard session ----
    if (session_status() !== PHP_SESSION_ACTIVE) {
        // Match the cookie settings in api/auth.php so we read the same session.
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
               || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
        if (PHP_VERSION_ID >= 70300) {
            session_set_cookie_params(array(
                'lifetime' => 0, 'path' => '/', 'httponly' => true,
                'secure' => $secure, 'samesite' => 'Strict',
            ));
        } else {
            session_set_cookie_params(0, '/; SameSite=Strict', '', $secure, true);
        }
        session_name('cycology_admin');
        // Don't start a brand-new session for anonymous visitors — only read
        // one that already exists, so public page views set no cookie.
        if (!empty($_COOKIE['cycology_admin'])) session_start();
    }
    if (!empty($_SESSION['admin_id'])) return true;

    // ---- 2. token ----
    $c = cycology_config();
    if (empty($c['admin_token']) || $c['admin_token'] === 'CHANGE-ME-TO-A-LONG-RANDOM-STRING') return false;

    $token = '';
    if (isset($_SERVER['HTTP_X_ADMIN_TOKEN'])) $token = $_SERVER['HTTP_X_ADMIN_TOKEN'];
    elseif (isset($_GET['token']))             $token = $_GET['token'];

    return hash_equals((string)$c['admin_token'], (string)$token);
}
