<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';
$pdo = require __DIR__ . '/../db_connect.php';
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
                                $updateFields[] = 'price_display = ?';
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

                            if ($imageUrl) {
                                $imgStmt = $pdo->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, 0)');
                                $imgStmt->execute([$productId, $imageUrl]);
                            }

                            $report['updated']++;
                        } else {
                            $slug = slugify($name);
                            if (empty($slug)) {
                                $slug = slugify($sku);
                            }

                            $stmt = $pdo->prepare(
                                'INSERT INTO products (sku, slug, name, description, price_display, category_id) VALUES (?, ?, ?, ?, ?, ?)'
                            );
                            $stmt->execute([
                                $sku,
                                $slug,
                                $name,
                                $description ?: null,
                                $price,
                                $categoryId ?: null,
                            ]);

                            if ($imageUrl) {
                                $newProductId = $pdo->lastInsertId();
                                $imgStmt = $pdo->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, 0)');
                                $imgStmt->execute([$newProductId, $imageUrl]);
                            }

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
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo SITE_PATH; ?>/admin/admin.css">
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <nav>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo SITE_PATH; ?>/admin/index.php">Dashboard</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/categories.php">Categories</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a></li>
                </ul>
            </nav>
        </aside>

        <div class="main-content">
            <div class="topbar">
                <h1>Import Products</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Logout</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <a href="<?php echo SITE_PATH; ?>/admin/products.php" class="back-link">← Back to Products</a>
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
                            <a href="<?php echo SITE_PATH; ?>/admin/products.php" class="btn btn-secondary">Cancel</a>
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
