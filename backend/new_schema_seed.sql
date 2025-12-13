INSERT INTO users (fullname, email, phone, password_hash, created_at) VALUES
('Moiz Usman', 'moizusman@gmail.com', '03347621959', '$2a$12$bOaFuID6whD5haAu6uCO3.yheb0rg5VTAX9E7RtHFCKDp6YmzOWIy', '2025-07-15 10:30:00');

INSERT INTO user_address (user_id, line1, city, state, country, zip_code, is_default) VALUES
(1, '123 Main Street', 'New York', 'NY', 'USA', '10001', TRUE);

---------------------------------------------------------
-- CATEGORY
---------------------------------------------------------

-- Insert main categories
INSERT INTO categories (name, parent_id)
VALUES 
('Men', NULL),
('Women', NULL),
('Kids', NULL);

-- Insert Men subcategories
INSERT INTO categories (name, parent_id)
VALUES 
('T-Shirts', 1),
('Polos', 1),
('Jackets', 1),
('Pants', 1);

-- Insert Women subcategories
INSERT INTO categories (name, parent_id)
VALUES 
('T-Shirts', 2),
('Jackets', 2),
('Hoodies', 2),
('Pants', 2);

-- Insert Kids subcategories
INSERT INTO categories (name, parent_id)
VALUES 
('T-Shirts', 3),
('Pants', 3),
('Shorts', 3);

---------------------------------------------------------
-- PRODUCTS
---------------------------------------------------------
INSERT INTO products (name, description, category_id, price, discount)
VALUES
('Men T-Shirt', 'Comfortable cotton T-shirt for men', 4, 499.00, 10),
('Men Polo', 'Classic polo shirt for men', 5, 799.00, 5),
('Men Jacket', 'Stylish winter jacket for men', 6, 2499.00, 15),
('Men Pants', 'Slim fit pants for men', 7, 1299.00, 10);

INSERT INTO products (name, description, category_id, price, discount)
VALUES
('Women T-Shirt', 'Soft and breathable T-shirt for women', 8, 599.00, 12),
('Women Jacket', 'Trendy women\'s jacket', 9, 2199.00, 10),
('Women Hoodie', 'Warm hoodie for women', 10, 1799.00, 8),
('Women Pants', 'Comfortable slim-fit pants for women', 11, 1199.00, 10);

INSERT INTO products (name, description, category_id, price, discount)
VALUES
('Kids T-Shirt', 'Colorful kids cotton T-shirt', 12, 299.00, 5),
('Kids Pants', 'Comfortable pants for kids', 13, 499.00, 8),
('Kids Shorts', 'Breathable cotton shorts for kids', 14, 399.00, 5);

---------------------------------------------------------
-- Product Variants
---------------------------------------------------------
-- Men T-Shirt (product_id = 1)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(1, 'S', 'Blue', 20, 0),
(1, 'M', 'Blue', 20, 0),
(1, 'L', 'Blue', 20, 0);

-- Men Polo (product_id = 2)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(2, 'S', 'Navy', 20, 0),
(2, 'M', 'Navy', 20, 0),
(2, 'L', 'Navy', 20, 0);

-- Men Jacket (product_id = 3)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(3, 'S', 'Black', 20, 0),
(3, 'M', 'Black', 20, 0),
(3, 'L', 'Black', 20, 0);

-- Men Pants (product_id = 4)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(4, 'S', 'Gray', 20, 0),
(4, 'M', 'Gray', 20, 0),
(4, 'L', 'Gray', 20, 0);

-- Women T-Shirt (product_id = 5)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(5, 'S', 'Pink', 20, 0),
(5, 'M', 'Pink', 20, 0),
(5, 'L', 'Pink', 20, 0);

-- Women Jacket (product_id = 6)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(6, 'S', 'Red', 20, 0),
(6, 'M', 'Red', 20, 0),
(6, 'L', 'Red', 20, 0);

-- Women Hoodie (product_id = 7)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(7, 'S', 'Purple', 20, 0),
(7, 'M', 'Purple', 20, 0),
(7, 'L', 'Purple', 20, 0);

-- Women Pants (product_id = 8)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(8, 'S', 'Beige', 20, 0),
(8, 'M', 'Beige', 20, 0),
(8, 'L', 'Beige', 20, 0);

-- Kids T-Shirt (product_id = 9)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(9, 'S', 'Yellow', 20, 0),
(9, 'M', 'Yellow', 20, 0),
(9, 'L', 'Yellow', 20, 0);

