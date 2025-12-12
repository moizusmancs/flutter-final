-- Seed Admin User for Testing
-- Password: admin123 (hashed with bcrypt, 10 rounds)

INSERT INTO admins (username, email, password_hash, role, created_at)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC',
  'super_admin',
  CURRENT_TIMESTAMP
);

-- Verify the insert
SELECT id, username, email, role, created_at FROM admins WHERE email = 'admin@example.com';
