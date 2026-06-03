# Prambanan Batik - Product Catalog & Review System

A full-featured product catalog showcasing authentic Indonesian batik with admin management panel and customer reviews built with PHP and MySQL.

## Features

- **Product Management**: Browse, search, and filter batik products by category
- **Customer Reviews**: Submit and view product reviews with star ratings
- **Admin Panel**: Secure authentication to manage products, categories, reviews, and images
- **CSV Import**: Bulk import products with upsert by SKU
- **Responsive Design**: Mobile-friendly interface with modern styling
- **SEO Optimized**: XML sitemap and robots.txt for search engines
- **Outbound Click Tracking**: Analytics for affiliate/shop links (Shopee, Tokopedia, etc.)
- **Multi-Language Ready**: Built with internationalization in mind

## Technology Stack

- **Backend**: PHP 7.4+ with PDO
- **Database**: MySQL 8.0+ with utf8mb4 charset
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Architecture**: MVC-inspired with utility functions
- **Hosting**: Compatible with shared hosting (Niagahoster, etc.)

## Prerequisites

- PHP 7.4 or higher
- MySQL 8.0 or higher
- PDO extension for PHP
- Web server (Apache/Nginx) with `.htaccess` support (for Apache)

## Installation & Deployment

### Step 1: Database Setup

1. Access **cPanel** → **MySQL Databases**
2. Create a new database:
   - Database Name: `product_catalog` (or custom name)
   - Click "Create Database"
3. Create a database user:
   - Username: `catalog_user` (or custom name)
   - Password: Generate a strong password
   - Click "Create User"
4. Add user to database:
   - Select the user and database → "Add"
   - Grant ALL privileges

### Step 2: Upload Files

1. Connect via FTP using your hosting credentials
2. Navigate to `public_html` folder
3. Upload all project files maintaining the folder structure

### Step 3: Configure Database Connection

Edit `config.php` with your database credentials:
```php
define('DB_HOST', 'localhost');        // Usually localhost
define('DB_NAME', 'product_catalog');  // Your database name
define('DB_USER', 'catalog_user');     // Your database user
define('DB_PASSWORD', 'your_password'); // Your database password
define('BASE_URL', 'https://yourdomain.com');
define('SITE_TIMEZONE', 'Asia/Jakarta');
```

Also update `robots.txt` with your domain.

### Step 4: Create Database Tables

1. Access **cPanel** → **phpMyAdmin**
2. Select your database from left sidebar
3. Go to **SQL** tab
4. Copy and paste the entire `schema.sql` file
5. Click **Go** to execute
6. (Optional) Run `seed.sql` to populate sample data

### Step 5: Create Admin User

In phpMyAdmin SQL tab, run:
```sql
INSERT INTO admin_users (email, password_hash, created_at) VALUES
('admin@yourdomain.com', SHA2('your_password_here', 256), NOW());
```

### Step 6: Verify Installation

1. Visit your domain: `https://yourdomain.com`
   - Should see the Prambanan Batik homepage with featured products
2. Visit admin: `https://yourdomain.com/admin/`
   - Login with admin email and password
3. Test functionality:
   - Browse products and filters
   - Submit a review on a product
   - Add/edit products in admin panel

## Environment Variables (Optional)

The application supports environment variables via a `.env` file:

```
BASE_URL=https://yourdomain.com
DB_HOST=localhost
DB_NAME=product_catalog
DB_USER=catalog_user
DB_PASSWORD=your_password
```

If not set, defaults from `config.php` will be used.

## File Structure

```
/
├── index.php                    # Homepage with featured products
├── products.php                 # Products listing with category filters
├── product.php                  # Single product detail page with reviews
├── go.php                       # Outbound redirect with click tracking
├── sitemap.php                  # XML sitemap generator
├── robots.txt                   # Search engine directives
├── config.php                   # Site configuration constants
├── db_connect.php               # Database connection setup
├── functions.php                # Utility functions
├── header.php                   # Page header template
├── footer.php                   # Page footer template
├── schema.sql                   # Database schema (CREATE TABLE statements)
├── seed.sql                     # Sample data
├── .env                         # Environment variables (if using)
├── assets/
│   ├── css/
│   │   └── styles.css          # Main website styles
│   └── js/
│       └── main.js             # Frontend JavaScript
├── admin/
│   ├── admin.css               # Admin panel styles
│   ├── index.php               # Admin dashboard
│   ├── login.php               # Admin login page
│   ├── logout.php              # Admin logout handler
│   ├── auth.php                # Authentication functions
│   ├── categories.php          # Manage categories
│   ├── products.php            # Manage products listing
│   ├── product_edit.php        # Edit/create product
│   ├── product_images.php      # Manage product images
│   ├── import_products.php     # CSV bulk import
│   ├── reviews.php             # Manage reviews
│   └── review_edit.php         # Edit reviews
└── README.md                    # This file
```

