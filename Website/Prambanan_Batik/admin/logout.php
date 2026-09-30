<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';
require_once __DIR__ . '/auth.php';

logoutAdmin();

header('Location: ' . BASE_URL . '/admin/login.php');
exit;
