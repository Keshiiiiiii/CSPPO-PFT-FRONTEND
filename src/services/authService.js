/**
 * Auth Service — login, signup, account info.
 * Preserves offline mode fallbacks identically.
 */
import { API_BASE_URL, USE_OFFLINE_MODE, get, post, put, saveAuthToken, requireAdminKey, getStoredAdminKey } from './httpClient.js'

/* ── Offline fallbacks (unchanged) ── */

const createMockToken = (userData) => {
  const payload = btoa(JSON.stringify({ ...userData, iat: Date.now() }))
  return `mock_${payload}`
}

const handleOfflineSignup = async (signupData, type) => {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]')
  if (accounts.some((acc) => (signupData.email && acc.email === signupData.email) || (signupData.username && acc.username === signupData.username))) {
    throw new Error('Email or username already registered')
  }
  const newAccount = { id: Date.now().toString(), ...signupData, type, created_at: new Date().toISOString() }
  accounts.push(newAccount)
  localStorage.setItem('accounts', JSON.stringify(accounts))
  const token = createMockToken(newAccount)
  localStorage.setItem('authToken', token)
  return { access_token: token, user: newAccount, email: signupData.email, username: signupData.username }
}

const handleOfflineLogin = async (loginData, type) => {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]')
  const account = accounts.find((acc) => ((loginData.email && acc.email === loginData.email) || (loginData.username && acc.username === loginData.username)) && acc.password === loginData.password && acc.type === type)
  if (!account) throw new Error('Invalid badge number or password')
  const token = createMockToken(account)
  localStorage.setItem('authToken', token)
  return { access_token: token, user: account, full_name: account.full_name }
}

/* ── Officer Auth ── */

export const officerSignup = async (signupData) => {
  try {
    const url = `${API_BASE_URL}/auth/officer/signup`
    console.log('Attempting signup at:', url)
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(signupData) })
    let payload = {}
    try { payload = await response.json() } catch { /* empty */ }
    if (!response.ok) {
      const detailMsg = typeof payload?.detail === 'object' ? JSON.stringify(payload.detail) : payload?.detail
      throw new Error(payload?.message || payload?.error || detailMsg || response.statusText || `Server error: ${response.status}`)
    }
    saveAuthToken(payload)
    return payload
  } catch (error) {
    console.error('Error during signup:', error)
    if (USE_OFFLINE_MODE && error instanceof TypeError) {
      console.log('Backend unavailable, using offline mode')
      return await handleOfflineSignup(signupData, 'officer')
    }
    throw error
  }
}

export const officerLogin = async (loginData) => {
  try {
    const data = await post('/auth/officer/login', loginData)
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

/* ── Admin Auth ── */

export const adminSignup = async (signupData, authKey) => {
  try {
    const adminKey = requireAdminKey(authKey)
    const url = `${API_BASE_URL}/auth/admin/signup`
    console.log('Attempting admin signup at:', url)
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify(signupData) })
    let payload = {}
    try { payload = await response.json() } catch { /* empty */ }
    if (!response.ok) {
      const detailMsg = typeof payload?.detail === 'object' ? JSON.stringify(payload.detail) : payload?.detail
      throw new Error(payload?.message || payload?.error || detailMsg || response.statusText || `Server error: ${response.status}`)
    }
    if (authKey) localStorage.setItem('adminAuthKey', adminKey)
    saveAuthToken(payload)
    return payload
  } catch (error) {
    console.error('Error during admin signup:', error)
    if (USE_OFFLINE_MODE && error instanceof TypeError) {
      console.log('Backend unavailable, using offline mode')
      return await handleOfflineSignup(signupData, 'admin')
    }
    throw error
  }
}

export const adminLogin = async (loginData) => {
  try {
    const data = await post('/auth/admin/login', loginData)
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

/* ── Account Info ── */

export const getOfficerInfo = () => get('/auth/officer/info')

export const updateOfficerAccount = async (updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/officer/update_account`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {}), ...(getStoredAdminKey() ? { 'x-admin-key': getStoredAdminKey() } : {}) },
      body: JSON.stringify(updateData),
    })
    if (!response.ok) throw new Error('Failed to update account')
    return await response.json()
  } catch (error) {
    console.error('Error updating account:', error)
    throw error
  }
}

export const createOfficerProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/officer/create_profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {}), ...(getStoredAdminKey() ? { 'x-admin-key': getStoredAdminKey() } : {}) },
      body: JSON.stringify(profileData),
    })
    if (!response.ok) throw new Error('Failed to create profile')
    return await response.json()
  } catch (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}
