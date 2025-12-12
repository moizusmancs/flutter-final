-- Fake Data for E-commerce Database
-- Run this after creating the schema and the admin user

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
-- Password for all users: password123
-- Bcrypt hash: $2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC

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
(1, '456 Oak Avenue', 'Brooklyn', 'NY', 'USA', '11201', FALSE),
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
-- PRODUCTS (30 products)
-- =========================================================
INSERT INTO products (name, description, category_id, price, discount, created_at) VALUES
-- Men's Clothing
('Classic Blue Jeans', 'Comfortable denim jeans perfect for everyday wear', 6, 49.99, 10.00, '2024-01-10 10:00:00'),
('Cotton T-Shirt', 'Premium cotton t-shirt in various colors', 6, 19.99, 0.00, '2024-01-12 11:30:00'),
('Leather Jacket', 'Genuine leather jacket for a stylish look', 6, 199.99, 15.00, '2024-01-15 14:20:00'),
('Formal Dress Shirt', 'Elegant dress shirt for formal occasions', 6, 39.99, 5.00, '2024-01-18 09:45:00'),
('Running Sneakers', 'Comfortable sneakers for running and sports', 6, 79.99, 20.00, '2024-01-20 16:30:00'),

-- Women's Clothing
('Floral Summer Dress', 'Beautiful floral pattern summer dress', 7, 59.99, 10.00, '2024-01-22 10:15:00'),
('Yoga Pants', 'Stretchy and comfortable yoga pants', 7, 34.99, 0.00, '2024-01-25 13:40:00'),
('Silk Blouse', 'Elegant silk blouse for office wear', 7, 54.99, 15.00, '2024-01-28 11:20:00'),
('Winter Coat', 'Warm winter coat with faux fur trim', 7, 149.99, 25.00, '2024-02-01 08:50:00'),
('High Heels', 'Stylish high heels for evening events', 7, 69.99, 10.00, '2024-02-03 15:30:00'),

-- Kids Clothing
('Kids School Backpack', 'Colorful and durable school backpack', 8, 29.99, 0.00, '2024-02-05 12:10:00'),
('Children\'s Hoodie', 'Soft and cozy hoodie for kids', 8, 24.99, 5.00, '2024-02-08 14:25:00'),

-- Electronics - Smartphones
('iPhone 15 Pro', 'Latest iPhone with advanced features', 9, 999.99, 5.00, '2024-02-10 10:00:00'),
('Samsung Galaxy S24', 'Premium Android smartphone', 9, 899.99, 10.00, '2024-02-12 11:45:00'),
('Google Pixel 8', 'Pure Android experience with great camera', 9, 699.99, 0.00, '2024-02-15 09:30:00'),

-- Electronics - Laptops
('MacBook Pro 16"', 'Powerful laptop for professionals', 10, 2499.99, 5.00, '2024-02-18 13:20:00'),
('Dell XPS 15', 'High-performance Windows laptop', 10, 1799.99, 10.00, '2024-02-20 10:50:00'),
('HP Pavilion', 'Affordable laptop for everyday use', 10, 799.99, 15.00, '2024-02-22 14:15:00'),

-- Electronics - Headphones
('Sony WH-1000XM5', 'Premium noise-cancelling headphones', 11, 349.99, 10.00, '2024-02-25 11:40:00'),
('AirPods Pro', 'Apple wireless earbuds with ANC', 11, 249.99, 0.00, '2024-02-27 09:25:00'),
('Bose QuietComfort', 'Comfortable over-ear headphones', 11, 299.99, 15.00, '2024-03-01 15:50:00'),

-- Home & Garden - Furniture
('Modern Sofa', 'Comfortable 3-seater modern sofa', 12, 799.99, 20.00, '2024-01-15 10:30:00'),
('Dining Table Set', '6-person dining table with chairs', 12, 599.99, 10.00, '2024-01-20 13:15:00'),
('Office Chair', 'Ergonomic office chair for long hours', 12, 249.99, 5.00, '2024-01-25 11:20:00'),

