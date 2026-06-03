<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

$product_id = get_query_param('id', 0, FILTER_VALIDATE_INT);
$platform = get_query_param('platform', 'shopee', FILTER_SANITIZE_STRING);

if (!$product_id) {
    header('Location: /products.php');
    exit;
}

$db = null;
$buy_url = null;

try {
    $db = require __DIR__ . '/db_connect.php';

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
                $user_ip = $_SERVER['REMOTE_ADDR'] ?? '';
                $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
                $referrer = $_SERVER['HTTP_REFERER'] ?? '';

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

if ($buy_url) {
    header('Location: ' . $buy_url);
} else {
    header('Location: /product.php?id=' . $product_id);
}
exit;
