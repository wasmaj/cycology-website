<?php
/* =========================================================
   api/publications.php — Cycology publications CRUD
   ---------------------------------------------------------
   JSON endpoint that manages rows in the `publications` table
   (schema: sql/publications.sql). Used by the admin screen at
   pages/admin-publications.html; can also be called from the
   public blog page to list published posts.

   Endpoints (all return JSON):
     GET    /api/publications.php                → list (published only)
     GET    /api/publications.php?all=1          → list incl. drafts  [admin]
     GET    /api/publications.php?id=7           → one by id
     GET    /api/publications.php?slug=my-post   → one by slug
     POST   /api/publications.php                → create             [admin]
     PUT    /api/publications.php?id=7           → update             [admin]
     DELETE /api/publications.php?id=7           → delete             [admin]

   Bodies for POST/PUT are JSON:
     { "title": "...", "slug": "...", "excerpt": "...", "body": "...",
       "cover_image": "images/…", "author": "...",
       "status": "draft|published", "published_at": "YYYY-MM-DD" }
   Only `title` is required on create; the slug is derived from
   the title when omitted. PUT accepts any subset of fields.

   [admin] routes require the header  X-Admin-Token: <token>
   where <token> matches 'admin_token' in api/config.php.
   Hosts that strip custom headers can pass ?token=<token> or
   a `_method` field (POST + _method=PUT) instead.

   Runs on PHP 5.6+ / any cPanel host with PDO MySQL.
   ========================================================= */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// ---------- helpers ----------
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function fail($message, $code = 400, $extra = array()) {
    respond(array_merge(array('error' => $message), $extra), $code);
}
function slugify($text) {
    $s = strtolower(trim((string)$text));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    $s = trim($s, '-');
    return substr($s !== '' ? $s : 'post', 0, 200);
}
function read_json_body() {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return array();
    $data = json_decode($raw, true);
    if (!is_array($data)) fail('Request body must be a JSON object');
    return $data;
}

// ---------- config + DB ----------
$configFile = __DIR__ . '/config.php';
if (!is_readable($configFile)) {
    fail('api/config.php is missing — copy api/config.example.php and fill in your database details', 500);
}
$config = require $configFile;

try {
    // 'dsn' in config.php overrides the MySQL DSN (e.g. "sqlite:/path/dev.db" for local testing).
    $dsn = !empty($config['dsn']) ? $config['dsn']
         : 'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4';
    $db  = new PDO($dsn, $config['db_user'], $config['db_pass'], array(
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ));
} catch (PDOException $e) {
    fail('Database connection failed', 500);
}

// ---------- method + body ----------
$method = strtoupper($_SERVER['REQUEST_METHOD']);
$body   = in_array($method, array('POST', 'PUT', 'PATCH', 'DELETE'), true) ? read_json_body() : array();

// Allow POST + _method override for hosts that block PUT/DELETE.
if ($method === 'POST' && !empty($body['_method'])) {
    $method = strtoupper($body['_method']);
    unset($body['_method']);
}
if ($method === 'PATCH') $method = 'PUT';

// ---------- auth ----------
$token = '';
if (isset($_SERVER['HTTP_X_ADMIN_TOKEN']))   $token = $_SERVER['HTTP_X_ADMIN_TOKEN'];
elseif (isset($_GET['token']))               $token = $_GET['token'];
elseif (isset($body['_token']))              { $token = $body['_token']; unset($body['_token']); }

$isAdmin = ($config['admin_token'] !== ''
            && $config['admin_token'] !== 'CHANGE-ME-TO-A-LONG-RANDOM-STRING'
            && hash_equals((string)$config['admin_token'], (string)$token));

function require_admin() {
    global $isAdmin;
    if (!$isAdmin) fail('Unauthorized — a valid X-Admin-Token header is required', 401);
}

// ---------- validation ----------
$FIELDS = array('title', 'slug', 'excerpt', 'body', 'cover_image', 'author', 'status', 'published_at');

/** Normalise + validate incoming fields. Returns array(values, errors). */
function clean_fields($in, $isCreate) {
    global $FIELDS;
    $out = array(); $errors = array();

    foreach ($FIELDS as $f) {
        if (!array_key_exists($f, $in)) continue;
        $v = is_null($in[$f]) ? '' : trim((string)$in[$f]);

        switch ($f) {
            case 'title':
                if ($v === '')            $errors['title'] = 'Title is required';
                elseif (strlen($v) > 200) $errors['title'] = 'Title must be 200 characters or fewer';
                break;
            case 'slug':
                if ($v !== '') $v = slugify($v);
                break;
            case 'excerpt':
                if (strlen($v) > 500) $errors['excerpt'] = 'Excerpt must be 500 characters or fewer';
                break;
            case 'cover_image':
                $v = ltrim($v, '/');
                if (strlen($v) > 300 || strpos($v, '..') !== false) $errors['cover_image'] = 'Invalid image path';
                break;
            case 'author':
                if (strlen($v) > 120) $errors['author'] = 'Author must be 120 characters or fewer';
                break;
            case 'status':
                if (!in_array($v, array('draft', 'published'), true)) $errors['status'] = 'Status must be "draft" or "published"';
                break;
            case 'published_at':
                if ($v === '') { $v = null; break; }
                $d = DateTime::createFromFormat('Y-m-d', $v);
                if (!$d || $d->format('Y-m-d') !== $v) $errors['published_at'] = 'Date must be YYYY-MM-DD';
                break;
        }
        $out[$f] = $v;
    }

    if ($isCreate) {
        if (!isset($out['title']) && !isset($errors['title'])) $errors['title'] = 'Title is required';
        if (empty($out['slug']) && isset($out['title']))       $out['slug'] = slugify($out['title']);
        if (!isset($out['status']))                            $out['status'] = 'draft';
        if (!isset($out['author']) || $out['author'] === '')   $out['author'] = 'Cycology';
        if ($out['status'] === 'published' && empty($out['published_at'])) $out['published_at'] = date('Y-m-d');
    } elseif (isset($out['slug']) && $out['slug'] === '') {
        unset($out['slug']); // blank slug on update = keep the current one
    }
    return array($out, $errors);
}

