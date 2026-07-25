<?php
function hm_read_contact_settings() {
    $defaults = [
        'zalo' => '0345345553',
        'facebook' => 'https://www.facebook.com/profile.php?id=100069526895693'
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

    $zalo = trim((string)($data['zalo'] ?? ''));
    $facebook = trim((string)($data['facebook'] ?? ''));

    return [
        'zalo' => $zalo !== '' ? $zalo : $defaults['zalo'],
        'facebook' => $facebook !== '' ? $facebook : $defaults['facebook']
    ];
}

function hm_save_contact_settings(array $data): void {
    $path = __DIR__ . '/../data/contact-settings.json';
    $dir = dirname($path);

    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $payload = [
        'zalo' => trim((string)($data['zalo'] ?? '')),
        'facebook' => trim((string)($data['facebook'] ?? ''))
    ];

    file_put_contents(
        $path,
        json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}
