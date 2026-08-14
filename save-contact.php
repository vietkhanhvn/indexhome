<?php
// Write settings to data/contact-settings.json and always return valid JSON.
header('Content-Type: application/json; charset=utf-8');

// Accept POST or GET (some hosts block POST to custom endpoints). Read from $_REQUEST as a fallback.
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Collect inputs from POST or GET (REQUEST covers both)
$zalo = isset($_REQUEST['zalo']) ? trim((string)$_REQUEST['zalo']) : '';
$facebook = isset($_REQUEST['facebook']) ? trim((string)$_REQUEST['facebook']) : '';
$modalTitle = isset($_REQUEST['modalTitle']) ? trim((string)$_REQUEST['modalTitle']) : '';
$modalBody = isset($_REQUEST['modalBody']) ? trim((string)$_REQUEST['modalBody']) : '';
$modalContactText = isset($_REQUEST['modalContactText']) ? trim((string)$_REQUEST['modalContactText']) : '';
$modalButtonLabel = isset($_REQUEST['modalButtonLabel']) ? trim((string)$_REQUEST['modalButtonLabel']) : '';
$modalAlwaysShow = isset($_REQUEST['modalAlwaysShow']) ? ((string)$_REQUEST['modalAlwaysShow'] === '1' || $_REQUEST['modalAlwaysShow'] === 'true' ? true : (bool)$_REQUEST['modalAlwaysShow']) : true;

$payload = [
    'zalo' => $zalo,
    'facebook' => $facebook,
    'modalTitle' => $modalTitle,
    'modalBody' => $modalBody,
    'modalContactText' => $modalContactText,
    'modalButtonLabel' => $modalButtonLabel,
    'modalAlwaysShow' => $modalAlwaysShow
];

$path = __DIR__ . '/data/contact-settings.json';
$dir = dirname($path);
try {
    if (!is_dir($dir)) mkdir($dir, 0777, true);
    $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) throw new Exception('JSON encode failed');
    $written = file_put_contents($path, $json, LOCK_EX);
    if ($written === false) throw new Exception('Failed to write settings file');
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    // ensure no extra HTML or warnings are emitted
    @header_remove('Content-Type');
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