-- Home & Garden - Kitchen
('Blender Pro', 'High-power blender for smoothies', 13, 89.99, 10.00, '2024-01-28 14:40:00'),
('Coffee Maker', 'Automatic drip coffee maker', 13, 79.99, 0.00, '2024-02-02 09:55:00'),
('Kitchen Knife Set', 'Professional chef knife set', 13, 149.99, 15.00, '2024-02-05 16:30:00'),

-- Sports & Outdoors
('Yoga Mat', 'Non-slip exercise yoga mat', 14, 29.99, 5.00, '2024-02-08 12:20:00'),
('Camping Tent', '4-person waterproof camping tent', 15, 199.99, 20.00, '2024-02-12 10:45:00'),
('Mountain Bike', 'Durable mountain bike for trails', 4, 499.99, 10.00, '2024-02-15 13:30:00');

-- =========================================================
-- PRODUCT VARIANTS
-- =========================================================
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
-- Classic Blue Jeans (id: 1)
(1, 'S', 'Blue', 50, 0.00),
(1, 'M', 'Blue', 75, 0.00),
(1, 'L', 'Blue', 60, 0.00),
(1, 'XL', 'Blue', 40, 0.00),
(1, 'S', 'Black', 45, 5.00),
(1, 'M', 'Black', 70, 5.00),

-- Cotton T-Shirt (id: 2)
(2, 'S', 'White', 100, 0.00),
(2, 'M', 'White', 120, 0.00),
(2, 'L', 'White', 90, 0.00),
(2, 'XL', 'White', 70, 0.00),
(2, 'M', 'Black', 110, 0.00),
(2, 'M', 'Red', 85, 2.00),

-- Leather Jacket (id: 3)
(3, 'M', 'Black', 25, 0.00),
(3, 'L', 'Black', 30, 0.00),
(3, 'XL', 'Black', 20, 0.00),
(3, 'L', 'Brown', 15, 10.00),

-- iPhone 15 Pro (id: 13)
(13, NULL, 'Space Black', 50, 0.00),
(13, NULL, 'Silver', 45, 0.00),
(13, NULL, 'Gold', 40, 0.00),

-- Samsung Galaxy S24 (id: 14)
(14, NULL, 'Phantom Black', 60, 0.00),
(14, NULL, 'Cream', 55, 0.00),

-- MacBook Pro (id: 16)
(16, NULL, 'Space Gray', 30, 0.00),
(16, NULL, 'Silver', 25, 0.00),

-- Floral Summer Dress (id: 6)
(6, 'S', 'Floral Pink', 40, 0.00),
(6, 'M', 'Floral Pink', 50, 0.00),
(6, 'L', 'Floral Pink', 35, 0.00),

-- Running Sneakers (id: 5)
(5, 'M', 'White/Blue', 60, 0.00),
(5, 'L', 'White/Blue', 55, 0.00),
(5, 'XL', 'White/Blue', 40, 0.00),

-- Yoga Mat (id: 28)
(28, NULL, 'Purple', 100, 0.00),
(28, NULL, 'Blue', 95, 0.00),
(28, NULL, 'Pink', 90, 0.00);

