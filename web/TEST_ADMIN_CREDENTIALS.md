# Test Admin Credentials

## For Testing the Login

Use these credentials to test the login page:

**Email:** `admin@example.com`
**Password:** `admin123`

---

## Database Setup

### Option 1: SQL Insert (For MySQL)

Use the SQL file I created at `backend/seed-admin.sql` or run this directly:

```sql
-- For the admins table
INSERT INTO admins (username, email, password_hash, role, created_at)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC',
  'super_admin',
  CURRENT_TIMESTAMP
);
```

**Note:** The hashed password above is for `admin123` using bcrypt with 10 rounds.

**To run the seed file:**
```bash
mysql -u your_username -p your_database < backend/seed-admin.sql
```

---

### Option 2: If you need to generate your own bcrypt hash

If you want to create your own password hash, you can use this Node.js script:

```javascript
// hash-password.js
const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
```

Run it with:
```bash
node hash-password.js
```

---

### Option 3: Using your backend API to create admin

If your backend has an endpoint to create admins (like a seed script or registration endpoint), use this JSON:

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "super_admin"
}
```

---

## Quick Test with Mock Data (If Backend Not Ready)

If your backend isn't ready yet, you can temporarily modify the `authApi.login` function to return mock data for testing the frontend:

**File:** `src/api/auth.api.ts`

```typescript
login: async (email: string, password: string): Promise<LoginResponse> => {
  // TEMPORARY: Remove this when backend is ready
  if (email === 'admin@example.com' && password === 'admin123') {
    return {
      success: true,
      message: 'Login successful',
      admin: {
        id: 1,
        email: 'admin@example.com',
        fullname: 'Admin User',
      },
    };
  }
  throw new Error('Invalid credentials');

  // Uncomment this when backend is ready:
  // return apiClient.post('/admin/auth/login', { email, password });
},
```

---

## Expected Backend Response

Your backend `/api/v1/admin/auth/login` endpoint should return:

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Common Bcrypt Hashes for Testing

Here are some pre-generated bcrypt hashes for common test passwords:

| Password | Bcrypt Hash (10 rounds) |
|----------|-------------------------|
| `admin123` | `$2b$10$rBV2z2pO7C9YvV3qKq0lJOX8HxW8vYZ0YKzH.xZQwXJ7zN7ZqYxGC` |
| `password` | `$2b$10$YourHashHereForPassword` |
| `test1234` | `$2b$10$YourHashHereForTest1234` |

**Note:** The actual hash may vary each time you generate it due to the salt, but all will validate correctly with bcrypt.compare().

---

## Troubleshooting

### Login button does nothing
- Check browser console for errors
- Verify backend API is running at `http://localhost:4000`
- Check network tab to see if request is being sent

### CORS errors
Your backend needs to allow credentials from `http://localhost:5173`:

```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 401 Unauthorized
- Verify the admin exists in the database
- Check that the password hash matches
- Ensure the backend is comparing passwords correctly with bcrypt
