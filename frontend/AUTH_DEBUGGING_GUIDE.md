# Authentication Debugging Guide

## Current Setup

### Backend (Node.js/Express)
- **Signup Endpoint**: `POST /api/v1/users/auth/signup`
- **Expected Request Body**:
  ```json
  {
    "fullname": "string",
    "email": "string",
    "password": "string",
    "phone": "string"
  }
  ```
- **Response on Success** (201):
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "user": {
      "id": 1,
      "fullname": "Test User",
      "email": "test@example.com",
      "phone": "1234567890"
    }
  }
  ```
- **Sets Cookie**: `token` (JWT) with HTTP-only flag

### Frontend (Flutter)
- **DioClient** configured with cookie persistence
- **AuthRepository** handles API calls
- **AuthProvider** manages authentication state
- **User Model** expects: id, fullname, email, phone (created_at and updated_at are optional)

---

## How to Debug

### Step 1: Check Backend is Running

```bash
# From project root
cd backend
npm run dev

# Should see: "Server is running on http://localhost:4000"
```

Verify port 4000 is listening:
```bash
lsof -i :4000
```

### Step 2: Test Backend Directly with curl

```bash
# Test signup
curl -X POST http://localhost:4000/api/v1/users/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'

# Expected output:
# {"success":true,"message":"User created successfully","user":{...}}
```

If this fails:
- Check database connection
- Check if email already exists
- Check validation errors

### Step 3: Run Flutter App with Debug Logs

```bash
cd frontend
flutter run
```

When you signup, you should see detailed logs like:

```
┌─────────────────────────────────────────────────────
│ REQUEST[POST]
│ URL: http://localhost:4000/api/v1/users/auth/signup
│ Headers: {Content-Type: application/json, Accept: application/json}
│ Data: {fullname: Test User, email: test@example.com, password: password123, phone: 1234567890}
└─────────────────────────────────────────────────────
```

Then either success:
```
┌─────────────────────────────────────────────────────
│ RESPONSE[201]
│ URL: http://localhost:4000/api/v1/users/auth/signup
│ Data: {success: true, message: User created successfully, user: {...}}
└─────────────────────────────────────────────────────
```

Or error:
```
┌─────────────────────────────────────────────────────
│ ERROR[400]
│ URL: http://localhost:4000/api/v1/users/auth/signup
│ Message: <error message>
│ Response Data: {success: false, message: "..."}
└─────────────────────────────────────────────────────
```

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to server"
**Symptoms**: Connection refused, timeout errors

**Solution**:
1. Ensure backend is running on port 4000
2. If using physical device, change `baseUrl` in `api_constants.dart`:
   ```dart
   static const String baseUrl = 'http://YOUR_COMPUTER_IP:4000/api/v1';
   // Example: http://192.168.1.100:4000/api/v1
   ```
3. Ensure firewall allows connections on port 4000

### Issue 2: "404 Not Found"
**Symptoms**: ERROR[404] in logs

**Solution**:
- Verify endpoint path in `api_constants.dart` matches backend routes
- Current correct paths:
  - Signup: `/users/auth/signup` ✅
  - Login: `/users/auth/login` ✅
  - Logout: `/users/auth/logout` ✅

### Issue 3: "400 Bad Request - Validation Error"
**Symptoms**: ERROR[400] with validation message

**Solution**:
- Check form validation in Flutter matches backend requirements
- Email: Must be valid email format
- Password: Minimum 8 characters
- Phone: Minimum 10 digits
- Fullname: Required, not empty

### Issue 4: "User already exists"
**Symptoms**: ERROR[400] with message "an account with this email already exists"

**Solution**:
- Use a different email
- Or delete the existing user from database:
  ```sql
  DELETE FROM users WHERE email = 'test@example.com';
  ```

### Issue 5: "Type Error in JSON Parsing"
**Symptoms**: Error like "type 'String' is not a subtype of type 'int'"

**Solution**:
- Check User model matches backend response
- Ensure `json_serializable` generated code is up to date:
  ```bash
  flutter pub run build_runner build --delete-conflicting-outputs
  ```

### Issue 6: "Cookies Not Persisting"
**Symptoms**: User logged out after app restart

**Solution**:
1. Verify `PersistCookieJar` is initialized:
   ```dart
   await dioClient.initialize(); // in main.dart
   ```
2. Check cookie storage permissions
3. Verify backend sets cookie correctly:
   ```javascript
   res.cookie("token", token)
   ```

---

## Testing Checklist

### Backend Tests
- [ ] Backend server starts without errors
- [ ] Database connection works
- [ ] Can create user via curl
- [ ] Can login via curl
- [ ] Cookie is set in response headers

### Frontend Tests
- [ ] App starts and shows Login screen
- [ ] Can navigate to Signup screen
- [ ] Form validation works
- [ ] Signup button shows "Signing up..." when loading
- [ ] Success: Navigates to Home screen
- [ ] Error: Shows error message in SnackBar
- [ ] After signup, can see user data in AuthProvider

### Integration Tests
- [ ] Complete signup flow: Login → Signup → Home
- [ ] Cookie persists (close app, reopen, still logged in)
- [ ] Can logout and login again
- [ ] Error messages are user-friendly

---

## Debug Mode - Step by Step

### 1. Enable Flutter DevTools
```bash
flutter run --observatory-port=8888
```

Then open Chrome to: `http://localhost:8888`

