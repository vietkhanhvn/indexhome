<?php
require_once __DIR__ . '/includes/contact-settings.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (strtoupper($method) !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST allowed']);
    exit(0);
}

$zalo = isset($_POST['zalo']) ? trim((string)$_POST['zalo']) : '';
$facebook = isset($_POST['facebook']) ? trim((string)$_POST['facebook']) : '';
$modalTitle = isset($_POST['modalTitle']) ? trim((string)$_POST['modalTitle']) : '';
$modalBody = isset($_POST['modalBody']) ? trim((string)$_POST['modalBody']) : '';
$modalContactText = isset($_POST['modalContactText']) ? trim((string)$_POST['modalContactText']) : '';
$modalButtonLabel = isset($_POST['modalButtonLabel']) ? trim((string)$_POST['modalButtonLabel']) : '';
$modalAlwaysShow = isset($_POST['modalAlwaysShow']) ? (bool)$_POST['modalAlwaysShow'] : true;

$payload = [
    'zalo' => $zalo,
    'facebook' => $facebook,
    'modalTitle' => $modalTitle,
    'modalBody' => $modalBody,
    'modalContactText' => $modalContactText,
    'modalButtonLabel' => $modalButtonLabel,
    'modalAlwaysShow' => $modalAlwaysShow
];

try {
    hm_save_contact_settings($payload);
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
