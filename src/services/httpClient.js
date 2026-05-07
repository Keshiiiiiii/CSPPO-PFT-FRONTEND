/**
 * Shared HTTP Client — centralizes fetch, auth headers, and response parsing.
 * All domain services import from here instead of duplicating fetch boilerplate.
 */

const ENV_AUTH_KEY = import.meta.env.VITE_AUTH_KEY || ''

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'development' ? '/api' : 'https://csppopft.onrender.com')

export const USE_OFFLINE_MODE = import.meta.env.VITE_OFFLINE_MODE === 'true'

/* ── Auth helpers ── */

export const getStoredAdminKey = () => localStorage.getItem('adminAuthKey') || ENV_AUTH_KEY

export const requireAdminKey = (authKey) => {
  const key = authKey || getStoredAdminKey()
  if (!key) throw new Error('Authorization key is required')
  return key
}

const getAuthHeaders = (authKey) => {
  const authToken = localStorage.getItem('authToken')
  const key = authKey || getStoredAdminKey()
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(key ? { 'x-admin-key': key } : {}),
  }
}

export const saveAuthToken = (data) => {
  const token = data?.bearer_token || data?.access_token || data?.token
  if (token) localStorage.setItem('authToken', token)
}

/* ── Response parser ── */

const parseResponse = async (response) => {
  let payload = {}
  let text = ''
  try {
    payload = await response.json()
  } catch {
    text = await response.text().catch(() => '')
  }
  if (!response.ok) {
    const detailMsg = typeof payload?.detail === 'object' ? JSON.stringify(payload.detail) : payload?.detail
    const backendMessage = payload?.message || payload?.error || detailMsg || text || response.statusText
    const error = new Error(backendMessage || `Server error: ${response.status}`)
    error.status = response.status
    throw error
  }
  return payload
}

/* ── HTTP Methods ── */

export const get = async (path, authKey) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: getAuthHeaders(authKey),
  })
  return parseResponse(response)
}

export const post = async (path, data, authKey) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(authKey),
    body: JSON.stringify(data),
  })
  return parseResponse(response)
}

export const put = async (path, data, authKey) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(authKey),
    body: JSON.stringify(data),
  })
  return parseResponse(response)
}

export const del = async (path, data, authKey) => {
  const opts = {
    method: 'DELETE',
    headers: getAuthHeaders(authKey),
  }
  if (data) opts.body = JSON.stringify(data)
  const response = await fetch(`${API_BASE_URL}${path}`, opts)
  return parseResponse(response)
}

/**
 * Simple fetch without auth headers (for legacy endpoints).
 */
export const fetchRaw = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!response.ok) {
    throw new Error(options.errorMsg || `Failed: ${response.status}`)
  }
  return response.json()
}