-- =========================================================
-- PRODUCT MEDIA
-- =========================================================
INSERT INTO product_media (product_id, url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', TRUE),
(1, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', FALSE),
(2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', TRUE),
(3, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', TRUE),
(4, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', TRUE),
(5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', TRUE),
(6, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', TRUE),
(7, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', TRUE),
(8, 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400', TRUE),
(9, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400', TRUE),
(10, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', TRUE),
(13, 'https://images.unsplash.com/photo-1592286927505-4a321dda2a9b?w=400', TRUE),
(14, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', TRUE),
(15, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400', TRUE),
(16, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', TRUE),
(17, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', TRUE),
(19, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', TRUE),
(20, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400', TRUE),
(22, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', TRUE),
(28, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', TRUE);

-- =========================================================
-- COUPONS
-- =========================================================
INSERT INTO coupons (code, discount_percent, min_order_amount, expires_at) VALUES
('WELCOME10', 10, 50.00, '2025-12-31 23:59:59'),
('SAVE20', 20, 100.00, '2025-12-31 23:59:59'),
('SUMMER25', 25, 150.00, '2025-08-31 23:59:59'),
('FLASH15', 15, 75.00, '2025-06-30 23:59:59'),
('NEWYEAR30', 30, 200.00, '2025-01-31 23:59:59'),
('EXPIRED10', 10, 50.00, '2024-01-01 23:59:59');

-- =========================================================
-- ORDERS (40 orders with various statuses and dates)
-- =========================================================
INSERT INTO orders (user_id, total_amount, status, shipping_address_id, created_at) VALUES
-- January orders
(1, 149.99, 'delivered', 1, '2024-01-20 10:30:00'),
(2, 89.99, 'delivered', 3, '2024-01-22 14:20:00'),
(3, 299.99, 'delivered', 4, '2024-01-25 09:15:00'),
(4, 199.99, 'delivered', 5, '2024-01-28 16:45:00'),

-- February orders
(5, 449.99, 'delivered', 6, '2024-02-01 11:30:00'),
(6, 129.99, 'delivered', 7, '2024-02-03 13:20:00'),
(7, 799.99, 'delivered', 8, '2024-02-05 08:50:00'),
(8, 99.99, 'delivered', 9, '2024-02-08 15:10:00'),
(9, 1299.99, 'delivered', 10, '2024-02-10 10:25:00'),
(10, 599.99, 'delivered', 11, '2024-02-12 12:40:00'),
(11, 249.99, 'delivered', 12, '2024-02-15 09:30:00'),
(12, 179.99, 'delivered', 13, '2024-02-18 14:15:00'),
(13, 399.99, 'delivered', 14, '2024-02-20 11:50:00'),
(14, 89.99, 'delivered', 15, '2024-02-22 16:20:00'),

-- March orders (mix of statuses)
(15, 2499.99, 'delivered', 16, '2024-03-01 08:45:00'),
(16, 199.99, 'delivered', 17, '2024-03-03 13:30:00'),
(17, 149.99, 'shipped', 18, '2024-03-05 10:10:00'),
(18, 899.99, 'shipped', 19, '2024-03-08 15:40:00'),
(19, 349.99, 'shipped', 20, '2024-03-10 09:20:00'),
(20, 79.99, 'paid', 1, '2024-03-12 12:00:00'),
(1, 599.99, 'paid', 1, '2024-03-14 14:30:00'),
(2, 249.99, 'paid', 3, '2024-03-16 11:15:00'),
(3, 1799.99, 'paid', 4, '2024-03-18 16:50:00'),
(4, 299.99, 'paid', 5, '2024-03-20 10:35:00'),
(5, 89.99, 'pending', 6, '2024-03-22 13:45:00'),
(6, 449.99, 'pending', 7, '2024-03-24 09:25:00'),
(7, 199.99, 'pending', 8, '2024-03-26 15:10:00'),
(8, 699.99, 'pending', 9, '2024-03-28 11:40:00'),
(9, 149.99, 'pending', 10, '2024-03-30 14:20:00'),

-- Recent orders (last 7 days)
(10, 999.99, 'pending', 11, '2025-03-05 10:00:00'),
(11, 349.99, 'pending', 12, '2025-03-06 14:30:00'),
(12, 249.99, 'paid', 13, '2025-03-07 09:15:00'),
(13, 799.99, 'paid', 14, '2025-03-08 16:45:00'),
(14, 599.99, 'shipped', 15, '2025-03-09 11:20:00'),
(15, 199.99, 'shipped', 16, '2025-03-10 13:50:00'),
(16, 89.99, 'delivered', 17, '2025-03-11 10:30:00'),

-- Cancelled orders
(17, 299.99, 'cancelled', 18, '2024-02-15 12:00:00'),
(18, 149.99, 'cancelled', 19, '2024-03-01 15:30:00'),
(19, 499.99, 'cancelled', 20, '2024-03-15 11:20:00');

-- =========================================================
-- ORDER ITEMS (multiple items per order)
-- =========================================================
INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) VALUES
-- Order 1 (user 1): Jeans + T-shirt
(1, 1, 1, 49.99),
(1, 7, 2, 19.99),

-- Order 2 (user 2): Sneakers
(2, 27, 1, 79.99),

-- Order 3 (user 3): Leather Jacket + T-shirt
(3, 13, 1, 199.99),
(3, 8, 1, 19.99),

-- Order 4 (user 4): Summer Dress
(4, 24, 1, 59.99),

-- Order 5 (user 5): iPhone
(5, 17, 1, 999.99),

-- Order 6 (user 6): Blender
(6, 1, 1, 89.99),

-- Order 7 (user 7): Samsung Phone
(7, 20, 1, 899.99),

-- Order 8 (user 8): Yoga Mat
(8, 31, 1, 29.99),

-- Order 9 (user 9): MacBook
(9, 22, 1, 2499.99),

-- Order 10 (user 10): Dining Table
(10, 1, 1, 599.99),

-- Order 11 (user 11): Office Chair
(11, 1, 1, 249.99),

-- Order 12 (user 12): Coffee Maker + Knife Set
(12, 1, 1, 79.99),
(12, 2, 1, 149.99),

-- Order 13 (user 13): Sony Headphones
(13, 1, 1, 349.99),

-- Order 14 (user 14): Yoga Pants
(14, 1, 1, 34.99),

-- Order 15 (user 15): MacBook
(15, 22, 1, 2499.99),

-- Order 16 (user 16): Camping Tent
(16, 1, 1, 199.99),

-- Order 17 (user 17): Jeans + Sneakers
(17, 2, 1, 49.99),
(17, 27, 1, 79.99),

-- Order 18 (user 18): Samsung Phone
(18, 20, 1, 899.99),

-- Order 19 (user 19): Sony Headphones
(19, 1, 1, 349.99),

-- Order 20 (user 20): T-shirt + Yoga Mat
(20, 7, 2, 19.99),
(20, 31, 1, 29.99),

-- Continue with more recent orders...
(21, 1, 1, 599.99),
(22, 1, 1, 249.99),
(23, 22, 1, 1799.99),
(24, 1, 1, 299.99),
(25, 31, 3, 29.99),
(26, 17, 1, 999.99),
(27, 20, 1, 899.99),
(28, 7, 5, 19.99),
(29, 1, 1, 699.99),
(30, 2, 1, 49.99),
(31, 17, 1, 999.99),
(32, 1, 1, 349.99),
(33, 1, 1, 249.99),
(34, 1, 1, 799.99),
(35, 1, 1, 599.99),
(36, 1, 1, 199.99),
(37, 31, 3, 29.99);

-- =========================================================
-- PAYMENTS
-- =========================================================
INSERT INTO payments (order_id, method, status, transaction_reference, paid_at) VALUES
(1, 'card', 'completed', 'TXN1001', '2024-01-20 10:35:00'),
(2, 'upi', 'completed', 'TXN1002', '2024-01-22 14:25:00'),
(3, 'card', 'completed', 'TXN1003', '2024-01-25 09:20:00'),
(4, 'net_banking', 'completed', 'TXN1004', '2024-01-28 16:50:00'),
(5, 'card', 'completed', 'TXN1005', '2024-02-01 11:35:00'),
(6, 'upi', 'completed', 'TXN1006', '2024-02-03 13:25:00'),
(7, 'card', 'completed', 'TXN1007', '2024-02-05 08:55:00'),
(8, 'cod', 'completed', 'TXN1008', '2024-02-08 15:15:00'),
(9, 'card', 'completed', 'TXN1009', '2024-02-10 10:30:00'),
(10, 'net_banking', 'completed', 'TXN1010', '2024-02-12 12:45:00'),
(11, 'card', 'completed', 'TXN1011', '2024-02-15 09:35:00'),
(12, 'upi', 'completed', 'TXN1012', '2024-02-18 14:20:00'),
(13, 'card', 'completed', 'TXN1013', '2024-02-20 11:55:00'),
(14, 'cod', 'completed', 'TXN1014', '2024-02-22 16:25:00'),
(15, 'card', 'completed', 'TXN1015', '2024-03-01 08:50:00'),
(16, 'upi', 'completed', 'TXN1016', '2024-03-03 13:35:00'),
(17, 'card', 'completed', 'TXN1017', '2024-03-05 10:15:00'),
(18, 'net_banking', 'completed', 'TXN1018', '2024-03-08 15:45:00'),
(19, 'card', 'completed', 'TXN1019', '2024-03-10 09:25:00'),
(20, 'upi', 'completed', 'TXN1020', '2024-03-12 12:05:00'),
(21, 'card', 'completed', 'TXN1021', '2024-03-14 14:35:00'),
(22, 'net_banking', 'completed', 'TXN1022', '2024-03-16 11:20:00'),
(23, 'card', 'completed', 'TXN1023', '2024-03-18 16:55:00'),
(24, 'upi', 'completed', 'TXN1024', '2024-03-20 10:40:00'),
(25, 'card', 'pending', NULL, NULL),
(26, 'upi', 'pending', NULL, NULL),
(27, 'card', 'pending', NULL, NULL),
(28, 'net_banking', 'pending', NULL, NULL),
(29, 'card', 'pending', NULL, NULL),
(30, 'card', 'pending', NULL, NULL),
(31, 'upi', 'pending', NULL, NULL),
(32, 'card', 'completed', 'TXN1032', '2025-03-07 09:20:00'),
(33, 'net_banking', 'completed', 'TXN1033', '2025-03-08 16:50:00'),
(34, 'card', 'completed', 'TXN1034', '2025-03-09 11:25:00'),
(35, 'upi', 'completed', 'TXN1035', '2025-03-10 13:55:00'),
(36, 'card', 'completed', 'TXN1036', '2025-03-11 10:35:00');

-- =========================================================
-- ORDER COUPONS (Some orders used coupons)
-- =========================================================
INSERT INTO order_coupons (order_id, coupon_id, discount_applied) VALUES
(1, 1, 14.99),
(5, 2, 89.99),
(9, 3, 324.99),
(15, 3, 624.99),
(21, 2, 119.99),
(26, 1, 99.99);

-- =========================================================
-- CART (Current items in users' carts)
-- =========================================================
INSERT INTO cart (user_id, variant_id, quantity) VALUES
(1, 7, 2),
(1, 31, 1),
(2, 17, 1),
(3, 13, 1),
(4, 24, 2),
(5, 27, 1),
(6, 2, 3),
(7, 20, 1);

-- =========================================================
-- WISHLIST (Items users want to buy later)
-- =========================================================
INSERT INTO wishlist (user_id, variant_id, created_at) VALUES
(1, 22, '2024-03-01 10:00:00'),
(1, 20, '2024-03-05 14:30:00'),
(2, 13, '2024-03-02 11:15:00'),
(3, 17, '2024-03-03 16:45:00'),
(4, 22, '2024-03-04 09:20:00'),
(5, 31, '2024-03-06 13:50:00'),
(6, 24, '2024-03-07 10:30:00'),
(7, 27, '2024-03-08 15:10:00');

-- =========================================================
-- VERIFY DATA
-- =========================================================
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'User Addresses', COUNT(*) FROM user_address
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Product Variants', COUNT(*) FROM product_variants
UNION ALL
SELECT 'Product Media', COUNT(*) FROM product_media
UNION ALL
SELECT 'Coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Order Coupons', COUNT(*) FROM order_coupons
UNION ALL
SELECT 'Cart Items', COUNT(*) FROM cart
UNION ALL
SELECT 'Wishlist Items', COUNT(*) FROM wishlist;
