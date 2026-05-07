/**
 * Officer Service — all officer personal record CRUD.
 * Identical function signatures to original api.js.
 */
import { get, post, put, del } from './httpClient.js'

/* ── Walk Test ── */
export const officerGetWalkTests = () => get('/auth/officer/get_walktest_record')
export const officerCreateWalkTest = (data) => post('/auth/officer/create_walktest', data)
export const officerUpdateWalkTest = (id, data) => put(`/auth/officer/update_walkrecord/${id}`, data)
export const officerDeleteWalkTest = (id) => del(`/auth/officer/delete_walkrecord/${id}`)

/* ── Sprint ── */
export const officerGetSprintRecords = () => get('/auth/officer/get_sprint_record')
export const officerCreateSprintRecord = (data) => post('/auth/officer/create_sprint', data)
export const officerUpdateSprintRecord = (id, data) => put(`/auth/officer/update_sprint_record/${id}`, data)
export const officerDeleteSprintRecord = (id) => del(`/auth/officer/delete_sprint_record/${id}`)

/* ── Sit-up ── */
export const officerGetSitupRecords = () => get('/auth/officer/situp_record')
export const officerCreateSitupRecord = (data) => post('/auth/officer/create_situp', data)
export const officerUpdateSitupRecord = (id, data) => put(`/auth/officer/update_situp/${id}`, data)
export const officerDeleteSitupRecord = (id) => del(`/auth/officer/delete_situp/${id}`)

/* ── Push-up ── */
export const officerGetPushupRecords = () => get('/auth/officer/pushup_record')
export const officerCreatePushupRecord = (data) => post('/auth/officer/create_pushup_record', data)
export const officerUpdatePushupRecord = (id, data) => put(`/auth/officer/update_officer_pushup_record/${id}`, data)
export const officerDeletePushupRecord = (id) => del(`/auth/officer/delete_officer_pushup_record/${id}`)

/* ── BMI ── */
export const officerGetBmi = () => get('/auth/officer/bmi')
export const officerCreateBmi = (data) => post('/auth/officer/create_bmi', data)
export const officerUpdateBmi = (data) => put('/auth/officer/update_bmi', data)
export const officerDeleteBmi = (id) => del(`/auth/officer/delete_bmi/${id}`)

/* ── "Create by other" variants (admin-triggered for officer) ── */
export const officerCreateOtherBmi = (data) => post('/auth/officer/create_other_bmi', data)
export const officerCreateOtherSprint = (data) => post('/auth/officer/create_sprint_byother', data)
export const officerCreateOtherPushup = (data) => post('/auth/officer/create_pushup_other', data)
export const officerCreateOtherSitup = (data) => post('/auth/officer/create_situp_by_other', data)
export const officerCreateOtherWalkTest = (data) => post('/auth/officer/create_walkrecord_byother', data)

/* ── Profile ── */
export const officerGetProfile = () => get('/auth/officer/profile')
export const officerCreateProfile = (profileData) => post('/auth/officer/create_profile', profileData)
export const officerUpdateProfile = (profileData) => put('/auth/officer/update_profile', profileData)
export const officerDeleteProfile = () => del('/auth/officer/delete_profile')