-- Kids Pants (product_id = 10)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(10, 'S', 'Green', 20, 0),
(10, 'M', 'Green', 20, 0),
(10, 'L', 'Green', 20, 0);

-- Kids Shorts (product_id = 11)
INSERT INTO product_variants (product_id, size, color, stock, additional_price) VALUES
(11, 'S', 'Orange', 20, 0),
(11, 'M', 'Orange', 20, 0),
(11, 'L', 'Orange', 20, 0);

---------------------------------------------------------
-- Product Media
---------------------------------------------------------
INSERT INTO product_media (product_id, url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(1, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(1, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE);

INSERT INTO product_media (product_id, url, is_primary) VALUES
(2, 'https://images.unsplash.com/photo-1744551358258-5a5b9b268eca?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(2, 'https://images.unsplash.com/photo-1744551358258-5a5b9b268eca?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(2, 'https://images.unsplash.com/photo-1744551358258-5a5b9b268eca?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE);

INSERT INTO product_media (product_id, url, is_primary) VALUES
(3, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1036', TRUE),
(3, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1036', FALSE),
(3, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1036', FALSE);

INSERT INTO product_media (product_id, url, is_primary) VALUES
(4, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(4, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(4, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE);

INSERT INTO product_media (product_id, url, is_primary) VALUES
(5, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(5, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(5, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),

(6, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(6, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(6, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),

(7, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(7, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(7, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),

(8, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(8, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(8, 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE);

INSERT INTO product_media (product_id, url, is_primary) VALUES
(9, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(9, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(9, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),

(10, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(10, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(10, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),

(11, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', TRUE),
(11, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE),
(11, 'https://images.unsplash.com/photo-1552904219-f4b87efe8792?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', FALSE);


---------------------------------------------------------
-- Wish List
---------------------------------------------------------
INSERT INTO wishlist (user_id, variant_id)
VALUES
(1, 1),
(1, 3),
(1, 7),
(1, 9); 

---------------------------------------------------------
-- Wish cart
---------------------------------------------------------
INSERT INTO cart (user_id, variant_id, quantity)
VALUES
(1, 10, 1),
(1, 14, 1),
(1, 18, 1),
(1, 25, 1),
(1, 30, 1);

---------------------------------------------------------
-- Orders and Payments
---------------------------------------------------------
INSERT INTO orders (user_id, total_amount, status, payment_id, shipping_address_id)
VALUES
(1, 1998.00, 'delivered', NULL, 1),  -- order_id 1
(1, 1299.00, 'pending', NULL, 1);   -- order_id 2

INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase)
VALUES
-- Order 1 items
(1, 5, 1, 499.00),
(1, 8, 1, 799.00),
(1, 12, 1, 699.00),

-- Order 2 items
(2, 20, 1, 799.00),
(2, 22, 1, 500.00);

INSERT INTO payments (order_id, method, status, paid_at)
VALUES
(1, 'card', 'completed', NOW()),   -- payment_id 1
(2, 'cod', 'pending', NULL);       -- payment_id 2

UPDATE orders SET payment_id = 1 WHERE id = 1;
UPDATE orders SET payment_id = 2 WHERE id = 2;


INSERT INTO coupons (code, discount_percent, min_order_amount, expires_at)
VALUES
('WELCOME10', 10, 500.00, '2026-01-01 00:00:00'),
('SAVE20', 20, 1500.00, '2026-06-01 00:00:00'),
('FREESHIP', 5, 0.00, '2025-12-31 00:00:00');


INSERT INTO order_coupons (order_id, coupon_id, discount_applied)
VALUES
(1, 2, 399.60),   -- 20% OFF on 1998.00
(2, 1, 129.90);   -- 10% OFF on 1299.00


INSERT INTO admins (username, email, password_hash, role)
VALUES
('superadmin', 'superadmin@example.com', '$2a$12$bOaFuID6whD5haAu6uCO3.yheb0rg5VTAX9E7RtHFCKDp6YmzOWIy', 'super_admin'),
('admin_john', 'john@example.com', '$2a$12$bOaFuID6whD5haAu6uCO3.yheb0rg5VTAX9E7RtHFCKDp6YmzOWIy', 'admin'),
('moderator_amy', 'amy@example.com', '$2a$12$bOaFuID6whD5haAu6uCO3.yheb0rg5VTAX9E7RtHFCKDp6YmzOWIy', 'moderator');






select * from users;
select * from product_variants;

