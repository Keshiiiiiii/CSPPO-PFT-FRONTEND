# Frontend-Backend Integration Guide

## Overview
This document outlines the integration between your React/Vite frontend and the NestJS backend API.

## Backend Configuration

### API Base URL
- **Deployed**: https://csppopft.onrender.com
- **Auth Key**: 5CAMSUCSPPOJJBWFR@2026

### Environment Variables (.env)
The frontend uses the following environment variables configured in `.env`:
```
VITE_API_BASE_URL=https://csppopft.onrender.com
VITE_AUTH_KEY=5CAMSUCSPPOJJBWFR@2026
```

These are automatically loaded by Vite during development and build.

## Authentication Endpoints

### Officer Authentication
- **Signup**: `POST /auth/officer/signup`
  - Required fields: `full_name`, `badge_number`, `password`
  - Returns: JWT token in `access_token`
  
- **Login**: `POST /auth/officer/login`
  - Required fields: `badge_number`, `password`
  - Returns: JWT token in `access_token`

- **Get Info**: `GET /auth/officer/info`
  - Requires: Authorization header with Bearer token
  
- **Update Account**: `PUT /auth/officer/update_account`
  - Headers: Bearer token required
  
- **Create Profile**: `POST /auth/officer/create_profile`
  - Headers: Bearer token required

### Admin Authentication
- **Signup**: `POST /auth/admin/signup`
  - Required fields: `full_name`, `badge_number`, `password`
  - Returns: JWT token in `access_token`
  
- **Login**: `POST /auth/admin/login`
  - Required fields: `badge_number`, `password`
  - Returns: JWT token in `access_token`

## Frontend Implementation Details

### API Module (src/api.js)
The `api.js` file contains all API communication functions:

#### Authentication Functions
- `officerSignup(signupData)` - Register a new officer
- `officerLogin(loginData)` - Login as officer
- `adminSignup(signupData)` - Register a new admin
- `adminLogin(loginData)` - Login as admin
- `getOfficerInfo()` - Fetch officer information
- `updateOfficerAccount(updateData)` - Update officer account
- `createOfficerProfile(profileData)` - Create officer profile

#### Token Management
- JWT tokens are automatically stored in `localStorage` under the key `authToken`
- Tokens are automatically included in subsequent API requests via the `Authorization` header

### Login Flow (src/Login.jsx)
1. User selects account type (Officer or Admin)
2. Enter badge number and password
3. Frontend calls appropriate login endpoint
4. Token is stored in localStorage
5. User is authenticated and redirected to dashboard

### Signup Flow (src/Create_Account.jsx)
1. User fills in full name, badge number, and password
2. User selects role (Officer or Admin)
3. Frontend calls appropriate signup endpoint
4. Token is stored in localStorage
5. Account is created successfully

### App State Management (src/App.jsx)
- `isAuthenticated` - Boolean flag for authentication status
- `userRole` - 'admin' or 'officer'
- `userName` - Display name from backend
- `loginError` - Error message display
- Token is stored in localStorage and persists across sessions

## Integration Checklist

✅ API endpoints configured for officer and admin authentication
✅ JWT token handling implemented
✅ Signup/Login components integrated with backend
✅ Error handling for authentication failures
✅ Token storage in localStorage
✅ Authorization headers automatically added
✅ Environment variables configured

## Testing the Integration

### Test Officer Signup
1. Click "Create Account"
2. Enter full name, badge number (numeric), and password (6+ chars)
3. Select "Officer" role
4. Click "Create Account"
5. Expected: Account created successfully, can login

### Test Officer Login
1. Enter badge number from signup
2. Enter password
3. Select "Officer" account type
4. Click "Sign In"
5. Expected: Logged in, dashboard displays

### Test Admin Signup/Login
1. Same as officer, but select "Admin" role during signup/login

## Common Errors & Solutions

### CORS Errors
- Ensure backend has CORS enabled
- Check that the API_BASE_URL is correct
- Verify the deployed backend is accessible

### Authentication Failures
- Check that badge_number format matches backend expectations
- Ensure password meets backend requirements (typically 6+ characters)
- Verify JWT_SECRET is properly configured on backend

### Token Expiration
- Backend JWT_EXPIRES_IN determines token lifetime
- Configure in backend .env file
- Frontend will need to handle token refresh or re-login

## Next Steps

1. **Add Password Reset**: Implement `/auth/officer/reset_password` endpoint
2. **Add Profile Management**: Use `/auth/officer/update_profile` endpoint
3. **Add Fitness Tracking**: Integrate BMI, pushup, situp, sprint, and walk test endpoints
4. **Add Admin Dashboard**: Leverage admin-specific endpoints for user management

## File Changes

### Modified Files
- `src/api.js` - Updated with NestJS backend endpoints
- `src/App.jsx` - Updated authentication handlers
- `src/Login.jsx` - Updated with API integration
- `src/Create_Account.jsx` - Updated with API integration
- `.env` - Created with environment variables

### Environment Files
- `.env` - Frontend environment configuration (development and build)
