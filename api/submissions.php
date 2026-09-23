<?php
/* =========================================================
   api/submissions.php — read / export / delete form submissions
   ---------------------------------------------------------
   Everything here is ADMIN ONLY. Send the admin token from
   api/config.php as an "X-Admin-Token" header (or ?token= for
   the download links, which can't set headers).

     GET    ?form=contact&limit=50&offset=0   list as JSON
     GET    ?id=7                             one submission, all fields
     GET    ?export=csv&form=membership       download .csv  (opens in Excel)
     GET    ?export=xlsx&form=membership      download .xlsx (real Excel file)
     DELETE ?id=7                             delete one

   `form` is optional everywhere — leave it off for all forms.
   Exports honour the same filters as the list.

   Table: form_submissions (schema: sql/form-submissions.sql)
   ========================================================= */

require_once __DIR__ . '/db.php';
$FORMS = require __DIR__ . '/forms.php';

function respond($data, $code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function fail($message, $code = 400) { respond(array('error' => $message), $code); }

if (!cycology_is_admin()) fail('Unauthorized — a valid admin token is required', 401);

$db = cycology_db();
if (!$db) fail('Database not configured — see README §5', 500);

// A missing table is the most common setup slip; say so plainly.
try {
    $db->query('SELECT 1 FROM form_submissions LIMIT 1');
} catch (PDOException $e) {
    fail('The form_submissions table is missing — run sql/form-submissions.sql in phpMyAdmin', 500);
}

$method = strtoupper($_SERVER['REQUEST_METHOD']);
$formKey = isset($_GET['form']) && $_GET['form'] !== '' ? (string)$_GET['form'] : '';
if ($formKey !== '' && !isset($FORMS[$formKey])) fail('Unknown form');

/** WHERE clause + bound values for the current filters. */
function build_filter($formKey) {
    $where = array(); $args = array();
    if ($formKey !== '') { $where[] = 'form = ?'; $args[] = $formKey; }
    if (isset($_GET['q']) && trim($_GET['q']) !== '') {
        $like = '%' . trim($_GET['q']) . '%';
        $where[] = '(name LIKE ? OR email LIKE ? OR phone LIKE ? OR data LIKE ?)';
        array_push($args, $like, $like, $like, $like);
    }
    if (isset($_GET['from']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['from'])) {
        $where[] = 'created_at >= ?'; $args[] = $_GET['from'] . ' 00:00:00';
    }
    if (isset($_GET['to']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['to'])) {
        $where[] = 'created_at <= ?'; $args[] = $_GET['to'] . ' 23:59:59';
    }
    return array($where ? ' WHERE ' . implode(' AND ', $where) : '', $args);
}

// =========================================================
//  DELETE
// =========================================================
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id < 1) fail('Missing id');
    $st = $db->prepare('DELETE FROM form_submissions WHERE id = ?');
    $st->execute(array($id));
    if ($st->rowCount() === 0) fail('Submission not found', 404);
    respond(array('deleted' => $id));
}

if ($method !== 'GET') fail('Method not allowed', 405);

