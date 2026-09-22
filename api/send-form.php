<?php
/* =========================================================
   api/send-form.php — Cycology form mailer
   ---------------------------------------------------------
   Receives a form submission as JSON and emails it to the
   right club address:

     form = "contact"     → info@cycology.com.ng
     form = "membership"  → membership@cycology.com.ng

   The recipient is NEVER taken from the request — the browser
   only sends a form key, which is looked up in $FORMS below.
   That stops the endpoint being abused as an open relay.

   Usage (from js/main.js):
     POST /api/send-form.php
     Content-Type: application/json
     { "form": "contact", "name": "...", "email": "...", ... }

   Returns: { "ok": true } or { "error": "...", "fields": {...} }

   Every submission is BOTH emailed and stored in the
   `form_submissions` table (schema: sql/form-submissions.sql)
   so the club can review and export them later at
   pages/admin-submissions.html.

   The two are independent on purpose: mail still works on a
   host with no database, storage still works if mail() fails,
   and the visitor only sees an error if BOTH fail.
   ========================================================= */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// ---------- what each form does (shared with api/submissions.php) ----------
require_once __DIR__ . '/db.php';
$FORMS = require __DIR__ . '/forms.php';

// The envelope sender. Must be an address ON YOUR DOMAIN or the host's mail
// server will usually reject the message or it will land in spam.
$FROM_EMAIL = 'no-reply@cycology.com.ng';
$FROM_NAME  = 'Cycology Website';

// Optional overrides from api/config.php (also lets you set 'mail_log' to a
// file path to write messages to disk instead of sending — useful while
// testing, or for debugging a host whose mail() is failing).
$config = cycology_config();
if (!empty($config['mail_from']))      $FROM_EMAIL = $config['mail_from'];
if (!empty($config['mail_from_name'])) $FROM_NAME  = $config['mail_from_name'];

// ---------- helpers ----------
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function fail($message, $code = 400, $extra = array()) {
    respond(array_merge(array('error' => $message), $extra), $code);
}
/** Strip CR/LF so a value can never inject extra mail headers. */
function header_safe($v) {
    return trim(str_replace(array("\r", "\n", "%0a", "%0d"), ' ', (string)$v));
}
/** A display name safe to place before <address> in a From/Reply-To header. */
function display_name($v) {
    $v = header_safe($v);
    $v = str_replace(array('"', '<', '>', ',', ':', ';'), ' ', $v);
    return trim(preg_replace('/\s+/', ' ', $v));
}

if (strtoupper($_SERVER['REQUEST_METHOD']) !== 'POST') fail('Method not allowed', 405);

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) $data = $_POST;          // tolerate a normal form POST
if (!is_array($data) || !$data) fail('No form data received');

// ---------- pick the form ----------
$key = isset($data['form']) ? (string)$data['form'] : '';
if (!isset($FORMS[$key])) fail('Unknown form');
$form = $FORMS[$key];
unset($data['form']);

// ---------- spam trap ----------
// `website` is a hidden field no human ever fills in. Bots fill everything.
// Pretend it worked so the bot doesn't retry with a different strategy.
if (!empty($data['website'])) respond(array('ok' => true));
unset($data['website']);

// ---------- validate ----------
$errors = array();
foreach ($form['required'] as $f) {
    if (!isset($data[$f]) || trim((string)$data[$f]) === '') {
        $label = isset($form['labels'][$f]) ? $form['labels'][$f] : $f;
        $errors[$f] = $label . ' is required';
    }
}
$email = isset($data['email']) ? trim((string)$data['email']) : '';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'That email address doesn\'t look right';
}
foreach ($data as $f => $v) {
    if (is_string($v) && strlen($v) > 5000) $errors[$f] = 'That entry is too long';
}
if ($errors) fail('Please check the form', 422, array('fields' => $errors));

// Keep the full set for storage — building the email body consumes $data.
$submitted = $data;

// ---------- build the message ----------
$senderName = '';
if (isset($data['name']))           $senderName = $data['name'];
elseif (isset($data['firstName']))  $senderName = trim($data['firstName'] . ' ' . (isset($data['lastName']) ? $data['lastName'] : ''));

$lines = array();
// Known fields first, in the order they appear in the form…
foreach ($form['labels'] as $f => $label) {
    if (!isset($data[$f])) continue;
    $v = trim((string)$data[$f]);
    if ($v === '') continue;
    $lines[] = $label . ': ' . $v;
    unset($data[$f]);
}
// …then anything else that was submitted, so nothing is silently dropped.
foreach ($data as $f => $v) {
    if (!is_scalar($v)) continue;
    $v = trim((string)$v);
    if ($v !== '') $lines[] = $f . ': ' . $v;
}

$body = $form['subject'] . "\n"
      . str_repeat('=', strlen($form['subject'])) . "\n\n"
      . implode("\n\n", $lines) . "\n\n"
      . str_repeat('-', 40) . "\n"
      . 'Sent from the website contact form on ' . date('j M Y, H:i') . "\n"
      . 'Page: ' . header_safe(isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'unknown') . "\n"
      . 'IP:   ' . header_safe(isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown') . "\n";

$senderName = display_name($senderName);
$subject = $form['subject'] . ($senderName !== '' ? ' — ' . $senderName : '');

$headers  = 'From: "' . display_name($FROM_NAME) . '" <' . header_safe($FROM_EMAIL) . '>' . "\r\n";
if ($email !== '') {
    // Replying in the mail client goes straight back to the person.
    $headers .= 'Reply-To: ' . ($senderName !== '' ? '"' . $senderName . '" <' . $email . '>' : $email) . "\r\n";
}
$headers .= 'Content-Type: text/plain; charset=utf-8' . "\r\n"
          . 'Content-Transfer-Encoding: 8bit' . "\r\n"
          . 'X-Mailer: Cycology Website' . "\r\n";

// ---------- send ----------
if (!empty($config['mail_log'])) {
    // Debug mode — write to a file instead of sending.
    $entry = "==== " . date('c') . " ====\nTo: {$form['to']}\nSubject: $subject\n$headers\n$body\n\n";
    $sent  = (bool)@file_put_contents($config['mail_log'], $entry, FILE_APPEND);
} else {
    $sent = @mail($form['to'], $subject, $body, $headers, '-f' . $FROM_EMAIL);
}

// ---------- store ----------
// Runs whether or not the email got through, so a mail outage never loses a
// membership application. `emailed` records which ones need chasing.
$stored = false;
$db = cycology_db();
if ($db) {
    try {
        $full = trim((isset($submitted['firstName']) ? $submitted['firstName'] . ' ' . (isset($submitted['lastName']) ? $submitted['lastName'] : '')
                                                     : (isset($submitted['name']) ? $submitted['name'] : '')));
        $st = $db->prepare(
            'INSERT INTO form_submissions (form, name, email, phone, data, emailed, ip, page)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $st->execute(array(
            $key,
            mb_substr($full, 0, 200),
            mb_substr($email, 0, 200),
            mb_substr(isset($submitted['phone']) ? (string)$submitted['phone'] : '', 0, 60),
            json_encode($submitted, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            $sent ? 1 : 0,
            mb_substr(isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '', 0, 45),
            mb_substr(isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '', 0, 300),
        ));
        $stored = true;
    } catch (PDOException $e) {
        $stored = false;                // table missing or DB down — fall through
    }
}

// Only a real dead end — neither emailed nor saved — is the visitor's problem.
if (!$sent && !$stored) {
    fail('We couldn\'t send your message right now. Please email us directly at ' . $form['to'] . '.', 500);
}

respond(array('ok' => true));
