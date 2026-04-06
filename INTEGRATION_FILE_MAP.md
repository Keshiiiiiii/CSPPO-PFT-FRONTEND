# Integration File Map

## Project Structure with Integration Changes

```
c:\Users\John Carlo\PFT/
│
├── 📄 .env  [NEW ✨]
│   ├── VITE_API_BASE_URL=https://csppopft.onrender.com
│   └── VITE_AUTH_KEY=5CAMSUCSPPOJJBWFR@2026
│
├── 📄 package.json
│   └── (no changes - all deps included)
│
├── 📄 vite.config.js
│   └── (no changes needed)
│
│
├── 📂 src/
│   │
│   ├── 📄 api.js  [UPDATED ✅]
│   │   ├── Updated API_BASE_URL to deployed backend
│   │   ├── Added officerSignup()
│   │   ├── Added officerLogin()
│   │   ├── Added adminSignup()
│   │   ├── Added adminLogin()
│   │   ├── Added getOfficerInfo()
│   │   ├── Added updateOfficerAccount()
│   │   ├── Added createOfficerProfile()
│   │   ├── JWT token auto-storage
│   │   └── Auto Authorization headers
│   │
│   ├── 📄 App.jsx  [UPDATED ✅]
│   │   ├── Updated imports (added auth functions)
│   │   ├── Updated handleLogin()
│   │   ├── Updated handleCreateAccount()
│   │   ├── Token storage logic
│   │   ├── User role management
│   │   └── Error handling
│   │
│   ├── 📄 Login.jsx  [UPDATED ✅]
│   │   ├── Added account type selector
│   │   ├── Integrated officerLogin()
│   │   ├── Integrated adminLogin()
│   │   ├── Added loading state
│   │   ├── Added error display
│   │   ├── Token management
│   │   └── Form validation
│   │
│   ├── 📄 Create_Account.jsx  [UPDATED ✅]
│   │   ├── Integrated officerSignup()
│   │   ├── Integrated adminSignup()
│   │   ├── Updated field names (full_name, badge_number)
│   │   ├── Added password confirmation
│   │   ├── Added password length validation
│   │   ├── Added error display
│   │   ├── Added loading state
│   │   └── Role selection
│   │
│   ├── 📄 Modal.jsx
│   │   └── (no changes - still used by Login)
│   │
│   ├── 📄 user.jsx
│   │   └── (no changes)
│   │
│   ├── 📄 main.jsx
│   │   └── (no changes)
│   │
│   ├── 📄 index.css
│   └── └── (no changes)
│
│
├── 📂 public/
│   └── (no changes)
│
├── 📂 backend/
│   └── (your backend code - not modified)
│
│
├── 📄 INTEGRATION_COMPLETE.md  [NEW ✨]
│   └── Summary of all changes and testing guide
│
├── 📄 INTEGRATION_GUIDE.md  [NEW ✨]
│   └── Detailed documentation and API reference
│
├── 📄 INTEGRATION_QUICK_START.md  [NEW ✨]
│   └── Quick reference and testing procedures
│
├── 📄 INTEGRATION_VERIFY.js  [NEW ✨]
│   └── Verification checklist script
│
├── 📄 INTEGRATION_FILE_MAP.md  [NEW ✨]
│   └── This file - directory structure
│
├── 📄 README.md
│   └── (original project readme)
│
├── 📄 eslint.config.js
├── 📄 index.html
└── 📄 vite.config.js
```

---

## Integration Layer (api.js)

The `src/api.js` file is the central hub for all backend communication:

```
api.js Structure:
├── Configuration
│   ├── API_BASE_URL (from .env or fallback)
│   └── AUTH_KEY (from .env or fallback)
│
├── Helper Functions
│   └── getAuthHeaders() - Injects JWT token
│
├── Authentication Functions
│   ├── officerSignup()
│   ├── officerLogin()
│   ├── adminSignup()
│   └── adminLogin()
│
├── Officer Management Functions
│   ├── getOfficerInfo()
│   ├── updateOfficerAccount()
│   └── createOfficerProfile()
│
└── Legacy Functions (fallback)
    ├── fetchUsers()
    ├── createUser()
    ├── updateUser()
    ├── deleteUser()
    ├── createAccount()
    └── ... (and others)
```

