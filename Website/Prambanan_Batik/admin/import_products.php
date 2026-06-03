<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireAdminLogin();
$admin = getAdminSession();

$message = '';
$error = '';
$report = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'import' && isset($_FILES['csv_file'])) {
        $file = $_FILES['csv_file'];
        $error = '';

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $error = 'Failed to upload file';
        } elseif ($file['size'] === 0) {
            $error = 'File is empty';
        } elseif ($file['size'] > 5 * 1024 * 1024) {
            $error = 'File is too large (max 5MB)';
        } else {
            $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if ($fileExt !== 'csv') {
                $error = 'File must be a CSV file';
            }
        }

        if (!$error) {
            $report = [
                'inserted' => 0,
                'updated' => 0,
                'failed' => 0,
                'errors' => [],
                'rows_processed' => 0,
            ];

            $handle = fopen($file['tmp_name'], 'r');
            if (!$handle) {
                $error = 'Could not open file';
            } else {
                $headers = null;
                $rowNum = 0;

                while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                    $rowNum++;

                    if ($headers === null) {
                        $headers = array_map('trim', $row);
                        continue;
                    }

                    $report['rows_processed']++;
                    $data = array_combine($headers, $row);
                    $data = array_map('trim', $data);

                    $sku = $data['sku'] ?? '';
                    $name = $data['name'] ?? '';
                    $description = $data['description'] ?? '';
                    $price = $data['price'] ?? '';
                    $categoryId = $data['category_id'] ?? '';
                    $imageUrl = $data['image_url'] ?? '';

                    if (empty($sku) || empty($name) || empty($price)) {
                        $report['failed']++;
                        $report['errors'][] = "Row $rowNum: Missing required fields (sku, name, price)";
                        continue;
                    }

                    if (!is_numeric($price)) {
                        $report['failed']++;
                        $report['errors'][] = "Row $rowNum (SKU: $sku): Invalid price format";
                        continue;
                    }

                    try {
                        $price = (float) $price;

                        $stmt = $pdo->prepare('SELECT id FROM products WHERE sku = ? LIMIT 1');
                        $stmt->execute([$sku]);
                        $existingProduct = $stmt->fetch();

                        if ($existingProduct) {
                            $productId = $existingProduct['id'];

                            $updateFields = [];
                            $updateValues = [];

                            if ($name) {
                                $updateFields[] = 'name = ?';
                                $updateValues[] = $name;
                            }

                            if ($description) {
                                $updateFields[] = 'description = ?';
                                $updateValues[] = $description;
                            }

                            if ($price) {
                                $updateFields[] = 'price = ?';
                                $updateValues[] = $price;
                            }

                            if ($categoryId) {
                                $updateFields[] = 'category_id = ?';
                                $updateValues[] = $categoryId;
                            }

                            $updateFields[] = 'updated_at = NOW()';

                            $updateValues[] = $productId;

                            $updateQuery = 'UPDATE products SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
                            $stmt = $pdo->prepare($updateQuery);
                            $stmt->execute($updateValues);

                            $report['updated']++;
                        } else {
                            $stmt = $pdo->prepare(
                                'INSERT INTO products (sku, name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)'
                            );
                            $stmt->execute([
                                $sku,
                                $name,
                                $description ?: null,
                                $price,
                                $categoryId ?: null,
                                $imageUrl ?: null,
                            ]);

                            $report['inserted']++;
                        }
                    } catch (Exception $e) {
                        $report['failed']++;
                        $report['errors'][] = "Row $rowNum (SKU: $sku): " . $e->getMessage();
                    }
                }

                fclose($handle);
                $message = 'CSV import completed successfully';
            }
        }
    }
}

