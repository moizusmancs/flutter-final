# Admin Authentication Endpoints

Base URL: `http://localhost:4000/api/v1/admin/auth`

---

## 1. Admin Login

**Endpoint**: `POST /login`

**Description**: Authenticate admin user and receive auth token in HTTP-only cookie

**Authentication**: Not required (public endpoint)

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "yourPassword123"
}
```

**Validation Rules**:
- `email`: Must be valid email format, required
- `password`: Minimum 6 characters, required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

**Error Responses**:

401 Unauthorized (Invalid credentials):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

400 Bad Request (Validation error):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Cookies Set**:
- `admin_token`: HTTP-only cookie containing JWT token (expires in 7 days)

**Example using cURL**:
```bash
curl -X POST http://localhost:4000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "yourPassword123"
  }' \
  -c cookies.txt
```

**Example using JavaScript (Axios)**:
```javascript
import axios from 'axios';

const response = await axios.post(
  'http://localhost:4000/api/v1/admin/auth/login',
  {
    email: 'admin@example.com',
    password: 'yourPassword123'
  },
  {
    withCredentials: true // Important: allows cookies to be sent/received
  }
);

console.log(response.data.admin);
```

---

## 2. Check Authentication Status

**Endpoint**: `GET /check`

**Description**: Verify if the admin is currently authenticated and get admin details

**Authentication**: Required (admin_token cookie)

**Request Body**: None

**Query Parameters**: None

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin is authenticated",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

**Error Responses**:

401 Unauthorized (No token or invalid token):
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

404 Not Found (Admin not found in database):
```json
{
  "success": false,
  "message": "Admin not found"
}
```

**Example using cURL**:
```bash
curl -X GET http://localhost:4000/api/v1/admin/auth/check \
  -b cookies.txt
```

**Example using JavaScript (Axios)**:
```javascript
import axios from 'axios';

try {
  const response = await axios.get(
    'http://localhost:4000/api/v1/admin/auth/check',
    {
      withCredentials: true // Important: sends cookies with request
    }
  );

  console.log('Authenticated as:', response.data.admin);
  return response.data.admin;
} catch (error) {
  if (error.response?.status === 401) {
    console.log('Not authenticated');
    // Redirect to login page
  }
  throw error;
}
```

**Use Cases**:
- Check if user is logged in on app initialization
- Verify token validity before making other API calls
- Get current admin details for display in UI
- Protect routes in frontend application

---

## 3. Admin Logout

**Endpoint**: `POST /logout`

**Description**: Logout admin user and clear authentication cookie

**Authentication**: Required (admin_token cookie)

**Request Body**: None

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin logged out successfully"
}
```

**Error Response**:

401 Unauthorized (No token):
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Cookies Cleared**:
- `admin_token`: Removed from browser

**Example using cURL**:
```bash
curl -X POST http://localhost:4000/api/v1/admin/auth/logout \
  -b cookies.txt
```

**Example using JavaScript (Axios)**:
```javascript
import axios from 'axios';

const response = await axios.post(
  'http://localhost:4000/api/v1/admin/auth/logout',
  {},
  {
    withCredentials: true // Important: allows cookie to be cleared
  }
);

console.log(response.data.message);
// Redirect to login page
```

---

## Authentication Flow

### Initial Login Flow:
1. User submits email and password to `POST /login`
2. Backend validates credentials
3. Backend generates JWT token
4. Backend sets `admin_token` HTTP-only cookie
5. Backend returns admin details
6. Frontend stores admin details in state/context
7. Frontend redirects to dashboard

### Checking Authentication on App Load:
1. App loads/refreshes
2. Frontend calls `GET /check`
3. If successful (200): User is authenticated, load admin panel
4. If unauthorized (401): Redirect to login page

### Making Authenticated Requests:
1. Include `withCredentials: true` in all axios requests
2. Browser automatically sends `admin_token` cookie
3. Backend verifies token via `adminAuthMiddleware`
4. Request proceeds if token is valid

### Logout Flow:
1. User clicks logout button
2. Frontend calls `POST /logout`
3. Backend clears `admin_token` cookie
4. Frontend clears admin state
5. Frontend redirects to login page

---

## Security Considerations

### HTTP-Only Cookies
- `admin_token` is set as HTTP-only, preventing JavaScript access
- Protects against XSS attacks
- Browser automatically sends cookie with requests

### Cookie Attributes
```javascript
{
  httpOnly: true,           // Cannot be accessed by JavaScript
  secure: true,             // Only sent over HTTPS (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days expiration
}
```

### CORS Configuration
Frontend must be configured with:
```javascript
axios.defaults.withCredentials = true;
```

Backend CORS must allow:
```javascript
cors({
  origin: 'http://localhost:5173',  // Your frontend URL
  credentials: true
})
```

### Token Expiration
- Tokens expire after 7 days
- After expiration, user must login again
- No automatic refresh (for security)

---

## Common Integration Patterns

### React Context Pattern

```typescript
// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.checkAuth();
      setAdmin(response.admin);
    } catch (error) {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setAdmin(response.admin);
  };

  const logout = async () => {
    await authApi.logout();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### API Client Setup

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  withCredentials: true, // Important: enables cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
```

### Auth API Module

```typescript
// api/auth.api.ts
import apiClient from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post('/admin/auth/login', { email, password });
  },

  checkAuth: async () => {
    return apiClient.get('/admin/auth/check');
  },

  logout: async () => {
    return apiClient.post('/admin/auth/logout');
  },
};
```

### Protected Route Component

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### Login Page Component

```typescript
// pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit">Login</button>
    </form>
  );
};
```

---

## Testing Endpoints

### Using Postman

1. **Login**:
   - Method: POST
   - URL: `http://localhost:4000/api/v1/admin/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "yourPassword123"
     }
     ```
   - Enable "Save cookies" in Postman settings

2. **Check Auth**:
   - Method: GET
   - URL: `http://localhost:4000/api/v1/admin/auth/check`
   - Cookies are automatically sent from previous login

3. **Logout**:
   - Method: POST
   - URL: `http://localhost:4000/api/v1/admin/auth/logout`
   - Cookies are automatically sent

### Using Browser DevTools

1. Open browser DevTools (F12)
2. Go to "Application" tab → "Cookies"
3. After login, you should see `admin_token` cookie
4. After logout, cookie should be removed

---

## Troubleshooting

### "401 Unauthorized" on check endpoint
- Ensure `withCredentials: true` is set in axios config
- Check that CORS is configured correctly on backend
- Verify cookie is being sent (check DevTools → Network → Headers)
- Confirm JWT_SECRET is set in backend .env file

### Cookie not being set
- Check CORS `credentials: true` on backend
- Verify frontend origin matches backend CORS config
- Ensure `withCredentials: true` on axios requests
- Check cookie settings (httpOnly, secure, sameSite)

### "404 Not Found" on /check
- Ensure route is registered in backend
- Check backend server is running
- Verify correct base URL in frontend

### Token expired
- Login again to get new token
- Check token expiration time (default: 7 days)
- Consider implementing token refresh mechanism

---

## Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/login` | POST | No | Login and receive token |
| `/check` | GET | Yes | Verify authentication status |
| `/logout` | POST | Yes | Logout and clear token |

All endpoints use HTTP-only cookies for secure token storage.