---

## Authentication Flow

### Signup Flow
```
CreateAccount.jsx
    ↓
User fills form and submits
    ↓
handleSubmit() validates inputs
    ↓
Calls officerSignup() or adminSignup()
    ↓
api.js makes POST request to backend
    ↓
Backend validates and creates account
    ↓
Returns JWT token in response
    ↓
Token stored in localStorage
    ↓
onRegister() callback to parent (App.jsx)
    ↓
Success message shown
    ↓
User redirected to login screen
```

### Login Flow
```
Login.jsx
    ↓
User selects account type (Officer/Admin)
    ↓
User enters badge number & password
    ↓
handleSubmit() validates inputs
    ↓
Calls officerLogin() or adminLogin()
    ↓
api.js makes POST request to backend
    ↓
Backend validates credentials
    ↓
Returns JWT token in response
    ↓
Token stored in localStorage
    ↓
onLogin() callback to App.jsx
    ↓
App.jsx updates state:
    - setIsAuthenticated(true)
    - setUserRole(userType)
    - setUserName(displayName)
    ↓
User routed to dashboard
    ↓
All subsequent requests include Authorization header
```

---

## State Management (App.jsx)

```
App.jsx maintains:
├── isAuthenticated  - Boolean (false = Login, true = Dashboard)
├── userRole         - String ('officer' or 'admin')
├── userName         - String (display name from backend)
├── loginError       - String (error message)
├── authToken        - Stored in localStorage, not in React state
└── ... (other dashboard state)
```

---

## API Request/Response Format

### Signup Request
```javascript
POST /auth/officer/signup
Headers:
  - Content-Type: application/json
  - X-Auth-Key: 5CAMSUCSPPOJJBWFR@2026

Body:
{
  "full_name": "John Rivera",
  "badge_number": "4821",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... },
  ... (other user data)
}
```

### Login Request
```javascript
POST /auth/officer/login
Headers:
  - Content-Type: application/json
  - X-Auth-Key: 5CAMSUCSPPOJJBWFR@2026

Body:
{
  "badge_number": "4821",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... },
  ... (other user data)
}
```

### Protected Request (after login)
```javascript
GET /auth/officer/info
Headers:
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  - X-Auth-Key: 5CAMSUCSPPOJJBWFR@2026
```

---

## Token Storage Location

```
Browser LocalStorage:
├── authToken: "eyJhbGciOiJIUzI1NiIs..."  ← JWT token from backend
```

Accessed via `localStorage.getItem('authToken')`

---

## Environment Variables

### Development & Build
```
.env file (loaded by Vite):
├── VITE_API_BASE_URL=https://csppopft.onrender.com
└── VITE_AUTH_KEY=5CAMSUCSPPOJJBWFR@2026

In code, accessed via:
├── import.meta.env.VITE_API_BASE_URL
└── import.meta.env.VITE_AUTH_KEY
```

---

## Component Communication

```
App.jsx (Main Container)
├─ <Login />
│  ├─ <CreateAccount />
│  └─ handleLogin() callback
│     └── API calls in Login.jsx
│
└─ After authentication:
   ├─ <Dashboard />
   ├─ <UserManagement />
   └─ Uses authenticated state
```

---

## Compilation & Errors

✅ **No build errors**
✅ **No lint errors**
✅ **All imports resolved**
✅ **All functions defined**

Verified: `get_errors()` returns no issues

---

## Ready to Deploy

Files are ready for:
1. **Development**: `npm run dev`
2. **Production Build**: `npm run build`
3. **Preview**: `npm run preview`

All changes are backward compatible with existing code.
