<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';
$pdo = require __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/auth.php';

requireDatabase($pdo);
requireAdminLogin($pdo);
$admin = getAdminSession();

$message = '';
$error = '';
$report = null;

/**
 * A slug not used by any other product: the slugified name, or name-2, name-3, … on a clash
 * (two products with the same name would otherwise fail on the UNIQUE slug index).
 */
function uniqueProductSlug($pdo, $base) {
    $stmt = $pdo->prepare('SELECT 1 FROM products WHERE slug = ? LIMIT 1');
    $slug = $base;
    for ($i = 2; ; $i++) {
        $stmt->execute([$slug]);
        if (!$stmt->fetchColumn()) {
            return $slug;
        }
        $slug = $base . '-' . $i;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = 'Your session expired. Reload the page and try again.';
    } else {
    $action = $_POST['action'] ?? '';

    if ($action === 'import' && isset($_FILES['csv_file']) && is_array($_FILES['csv_file']) && !is_array($_FILES['csv_file']['error'])) {
        $file = $_FILES['csv_file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $error = $file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE
                ? 'That file is bigger than the server allows.'
                : 'The upload didn\'t finish. Try again.';
        } elseif ($file['size'] === 0) {
            $error = 'That file is empty.';
        } elseif ($file['size'] > 5 * 1024 * 1024) {
            $error = 'That file is over 5 MB. Split it into smaller files.';
        } elseif (strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'csv') {
            $error = 'Upload a .csv file.';
        }

        $handle = $error ? false : fopen($file['tmp_name'], 'r');
        if (!$error && !$handle) {
            $error = 'We couldn\'t read that file. Try uploading it again.';
        }

        if ($handle) {
            $report = [
                'inserted' => 0,
                'updated' => 0,
                'failed' => 0,
                'errors' => [],
                'rows_processed' => 0,
            ];

            $categoryStmt = $pdo->prepare('SELECT 1 FROM categories WHERE id = ? LIMIT 1');
            $imageExistsStmt = $pdo->prepare('SELECT 1 FROM product_images WHERE product_id = ? AND image_url = ? LIMIT 1');
            $imageInsertStmt = $pdo->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, 0)');

            $headers = null;
            $rowNum = 0;

            // Length 0 = no line-length limit, so long descriptions aren't split into bogus rows.
            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                $rowNum++;

                // fgetcsv() returns [null] for a blank line.
                if ($row === [null] || (count($row) === 1 && trim((string)$row[0]) === '')) {
                    continue;
                }

                if ($headers === null) {
                    // Strip a UTF-8 BOM (Excel's "CSV UTF-8" adds one) and match headers case-insensitively.
                    $row[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string)$row[0]);
                    $headers = array_map(function ($h) {
                        return strtolower(trim((string)$h));
                    }, $row);
                    $missing = array_diff(['sku', 'name', 'price'], $headers);
                    if ($missing) {
                        $error = 'The first row of the CSV is missing these columns: ' . implode(', ', $missing) . '.';
                        $report = null;
                        break;
                    }
                    continue;
                }

                $report['rows_processed']++;

                if (count($row) !== count($headers)) {
                    $report['failed']++;
                    $report['errors'][] = "Row $rowNum has " . count($row) . ' columns, but the header row has ' . count($headers) . '. Check for a comma that isn\'t inside double quotes.';
                    continue;
                }

                $data = array_map(function ($v) {
                    return trim((string)$v);
                }, array_combine($headers, $row));

                $sku = $data['sku'] ?? '';
                $name = $data['name'] ?? '';
                $description = $data['description'] ?? '';
                $price = $data['price'] ?? '';
                $categoryId = $data['category_id'] ?? '';
                $imageUrl = $data['image_url'] ?? '';

                if ($sku === '' || $name === '' || $price === '') {
                    $report['failed']++;
                    $report['errors'][] = "Row $rowNum: sku, name and price can't be empty.";
                    continue;
                }

                // Reject Indonesian thousands separators ("350.000" would otherwise import as Rp 350).
                if (!is_numeric($price) || (float)$price < 0 || (float)$price > 99999999.99 || preg_match('/^\d{1,3}(\.\d{3})+$/', $price)) {
                    $report['failed']++;
                    $report['errors'][] = "Row $rowNum (SKU $sku): the price \"$price\" isn't a plain number. Write it as digits only, like 350000.";
                    continue;
                }

                if ($categoryId !== '') {
                    $categoryExists = false;
                    if (ctype_digit($categoryId)) {
                        $categoryStmt->execute([(int)$categoryId]);
                        $categoryExists = (bool)$categoryStmt->fetchColumn();
                    }
                    if (!$categoryExists) {
                        $report['failed']++;
                        $report['errors'][] = "Row $rowNum (SKU $sku): there's no category with ID \"$categoryId\".";
                        continue;
                    }
                }

                if ($imageUrl !== '' && (!preg_match('/^https?:\/\//i', $imageUrl) || strlen($imageUrl) > 500)) {
                    $report['errors'][] = "Row $rowNum (SKU $sku): we skipped the image_url because it doesn't start with http:// or https://, or it's longer than 500 characters.";
                    $imageUrl = '';
                }

                try {
                    $pdo->beginTransaction();

                    $stmt = $pdo->prepare('SELECT id FROM products WHERE sku = ? LIMIT 1');
                    $stmt->execute([$sku]);
                    $existingProduct = $stmt->fetch();

                    if ($existingProduct) {
                        $productId = (int)$existingProduct['id'];

                        $updateFields = ['name = ?', 'price_display = ?'];
                        $updateValues = [$name, $price];

                        if ($description !== '') {
                            $updateFields[] = 'description = ?';
                            $updateValues[] = $description;
                        }

                        if ($categoryId !== '') {
                            $updateFields[] = 'category_id = ?';
                            $updateValues[] = (int)$categoryId;
                        }

                        $updateFields[] = 'updated_at = NOW()';
                        $updateValues[] = $productId;

                        $stmt = $pdo->prepare('UPDATE products SET ' . implode(', ', $updateFields) . ' WHERE id = ?');
                        $stmt->execute($updateValues);

                        $report['updated']++;
                    } else {
                        $baseSlug = slugify($name) !== '' ? slugify($name) : slugify($sku);
                        if ($baseSlug === '') {
                            $baseSlug = 'product';
                        }

                        $stmt = $pdo->prepare(
                            'INSERT INTO products (sku, slug, name, description, price_display, category_id) VALUES (?, ?, ?, ?, ?, ?)'
                        );
                        $stmt->execute([
                            $sku,
                            uniqueProductSlug($pdo, $baseSlug),
                            $name,
                            $description !== '' ? $description : null,
                            $price,
                            $categoryId !== '' ? (int)$categoryId : null,
                        ]);
                        $productId = (int)$pdo->lastInsertId();

                        $report['inserted']++;
                    }

                    // Re-importing the same CSV must not stack duplicate copies of the same image.
                    if ($imageUrl !== '') {
                        $imageExistsStmt->execute([$productId, $imageUrl]);
                        if (!$imageExistsStmt->fetchColumn()) {
                            $imageInsertStmt->execute([$productId, $imageUrl]);
                        }
                    }

                    $pdo->commit();
                } catch (Exception $e) {
                    if ($pdo->inTransaction()) {
                        $pdo->rollBack();
                    }
                    error_log("CSV import row $rowNum (SKU: $sku) failed: " . $e->getMessage());
                    $report['failed']++;
                    $report['errors'][] = "Row $rowNum (SKU $sku): we couldn't save this row. Check its values.";
                }
            }

            fclose($handle);

            if ($report !== null) {
                if ($report['rows_processed'] === 0) {
                    $error = 'The CSV has a header row but no products under it.';
                    $report = null;
                } elseif ($report['failed'] === 0) {
                    $message = 'Import finished. We saved every row.';
                } elseif ($report['inserted'] + $report['updated'] > 0) {
                    $message = 'Import finished, but we skipped some rows. The list below says why.';
                } else {
                    $error = 'We didn\'t import any rows. The list below says why.';
                }
            }
        }
    } elseif ($action === 'import') {
        $error = 'Choose a CSV file to upload.';
    }
    } // end CSRF else
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
    <title>Import products</title>
    
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="<?php echo SITE_PATH; ?>/assets/favicon/favicon.ico" sizes="any">
    <link rel="apple-touch-icon" sizes="180x180" href="<?php echo SITE_PATH; ?>/assets/favicon/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo asset_url('admin/admin.css'); ?>">
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Admin panel</h2>
            </div>
            <nav aria-label="Admin">
                <ul class="sidebar-nav">
                    <li><a href="<?php echo SITE_PATH; ?>/admin/index.php">Dashboard</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/categories.php">Categories</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/products.php" class="active" aria-current="page">Products</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/reviews.php">Reviews</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/admins.php">Admins</a></li>
                    <li><a href="<?php echo SITE_PATH; ?>/admin/logout.php">Log out</a></li>
                </ul>
            </nav>
        </aside>

        <main class="main-content" id="main" tabindex="-1">
            <div class="topbar">
                <h1>Import products</h1>
                <div class="topbar-user">
                    <span><?php echo htmlspecialchars($admin['email']); ?></span>
                    <a href="<?php echo SITE_PATH; ?>/admin/logout.php">Log out</a>
                </div>
            </div>

            <div class="content">
                <div class="page-header">
                    <a href="<?php echo SITE_PATH; ?>/admin/products.php" class="back-link">← Back to products</a>
                </div>

                <?php if ($message): ?>
                    <div class="message success"><?php echo htmlspecialchars($message); ?></div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <?php if ($report): ?>
                    <div class="section">
                        <h3>Import summary</h3>
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

                        <p class="muted" style="margin-bottom: 1rem;">
                            Processed <?php echo $report['rows_processed']; ?> rows total
                        </p>

                        <?php if (count($report['errors']) > 0): ?>
                            <div>
                                <h4 style="margin-bottom: 1rem; color: #c53030;">Skipped rows</h4>
                                <ul class="errors-list">
                                    <?php foreach ($report['errors'] as $rowError): ?>
                                        <li><?php echo htmlspecialchars($rowError); ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <div class="section">
                    <h3>Upload a CSV file</h3>

                    <div class="template-section">
                        <h4>CSV format</h4>
                        <table class="template-table">
                            <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>sku</strong> <span class="required">*</span></td>
                                    <td>String</td>
                                    <td>Your product code. A row with a SKU that already exists updates that product.</td>
                                </tr>
                                <tr>
                                    <td><strong>name</strong> <span class="required">*</span></td>
                                    <td>String</td>
                                    <td>Product name</td>
                                </tr>
                                <tr>
                                    <td><strong>price</strong> <span class="required">*</span></td>
                                    <td>Number</td>
                                    <td>Price in rupiah, digits only: 350000, not 350.000 or Rp 350.000</td>
                                </tr>
                                <tr>
                                    <td><strong>description</strong> <span class="optional">(optional)</span></td>
                                    <td>String</td>
                                    <td>Product description</td>
                                </tr>
                                <tr>
                                    <td><strong>category_id</strong> <span class="optional">(optional)</span></td>
                                    <td>Integer</td>
                                    <td>Category ID. It must already exist:<?php if ($categories): ?><br><small><?php echo htmlspecialchars(implode(' · ', array_map(function ($c) { return $c['id'] . ' = ' . $c['name']; }, $categories))); ?></small><?php endif; ?></td>
                                </tr>
                                <tr>
                                    <td><strong>image_url</strong> <span class="optional">(optional)</span></td>
                                    <td>String</td>
                                    <td>Product image URL</td>
                                </tr>
                            </tbody>
                        </table>

                        <h4 style="margin-top: 1.5rem; margin-bottom: 1rem;">Example CSV</h4>
                        <pre class="csv-example">sku,name,price,description,category_id,image_url
