// API functions for backend communication
const ENV_AUTH_KEY = import.meta.env.VITE_AUTH_KEY || '' // Optional environment auth key

// Use proxy in local development to avoid CORS issues; use actual remote in production.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'development' ? '/api' : 'https://csppopft.onrender.com')

// Development mode - use localStorage as fallback only when explicit flag is enabled.
const USE_OFFLINE_MODE = import.meta.env.VITE_OFFLINE_MODE === 'true'

const getStoredAdminKey = () => localStorage.getItem('adminAuthKey') || ENV_AUTH_KEY

const requireAdminKey = (authKey) => {
  const key = authKey || getStoredAdminKey()
  if (!key) {
    throw new Error('Authorization key is required')
  }
  return key
}

// Helper to get authorization header
const getAuthHeaders = (authKey) => {
  const authToken = localStorage.getItem('authToken')
  const key = authKey || getStoredAdminKey()
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(key ? { 'x-admin-key': key } : {}),
  }
}

const saveAuthToken = (data) => {
  
  const token = data?.bearer_token || data?.access_token || data?.token
  if (token) {
    localStorage.setItem('authToken', token)
  }
}

const parseResponse = async (response) => {
  let payload = {}
  let text = ''

  try {
    payload = await response.json()
  } catch {
    text = await response.text().catch(() => '')
  }

  if (!response.ok) {
    const detailMsg = typeof payload?.detail === 'object' ? JSON.stringify(payload.detail) : payload?.detail;
    const backendMessage = payload?.message || payload?.error || detailMsg || text || response.statusText
    throw new Error(backendMessage || `Server error: ${response.status}`)
  }

  return payload
}

// ==================== AUTHENTICATION ====================

// Fallback function for offline testing
const createMockToken = (userData) => {
  // Create a simple JWT-like token for testing
  const payload = btoa(JSON.stringify({ ...userData, iat: Date.now() }))
  return `mock_${payload}`
}

// Fallback to localStorage for testing when backend is unavailable
const handleOfflineSignup = async (signupData, type) => {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]')

  // Check email or username collision
  if (
    accounts.some(
      (acc) =>
        (signupData.email && acc.email === signupData.email) ||
        (signupData.username && acc.username === signupData.username)
    )
  ) {
    throw new Error('Email or username already registered')
  }

  const newAccount = {
    id: Date.now().toString(),
    ...signupData,
    type,
    created_at: new Date().toISOString(),
  }

  accounts.push(newAccount)
  localStorage.setItem('accounts', JSON.stringify(accounts))

  const token = createMockToken(newAccount)
  localStorage.setItem('authToken', token)

  return {
    access_token: token,
    user: newAccount,
    email: signupData.email,
    username: signupData.username,
  }
}

// Fallback to localStorage for testing when backend is unavailable
const handleOfflineLogin = async (loginData, type) => {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]')

  const account = accounts.find(
    (acc) =>
      ((loginData.email && acc.email === loginData.email) ||
        (loginData.username && acc.username === loginData.username)) &&
      acc.password === loginData.password &&
      acc.type === type
  )
  
  if (!account) {
    throw new Error('Invalid badge number or password')
  }
  
  const token = createMockToken(account)
  localStorage.setItem('authToken', token)
  
  return {
    access_token: token,
    user: account,
    full_name: account.full_name,
  }
}

// Officer Signup
export const officerSignup = async (signupData) => {
  try {
    const url = `${API_BASE_URL}/auth/officer/signup`
    console.log('Attempting signup at:', url)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    })
    const data = await parseResponse(response)
    saveAuthToken(data)
    return data
  } catch (error) {
    console.error('Error during signup:', error)
    if (USE_OFFLINE_MODE && error instanceof TypeError) {
      console.log('Backend unavailable, using offline mode')
      // Fallback to localStorage only when explicitly enabled for offline development
      return await handleOfflineSignup(signupData, 'officer')
    }
    throw error
  }
}

// Officer Login
export const officerLogin = async (loginData) => {
  try {
    const url = `${API_BASE_URL}/auth/officer/login`
    console.log('Attempting login at:', url)
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(loginData),
    })
    const data = await parseResponse(response)
    saveAuthToken(data)
    return data
  } catch (error) {
    console.error('Error during login:', error)
    if (USE_OFFLINE_MODE && error instanceof TypeError) {
      console.log('Backend unavailable, using offline mode')
      return await handleOfflineLogin(loginData, 'officer')
    }
    throw error
  }
}

