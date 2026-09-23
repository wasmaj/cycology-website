<?php
/* =========================================================
   api/auth.php — admin sign-in for the Cycology dashboard
   ---------------------------------------------------------
   Replaces pasting a raw token into every admin page: you sign
   in once and a normal PHP session cookie carries you across
   the dashboard, publications and form submissions.

     GET  ?action=me         who am I? (also reports needs_setup)
     POST {action:"login",  username, password}
     POST {action:"logout"}
     POST {action:"setup",  username, password, token}
     POST {action:"password", current, password}

   FIRST RUN: when `admin_users` is empty, "setup" creates the
   first account. It requires the `admin_token` from
   api/config.php, which proves the caller can read files on the
   server — so a passer-by can't claim the empty account.

   Tables: sql/admin-users.sql
   ========================================================= */

require_once __DIR__ . '/db.php';

// ---------- session cookie ----------
// Strict SameSite means the cookie is never sent from another site, which
// is what stops cross-site request forgery against these endpoints.
if (session_status() !== PHP_SESSION_ACTIVE) {
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
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function fail($message, $code = 400, $extra = array()) {
    respond(array_merge(array('error' => $message), $extra), $code);
}

$db = cycology_db();
if (!$db) fail('Database not configured — see README §5', 500);

$tablesReady = true;
try { $db->query('SELECT 1 FROM admin_users LIMIT 1'); }
catch (PDOException $e) { $tablesReady = false; }

$method = strtoupper($_SERVER['REQUEST_METHOD']);
$in = array();
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $in  = json_decode($raw, true);
    if (!is_array($in)) $in = $_POST;
}
$action = isset($_GET['action']) ? $_GET['action'] : (isset($in['action']) ? $in['action'] : '');

function current_user($db) {
    if (empty($_SESSION['admin_id'])) return null;
    $st = $db->prepare('SELECT id, username, name, email, last_login_at FROM admin_users WHERE id = ? LIMIT 1');
    $st->execute(array($_SESSION['admin_id']));
    $u = $st->fetch();
    if (!$u) { unset($_SESSION['admin_id']); return null; }
    return $u;
}

function user_count($db) {
    try { return (int)$db->query('SELECT COUNT(*) FROM admin_users')->fetchColumn(); }
    catch (PDOException $e) { return 0; }
}

// ---------- brute-force throttle ----------
define('LOCKOUT_MINUTES', 15);
define('MAX_ATTEMPTS', 10);

function attempt_count($db, $ip) {
    try {
        $st = $db->prepare('SELECT COUNT(*) FROM admin_login_attempts
                            WHERE ip = ? AND created_at > ?');
        $st->execute(array($ip, date('Y-m-d H:i:s', time() - LOCKOUT_MINUTES * 60)));
        return (int)$st->fetchColumn();
    } catch (PDOException $e) { return 0; }
}
function record_attempt($db, $ip, $username) {
    try {
        $db->prepare('INSERT INTO admin_login_attempts (ip, username) VALUES (?, ?)')
           ->execute(array($ip, mb_substr($username, 0, 60)));
        // Housekeeping: drop anything outside the window.
        $db->prepare('DELETE FROM admin_login_attempts WHERE created_at < ?')
           ->execute(array(date('Y-m-d H:i:s', time() - LOCKOUT_MINUTES * 60)));
    } catch (PDOException $e) { /* throttling is best-effort */ }
}
function clear_attempts($db, $ip) {
    try { $db->prepare('DELETE FROM admin_login_attempts WHERE ip = ?')->execute(array($ip)); }
    catch (PDOException $e) {}
}

$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';

// =========================================================
//  WHO AM I
// =========================================================
if ($action === 'me' || $action === '') {
    if (!$tablesReady) {
        respond(array('user' => null, 'needs_setup' => true,
                      'error' => 'The admin_users table is missing — run sql/admin-users.sql in phpMyAdmin'));
    }
    $u = current_user($db);
    respond(array('user' => $u, 'needs_setup' => user_count($db) === 0));
}

if ($method !== 'POST') fail('Method not allowed', 405);

// =========================================================
//  FIRST-RUN SETUP
// =========================================================
if ($action === 'setup') {
    if (!$tablesReady) fail('The admin_users table is missing — run sql/admin-users.sql in phpMyAdmin', 500);
    if (user_count($db) > 0) fail('An admin account already exists — sign in instead', 409);

    $config = cycology_config();
    $token  = isset($in['token']) ? (string)$in['token'] : '';
    if (empty($config['admin_token']) || $config['admin_token'] === 'CHANGE-ME-TO-A-LONG-RANDOM-STRING') {
        fail('Set a real admin_token in api/config.php first', 500);
    }
    if (!hash_equals((string)$config['admin_token'], $token)) {
        usleep(300000);
        fail('That setup token is wrong — it is the admin_token in api/config.php', 401);
    }

    $username = trim(isset($in['username']) ? (string)$in['username'] : '');
    $password = isset($in['password']) ? (string)$in['password'] : '';
    $errors = array();
    if (!preg_match('/^[A-Za-z0-9._-]{3,60}$/', $username)) {
        $errors['username'] = 'Use 3–60 letters, digits, dot, dash or underscore';
    }
    if (strlen($password) < 10) $errors['password'] = 'Use at least 10 characters';
    if ($errors) fail('Please check the form', 422, array('fields' => $errors));

    $st = $db->prepare('INSERT INTO admin_users (username, password_hash, name, email) VALUES (?, ?, ?, ?)');
    $st->execute(array(
        $username,
        password_hash($password, PASSWORD_DEFAULT),
        mb_substr(trim(isset($in['name']) ? (string)$in['name'] : ''), 0, 120),
        mb_substr(trim(isset($in['email']) ? (string)$in['email'] : ''), 0, 200),
    ));

    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int)$db->lastInsertId();
    respond(array('ok' => true, 'user' => current_user($db)), 201);
}