## Database Schema

### Tables

**categories**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR 255, UNIQUE)
- `slug` (VARCHAR 255, UNIQUE) - URL-friendly name
- Indexes on slug for fast lookups

**products**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `category_id` (INT, FOREIGN KEY)
- `sku` (VARCHAR 255, UNIQUE) - Stock Keeping Unit for CSV import
- `slug` (VARCHAR 255, UNIQUE) - URL-friendly name
- `name` (VARCHAR 255)
- `description` (LONGTEXT)
- `price_display` (DECIMAL 10,2)
- `rating_avg` (DECIMAL 3,2) - Average rating from reviews
- `rating_count` (INT) - Total number of reviews
- `buy_link_shopee` (VARCHAR 500) - Shopee affiliate link
- `buy_link_tokopedia` (VARCHAR 500) - Tokopedia affiliate link
- `buy_link_other` (VARCHAR 500) - Other marketplace link
- `created_at`, `updated_at` - Timestamps
- Indexes on category, sku, slug, price, rating for query optimization

**product_images**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `product_id` (INT, FOREIGN KEY)
- `image_url` (VARCHAR 500)
- `alt_text` (VARCHAR 255) - Accessibility text
- `sort_order` (INT) - Display order
- `created_at` - Timestamp

**reviews**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `product_id` (INT, FOREIGN KEY)
- `reviewer_name` (VARCHAR 255)
- `rating` (INT 1-5) - CHECK constraint validates 1-5
- `content` (LONGTEXT)
- `review_source` (VARCHAR 50) - e.g., 'customer', 'verified_purchase'
- `verified_purchase` (BOOLEAN) - For future integration
- `created_at` - Timestamp

**outbound_clicks**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `product_id` (INT, FOREIGN KEY)
- `platform` (VARCHAR 50) - 'shopee', 'tokopedia', 'other'
- `user_ip` (VARCHAR 45) - IPv4 or IPv6
- `user_agent` (TEXT) - Browser information
- `referrer` (VARCHAR 500) - HTTP referrer
- `created_at` - Timestamp
- For tracking affiliate link clicks

**admin_users**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `email` (VARCHAR 255, UNIQUE)
- `password_hash` (VARCHAR 255) - SHA2(password, 256)
- `created_at` - Timestamp

## API/URL Patterns

### Frontend Pages

- `/` - Homepage
- `/products.php` - Products listing (supports `?category=slug` filter)
- `/product.php?id={id}` - Product detail page
- `/sitemap.php` - XML sitemap

### Redirect Handler

- `/go.php?id={product_id}&platform={shopee|tokopedia|other}` - Redirects to affiliate link and logs click

### Admin Pages

- `/admin/` - Dashboard (login required)
- `/admin/login.php` - Login form
- `/admin/logout.php` - Logout handler
- `/admin/categories.php` - Manage categories
- `/admin/products.php` - List products
- `/admin/product_edit.php` - Create/edit product
- `/admin/product_images.php` - Manage product images
- `/admin/import_products.php` - CSV import
- `/admin/reviews.php` - Manage reviews
- `/admin/review_edit.php` - Edit review

## CSV Import Format

Upload CSV files to bulk import products. Required format:

```
sku,name,price,description,category_id,image_url
PROD-001,Cloud Pattern Batik,299999,Hand-made traditional batik with cloud motifs,1,https://example.com/image.jpg
```

**Required columns**: `sku`, `name`, `price`
**Optional columns**: `description`, `category_id`, `image_url`

Products are **upserted by SKU** - existing products with the same SKU are updated.

## Core Functions (functions.php)

Key utility functions available:

- `escape($str)` - HTML escape user input
- `format_currency($amount)` - Format price display
- `get_star_rating($rating)` - Generate star HTML
- `get_query_param($name, $default, $filter)` - Safe query parameter retrieval
- `get_pagination($page, $total, $per_page)` - Pagination calculations
- `get_sample_batik_products()` - Sample product data for preview mode

## Session Management

- Session name: `product_hub_session` (customizable in config)
- Session timeout: 30 minutes
- Auto-regeneration on admin login
- Secure flag on session cookies

