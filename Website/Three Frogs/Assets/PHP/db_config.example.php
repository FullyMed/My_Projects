<?php
define("DB_HOST", "localhost");
define("DB_USER", "your_db_user");
define("DB_PASS", "your_db_password");
define("DB_NAME", "your_db_name");

// Optional — omit all of these on production (Hostinger).
// define("DB_PORT", 3307);                         // defaults to 3306 (local XAMPP MariaDB uses 3307)
// define("SITE_URL", "http://localhost:8080");     // base URL used in emailed links; defaults to https://threefrogsboardgame.com
//
// Local dev only: let tests/run-tests.sh point its own Apache at the throwaway
// `threefrogs_test` database (it sets THREEFROGS_DB_NAME via SetEnv):
// define("DB_NAME", getenv("THREEFROGS_DB_NAME") ?: "threefrogs_local");