// Admin Signup
export const adminSignup = async (signupData, authKey) => {
  try {
    const url = `${API_BASE_URL}/auth/admin/signup`
    console.log('Attempting admin signup at:', url)
    const adminKey = requireAdminKey(authKey)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify(signupData),
    })
    const data = await parseResponse(response)
    if (authKey) {
      localStorage.setItem('adminAuthKey', adminKey)
    }
    saveAuthToken(data)
    return data
  } catch (error) {
    console.error('Error during admin signup:', error)
    if (USE_OFFLINE_MODE && error instanceof TypeError) {
      console.log('Backend unavailable, using offline mode')
      return await handleOfflineSignup(signupData, 'admin')
    }
    throw error
  }
}

// Admin Login
export const adminLogin = async (loginData) => {
  try {
    const url = `${API_BASE_URL}/auth/admin/login`
    console.log('Attempting admin login at:', url)
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(loginData),
    })
    const data = await parseResponse(response)
    saveAuthToken(data)
    return data
  } catch (error) {
    console.error('Error during admin login:', error)
    if (USE_OFFLINE_MODE && error instanceof TypeError) {
      console.log('Backend unavailable, using offline mode')
      return await handleOfflineLogin(loginData, 'admin')
    }
    throw error
  }
}

// Get Officer Info (account fields such as email — GET /auth/officer/info)
export const getOfficerInfo = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/officer/info`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

// Update Officer Account
export const updateOfficerAccount = async (updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/officer/update_account`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    })
    if (!response.ok) throw new Error('Failed to update account')
    return await response.json()
  } catch (error) {
    console.error('Error updating account:', error)
    throw error
  }
}

// Update Officer Profile
export const createOfficerProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/officer/create_profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    })
    if (!response.ok) throw new Error('Failed to create profile')
    return await response.json()
  } catch (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}

// ==================== OFFICER PERSONAL RECORDS ====================

const buildOfficerUrl = (path) => `${API_BASE_URL}${path}`

