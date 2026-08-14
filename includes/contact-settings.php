<?php
function hm_read_contact_settings() {
    $defaults = [
        'zalo' => '0345345553',
        'facebook' => 'https://www.facebook.com/profile.php?id=100069526895693',
        // modal defaults
        'modalTitle' => 'THÔNG BÁO',
        'modalBody' => "Vay tiền qua iCloud\n\n- Chỉ cần có iPhone/iPad\n- Không giữ máy — dùng bình thường\n- Duyệt hồ sơ chỉ trong 15 phút",
        'modalContactText' => 'Liên hệ ngay Zalo: 0345345553',
        'modalButtonLabel' => 'ĐÃ HIỂU, KHÔNG HIỂN THỊ LẠI',
        // if true, modal will always show after reload (close only hides for current view)
        'modalAlwaysShow' => true
    ];

    $path = __DIR__ . '/../data/contact-settings.json';

    if (!file_exists($path)) {
        return $defaults;
    }

    $raw = file_get_contents($path);
    if ($raw === false) {
        return $defaults;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return $defaults;
    }

    // merge and sanitize
    $out = $defaults;
    if (is_array($data)) {
        if (isset($data['zalo'])) $out['zalo'] = trim((string)$data['zalo']);
        if (isset($data['facebook'])) $out['facebook'] = trim((string)$data['facebook']);
        if (isset($data['modalTitle'])) $out['modalTitle'] = trim((string)$data['modalTitle']);
        if (isset($data['modalBody'])) $out['modalBody'] = trim((string)$data['modalBody']);
        if (isset($data['modalContactText'])) $out['modalContactText'] = trim((string)$data['modalContactText']);
        if (isset($data['modalButtonLabel'])) $out['modalButtonLabel'] = trim((string)$data['modalButtonLabel']);
        if (isset($data['modalAlwaysShow'])) $out['modalAlwaysShow'] = (bool)$data['modalAlwaysShow'];
    }

    return $out;
}

function hm_save_contact_settings(array $data): void {
    $path = __DIR__ . '/../data/contact-settings.json';
    $dir = dirname($path);

    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $payload = [];
    // accept known keys and sanitize
    $payload['zalo'] = trim((string)($data['zalo'] ?? ''));
    $payload['facebook'] = trim((string)($data['facebook'] ?? ''));
    $payload['modalTitle'] = trim((string)($data['modalTitle'] ?? ''));
    $payload['modalBody'] = trim((string)($data['modalBody'] ?? ''));
    $payload['modalContactText'] = trim((string)($data['modalContactText'] ?? ''));
    $payload['modalButtonLabel'] = trim((string)($data['modalButtonLabel'] ?? ''));
    $payload['modalAlwaysShow'] = isset($data['modalAlwaysShow']) ? (bool)$data['modalAlwaysShow'] : true;

    file_put_contents(
        $path,
        json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}
