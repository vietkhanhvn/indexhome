<?php
// Write settings to data/contact-settings.json and always return valid JSON.
header('Content-Type: application/json; charset=utf-8');

// Only accept POST
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (strtoupper($method) !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST allowed']);
    exit(0);
}

// Collect inputs
$zalo = isset($_POST['zalo']) ? trim((string)$_POST['zalo']) : '';
$facebook = isset($_POST['facebook']) ? trim((string)$_POST['facebook']) : '';
$modalTitle = isset($_POST['modalTitle']) ? trim((string)$_POST['modalTitle']) : '';
$modalBody = isset($_POST['modalBody']) ? trim((string)$_POST['modalBody']) : '';
$modalContactText = isset($_POST['modalContactText']) ? trim((string)$_POST['modalContactText']) : '';
$modalButtonLabel = isset($_POST['modalButtonLabel']) ? trim((string)$_POST['modalButtonLabel']) : '';
$modalAlwaysShow = isset($_POST['modalAlwaysShow']) ? ((string)$_POST['modalAlwaysShow'] === '1' || $_POST['modalAlwaysShow'] === 'true' ? true : (bool)$_POST['modalAlwaysShow']) : true;

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