$stmt = $pdo->prepare('SELECT id, name FROM categories ORDER BY name');
$stmt->execute();
$categories = $stmt->fetchAll();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Import Products</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
    <link rel="stylesheet" href="/admin/admin.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-container {
            display: flex;
            min-height: 100vh;
        }

        .sidebar {
            width: 240px;
            background: #2d3436;
            color: #ecf0f1;
            padding: 2rem 0;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
        }

        .sidebar-header {
            padding: 0 1.5rem 2rem;
            border-bottom: 1px solid #34495e;
        }

        .sidebar-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
        }

        .sidebar-nav {
            list-style: none;
        }

        .sidebar-nav li a {
            display: block;
            padding: 0.75rem 1.5rem;
            color: #bdc3c7;
            text-decoration: none;
            transition: all 200ms ease-in-out;
            border-left: 3px solid transparent;
        }

        .sidebar-nav li a:hover {
            background: #34495e;
            color: #ecf0f1;
            border-left-color: #8b6f47;
        }

        .sidebar-nav li a.active {
            background: #34495e;
            color: #8b6f47;
            border-left-color: #8b6f47;
            font-weight: 600;
        }

        .main-content {
            flex: 1;
            margin-left: 240px;
        }

        .topbar {
            background: white;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .topbar-user {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .topbar-user a {
            color: #8b6f47;
            text-decoration: none;
            font-weight: 500;
            transition: color 200ms ease-in-out;
        }

        .topbar-user a:hover {
            color: #a0824d;
        }

        .content {
            padding: 2rem;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 1.875rem;
            color: #2d3436;
        }

        .back-link {
            color: #8b6f47;
            text-decoration: none;
            font-weight: 500;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        .section {
            background: white;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .section h3 {
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
            color: #2d3436;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2d3436;
        }

        .form-group input[type="file"],
        .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d6d3d1;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-family: inherit;
        }

        .form-group input[type="file"]:focus,
        .form-group select:focus {
            outline: none;
            border-color: #8b6f47;
            box-shadow: 0 0 0 3px rgba(139, 111, 71, 0.1);
        }

        .file-input-wrapper {
            position: relative;
            overflow: hidden;
            display: inline-block;
            width: 100%;
        }

        .file-input-wrapper input[type="file"] {
            position: absolute;
            left: -9999px;
        }

        .file-input-label {
            display: block;
            padding: 2rem;
            background: #f9f9f9;
            border: 2px dashed #d6d3d1;
            border-radius: 0.5rem;
            text-align: center;
            cursor: pointer;
            transition: all 200ms ease-in-out;
        }

        .file-input-label:hover {
            background: #f5f5f5;
            border-color: #8b6f47;
        }

        .file-input-label.active {
            background: #f0fdf4;
            border-color: #166534;
        }

        .file-input-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .file-input-text {
            color: #666;
        }

        .file-input-text strong {
            color: #8b6f47;
        }

        .file-name {
            display: none;
            margin-top: 0.5rem;
            color: #166534;
            font-size: 0.875rem;
        }

        .file-name.visible {
            display: block;
        }

        .message {
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            border-left: 4px solid;
        }

        .message.success {
            background: #f0fdf4;
            color: #166534;
            border-color: #166534;
        }

        .message.error {
            background: #fdeaea;
            color: #c53030;
            border-color: #c53030;
        }

        .button-group {
            display: flex;
            gap: 1rem;
        }

        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #8b6f47;
            color: white;
            text-decoration: none;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 200ms ease-in-out;
        }

        .btn:hover:not(:disabled) {
            background: #a0824d;
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-secondary {
            background: #666;
        }

        .btn-secondary:hover {
            background: #777;
        }

        .report-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .report-card {
            padding: 1.5rem;
            border-radius: 0.5rem;
            text-align: center;
        }

        .report-card.inserted {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
        }

        .report-card.updated {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
        }

        .report-card.failed {
            background: #fdeaea;
            border: 1px solid #fca5a5;
        }

        .report-number {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .report-card.inserted .report-number {
            color: #166534;
        }

        .report-card.updated .report-number {
            color: #1e40af;
        }

        .report-card.failed .report-number {
            color: #c53030;
        }

        .report-label {
            font-weight: 600;
            font-size: 0.875rem;
        }

        .report-card.inserted .report-label {
            color: #166534;
        }

        .report-card.updated .report-label {
            color: #1e40af;
        }

        .report-card.failed .report-label {
            color: #c53030;
        }

        .errors-list {
            list-style: none;
        }

        .errors-list li {
            padding: 0.75rem;
            background: #fdeaea;
            color: #c53030;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            word-break: break-word;
        }

        .template-section {
            background: #f9f9f9;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .template-section h4 {
            margin-bottom: 1rem;
            color: #2d3436;
            font-size: 1rem;
        }

        .template-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }

        .template-table th,
        .template-table td {
            padding: 0.75rem;
            text-align: left;
            border: 1px solid #e0e0e0;
        }

        .template-table th {
            background: #f0f0f0;
            font-weight: 600;
            color: #2d3436;
        }

        .template-table td {
            color: #666;
        }

        .required {
            color: #c53030;
        }

        .optional {
            color: #999;
            font-size: 0.875rem;
        }

        .download-link {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #8b6f47;
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
            font-size: 0.875rem;
            transition: background 200ms ease-in-out;
        }

        .download-link:hover {
            background: #a0824d;
        }

        @media (max-width: 768px) {
            .sidebar {
                width: 0;
                overflow: hidden;
            }

            .main-content {
                margin-left: 0;
            }

            .page-header {
                flex-direction: column;
                gap: 1rem;
            }

            .report-section {
                grid-template-columns: 1fr;
            }

            .button-group {
                flex-direction: column;
            }

            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <nav>
                <ul class="sidebar-nav">
                    <li><a href="/admin/index.php">Dashboard</a></li>
                    <li><a href="/admin/categories.php">Categories</a></li>
                    <li><a href="/admin/products.php">Products</a></li>
                    <li><a href="/admin/reviews.php">Reviews</a></li>
                    <li><a href="/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1>Import Products</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <a href="/admin/products.php" class="back-link">← Back to Products</a>
                </div>

                <?php if ($message): ?>
                    <div class="message success"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <?php if ($report): ?>
                    <div class="section">
                        <h3>Import Summary</h3>
                        <div class="report-section">
                            <div class="report-card inserted">
                                <div class="report-number"><?php echo $report['inserted']; ?></div>
                                <div class="report-label">Inserted</div>
                            </div>
                            <div class="report-card updated">
                                <div class="report-number"><?php echo $report['updated']; ?></div>
                                <div class="report-label">Updated</div>
                            </div>
                            <div class="report-card failed">
                                <div class="report-number"><?php echo $report['failed']; ?></div>
                                <div class="report-label">Failed</div>
                            </div>
                        </div>

                        <p style="color: #666; margin-bottom: 1rem; font-size: 0.875rem;">
                            Processed <?php echo $report['rows_processed']; ?> rows total
                        </p>

                        <?php if (count($report['errors']) > 0): ?>
                            <div>
                                <h4 style="margin-bottom: 1rem; color: #c53030;">Errors</h4>
                                <ul class="errors-list">
                                    <?php foreach ($report['errors'] as $error): ?>
                                        <li><?php echo htmlspecialchars($error); ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <div class="section">
                    <h3>Upload CSV File</h3>

                    <div class="template-section">
                        <h4>CSV Format</h4>
                        <table class="template-table">
                            <thead>
                                <tr>
                                    <th>Column Name</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>sku</strong> <span class="required">*</span></td>
                                    <td>String</td>
                                    <td>Unique product identifier. Used to update existing products.</td>
                                </tr>
                                <tr>
                                    <td><strong>name</strong> <span class="required">*</span></td>
                                    <td>String</td>
                                    <td>Product name</td>
                                </tr>
                                <tr>
                                    <td><strong>price</strong> <span class="required">*</span></td>
                                    <td>Decimal</td>
                                    <td>Product price (e.g., 29.99)</td>
                                </tr>
                                <tr>
                                    <td><strong>description</strong> <span class="optional">(optional)</span></td>
                                    <td>String</td>
                                    <td>Product description</td>
                                </tr>
                                <tr>
                                    <td><strong>category_id</strong> <span class="optional">(optional)</span></td>
                                    <td>Integer</td>
                                    <td>Category ID (must exist in system)</td>
                                </tr>
                                <tr>
                                    <td><strong>image_url</strong> <span class="optional">(optional)</span></td>
                                    <td>String</td>
                                    <td>Product image URL</td>
                                </tr>
                            </tbody>
                        </table>

                        <h4 style="margin-top: 1.5rem; margin-bottom: 1rem;">Example CSV</h4>
                        <pre style="background: white; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-size: 0.75rem;">sku,name,price,description,category_id,image_url
PROD-001,Widget A,29.99,High quality widget,1,https://example.com/image1.jpg
PROD-002,Widget B,39.99,Premium widget,1,https://example.com/image2.jpg
PROD-003,Gadget X,49.99,,2,</pre>
                    </div>

                    <form method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="action" value="import">

                        <div class="form-group">
                            <label>CSV File <span class="required">*</span></label>
                            <div class="file-input-wrapper">
                                <input type="file" id="csv_file" name="csv_file" accept=".csv" required>
                                <label for="csv_file" class="file-input-label">
                                    <div class="file-input-icon">📁</div>
                                    <div class="file-input-text">
                                        Drop CSV file here or <strong>click to browse</strong>
                                    </div>
                                    <div class="file-name" id="file-name"></div>
                                </label>
                            </div>
                        </div>

                        <div class="button-group">
                            <button type="submit" class="btn">Import Products</button>
                            <a href="/admin/products.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        const fileInput = document.getElementById('csv_file');
        const fileLabel = document.querySelector('.file-input-label');
        const fileName = document.getElementById('file-name');

        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileName.textContent = 'Selected: ' + this.files[0].name;
                fileName.classList.add('visible');
                fileLabel.classList.add('active');
            }
        });

        fileLabel.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('active');
        });

        fileLabel.addEventListener('dragleave', function() {
            this.classList.remove('active');
        });

        fileLabel.addEventListener('drop', function(e) {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                fileInput.files = e.dataTransfer.files;
                fileName.textContent = 'Selected: ' + e.dataTransfer.files[0].name;
                fileName.classList.add('visible');
                this.classList.add('active');
            }
        });
    </script>
</body>
</html>