## Security Features

- **Prepared Statements**: All queries use PDO prepared statements (SQL injection protection)
- **Input Validation**: GET/POST parameters validated and sanitized
- **Password Hashing**: Admin passwords hashed with SHA2-256
- **Output Escaping**: All dynamic content escaped with `escape()` function
- **HTTPS Ready**: Full support for HTTPS
- **Error Handling**: Errors logged to server logs, not displayed to users
- **CORS Ready**: Can be extended with CORS headers for API usage

### Security Recommendations

1. **Rename Admin Path**: Change `/admin/` folder name to something non-obvious
2. **Strong Passwords**: Use 12+ character passwords with mixed case, numbers, symbols
3. **HTTPS Only**: Redirect HTTP to HTTPS in `.htaccess`
4. **Regular Backups**: Backup database and files weekly
5. **Update PHP**: Keep PHP version current
6. **Disable Direct Access**: Add `.htaccess` to restrict direct access to sensitive files
7. **Monitor Logs**: Check cPanel error logs regularly

## Performance Tips

### Database Optimization

- Indexes are already configured on all frequently queried columns
- Use phpMyAdmin "Optimize" feature: Operations → Optimize

### Server-Side

1. **Enable Gzip Compression** in `.htaccess`:
   ```
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript
   </IfModule>
   ```

2. **Browser Caching** (already set in header.php):
   ```
   Cache-Control: public, max-age=3600
   ```

3. **Minimize Database Queries**:
   - Featured products are cached in memory during page load
   - Product images fetched with efficient subqueries

### Client-Side

1. **Lazy Loading**: Images use `loading="lazy"` attribute
2. **Asset Optimization**: Minify CSS/JS for production
3. **CDN Ready**: Image URLs can be absolute for CDN integration

## Troubleshooting

### Database Connection Error

**Error**: "Database connection failed"
- Check credentials in `config.php`
- Verify database user has ALL privileges
- Confirm MySQL is running (cPanel → Services)
- Check database host (usually 'localhost')

### Admin Login Issues

- Verify admin email and password in database
- Clear browser cookies/cache
- Check session save path in cPanel PHP Configuration
- Ensure cookies are enabled in browser

### CSV Import Fails

- Verify CSV format matches required columns
- Check file encoding (should be UTF-8)
- Ensure category_id exists in database
- Maximum file size check in `config.php`

### Product Images Not Showing

- Verify image URLs are accessible
- Check file permissions (755 for directories, 644 for files)
- Ensure image extensions are in ALLOWED_IMAGE_TYPES
- Check max upload size in PHP configuration

### Sitemap Not Generating

- Verify products exist in database
- Check file permissions for write access
- Monitor error logs for PHP errors

## Maintenance

### Regular Tasks

**Weekly**:
- Monitor disk space usage (cPanel → Disk Usage)
- Check error logs (cPanel → Error Log)

**Monthly**:
- Backup database (phpMyAdmin → Export)
- Backup files via FTP
- Review admin logs if available
- Run database optimization

**Quarterly**:
- Update PHP version if available
- Review security settings
- Check SSL certificate expiry

### Database Maintenance

In phpMyAdmin, for your database:
- Go to **Operations** tab
- Click **Optimize** to optimize tables
- Click **Check** to check for errors

## Development Notes

### Running Locally

For local development with XAMPP/WAMP:

1. Create database and user
2. Update `config.php` with local credentials
3. Run `schema.sql` to create tables
4. Optional: Run `seed.sql` for sample data
5. Access via `http://localhost/project-folder/`

### Preview Mode

The application has a "preview mode" that activates when:
- Database connection fails
- No products found in database

In preview mode, sample batik products are displayed from `get_sample_batik_products()`.

## Contributing

This is a proprietary project. For bug reports or feature requests, contact the administrator.

## Support & Resources

- [PHP Documentation](https://www.php.net/docs.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PDO Documentation](https://www.php.net/manual/en/book.pdo.php)
- [Niagahoster Docs](https://niagahoster.co.id/panduan/)
- [cPanel Documentation](https://documentation.cpanel.net/)

## License

Proprietary and Confidential. All rights reserved.

## Version History

- **v2.0.0** (2026): Complete rewrite
  - Modernized PHP with PDO
  - Fixed asset paths
  - Prambanan Batik branding
  - Improved security and performance
  
- **v1.0.0** (2024): Initial release
  - Product catalog with categories
  - Customer review system
  - Admin management panel
  - CSV import functionality
  - SEO optimization
