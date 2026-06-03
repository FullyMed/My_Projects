<?php

require_once __DIR__ . '/auth.php';

logoutAdmin();

header('Location: /admin/login.php');
exit;