// =========================================================
//  LOGIN
// =========================================================
if ($action === 'login') {
    if (!$tablesReady) fail('The admin_users table is missing — run sql/admin-users.sql in phpMyAdmin', 500);

    if (attempt_count($db, $ip) >= MAX_ATTEMPTS) {
        fail('Too many failed attempts. Please wait ' . LOCKOUT_MINUTES . ' minutes and try again.', 429);
    }

    $username = trim(isset($in['username']) ? (string)$in['username'] : '');
    $password = isset($in['password']) ? (string)$in['password'] : '';

    $st = $db->prepare('SELECT * FROM admin_users WHERE username = ? LIMIT 1');
    $st->execute(array($username));
    $u = $st->fetch();

    // Always spend roughly the same time whether or not the user exists, so
    // the response time doesn't reveal which usernames are real.
    $hash = $u ? $u['password_hash'] : '$2y$10$usesomesillystringforsaltusesomesillystringfore.';
    $ok   = password_verify($password, $hash) && $u;

    if (!$ok) {
        record_attempt($db, $ip, $username);
        usleep(300000);
        fail('Wrong username or password', 401);
    }

    // Upgrade the stored hash if PHP's default cost/algorithm has moved on.
    if (password_needs_rehash($u['password_hash'], PASSWORD_DEFAULT)) {
        $db->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
           ->execute(array(password_hash($password, PASSWORD_DEFAULT), $u['id']));
    }

    clear_attempts($db, $ip);
    session_regenerate_id(true);                  // new id on privilege change
    $_SESSION['admin_id'] = (int)$u['id'];
    $db->prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?')
       ->execute(array(date('Y-m-d H:i:s'), $u['id']));

    respond(array('ok' => true, 'user' => current_user($db)));
}

// =========================================================
//  LOGOUT
// =========================================================
if ($action === 'logout') {
    $_SESSION = array();
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    respond(array('ok' => true));
}

// =========================================================
//  CHANGE PASSWORD
// =========================================================
if ($action === 'password') {
    $u = current_user($db);
    if (!$u) fail('Please sign in', 401);

    $st = $db->prepare('SELECT password_hash FROM admin_users WHERE id = ?');
    $st->execute(array($u['id']));
    $hash = $st->fetchColumn();

    $current = isset($in['current']) ? (string)$in['current'] : '';
    $next    = isset($in['password']) ? (string)$in['password'] : '';

    if (!password_verify($current, $hash)) {
        usleep(300000);
        fail('Your current password is wrong', 422, array('fields' => array('current' => 'Wrong password')));
    }
    if (strlen($next) < 10) {
        fail('Please check the form', 422, array('fields' => array('password' => 'Use at least 10 characters')));
    }

    $db->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
       ->execute(array(password_hash($next, PASSWORD_DEFAULT), $u['id']));
    respond(array('ok' => true));
}

fail('Unknown action');