function fetch_one($db, $column, $value) {
    $st = $db->prepare("SELECT * FROM publications WHERE $column = ? LIMIT 1");
    $st->execute(array($value));
    return $st->fetch();
}

/**
 * MySQL in non-strict mode silently truncates text that is longer than the
 * column allows (e.g. if `body` was created as VARCHAR(255) instead of
 * MEDIUMTEXT). Compare what we sent with what was stored and shout if they
 * differ, so the admin sees an error instead of a chopped article.
 */
function assert_not_truncated($sent, $stored) {
    foreach (array('body', 'excerpt', 'title') as $f) {
        if (!isset($sent[$f]) || $sent[$f] === null) continue;
        if (strlen((string)$stored[$f]) < strlen((string)$sent[$f])) {
            fail("The $f was cut short by the database (column too small). Run in phpMyAdmin: "
               . "ALTER TABLE publications MODIFY body MEDIUMTEXT NULL, MODIFY excerpt VARCHAR(500) NOT NULL DEFAULT '', MODIFY title VARCHAR(200) NOT NULL;", 500,
                 array('field' => $f, 'sent' => strlen($sent[$f]), 'stored' => strlen((string)$stored[$f])));
        }
    }
}

function id_from_request($body) {
    if (isset($_GET['id']))  return (int)$_GET['id'];
    if (isset($body['id']))  return (int)$body['id'];
    return 0;
}

// =========================================================
//  READ
// =========================================================
if ($method === 'GET') {
    if (isset($_GET['id']) || isset($_GET['slug'])) {
        $row = isset($_GET['id'])
             ? fetch_one($db, 'id',   (int)$_GET['id'])
             : fetch_one($db, 'slug', slugify($_GET['slug']));
        if (!$row || ($row['status'] !== 'published' && !$isAdmin)) fail('Publication not found', 404);
        respond($row);
    }

    $includeDrafts = !empty($_GET['all']) && $isAdmin;
    $limit  = isset($_GET['limit'])  ? max(1, min(100, (int)$_GET['limit'])) : 100;
    $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
    $where  = $includeDrafts ? '' : " WHERE status = 'published'";

    $rows = $db->query(
        'SELECT id, title, slug, excerpt, cover_image, author, status, published_at, created_at, updated_at
         FROM publications' . $where . '
         ORDER BY published_at DESC, id DESC LIMIT ' . $limit . ' OFFSET ' . $offset
    )->fetchAll();
    $total = (int)$db->query('SELECT COUNT(*) FROM publications' . $where)->fetchColumn();

    respond(array('count' => count($rows), 'total' => $total, 'publications' => $rows));
}

// =========================================================
//  CREATE
// =========================================================
if ($method === 'POST') {
    require_admin();
    list($vals, $errors) = clean_fields($body, true);
    if ($errors) fail('Validation failed', 422, array('fields' => $errors));

    // Make the slug unique by appending -2, -3, …
    $base = $vals['slug']; $n = 1;
    while (fetch_one($db, 'slug', $vals['slug'])) { $n++; $vals['slug'] = $base . '-' . $n; }

    $cols = array_keys($vals);
    $sql  = 'INSERT INTO publications (' . implode(', ', $cols) . ')
             VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')';
    $db->prepare($sql)->execute(array_values($vals));

    $row = fetch_one($db, 'id', (int)$db->lastInsertId());
    assert_not_truncated($vals, $row);
    respond($row, 201);
}

// =========================================================
//  UPDATE
// =========================================================
if ($method === 'PUT') {
    require_admin();
    $id = id_from_request($body);
    if ($id < 1) fail('Missing id');
    $existing = fetch_one($db, 'id', $id);
    if (!$existing) fail('Publication not found', 404);

    unset($body['id']);
    list($vals, $errors) = clean_fields($body, false);
    if ($errors) fail('Validation failed', 422, array('fields' => $errors));
    if (!$vals)  respond($existing);

    // Publishing for the first time without a date → stamp today.
    if (isset($vals['status']) && $vals['status'] === 'published'
        && empty($vals['published_at']) && empty($existing['published_at'])) {
        $vals['published_at'] = date('Y-m-d');
    }
    if (isset($vals['slug'])) {
        $clash = fetch_one($db, 'slug', $vals['slug']);
        if ($clash && (int)$clash['id'] !== $id) {
            fail('Validation failed', 422, array('fields' => array('slug' => 'Slug already in use')));
        }
    }

    $set = array();
    foreach ($vals as $f => $v) $set[] = "$f = ?";
    $params   = array_values($vals);
    $params[] = $id;
    $db->prepare('UPDATE publications SET ' . implode(', ', $set) . ' WHERE id = ?')->execute($params);

    $row = fetch_one($db, 'id', $id);
    assert_not_truncated($vals, $row);
    respond($row);
}

// =========================================================
//  DELETE
// =========================================================
if ($method === 'DELETE') {
    require_admin();
    $id = id_from_request($body);
    if ($id < 1) fail('Missing id');

    $st = $db->prepare('DELETE FROM publications WHERE id = ?');
    $st->execute(array($id));
    if ($st->rowCount() === 0) fail('Publication not found', 404);

    respond(array('deleted' => $id));
}

fail('Method not allowed', 405);
