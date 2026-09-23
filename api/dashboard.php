<?php
/* =========================================================
   api/dashboard.php — numbers for the admin home screen
   ---------------------------------------------------------
   One call so the dashboard doesn't have to stitch together
   several endpoints:

     GET /api/dashboard.php      (admin session or token)

   Every block is optional — a site that has run only some of
   the SQL files still gets a working dashboard, with the
   missing pieces reported in "setup" so the screen can tell
   the admin exactly what is left to do.
   ========================================================= */

require_once __DIR__ . '/db.php';
$FORMS = require __DIR__ . '/forms.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if (!cycology_is_admin()) respond(array('error' => 'Please sign in'), 401);

$db = cycology_db();
if (!$db) respond(array('error' => 'Database not configured — see README §5'), 500);

$out = array(
    'setup'        => array(),
    'submissions'  => null,
    'publications' => null,
);

// ---------- form submissions ----------
try {
    $week = date('Y-m-d H:i:s', time() - 7 * 86400);

    $byForm = array();
    foreach ($db->query('SELECT form, COUNT(*) c FROM form_submissions GROUP BY form')->fetchAll() as $r) {
        $byForm[$r['form']] = (int)$r['c'];
    }
    $st = $db->prepare('SELECT COUNT(*) FROM form_submissions WHERE created_at >= ?');
    $st->execute(array($week));
    $thisWeek = (int)$st->fetchColumn();

    $forms = array();
    foreach ($FORMS as $k => $f) {
        $forms[] = array('key' => $k, 'title' => $f['title'],
                         'total' => isset($byForm[$k]) ? $byForm[$k] : 0);
    }

    $out['submissions'] = array(
        'total'       => (int)$db->query('SELECT COUNT(*) FROM form_submissions')->fetchColumn(),
        'this_week'   => $thisWeek,
        'not_emailed' => (int)$db->query('SELECT COUNT(*) FROM form_submissions WHERE emailed = 0')->fetchColumn(),
        'forms'       => $forms,
        'recent'      => $db->query('SELECT id, form, name, email, created_at
                                     FROM form_submissions
                                     ORDER BY created_at DESC, id DESC LIMIT 5')->fetchAll(),
    );
} catch (PDOException $e) {
    $out['setup'][] = array('what' => 'Form submissions', 'sql' => 'sql/form-submissions.sql');
}

// ---------- publications ----------
try {
    $byStatus = array();
    foreach ($db->query('SELECT status, COUNT(*) c FROM publications GROUP BY status')->fetchAll() as $r) {
        $byStatus[$r['status']] = (int)$r['c'];
    }
    $out['publications'] = array(
        'published' => isset($byStatus['published']) ? $byStatus['published'] : 0,
        'draft'     => isset($byStatus['draft']) ? $byStatus['draft'] : 0,
        'total'     => array_sum($byStatus),
        'recent'    => $db->query('SELECT id, title, slug, status, published_at
                                   FROM publications
                                   ORDER BY updated_at DESC, id DESC LIMIT 5')->fetchAll(),
    );
} catch (PDOException $e) {
    $out['setup'][] = array('what' => 'Blog publications', 'sql' => 'sql/publications.sql');
}

respond($out);
