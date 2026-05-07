/**
 * Admin Service — all admin-side record management.
 * Identical function signatures to original api.js.
 */
import { get, post, put, del, API_BASE_URL } from './httpClient.js'

/* ── Walk Test ── */
export const adminGetWalkTest = (id) => get(`/auth/admin/officer/get/walktest/${id}`)
export const adminGetWalkTests = () => get('/auth/admin/officer/get/walktestrecord')
export const adminUpdateWalkTest = (id, data) => put(`/auth/admin/officer/update/walktest/${id}`, data)
export const adminDeleteWalkTest = (id) => del(`/auth/admin/officer/delete/walktest/${id}`)

/* ── Sprint ── */
export const adminGetSprintRecord = (id) => get(`/auth/admin/officer/get/sprintrecord/${id}`)
export const adminGetSprintRecords = () => get('/auth/admin/officer/get/allsprintrecords')
export const adminUpdateSprintRecord = (id, data) => put(`/auth/admin/officer/update/sprintrecord/${id}`, data)
export const adminDeleteSprintRecord = (id) => del(`/auth/admin/officer/delete/sprintrecord/${id}`)

/* ── Sit-up ── */
export const adminGetSitupRecord = (id) => get(`/auth/admin/officer/get/situprecord/${id}`)
export const adminGetSitupRecords = () => get('/auth/admin/officer/get/allsituprecord')
export const adminUpdateSitupRecord = (id, data) => put(`/auth/admin/officer/update/situprecord/${id}`, data)
export const adminDeleteSitupRecord = (id) => del(`/auth/admin/officer/delete/situprecord/${id}`)

/* ── Push-up ── */
export const adminGetPushupRecord = (id) => get(`/auth/admin/officer/pushuprecord/${id}`)
export const adminGetPushupRecords = () => get('/auth/admin/officer/pushuprecord')
export const adminUpdatePushupRecord = (id, data) => put(`/auth/admin/officer/update/pushuprecord/${id}`, data)
export const adminDeletePushupRecord = (id) => del(`/auth/admin/officer/delete/pushuprecord/${id}`)

/* ── BMI ── */
export const adminGetOfficerBmi = () => get('/auth/admin/officer/get/officerbmi')
export const adminGetOfficerBmiById = (id) => get(`/auth/admin/officer/get/officerbmi/${id}`)
export const adminUpdateOfficerBmi = (id, data) => put(`/auth/admin/officer/update/officerbmi/${id}`, data)
export const adminDeleteOfficerBmi = (id) => del(`/auth/admin/officer/delete/officerbmi/${id}`)

/* ── Officer Profiles & Accounts ── */
export const adminGetAllOfficerProfiles = async () => {
  // Try current route first, then older variants — preserved from original
  const routes = [
    '/auth/admin/officer/profile',
    '/auth/admin/getallofficer_profile',
    '/auth/admin/officer/getallofficer_profile',
  ]
  for (const route of routes) {
    try {
      const data = await get(route)
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.data)) return data.data
      if (Array.isArray(data?.results)) return data.results
      if (Array.isArray(data?.items)) return data.items
      return []
    } catch (error) {
      if (error.status === 404) continue
      throw error
    }
  }
  return []
}

export const adminGetOfficerAccount = (id) => get(`/auth/admin/officer/account/${id}`)
export const adminGetOfficerAccounts = () => get('/auth/admin/officer/accounts')

/* ── Admin Account Management ── */
export const adminUpdateInfo = (data) => put('/auth/admin/update/info', data)
export const adminUpdateStatus = (data) => put('/auth/admin/update/status', data)
export const adminDeleteSelf = (data) => del('/auth/admin/delete', data)
export const adminForgotPassword = (data) => put('/auth/admin/forgot_password', data)
export const adminGetInfo = () => get('/auth/admin/info')

/* ── Summary ── */
export const adminGetSummary = async () => {
  const data = await get('/auth/admin/summary')
  if (Array.isArray(data)) return data
  if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      if (Array.isArray(data[key])) return data[key]
    }
  }
  console.error('adminGetSummary: Could not find an array in response:', data)
  return []
}

export const adminGetSummaryById = (id) => get(`/auth/admin/summary/${id}`)