// =========================================================
//  EXPORT  (csv / xlsx)
// =========================================================
if (!empty($_GET['export'])) {
    $type = strtolower($_GET['export']);
    if (!in_array($type, array('csv', 'xlsx'), true)) fail('Export must be csv or xlsx');

    list($where, $args) = build_filter($formKey);
    $st = $db->prepare('SELECT * FROM form_submissions' . $where . ' ORDER BY created_at DESC, id DESC');
    $st->execute($args);
    $rows = $st->fetchAll();

    // Columns: when one form is selected, use its own fields in form order.
    // For "all forms" fall back to the shared columns plus a details column.
    if ($formKey !== '') {
        $labels = $FORMS[$formKey]['labels'];
        $head   = array_merge(array('Date'), array_values($labels), array('Emailed'));
        $fields = array_keys($labels);
    } else {
        $labels = array();
        $head   = array('Date', 'Form', 'Name', 'Email', 'Phone', 'Details', 'Emailed');
        $fields = null;
    }

    $table = array($head);
    foreach ($rows as $r) {
        $d = json_decode($r['data'], true);
        if (!is_array($d)) $d = array();
        if ($fields !== null) {
            $line = array($r['created_at']);
            foreach ($fields as $f) $line[] = isset($d[$f]) ? (string)$d[$f] : '';
        } else {
            $title = isset($FORMS[$r['form']]['title']) ? $FORMS[$r['form']]['title'] : $r['form'];
            $extra = array();
            foreach ($d as $f => $v) {
                if (in_array($f, array('name', 'firstName', 'lastName', 'email', 'phone'), true)) continue;
                if (!is_scalar($v) || trim((string)$v) === '') continue;
                $lab = isset($FORMS[$r['form']]['labels'][$f]) ? $FORMS[$r['form']]['labels'][$f] : $f;
                $extra[] = $lab . ': ' . $v;
            }
            $line = array($r['created_at'], $title, $r['name'], $r['email'], $r['phone'], implode("\n", $extra));
        }
        $line[] = $r['emailed'] ? 'Yes' : 'No';
        $table[] = $line;
    }

    $base = 'cycology-' . ($formKey !== '' ? $formKey : 'form-submissions') . '-' . date('Y-m-d');

    if ($type === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $base . '.csv"');
        $out = fopen('php://output', 'w');
        // UTF-8 BOM so Excel shows accents correctly on a double-click.
        fwrite($out, "\xEF\xBB\xBF");
        foreach ($table as $line) fputcsv($out, $line);
        fclose($out);
        exit;
    }

    // ---- real .xlsx (a zip of XML parts; no library needed) ----
    if (!class_exists('ZipArchive')) {
        fail('This host has no ZipArchive extension, so Excel export is unavailable — use CSV (it opens in Excel too)', 500);
    }
    $tmp = tempnam(sys_get_temp_dir(), 'xlsx');
    $zip = new ZipArchive();
    if ($zip->open($tmp, ZipArchive::OVERWRITE) !== true) fail('Could not build the Excel file', 500);

    $esc = function ($v) {
        // Strip control characters Excel refuses, then XML-escape.
        $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', (string)$v);
        return htmlspecialchars($v, ENT_QUOTES | ENT_XML1, 'UTF-8');
    };
    $colName = function ($n) {                       // 1 → A, 27 → AA
        $s = '';
        while ($n > 0) { $m = ($n - 1) % 26; $s = chr(65 + $m) . $s; $n = (int)(($n - $m) / 26); }
        return $s;
    };

    $sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
           . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
           . '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
           . '<sheetData>';
    foreach ($table as $i => $line) {
        $r = $i + 1;
        $sheet .= '<row r="' . $r . '">';
        foreach (array_values($line) as $j => $cell) {
            $ref = $colName($j + 1) . $r;
            if ($cell !== '' && is_numeric($cell) && strlen($cell) < 15 && $cell[0] !== '0' && $cell[0] !== '+') {
                $sheet .= '<c r="' . $ref . '"><v>' . $esc($cell) . '</v></c>';
            } else {
                $sheet .= '<c r="' . $ref . '" t="inlineStr" s="' . ($r === 1 ? 1 : 0) . '">'
                        . '<is><t xml:space="preserve">' . $esc($cell) . '</t></is></c>';
            }
        }
        $sheet .= '</row>';
    }
    $sheet .= '</sheetData></worksheet>';

    $zip->addFromString('[Content_Types].xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      . '<Default Extension="xml" ContentType="application/xml"/>'
      . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
      . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
      . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
      . '</Types>');
    $zip->addFromString('_rels/.rels',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
      . '</Relationships>');
    $zip->addFromString('xl/workbook.xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
      . ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
      . '<sheets><sheet name="Submissions" sheetId="1" r:id="rId1"/></sheets></workbook>');
    $zip->addFromString('xl/_rels/workbook.xml.rels',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
      . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
      . '</Relationships>');
    // Two cell formats: 0 = normal, 1 = bold (the header row).
    $zip->addFromString('xl/styles.xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
      . '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>'
      . '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
      . '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
      . '<borders count="1"><border/></borders>'
      . '<cellStyleXfs count="1"><xf/></cellStyleXfs>'
      . '<cellXfs count="2"><xf xfId="0"/><xf xfId="0" fontId="1" applyFont="1"/></cellXfs>'
      . '</styleSheet>');
    $zip->addFromString('xl/worksheets/sheet1.xml', $sheet);
    $zip->close();

    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $base . '.xlsx"');
    header('Content-Length: ' . filesize($tmp));
    readfile($tmp);
    @unlink($tmp);
    exit;
}

// =========================================================
//  READ ONE
// =========================================================
if (isset($_GET['id'])) {
    $st = $db->prepare('SELECT * FROM form_submissions WHERE id = ? LIMIT 1');
    $st->execute(array((int)$_GET['id']));
    $row = $st->fetch();
    if (!$row) fail('Submission not found', 404);

    $d = json_decode($row['data'], true);
    $row['fields'] = array();
    if (is_array($d)) {
        $labels = isset($FORMS[$row['form']]['labels']) ? $FORMS[$row['form']]['labels'] : array();
        foreach ($labels as $f => $label) {                       // known fields, in form order
            if (isset($d[$f]) && trim((string)$d[$f]) !== '') {
                $row['fields'][] = array('label' => $label, 'value' => (string)$d[$f]);
                unset($d[$f]);
            }
        }
        foreach ($d as $f => $v) {                                 // anything else
            if (is_scalar($v) && trim((string)$v) !== '') $row['fields'][] = array('label' => $f, 'value' => (string)$v);
        }
    }
    unset($row['data']);
    respond($row);
}

// =========================================================
//  LIST
// =========================================================
list($where, $args) = build_filter($formKey);
$limit  = isset($_GET['limit'])  ? max(1, min(200, (int)$_GET['limit'])) : 50;
$offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

$st = $db->prepare('SELECT id, form, name, email, phone, emailed, created_at
                    FROM form_submissions' . $where . '
                    ORDER BY created_at DESC, id DESC LIMIT ' . $limit . ' OFFSET ' . $offset);
$st->execute($args);
$rows = $st->fetchAll();

$cnt = $db->prepare('SELECT COUNT(*) FROM form_submissions' . $where);
$cnt->execute($args);

// Per-form totals for the filter buttons.
$totals = array();
foreach ($db->query('SELECT form, COUNT(*) c FROM form_submissions GROUP BY form')->fetchAll() as $t) {
    $totals[$t['form']] = (int)$t['c'];
}

$meta = array();
foreach ($FORMS as $k => $f) $meta[$k] = array('title' => $f['title'], 'total' => isset($totals[$k]) ? $totals[$k] : 0);

respond(array(
    'count'       => count($rows),
    'total'       => (int)$cnt->fetchColumn(),
    'forms'       => $meta,
    'submissions' => $rows,
));
