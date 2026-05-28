<?php
/* =========================================================
   gallery.php — Cycology gallery directory scanner
   ---------------------------------------------------------
   Returns a JSON list of image filenames inside one of the
   event folders under /images/gallery/.

   Usage:   gallery.php?event=cycolobration-2025

   How it works: scans the requested folder for image files
   (jpg, jpeg, png, webp, gif, avif), sorts naturally so
   "photo-001.jpg" comes before "photo-010.jpg", and returns
   a JSON payload that the front-end consumes.

   Security: the event slug is whitelisted to lowercase
   letters, digits and dashes. The resolved path is verified
   to live inside /images/gallery/ so directory traversal
   attempts (e.g. ?event=../) are rejected with a 404.

   Runs on any PHP 5.4+ shared host (InMotion, A2, SiteGround
   etc.). No configuration needed.
   ========================================================= */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300'); // 5-minute browser cache
header('Access-Control-Allow-Origin: *');     // allow JS fetch from any subdomain

$event = isset($_GET['event']) ? $_GET['event'] : '';

// Whitelist: only "cycolobration-2025"-style slugs allowed.
if (!preg_match('/^[a-z0-9][a-z0-9-]{0,80}$/', $event)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid event slug']);
    exit;
}

$root = __DIR__ . '/images/gallery';
$dir  = $root . '/' . $event;

// Resolve and verify the directory is actually inside /images/gallery/
$realRoot = realpath($root);
$realDir  = realpath($dir);

if ($realRoot === false || $realDir === false || strpos($realDir, $realRoot) !== 0) {
    http_response_code(404);
    echo json_encode(['error' => 'event folder not found', 'event' => $event]);
    exit;
}

$allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
$files = [];

foreach (scandir($realDir) as $f) {
    if ($f === '.' || $f === '..') continue;
    if ($f[0] === '.') continue; // skip hidden files (e.g. .DS_Store)
    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
    if (in_array($ext, $allowedExt, true)) {
        $files[] = $f;
    }
}

// Natural sort so "img-2.jpg" comes before "img-10.jpg"
sort($files, SORT_NATURAL | SORT_FLAG_CASE);

echo json_encode([
    'event'  => $event,
    'count'  => count($files),
    'path'   => 'images/gallery/' . $event,
    'images' => $files,
]);
