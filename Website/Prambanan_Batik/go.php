<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$product_id = get_query_param('id', 0, FILTER_VALIDATE_INT);
$platform = get_query_param('platform', 'shopee');

if (!$product_id) {
    header('Location: ' . BASE_URL . '/products.php');
    exit;
}

$db = null;
$buy_url = null;

try {
    $db = require __DIR__ . '/db_connect.php';

    if ($db === null) {
        header('Location: ' . BASE_URL . '/product.php?id=' . $product_id);
        exit;
    }

    $stmt = $db->prepare('SELECT buy_link_shopee, buy_link_tokopedia, buy_link_other FROM products WHERE id = ? LIMIT 1');
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if ($product) {
        if ($platform === 'tokopedia' && !empty($product['buy_link_tokopedia'])) {
            $buy_url = $product['buy_link_tokopedia'];
        } elseif ($platform === 'other' && !empty($product['buy_link_other'])) {
            $buy_url = $product['buy_link_other'];
        } elseif (!empty($product['buy_link_shopee'])) {
            $buy_url = $product['buy_link_shopee'];
            $platform = 'shopee';
        }

        if ($buy_url) {
            try {
                // Trim to the column sizes (user_ip VARCHAR(45), referrer VARCHAR(500)) so an
                // unusually long header can't make a strict-mode MySQL reject the log insert.
                $user_ip = substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
                $user_agent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 1000);
                $referrer = mb_substr($_SERVER['HTTP_REFERER'] ?? '', 0, 500, 'UTF-8');

                $log_stmt = $db->prepare('INSERT INTO outbound_clicks (product_id, platform, user_ip, user_agent, referrer, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
                $log_stmt->execute([$product_id, $platform, $user_ip, $user_agent, $referrer]);
            } catch (Exception $e) {
                error_log('Failed to log click: ' . $e->getMessage());
            }
        }
    }
} catch (Exception $e) {
    error_log('Failed to fetch product URL: ' . $e->getMessage());
}

if ($buy_url && preg_match('/^https?:\/\//i', $buy_url)) {
    header('Location: ' . $buy_url);
} else {
    header('Location: ' . BASE_URL . '/product.php?id=' . $product_id);
}
exit;
