<?php

/**
 * Escape and sanitize string for SQL queries (using prepared statements is preferred)
 */
function escape($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Convert string to URL-friendly slug
 */
function slugify($string) {
    $string = mb_strtolower(trim($string), 'UTF-8');
    $string = preg_replace('/[^\w\s-]/u', '', $string);
    $string = preg_replace('/[\s-]+/', '-', $string);
    $string = trim($string, '-');
    return $string;
}

/**
 * Calculate pagination data
 */
function get_pagination($current_page, $total_items, $items_per_page = ITEMS_PER_PAGE) {
    $current_page = max(1, (int)$current_page);
    $total_pages = ceil($total_items / $items_per_page);
    $current_page = min($current_page, max(1, $total_pages));

    return [
        'current_page' => $current_page,
        'total_pages' => $total_pages,
        'total_items' => $total_items,
        'items_per_page' => $items_per_page,
        'offset' => ($current_page - 1) * $items_per_page,
        'has_prev' => $current_page > 1,
        'has_next' => $current_page < $total_pages,
        'prev_page' => $current_page - 1,
        'next_page' => $current_page + 1,
    ];
}

/**
 * Check if preview mode is enabled and user has access
 */
function is_preview_mode() {
    return PREVIEW_MODE === true;
}

/**
 * Get formatted currency (IDR)
 */
function format_currency($amount) {
    return 'Rp ' . number_format($amount, 0, ',', '.');
}

/**
 * Get star rating HTML
 */
function get_star_rating($rating) {
    $rating = (float)$rating;
    $full_stars = floor($rating);
    $half_star = ($rating - $full_stars) >= 0.5;
    $empty_stars = 5 - $full_stars - ($half_star ? 1 : 0);

    $stars = str_repeat('★', $full_stars);
    if ($half_star) {
        $stars .= '◐';
    }
    $stars .= str_repeat('☆', $empty_stars);

    return $stars;
}

/**
 * Truncate text to specified length
 */
function truncate_text($text, $length = 100, $suffix = '...') {
    if (strlen($text) <= $length) {
        return $text;
    }
    return substr($text, 0, $length - strlen($suffix)) . $suffix;
}

/**
 * Get time ago string (e.g., "2 days ago")
 */
function time_ago($timestamp) {
    $time = strtotime($timestamp);
    $current = time();
    $diff = $current - $time;

    if ($diff < 60) {
        return 'just now';
    } elseif ($diff < 3600) {
        $minutes = floor($diff / 60);
        return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 86400) {
        $hours = floor($diff / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 604800) {
        $days = floor($diff / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 2592000) {
        $weeks = floor($diff / 604800);
        return $weeks . ' week' . ($weeks > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 31536000) {
        $months = floor($diff / 2592000);
        return $months . ' month' . ($months > 1 ? 's' : '') . ' ago';
    } else {
        $years = floor($diff / 31536000);
        return $years . ' year' . ($years > 1 ? 's' : '') . ' ago';
    }
}

/**
 * Validate email address
 */
function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate URL
 */
function is_valid_url($url) {
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Get query parameter safely
 */
function get_query_param($key, $default = null, $filter = FILTER_DEFAULT) {
    return isset($_GET[$key]) ? filter_var($_GET[$key], $filter) : $default;
}

/**
 * Get POST parameter safely
 */
function get_post_param($key, $default = null, $filter = FILTER_DEFAULT) {
    return isset($_POST[$key]) ? filter_var($_POST[$key], $filter) : $default;
}

/**
 * Check if file upload is valid
 */
function is_valid_image_upload($file, $max_size = MAX_UPLOAD_SIZE) {
    if (!isset($file['tmp_name']) || !isset($file['type']) || !isset($file['size'])) {
        return false;
    }

    $file_type = $file['type'];
    $file_size = $file['size'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if ($file_size > $max_size) {
        return false;
    }

    if (!in_array($extension, ALLOWED_IMAGE_TYPES)) {
        return false;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowed_mimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    return in_array($mime_type, $allowed_mimes);
}

/**
 * Generate random token
 */
function generate_token($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Get sample batik products for preview mode
 */
function get_sample_batik_products($limit = null) {
    $products = [
        [
            'id' => 1,
            'name' => 'Traditional Mega Mendung Batik',
            'slug' => 'traditional-mega-mendung-batik',
            'category' => 'Traditional Patterns',
            'rating_avg' => 4.8,
            'rating_count' => 342,
            'price_display' => 350000,
            'image_url' => 'https://images.pexels.com/photos/3921857/pexels-photo-3921857.jpeg?auto=compress&cs=tinysrgb&w=500',
            'description' => 'Premium traditional Mega Mendung batik with intricate cloud patterns. Hand-drawn designs on premium cotton fabric. Perfect for formal occasions and collections.',
        ],
        [
            'id' => 2,
            'name' => 'Modern Pekalongan Batik Dress',
            'slug' => 'modern-pekalongan-batik-dress',
            'category' => 'Ready to Wear',
            'rating_avg' => 4.6,
            'rating_count' => 218,
            'price_display' => 450000,
            'image_url' => 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=500',
            'description' => 'Contemporary Pekalongan batik dress combining traditional patterns with modern silhouette. Comfortable breathable fabric suitable for daily wear and special events.',
        ],
        [
            'id' => 3,
            'name' => 'Authentic Cirebon Batik Fabric',
            'slug' => 'authentic-cirebon-batik-fabric',
            'category' => 'Fabric & Cloth',
            'rating_avg' => 4.7,
            'rating_count' => 289,
            'price_display' => 280000,
            'image_url' => 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=500',
            'description' => 'Authentic Cirebon batik fabric with distinctive motifs featuring celestial and floral elements. Premium quality suitable for custom tailoring and collection.',
        ],
        [
            'id' => 4,
            'name' => 'Javanese Sarong with Batik Motifs',
            'slug' => 'javanese-sarong-batik-motifs',
            'category' => 'Traditional Wear',
            'rating_avg' => 4.5,
            'rating_count' => 156,
            'price_display' => 320000,
            'image_url' => 'https://images.pexels.com/photos/4534200/pexels-photo-4534200.jpeg?auto=compress&cs=tinysrgb&w=500',
            'description' => 'Traditional Javanese sarong featuring authentic batik patterns. Versatile wrap suitable for casual wear, beach outings, and cultural events.',
        ],
        [
            'id' => 5,
            'name' => 'Lasem Red Batik Collection',
            'slug' => 'lasem-red-batik-collection',
            'category' => 'Regional Styles',
            'rating_avg' => 4.9,
            'rating_count' => 405,
            'price_display' => 520000,
            'image_url' => 'https://images.pexels.com/photos/3622613/pexels-photo-3622613.jpeg?auto=compress&cs=tinysrgb&w=500',
            'description' => 'Distinctive Lasem red batik featuring bold red and indigo colors. Signature design from Lasem region with intricate maritime motifs.',
        ],
        [
            'id' => 6,
            'name' => 'Batik Tulis Hand-drawn Masterpiece',
            'slug' => 'batik-tulis-hand-drawn-masterpiece',
            'category' => 'Premium Collection',
            'rating_avg' => 4.9,
            'rating_count' => 178,
            'price_display' => 850000,
            'image_url' => 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=500',
            'description' => 'Premium batik tulis (hand-drawn) masterpiece created by master artisans. Limited edition with unique artistic value and exceptional craftsmanship.',
        ],
        [
            'id' => 7,
            'name' => 'Yogyakarta Batik Scarf',
            'slug' => 'yogyakarta-batik-scarf',
            'category' => 'Accessories',
            'rating_avg' => 4.4,
            'rating_count' => 97,
            'price_display' => 185000,
            'image_url' => 'https://images.pexels.com/photos/2018994/pexels-photo-2018994.jpeg?auto=compress&cs=tinysrgb&w=500',
            'description' => 'Elegant Yogyakarta batik scarf with traditional motifs. Lightweight and versatile for various styling occasions.',
        ],
        [
            'id' => 8,
            'name' => 'Indigo Batik Wall Hanging',
            'slug' => 'indigo-batik-wall-hanging',
            'category' => 'Home Decor',
            'rating_avg' => 4.6,
            'rating_count' => 134,
            'price_display' => 420000,
            'image_url' => 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=500',
            'description' => 'Beautiful indigo batik wall hanging featuring traditional geometric patterns. Perfect for adding cultural charm to any interior space.',
        ],
    ];

    if ($limit) {
        return array_slice($products, 0, $limit);
    }

    return $products;
}