PRMB-101,Sogan Parang Batik Tulis,650000,"Hand-drawn parang motif, natural sogan dye",1,https://example.com/parang.jpg
PRMB-102,Kawung Batik Shirt,275000,Cotton shirt with kawung motif,2,https://example.com/kawung.jpg
PRMB-103,Indigo Batik Table Runner,150000,,8,</pre>
                        <p class="muted" style="margin-top: 0.75rem;">If a row's SKU already exists, we update that product's name and price, plus its description and category when those cells aren't empty. Put double quotes around any value that contains a comma. Excel's "CSV UTF-8" format works as it is.</p>
                    </div>

                    <form method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="action" value="import">
                        <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>">

                        <div class="form-group">
                            <label>CSV file <span class="required">*</span></label>
                            <div class="file-input-wrapper">
                                <input type="file" id="csv_file" name="csv_file" accept=".csv" required>
                                <label for="csv_file" class="file-input-label">
                                    <div class="file-input-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4"/><path d="m7 8 5-5 5 5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg></div>
                                    <div class="file-input-text">
                                        Drop CSV file here or <strong>click to browse</strong>
                                    </div>
                                    <div class="file-name" id="file-name"></div>
                                </label>
                            </div>
                        </div>

                        <div class="button-group">
                            <button type="submit" class="btn">Import products</button>
                            <a href="<?php echo SITE_PATH; ?>/admin/products.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>

    <script src="<?php echo asset_url('assets/js/main.js'); ?>"></script>
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