export const officerGetWalkTests = async () => {
  const response = await fetch(buildOfficerUrl('/auth/officer/get_walktest_record'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerCreateWalkTest = async (data) => {
  const response = await fetch(buildOfficerUrl('/auth/officer/create_walktest'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerUpdateWalkTest = async (id, data) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/update_walkrecord/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerDeleteWalkTest = async (id) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/delete_walkrecord/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerGetSprintRecords = async () => {
  const response = await fetch(buildOfficerUrl('/auth/officer/get_sprint_record'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerCreateSprintRecord = async (data) => {
  const response = await fetch(buildOfficerUrl('/auth/officer/create_sprint'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerUpdateSprintRecord = async (id, data) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/update_sprint_record/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerDeleteSprintRecord = async (id) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/delete_sprint_record/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerGetSitupRecords = async () => {
  const response = await fetch(buildOfficerUrl('/auth/officer/situp_record'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerCreateSitupRecord = async (data) => {
  const response = await fetch(buildOfficerUrl('/auth/officer/create_situp'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerUpdateSitupRecord = async (id, data) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/update_situp/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerDeleteSitupRecord = async (id) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/delete_situp/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerGetPushupRecords = async () => {
  const response = await fetch(buildOfficerUrl('/auth/officer/pushup_record'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerCreatePushupRecord = async (data) => {
  const response = await fetch(buildOfficerUrl('/auth/officer/create_pushup_record'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerUpdatePushupRecord = async (id, data) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/update_officer_pushup_record/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerDeletePushupRecord = async (id) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/delete_officer_pushup_record/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerGetBmi = async () => {
  const response = await fetch(buildOfficerUrl('/auth/officer/bmi'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerCreateBmi = async (data) => {
  const response = await fetch(buildOfficerUrl('/auth/officer/create_bmi'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerUpdateBmi = async (data) => {
  const response = await fetch(buildOfficerUrl('/auth/officer/update_bmi'), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const officerDeleteBmi = async (id) => {
  const response = await fetch(buildOfficerUrl(`/auth/officer/delete_bmi/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const officerGetProfile = async () => {
  const response = await fetch(buildOfficerUrl('/auth/officer/profile'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

/** Update the signed-in officer's profile (same resource family as GET /auth/officer/profile). */
export const officerUpdateProfile = async (profileData) => {
  const response = await fetch(buildOfficerUrl('/auth/officer/update_profile'), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  })
  return await parseResponse(response)
}

export const officerDeleteProfile = async () => {
  const response = await fetch(buildOfficerUrl('/auth/officer/delete_profile'), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

// ==================== ADMIN OFFICER RECORDS ====================

const buildAdminUrl = (path) => `${API_BASE_URL}${path}`

export const adminGetWalkTest = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/get/walktest/${id}`), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetWalkTests = async () => {
  const response = await fetch(buildAdminUrl('/auth/admin/officer/get/walktestrecord'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminUpdateWalkTest = async (id, data) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/update/walktest/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminDeleteWalkTest = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/delete/walktest/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetSprintRecord = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/get/sprintrecord/${id}`), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetSprintRecords = async () => {
  const response = await fetch(buildAdminUrl('/auth/admin/officer/get/allsprintrecords'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminUpdateSprintRecord = async (id, data) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/update/sprintrecord/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminDeleteSprintRecord = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/delete/sprintrecord/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetSitupRecord = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/get/situprecord/${id}`), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetSitupRecords = async () => {
  const response = await fetch(buildAdminUrl('/auth/admin/officer/get/allsituprecord'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminUpdateSitupRecord = async (id, data) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/update/situprecord/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminDeleteSitupRecord = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/delete/situprecord/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetPushupRecord = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/pushuprecord/${id}`), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetPushupRecords = async () => {
  const response = await fetch(buildAdminUrl('/auth/admin/officer/pushuprecord'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminUpdatePushupRecord = async (id, data) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/update/pushuprecord/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminDeletePushupRecord = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/delete/pushuprecord/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetOfficerBmi = async () => {
  const response = await fetch(buildAdminUrl('/auth/admin/officer/get/officerbmi'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetOfficerBmiById = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/get/officerbmi/${id}`), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminUpdateOfficerBmi = async (id, data) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/update/officerbmi/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminDeleteOfficerBmi = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/delete/officerbmi/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetAllOfficerProfiles = async () => {
  // Try the current Nest route first, then older variants.
  const routes = [
    '/auth/admin/officer/profile',
    '/auth/admin/getallofficer_profile',
    '/auth/admin/officer/getallofficer_profile',
  ]

  for (const route of routes) {
    try {
      const response = await fetch(buildAdminUrl(route), {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await parseResponse(response)
        if (Array.isArray(data)) return data
        if (Array.isArray(data?.data)) return data.data
        if (Array.isArray(data?.results)) return data.results
        if (Array.isArray(data?.items)) return data.items
        return []
      }
      if (response.status !== 404) {
        return await parseResponse(response)
      }
      // If 404, try next route
    } catch (error) {
      // For other network errors, rethrow and let caller decide.
      throw error
    }
  }

  // Endpoint not available, return empty list so dashboard does not break.
  return []
}

export const adminGetOfficerAccount = async (id) => {
  const response = await fetch(buildAdminUrl(`/auth/admin/officer/account/${id}`), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminGetOfficerAccounts = async () => {
  const response = await fetch(buildAdminUrl('/auth/admin/officer/accounts'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

export const adminUpdateInfo = async (data) => {
  const response = await fetch(buildAdminUrl('/auth/admin/update/info'), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminUpdateStatus = async (data) => {
  const response = await fetch(buildAdminUrl('/auth/admin/update/status'), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminDeleteSelf = async (data) => {
  const response = await fetch(buildAdminUrl('/auth/admin/delete'), {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminForgotPassword = async (data) => {
  const response = await fetch(buildAdminUrl('/auth/admin/forgot_password'), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return await parseResponse(response)
}

export const adminGetInfo = async () => {
  const response = await fetch(buildAdminUrl('/auth/admin/info'), {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return await parseResponse(response)
}

// ==================== LEGACY API (Fallback) ====================
// Users API
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`)
    if (!response.ok) throw new Error('Failed to fetch users')
    return await response.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error('Failed to create user')
    return await response.json()
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error('Failed to update user')
    return await response.json()
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete user')
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Accounts API
export const fetchAccounts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts`)
    if (!response.ok) throw new Error('Failed to fetch accounts')
    return await response.json()
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return []
  }
}

export const createAccount = async (accountData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    })
    if (!response.ok) throw new Error('Failed to create account')
    return await response.json()
  } catch (error) {
    console.error('Error creating account:', error)
    throw error
  }
}

export const updateAccount = async (id, accountData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    })
    if (!response.ok) throw new Error('Failed to update account')
    return await response.json()
  } catch (error) {
    console.error('Error updating account:', error)
    throw error
  }
}

export const deleteAccount = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete account')
    return true
  } catch (error) {
    console.error('Error deleting account:', error)
    throw error
  }
}