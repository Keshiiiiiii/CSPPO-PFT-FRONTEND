# Quick Reference: Frontend-Backend Integration

## ✅ Integration Complete

Your React/Vite frontend is now fully integrated with the NestJS backend API.

## API Configuration
```
Base URL: https://csppopft.onrender.com
Auth Key: 5CAMSUCSPPOJJBWFR@2026
```

## Authentication Endpoints Ready
```
POST   /auth/officer/signup
POST   /auth/officer/login
POST   /auth/admin/signup
POST   /auth/admin/login
GET    /auth/officer/info
PUT    /auth/officer/update_account
POST   /auth/officer/create_profile
```

## What Changed

### Files Modified
1. **src/api.js** - Added backend authentication functions
2. **src/App.jsx** - Updated to use API for login/signup
3. **src/Login.jsx** - Integrated API calls, added role selector
4. **src/Create_Account.jsx** - Integrated signup API
5. **.env** - Added environment variables

### Key Features
✅ JWT Token Authentication
✅ Officer & Admin Roles
✅ Automatic Token Storage
✅ Error Handling
✅ Password Validation
✅ Responsive Forms

## How to Test

### Test 1: Create Officer Account
1. Start dev server: `npm run dev`
2. Click "Create Account"
3. Fill in:
   - Full Name: John Rivera
   - Badge Number: 4821
   - Password: password123 (min 6 chars)
   - Role: Officer
4. Click "Create Account"
5. Should see success message
6. Sign in with: Badge 4821 / password123

### Test 2: Create Admin Account
1. Click "Create Account"
2. Fill in form with different badge number
3. Select "Admin" role
4. Same testing process

### Test 3: Login
1. Select account type (Officer/Admin)
2. Enter badge number
3. Enter password
4. Click "Sign In"
5. Should access dashboard

## Environment Variables
Located in `.env`:
```
VITE_API_BASE_URL=https://csppopft.onrender.com
VITE_AUTH_KEY=5CAMSUCSPPOJJBWFR@2026
```

## Data Flow
```
User Form Input
    ↓
Create_Account.jsx or Login.jsx
    ↓
api.js (officerSignup/adminSignup/officerLogin/adminLogin)
    ↓
Backend (https://csppopft.onrender.com)
    ↓
JWT Token response
    ↓
localStorage storage
    ↓
App.jsx state update
    ↓
Dashboard access
```

## Next: Full Feature Integration Available

When ready, integrate these additional endpoints:
- **Password Reset**: `/auth/officer/reset_password`
- **Profile Mgmt**: `/auth/officer/update_profile`
- **BMI Tracking**: `/auth/officer/create_bmi`
- **Fitness Tests**: pushup, situp, sprint, walktest records

See `INTEGRATION_GUIDE.md` for detailed documentation.

## Troubleshooting

### "Network Error" or CORS Error
- Check backend is running at https://csppopft.onrender.com
- Verify backend CORS settings allow your frontend domain

### "Invalid badge or password"
- Verify badge number was used during signup
- Check password matches what was set
- Badge numbers are case-sensitive

### Blank Dashboard
- Check browser console for errors
- Verify backend is accessible
- Check authentication token in localStorage (F12 → Application)

## API Request Example
```javascript
// Signup
const response = await officerSignup({
  full_name: "Juan Rivera",
  badge_number: "4821",
  password: "password123"
});

// Login
const response = await officerLogin({
  badge_number: "4821",
  password: "password123"
});
```

## Support
For issues:
1. Check browser console (F12)
2. Check Network tab for API responses
3. Verify .env variables are loaded
4. Check backend logs