### 2. Add Breakpoints in Flutter
In `lib/data/repositories/auth_repository.dart`:
```dart
Future<ApiResult<User>> signup(...) async {
  try {
    final response = await _dioClient.dio.post(...);

    // Add print here to see response
    print('Raw response: ${response.data}');

    if (response.data['success'] == true) {
      final user = User.fromJson(response.data['user']);
      return ApiResult.success(user, message: response.data['message']);
    }
    ...
}
```

### 3. Check Backend Logs
In `backend/src/controller/users/auth.controller.ts`, add console.logs:
```javascript
export const handleSignupUser = AsyncCall(async (req, res, next) => {
    const {fullname, email, password, phone} = req.body;

    console.log('Signup request:', { fullname, email, phone });

    // ... rest of code
});
```

---

## Quick Test Command

Test the entire flow with a single command:

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start Flutter
cd frontend && flutter run

# Then in app:
# 1. Click "New user? Create an account"
# 2. Click "Sign up with Email"
# 3. Fill form:
#    - Name: Test User
#    - Email: test@example.com
#    - Phone: 1234567890
#    - Password: password123
# 4. Click "Sign Up"
# 5. Should navigate to Home screen
```

---

## Expected Flow

1. **User taps "Sign Up"**
   - `_SignupEmailScreenState._signup()` called
   - Form validation runs
   - `AuthProvider.signup()` called

2. **AuthProvider calls Repository**
   - `AuthRepository.signup()` called
   - Dio makes POST request to backend
   - Request logged by interceptor

3. **Backend Processes Request**
   - Validates email doesn't exist
   - Hashes password with bcrypt
   - Inserts user into database
   - Generates JWT token
   - Sets token cookie
   - Returns user data

4. **Frontend Receives Response**
   - Response logged by interceptor
   - User model created from JSON
   - AuthProvider updates state:
     - `_user = user`
     - `_isAuthenticated = true`
     - `_isLoading = false`
   - UI notified via `notifyListeners()`

5. **Navigation**
   - Success callback in `_SignupEmailScreenState`
   - Navigator pushes HomeScreen
   - User sees products

---

## Troubleshooting Network Issues

### For iOS Simulator
Add to `ios/Runner/Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### For Android Emulator
In `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

### For Physical Device
1. Get your computer's IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Update `api_constants.dart`:
   ```dart
   static const String baseUrl = 'http://192.168.1.XXX:4000/api/v1';
   ```

3. Ensure computer and phone are on same WiFi network

---

## Success Indicators

✅ **Signup Successful** when you see:
1. Console log: `RESPONSE[201]` with user data
2. No error SnackBar shown
3. App navigates to Home screen
4. Home screen loads products
5. User data is in AuthProvider state

✅ **Cookie Persisted** when:
1. Close and reopen app
2. Still logged in (skip login screen)
3. Can make authenticated requests

---

## If All Else Fails

1. **Clean and rebuild**:
   ```bash
   flutter clean
   flutter pub get
   flutter pub run build_runner build --delete-conflicting-outputs
   flutter run
   ```

2. **Reset database**:
   ```bash
   cd backend
   # Re-run schema.sql to reset tables
   ```

3. **Clear app data**:
   - Uninstall app from device/emulator
   - Reinstall with `flutter run`

4. **Check versions**:
   ```bash
   flutter doctor -v
   node --version
   npm --version
   ```

---

*Use this guide to systematically debug any authentication issues.*
