<?php
/* =========================================================
   api/upload.php — Cycology image upload (admin only)
   ---------------------------------------------------------
   Accepts one image via multipart/form-data (field name "image")
   and saves it to /images/publications/. Returns the path to
   store in publications.cover_image, e.g.
     { "path": "images/publications/cape-argus-2f9a1c.jpg",
       "url":  "/images/publications/cape-argus-2f9a1c.jpg" }

   Usage (from pages/admin-publications.html):
     POST /api/upload.php
     X-Admin-Token: <token>
     form fields: image=<file>  name=<optional slug for the filename>

   Safety: the token from api/config.php is required; the file's
   real MIME type is sniffed (not trusted from the browser); only
   jpg/png/webp/gif are accepted; the saved filename is generated
   here, never taken from the client. Max size is $MAX_BYTES.
   ========================================================= */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$MAX_BYTES = 5 * 1024 * 1024; // 5 MB
$DEST_DIR  = dirname(__DIR__) . '/images/publications';
$ALLOWED   = array(
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
);

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function fail($message, $code = 400) { respond(array('error' => $message), $code); }

// ---------- auth ----------
require_once __DIR__ . '/db.php';
$config = cycology_config();

// A signed-in dashboard session OR the admin token (see api/db.php).
if (isset($_POST['_token'])) $_GET['token'] = $_POST['_token'];
if (!cycology_is_admin()) fail('Unauthorized — please sign in to the admin dashboard', 401);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method not allowed', 405);

// ---------- validate the upload ----------
if (empty($_FILES['image'])) {
    // A file bigger than post_max_size arrives as an empty $_FILES.
    fail('No file received — choose an image (max ' . round($MAX_BYTES / 1048576) . ' MB)');
}
$f = $_FILES['image'];
if ($f['error'] !== UPLOAD_ERR_OK) {
    $msg = ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE)
         ? 'File is too large' : 'Upload failed (code ' . $f['error'] . ')';
    fail($msg);
}
if ($f['size'] > $MAX_BYTES) fail('File is too large (max ' . round($MAX_BYTES / 1048576) . ' MB)');
if (!is_uploaded_file($f['tmp_name'])) fail('Invalid upload');

// Sniff the real type — never trust the extension or the browser's Content-Type.
$mime = '';
if (function_exists('finfo_open')) {
    $fi = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($fi, $f['tmp_name']);
    finfo_close($fi);
} elseif (function_exists('getimagesize')) {
    $info = @getimagesize($f['tmp_name']);
    $mime = $info ? $info['mime'] : '';
}
if (!isset($ALLOWED[$mime])) fail('Only JPG, PNG, WebP or GIF images are allowed');
if (@getimagesize($f['tmp_name']) === false) fail('File is not a valid image');

// ---------- build a safe filename ----------
$base = isset($_POST['name']) ? strtolower(trim($_POST['name'])) : '';
$base = trim(preg_replace('/[^a-z0-9]+/', '-', $base), '-');
if ($base === '') $base = 'image';
$base = substr($base, 0, 80);
$name = $base . '-' . substr(bin2hex(random_bytes(4)), 0, 6) . '.' . $ALLOWED[$mime];

// ---------- save ----------
if (!is_dir($DEST_DIR) && !@mkdir($DEST_DIR, 0755, true)) fail('Could not create images/publications/', 500);
if (!is_writable($DEST_DIR)) fail('images/publications/ is not writable — check folder permissions (755)', 500);

$dest = $DEST_DIR . '/' . $name;
if (!move_uploaded_file($f['tmp_name'], $dest)) fail('Could not save the file', 500);
@chmod($dest, 0644);

respond(array(
    'path' => 'images/publications/' . $name,
    'url'  => '/images/publications/' . $name,
    'size' => (int)$f['size'],
    'type' => $mime,
), 201);
