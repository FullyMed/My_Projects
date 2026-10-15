-- Insert Prambanan Batik categories
INSERT INTO categories (id, name, slug) VALUES
  (1, 'Traditional Patterns', 'traditional-patterns'),
  (2, 'Ready to Wear', 'ready-to-wear'),
  (3, 'Fabric & Cloth', 'fabric-cloth'),
  (4, 'Traditional Wear', 'traditional-wear'),
  (5, 'Regional Styles', 'regional-styles'),
  (6, 'Batik Tulis', 'batik-tulis'),
  (7, 'Accessories', 'accessories'),
  (8, 'Home Decor', 'home-decor');

-- Insert Prambanan Batik products
INSERT INTO products (id, category_id, sku, slug, name, description, price_display, rating_avg, rating_count, buy_link_shopee, created_at, updated_at) VALUES
  (1, 1, 'PRMB-001', 'parang-sogan-batik-cloth', 'Parang Sogan Batik Cloth', 'Cotton cloth in the parang pattern: rows of slanting S-shapes in cream on sogan brown, the classic colour of Central Javanese batik. Wear it as a kain or take it to your tailor.', 350000, 4.8, 342, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (2, 2, 'PRMB-002', 'pekalongan-batik-wrap-skirt', 'Pekalongan Batik Wrap Skirt', 'A wrap skirt cut from Pekalongan batik, the north-coast style known for its bright colours. Wear it with a kebaya to a wedding or with a plain top on a normal day.', 450000, 4.6, 218, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (3, 3, 'PRMB-003', 'cirebon-batik-fabric', 'Cirebon Batik Fabric', 'Batik cotton from Cirebon, sold as fabric for your own tailor. Cirebon batik often mixes cloud and flower motifs.', 280000, 4.7, 289, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (4, 4, 'PRMB-004', 'long-sleeve-batik-shirt', 'Long-Sleeve Batik Shirt', 'A long-sleeved shirt in brown and cream batik. In Indonesia a batik shirt counts as formal wear, so this one works for the office, a wedding or a family dinner.', 320000, 4.5, 156, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (5, 5, 'PRMB-005', 'lasem-red-batik-cloth', 'Lasem Red Batik Cloth', 'Lasem, a small town on Java\'s north coast, is known for its deep red dye. This cloth pairs that red with indigo.', 520000, 4.9, 405, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (6, 6, 'PRMB-006', 'hand-drawn-batik-tulis', 'Hand-Drawn Batik Tulis', 'Batik tulis is drawn by hand with a canting, a small copper pen that lays down hot wax one line at a time. One cloth can take weeks to finish, which is why it costs more than stamped batik.', 850000, 4.9, 178, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (7, 7, 'PRMB-007', 'yogyakarta-batik-scarf', 'Yogyakarta Batik Scarf', 'A light scarf in Yogyakarta-style batik. Wear it around your neck or over your shoulders.', 185000, 4.4, 97, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW()),
  (8, 8, 'PRMB-008', 'indigo-batik-wall-hanging', 'Indigo Batik Wall Hanging', 'Blue and white batik with geometric motifs, hemmed and ready to hang on a wall.', 420000, 4.6, 134, 'https://shopee.co.id/search?keyword=prambanan%20batik', NOW(), NOW());

-- Insert product images
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order) VALUES
  (1, 1, 'https://images.unsplash.com/photo-1616125162686-770bf85622b9?auto=format&fit=crop&w=600&q=80', 'Parang Sogan Batik Cloth', 0),
  (2, 2, 'https://images.unsplash.com/photo-1630929436231-91f4c6fe4884?auto=format&fit=crop&w=600&q=80', 'Pekalongan Batik Wrap Skirt', 0),
  (3, 3, 'https://images.unsplash.com/photo-1444362408440-274ecb6fc730?auto=format&fit=crop&w=600&q=80', 'Cirebon Batik Fabric', 0),
  (4, 4, 'https://images.unsplash.com/photo-1680345575812-2f6878d7d775?auto=format&fit=crop&w=600&q=80', 'Long-Sleeve Batik Shirt', 0),
  (5, 5, 'https://images.unsplash.com/photo-1680345575909-99633d4b6f46?auto=format&fit=crop&w=600&q=80', 'Lasem Red Batik Cloth', 0),
  (6, 6, 'https://images.unsplash.com/photo-1604973104381-870c92f10343?auto=format&fit=crop&w=600&q=80', 'Hand-Drawn Batik Tulis', 0),
  (7, 7, 'https://images.unsplash.com/photo-1672716912554-c23ba8fac4ce?auto=format&fit=crop&w=600&q=80', 'Yogyakarta Batik Scarf', 0),
  (8, 8, 'https://images.unsplash.com/photo-1586319826907-1ff4aadbaddc?auto=format&fit=crop&w=600&q=80', 'Indigo Batik Wall Hanging', 0);

-- Insert reviews for Prambanan Batik products
INSERT INTO reviews (id, product_id, reviewer_name, rating, content, review_source, verified_purchase, created_at) VALUES
  (1, 1, 'Siti Nurhaliza', 5, 'The parang lines are crisp and the brown is the same as in the photo. It came folded in tissue paper.', NULL, true, NOW()),
  (2, 1, 'Bambang', 5, 'I bought two lengths for my wife\'s kebaya set. Our tailor said the cotton is good.', NULL, true, NOW()),
  (3, 2, 'Dewi', 4, 'Comfortable, and the colours are bright. It was a bit long on me, so I had it shortened.', NULL, true, NOW()),
  (4, 3, 'Rinto', 5, 'Easy to sew, and the pattern lines up well at the seams.', NULL, true, NOW()),
  (5, 4, 'Andi', 4, 'Fits well and looks smart at the office. The sleeves are a little long for me.', NULL, true, NOW()),
  (6, 5, 'Joko', 5, 'The red is deep and hasn\'t faded after several washes.', NULL, true, NOW()),
  (7, 5, 'Elsa', 5, 'Worth the price. I use it as a table cloth and guests ask where it\'s from.', NULL, true, NOW()),
  (8, 6, 'Hendra', 5, 'You can see small wax cracks and tiny differences in the lines, so you know someone drew it by hand.', NULL, true, NOW()),
  (9, 7, 'Wati', 4, 'Light and soft. I wear it most weekends.', NULL, true, NOW()),
  (10, 8, 'Suryanto', 5, 'The indigo looks great on our white living-room wall.', NULL, true, NOW());

-- rating_avg / rating_count are denormalized (see CLAUDE.md): derive them from the reviews
-- inserted above, the same way the admin panel does on every review change.
UPDATE products SET
  rating_avg   = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = products.id), 0),
  rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = products.id);
