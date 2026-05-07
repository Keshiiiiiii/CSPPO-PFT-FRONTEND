/**
 * Legacy Service — old /users and /accounts REST endpoints.
 * Kept separate as they use a different pattern (no auth headers).
 * Identical function signatures to original api.js.
 */
import { API_BASE_URL } from './httpClient.js'

/* ── Users ── */

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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete user')
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

/* ── Accounts ── */

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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete account')
    return true
  } catch (error) {
    console.error('Error deleting account:', error)
    throw error
  }
}
