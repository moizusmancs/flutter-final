-- IMPORTANT: Run this AFTER the schema.sql and seed-admin.sql
-- This fixes date issues and ensures compatibility

-- Clear existing data (optional - comment out if you want to keep admin)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM order_coupons;
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart;
DELETE FROM wishlist;
DELETE FROM product_media;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM user_address;
DELETE FROM users;
DELETE FROM coupons;
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE user_address AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE product_variants AUTO_INCREMENT = 1;
ALTER TABLE product_media AUTO_INCREMENT = 1;
ALTER TABLE coupons AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE order_coupons AUTO_INCREMENT = 1;

-- =========================================================
-- CATEGORIES
-- =========================================================
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Clothing', NULL),
(2, 'Electronics', NULL),
(3, 'Home & Garden', NULL),
(4, 'Sports & Outdoors', NULL),
(5, 'Books', NULL),
(6, 'Men\'s Clothing', 1),
(7, 'Women\'s Clothing', 1),
(8, 'Kids Clothing', 1),
(9, 'Smartphones', 2),
(10, 'Laptops', 2),
(11, 'Headphones', 2),
(12, 'Furniture', 3),
(13, 'Kitchen', 3),
(14, 'Fitness', 4),
(15, 'Camping', 4);

-- =========================================================
-- USERS (20 users)
-- =========================================================
INSERT INTO users (fullname, email, phone, password_hash, created_at) VALUES
('John Smith', 'john.smith@example.com', '+1-555-0101', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-01-15 10:30:00'),
('Emma Johnson', 'emma.johnson@example.com', '+1-555-0102', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-01-16 14:20:00'),
('Michael Brown', 'michael.brown@example.com', '+1-555-0103', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-01-18 09:15:00'),
('Sophia Davis', 'sophia.davis@example.com', '+1-555-0104', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-01-20 16:45:00'),
('James Wilson', 'james.wilson@example.com', '+1-555-0105', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-01-22 11:30:00'),
('Olivia Martinez', 'olivia.martinez@example.com', '+1-555-0106', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-01-25 13:20:00'),
('William Anderson', 'william.anderson@example.com', '+1-555-0107', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-01-28 08:50:00'),
('Ava Taylor', 'ava.taylor@example.com', '+1-555-0108', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-01 15:10:00'),
('Benjamin Thomas', 'benjamin.thomas@example.com', '+1-555-0109', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-03 10:25:00'),
('Isabella Garcia', 'isabella.garcia@example.com', '+1-555-0110', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-05 12:40:00'),
('Lucas Rodriguez', 'lucas.rodriguez@example.com', '+1-555-0111', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-08 09:30:00'),
('Mia Lee', 'mia.lee@example.com', '+1-555-0112', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-10 14:15:00'),
('Alexander White', 'alexander.white@example.com', '+1-555-0113', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-12 11:50:00'),
('Charlotte Harris', 'charlotte.harris@example.com', '+1-555-0114', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-15 16:20:00'),
('Ethan Clark', 'ethan.clark@example.com', '+1-555-0115', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-18 08:45:00'),
('Amelia Lewis', 'amelia.lewis@example.com', '+1-555-0116', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-20 13:30:00'),
('Daniel Walker', 'daniel.walker@example.com', '+1-555-0117', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-22 10:10:00'),
('Harper Hall', 'harper.hall@example.com', '+1-555-0118', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-25 15:40:00'),
('Matthew Allen', 'matthew.allen@example.com', '+1-555-0119', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-02-27 09:20:00'),
('Evelyn Young', 'evelyn.young@example.com', '+1-555-0120', '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC', '2024-03-01 12:00:00');

-- =========================================================
-- USER ADDRESSES
-- =========================================================
INSERT INTO user_address (user_id, line1, city, state, country, zip_code, is_default) VALUES
(1, '123 Main Street', 'New York', 'NY', 'USA', '10001', TRUE),
(2, '789 Elm Street', 'Los Angeles', 'CA', 'USA', '90001', TRUE),
(3, '321 Pine Road', 'Chicago', 'IL', 'USA', '60601', TRUE),
(4, '654 Maple Drive', 'Houston', 'TX', 'USA', '77001', TRUE),
(5, '987 Cedar Lane', 'Phoenix', 'AZ', 'USA', '85001', TRUE),
(6, '147 Birch Court', 'Philadelphia', 'PA', 'USA', '19101', TRUE),
(7, '258 Walnut Street', 'San Antonio', 'TX', 'USA', '78201', TRUE),
(8, '369 Cherry Avenue', 'San Diego', 'CA', 'USA', '92101', TRUE),
(9, '741 Spruce Road', 'Dallas', 'TX', 'USA', '75201', TRUE),
(10, '852 Ash Drive', 'San Jose', 'CA', 'USA', '95101', TRUE),
(11, '963 Willow Lane', 'Austin', 'TX', 'USA', '78701', TRUE),
(12, '159 Poplar Court', 'Jacksonville', 'FL', 'USA', '32099', TRUE),
(13, '357 Sycamore Street', 'Fort Worth', 'TX', 'USA', '76101', TRUE),
(14, '486 Hickory Avenue', 'Columbus', 'OH', 'USA', '43085', TRUE),
(15, '624 Beech Road', 'Charlotte', 'NC', 'USA', '28201', TRUE),
(16, '793 Redwood Drive', 'San Francisco', 'CA', 'USA', '94102', TRUE),
(17, '135 Magnolia Lane', 'Indianapolis', 'IN', 'USA', '46201', TRUE),
(18, '246 Laurel Court', 'Seattle', 'WA', 'USA', '98101', TRUE),
(19, '579 Dogwood Street', 'Denver', 'CO', 'USA', '80201', TRUE),
(20, '864 Palmetto Avenue', 'Boston', 'MA', 'USA', '02101', TRUE);

-- =========================================================
-- PRODUCTS
-- =========================================================
INSERT INTO products (name, description, category_id, price, discount, created_at) VALUES
('Classic Blue Jeans', 'Comfortable denim jeans', 6, 49.99, 10.00, '2024-01-10 10:00:00'),
('Cotton T-Shirt', 'Premium cotton t-shirt', 6, 19.99, 0.00, '2024-01-12 11:30:00'),
('Leather Jacket', 'Genuine leather jacket', 6, 199.99, 15.00, '2024-01-15 14:20:00'),
('Running Sneakers', 'Comfortable running shoes', 6, 79.99, 20.00, '2024-01-20 16:30:00'),
('Summer Dress', 'Floral summer dress', 7, 59.99, 10.00, '2024-01-22 10:15:00'),
('Yoga Pants', 'Stretchy yoga pants', 7, 34.99, 0.00, '2024-01-25 13:40:00'),
('iPhone 15 Pro', 'Latest iPhone model', 9, 999.99, 5.00, '2024-02-10 10:00:00'),
('Samsung Galaxy S24', 'Premium Android phone', 9, 899.99, 10.00, '2024-02-12 11:45:00'),
('MacBook Pro 16"', 'Professional laptop', 10, 2499.99, 5.00, '2024-02-18 13:20:00'),
('Dell XPS 15', 'High-performance laptop', 10, 1799.99, 10.00, '2024-02-20 10:50:00'),
('Sony Headphones', 'Noise-cancelling headphones', 11, 349.99, 10.00, '2024-02-25 11:40:00'),
('AirPods Pro', 'Wireless earbuds', 11, 249.99, 0.00, '2024-02-27 09:25:00'),
('Modern Sofa', '3-seater sofa', 12, 799.99, 20.00, '2024-01-15 10:30:00'),
('Dining Table', '6-person dining set', 12, 599.99, 10.00, '2024-01-20 13:15:00'),
('Blender Pro', 'High-power blender', 13, 89.99, 10.00, '2024-01-28 14:40:00'),
('Coffee Maker', 'Automatic coffee maker', 13, 79.99, 0.00, '2024-02-02 09:55:00'),
('Yoga Mat', 'Non-slip yoga mat', 14, 29.99, 5.00, '2024-02-08 12:20:00'),
('Camping Tent', '4-person tent', 15, 199.99, 20.00, '2024-02-12 10:45:00'),
('Mountain Bike', 'Trail mountain bike', 4, 499.99, 10.00, '2024-02-15 13:30:00'),
('Office Chair', 'Ergonomic office chair', 12, 249.99, 5.00, '2024-01-25 11:20:00');

-- =========================================================
-- PRODUCT VARIANTS
-- =========================================================
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(1, 'M', 'Blue', 75, 0.00),
(1, 'L', 'Blue', 60, 0.00),
(2, 'M', 'White', 120, 0.00),
(2, 'L', 'White', 90, 0.00),
(3, 'L', 'Black', 30, 0.00),
(4, 'M', 'White', 60, 0.00),
(5, 'M', 'Pink', 50, 0.00),
(6, 'M', 'Black', 45, 0.00),
(7, NULL, 'Black', 50, 0.00),
(8, NULL, 'Black', 60, 0.00),
(9, NULL, 'Gray', 30, 0.00),
(10, NULL, 'Silver', 25, 0.00),
(11, NULL, 'Black', 40, 0.00),
(12, NULL, 'White', 35, 0.00),
(13, NULL, 'Gray', 20, 0.00),
(14, NULL, 'Brown', 15, 0.00),
(15, NULL, 'Red', 45, 0.00),
(16, NULL, 'Black', 50, 0.00),
(17, NULL, 'Purple', 100, 0.00),
(18, NULL, 'Green', 30, 0.00),
(19, NULL, 'Blue', 15, 0.00),
(20, NULL, 'Black', 25, 0.00);

-- =========================================================
-- PRODUCT MEDIA
-- =========================================================
INSERT INTO product_media (product_id, url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', TRUE),
(2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', TRUE),
(3, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', TRUE),
(4, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', TRUE),
(5, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', TRUE),
(6, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', TRUE),
(7, 'https://images.unsplash.com/photo-1592286927505-4a321dda2a9b?w=400', TRUE),
(8, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', TRUE),
(9, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', TRUE),
(10, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', TRUE),
(11, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', TRUE),
(12, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400', TRUE),
(13, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', TRUE);

-- =========================================================
-- COUPONS
-- =========================================================
INSERT INTO coupons (code, discount_percent, min_order_amount, expires_at) VALUES
('WELCOME10', 10, 50.00, '2024-12-31 23:59:59'),
('SAVE20', 20, 100.00, '2024-12-31 23:59:59'),
('SUMMER25', 25, 150.00, '2024-08-31 23:59:59');

-- =========================================================
-- ORDERS (Use recent dates within 2024)
-- =========================================================
INSERT INTO orders (user_id, total_amount, status, shipping_address_id, created_at) VALUES
(1, 149.99, 'delivered', 1, '2024-01-20 10:30:00'),
(2, 89.99, 'delivered', 2, '2024-01-22 14:20:00'),
(3, 299.99, 'delivered', 3, '2024-01-25 09:15:00'),
(4, 199.99, 'delivered', 4, '2024-02-01 16:45:00'),
(5, 449.99, 'delivered', 5, '2024-02-05 11:30:00'),
(6, 129.99, 'delivered', 6, '2024-02-10 13:20:00'),
(7, 799.99, 'delivered', 7, '2024-02-15 08:50:00'),
(8, 99.99, 'delivered', 8, '2024-02-20 15:10:00'),
(9, 999.99, 'delivered', 9, '2024-02-25 10:25:00'),
(10, 599.99, 'delivered', 10, '2024-03-01 12:40:00'),
(11, 249.99, 'delivered', 11, '2024-03-05 09:30:00'),
(12, 179.99, 'delivered', 12, '2024-03-10 14:15:00'),
(13, 399.99, 'shipped', 13, '2024-03-15 11:50:00'),
(14, 89.99, 'shipped', 14, '2024-03-20 16:20:00'),
(15, 2499.99, 'shipped', 15, '2024-03-25 08:45:00'),
(16, 199.99, 'paid', 16, '2024-03-28 13:30:00'),
(17, 149.99, 'paid', 17, '2024-04-01 10:10:00'),
(18, 899.99, 'paid', 18, '2024-04-05 15:40:00'),
(19, 349.99, 'pending', 19, '2024-04-10 09:20:00'),
(20, 79.99, 'pending', 20, '2024-04-15 12:00:00'),
(1, 599.99, 'pending', 1, '2024-04-20 14:30:00'),
(2, 249.99, 'cancelled', 2, '2024-02-15 11:15:00'),
(3, 199.99, 'cancelled', 3, '2024-03-01 16:50:00');

-- =========================================================
-- ORDER ITEMS
-- =========================================================
INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 49.99),
(1, 3, 2, 19.99),
(2, 6, 1, 79.99),
(3, 5, 1, 199.99),
(4, 7, 1, 59.99),
(5, 9, 1, 999.99),
(6, 15, 1, 89.99),
(7, 10, 1, 899.99),
(8, 17, 1, 29.99),
(9, 9, 1, 999.99),
(10, 14, 1, 599.99),
(11, 20, 1, 249.99),
(12, 15, 1, 79.99),
(13, 11, 1, 349.99),
(14, 8, 1, 34.99),
(15, 9, 1, 2499.99),
(16, 18, 1, 199.99),
(17, 1, 1, 49.99),
(18, 10, 1, 899.99),
(19, 11, 1, 349.99),
(20, 3, 2, 19.99),
(21, 14, 1, 599.99),
(22, 20, 1, 249.99),
(23, 1, 1, 49.99);

-- =========================================================
-- PAYMENTS
-- =========================================================
INSERT INTO payments (order_id, method, status, transaction_reference, paid_at) VALUES
(1, 'card', 'completed', 'TXN1001', '2024-01-20 10:35:00'),
(2, 'upi', 'completed', 'TXN1002', '2024-01-22 14:25:00'),
(3, 'card', 'completed', 'TXN1003', '2024-01-25 09:20:00'),
(4, 'card', 'completed', 'TXN1004', '2024-02-01 16:50:00'),
(5, 'card', 'completed', 'TXN1005', '2024-02-05 11:35:00'),
(6, 'upi', 'completed', 'TXN1006', '2024-02-10 13:25:00'),
(7, 'card', 'completed', 'TXN1007', '2024-02-15 08:55:00'),
(8, 'cod', 'completed', 'TXN1008', '2024-02-20 15:15:00'),
(9, 'card', 'completed', 'TXN1009', '2024-02-25 10:30:00'),
(10, 'card', 'completed', 'TXN1010', '2024-03-01 12:45:00'),
(11, 'card', 'completed', 'TXN1011', '2024-03-05 09:35:00'),
(12, 'upi', 'completed', 'TXN1012', '2024-03-10 14:20:00'),
(13, 'card', 'completed', 'TXN1013', '2024-03-15 11:55:00'),
(14, 'cod', 'completed', 'TXN1014', '2024-03-20 16:25:00'),
(15, 'card', 'completed', 'TXN1015', '2024-03-25 08:50:00'),
(16, 'upi', 'completed', 'TXN1016', '2024-03-28 13:35:00'),
(17, 'card', 'completed', 'TXN1017', '2024-04-01 10:15:00'),
(18, 'card', 'completed', 'TXN1018', '2024-04-05 15:45:00'),
(19, 'card', 'pending', NULL, NULL),
(20, 'upi', 'pending', NULL, NULL),
(21, 'card', 'pending', NULL, NULL);

-- =========================================================
-- ORDER COUPONS
-- =========================================================
INSERT INTO order_coupons (order_id, coupon_id, discount_applied) VALUES
(1, 1, 14.99),
(5, 2, 89.99),
(9, 3, 249.99);

-- =========================================================
-- CART
-- =========================================================
INSERT INTO cart (user_id, variant_id, quantity) VALUES
(1, 3, 2),
(2, 9, 1),
(3, 5, 1),
(4, 7, 2);

-- =========================================================
-- WISHLIST
-- =========================================================
INSERT INTO wishlist (user_id, variant_id, created_at) VALUES
(1, 9, '2024-04-01 10:00:00'),
(2, 5, '2024-04-02 11:15:00'),
(3, 9, '2024-04-03 16:45:00');

-- Verify counts
SELECT 'Data inserted successfully!' as status;
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL SELECT 'Users', COUNT(*) FROM users
UNION ALL SELECT 'Products', COUNT(*) FROM products
UNION ALL SELECT 'Product Variants', COUNT(*) FROM product_variants
UNION ALL SELECT 'Orders', COUNT(*) FROM orders
UNION ALL SELECT 'Order Items', COUNT(*) FROM order_items;
