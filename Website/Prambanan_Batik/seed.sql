-- Insert Prambanan Batik categories
INSERT INTO categories (id, name, slug) VALUES
  (1, 'Traditional Patterns', 'traditional-patterns'),
  (2, 'Ready to Wear', 'ready-to-wear'),
  (3, 'Fabric & Cloth', 'fabric-cloth'),
  (4, 'Traditional Wear', 'traditional-wear'),
  (5, 'Regional Styles', 'regional-styles'),
  (6, 'Premium Collection', 'premium-collection'),
  (7, 'Accessories', 'accessories'),
  (8, 'Home Decor', 'home-decor');

-- Insert Prambanan Batik products
INSERT INTO products (id, category_id, sku, slug, name, description, price_display, rating_avg, rating_count, buy_link_shopee, created_at, updated_at) VALUES
  (1, 1, 'PRMB-001', 'traditional-mega-mendung-batik', 'Traditional Mega Mendung Batik', 'Premium traditional Mega Mendung batik with intricate cloud patterns. Hand-drawn designs on premium cotton fabric. Perfect for formal occasions and collections.', 350000, 4.8, 342, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (2, 2, 'PRMB-002', 'modern-pekalongan-batik-dress', 'Modern Pekalongan Batik Dress', 'Contemporary Pekalongan batik dress combining traditional patterns with modern silhouette. Comfortable breathable fabric suitable for daily wear and special events.', 450000, 4.6, 218, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (3, 3, 'PRMB-003', 'authentic-cirebon-batik-fabric', 'Authentic Cirebon Batik Fabric', 'Authentic Cirebon batik fabric with distinctive motifs featuring celestial and floral elements. Premium quality suitable for custom tailoring and collection.', 280000, 4.7, 289, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (4, 4, 'PRMB-004', 'javanese-sarong-batik-motifs', 'Javanese Sarong with Batik Motifs', 'Traditional Javanese sarong featuring authentic batik patterns. Versatile wrap suitable for casual wear, beach outings, and cultural events.', 320000, 4.5, 156, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (5, 5, 'PRMB-005', 'lasem-red-batik-collection', 'Lasem Red Batik Collection', 'Distinctive Lasem red batik featuring bold red and indigo colors. Signature design from Lasem region with intricate maritime motifs.', 520000, 4.9, 405, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (6, 6, 'PRMB-006', 'batik-tulis-hand-drawn-masterpiece', 'Batik Tulis Hand-drawn Masterpiece', 'Premium batik tulis (hand-drawn) masterpiece created by master artisans. Limited edition with unique artistic value and exceptional craftsmanship.', 850000, 4.9, 178, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (7, 7, 'PRMB-007', 'yogyakarta-batik-scarf', 'Yogyakarta Batik Scarf', 'Elegant Yogyakarta batik scarf with traditional motifs. Lightweight and versatile for various styling occasions.', 185000, 4.4, 97, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (8, 8, 'PRMB-008', 'indigo-batik-wall-hanging', 'Indigo Batik Wall Hanging', 'Beautiful indigo batik wall hanging featuring traditional geometric patterns. Perfect for adding cultural charm to any interior space.', 420000, 4.6, 134, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW());

-- Insert product images
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order) VALUES
  (1, 1, 'https://images.unsplash.com/photo-1616125162686-770bf85622b9?auto=format&fit=crop&w=600&q=80', 'Traditional Mega Mendung Batik', 0),
  (2, 2, 'https://images.unsplash.com/photo-1630929436231-91f4c6fe4884?auto=format&fit=crop&w=600&q=80', 'Modern Pekalongan Batik Dress', 0),
  (3, 3, 'https://images.unsplash.com/photo-1444362408440-274ecb6fc730?auto=format&fit=crop&w=600&q=80', 'Authentic Cirebon Batik Fabric', 0),
  (4, 4, 'https://images.unsplash.com/photo-1680345575812-2f6878d7d775?auto=format&fit=crop&w=600&q=80', 'Javanese Sarong with Batik Motifs', 0),
  (5, 5, 'https://images.unsplash.com/photo-1680345575909-99633d4b6f46?auto=format&fit=crop&w=600&q=80', 'Lasem Red Batik Collection', 0),
  (6, 6, 'https://images.unsplash.com/photo-1604973104381-870c92f10343?auto=format&fit=crop&w=600&q=80', 'Batik Tulis Hand-drawn Masterpiece', 0),
  (7, 7, 'https://images.unsplash.com/photo-1672716912554-c23ba8fac4ce?auto=format&fit=crop&w=600&q=80', 'Yogyakarta Batik Scarf', 0),
  (8, 8, 'https://images.unsplash.com/photo-1586319826907-1ff4aadbaddc?auto=format&fit=crop&w=600&q=80', 'Indigo Batik Wall Hanging', 0);

-- Insert reviews for Prambanan Batik products
INSERT INTO reviews (id, product_id, reviewer_name, rating, content, review_source, verified_purchase, created_at) VALUES
  (1, 1, 'Siti Nurhaliza', 5, 'Authentic batik with incredible craftsmanship. The cloud patterns are so intricate!', NULL, true, NOW()),
  (2, 1, 'Bambang', 5, 'Absolutely beautiful piece. Perfect for my batik collection.', NULL, true, NOW()),
  (3, 2, 'Dewi', 4, 'Love the modern take on traditional batik. Very comfortable to wear.', NULL, true, NOW()),
  (4, 3, 'Rinto', 5, 'Premium quality fabric. Cirebon batik is my favorite regional style.', NULL, true, NOW()),
  (5, 4, 'Andi', 4, 'Great sarong, traditional patterns are stunning', NULL, true, NOW()),
  (6, 5, 'Joko', 5, 'Lasem red batik is iconic. The colors are vibrant and true.', NULL, true, NOW()),
  (7, 5, 'Elsa', 5, 'Masterpiece! Worth every rupiah. Highly recommend Prambanan Batik.', NULL, true, NOW()),
  (8, 6, 'Hendra', 5, 'Hand-drawn batik tulis - exceptional quality and artistry. Limited edition feels exclusive.', NULL, true, NOW()),
  (9, 7, 'Wati', 4, 'Elegant scarf with traditional Yogyakarta patterns. Great for everyday wear.', NULL, true, NOW()),
  (10, 8, 'Suryanto', 5, 'Wall hanging adds cultural charm to my living room. Indigo colors are mesmerizing.', NULL, true, NOW());

-- rating_avg / rating_count are denormalized (see CLAUDE.md): derive them from the reviews
-- actually inserted above, exactly as the admin panel does on every review change.
UPDATE products SET
  rating_avg   = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = products.id), 0),
  rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = products.id);
