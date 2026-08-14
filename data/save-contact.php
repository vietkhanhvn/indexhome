<?php
require_once __DIR__ . '/includes/contact-settings.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST allowed']);
    exit(0);
}

$zalo = trim((string)($_POST['zalo'] ?? ''));
$facebook = trim((string)($_POST['facebook'] ?? ''));

// collect modal fields if present
$modalTitle = trim((string)($_POST['modalTitle'] ?? ''));
$modalBody = trim((string)($_POST['modalBody'] ?? ''));
$modalContactText = trim((string)($_POST['modalContactText'] ?? ''));
$modalButtonLabel = trim((string)($_POST['modalButtonLabel'] ?? ''));
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
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
