import { useCallback } from 'react'
import useAppStore from '@/stores/appStore'
import {
  normalizeUserRecord,
  toArray,
  normalizePushupRecords,
  normalizeSprintRecords,
} from '@/lib/utils.js'
import {
  adminGetInfo,
  adminGetAllOfficerProfiles,
  adminGetWalkTests,
  adminGetOfficerBmi,
  adminGetSitupRecords,
  adminGetPushupRecords,
  adminGetSprintRecords,
  adminGetSummary,
  officerGetProfile,
  getOfficerInfo,
  officerGetWalkTests,
  officerGetBmi,
  officerGetSitupRecords,
  officerGetPushupRecords,
  officerGetSprintRecords,
} from '@/services/api.js'

/**
 * useAuth — encapsulates login, logout, account creation,
 * and the post-login data hydration logic.
 */
export function useAuth() {
  const store = useAppStore()

  const handleLogin = useCallback(async ({ email, password, userType, user }) => {
    try {
      if (user && (user.bearer_token || user.access_token || user.token)) {
        localStorage.setItem('authToken', user.bearer_token || user.access_token || user.token)
      }
      const role = userType === 'admin' ? 'admin' : 'officer'

      store.setAuth({
        userRole: role,
        userName: email,
        isAuthenticated: true,
        loginError: '',
      })
      store.setActivePage('dashboard')

      if (role === 'admin') {
        const adminInfo = await adminGetInfo().catch(() => null)
        const officerProfiles = await adminGetAllOfficerProfiles().catch(() => [])
        const walkTests = await adminGetWalkTests().catch(() => [])
        const bmiRecords = await adminGetOfficerBmi().catch(() => [])
        const situpRecords = await adminGetSitupRecords().catch(() => [])
        const pushupRecords = await adminGetPushupRecords().catch(() => [])
        const sprintRecords = await adminGetSprintRecords().catch(() => [])
        const summaryRecords = await adminGetSummary().catch(() => [])

        store.setAuth({
          userName: adminInfo?.username || adminInfo?.user_name || adminInfo?.email || email,
        })
        const normalizedProfiles = Array.isArray(officerProfiles)
          ? officerProfiles.map(normalizeUserRecord)
          : []
        store.setAccounts(normalizedProfiles)
        store.setUsers(normalizedProfiles)
        store.setAdminWalkTests(walkTests)
        store.setAdminBmiRecords(toArray(bmiRecords))
        store.setAdminSitupRecords(toArray(situpRecords))
        store.setAdminPushupRecords(toArray(pushupRecords))
        store.setAdminSprintRecords(toArray(sprintRecords))
        store.setAdminSummary(toArray(summaryRecords))
      } else {
        const profile = await officerGetProfile().catch(() => null)
        const info = await getOfficerInfo().catch(() => null)
        const [walkRecords, bmiRecords, situpRecords, pushupRecords, sprintRecords] =
          await Promise.all([
            officerGetWalkTests().catch(() => []),
            officerGetBmi().catch(() => []),
            officerGetSitupRecords().catch(() => []),
            officerGetPushupRecords().catch(() => []),
            officerGetSprintRecords().catch(() => []),
          ])
        store.setOfficerInfo(info)
        store.setAuth({
          userName:
            `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || email,
        })
        store.setUsers(walkRecords)
        store.setOfficerWalkRecords(walkRecords)
        store.setOfficerBmiRecords(toArray(bmiRecords))
        store.setOfficerSitupRecords(toArray(situpRecords))
        store.setOfficerPushupRecords(normalizePushupRecords(pushupRecords))
        store.setOfficerSprintRecords(normalizeSprintRecords(sprintRecords))
        store.setAccounts(profile ? [profile] : [])
      }
    } catch (error) {
      store.setAuth({ loginError: error.message || 'Login failed. Please try again.' })
    }
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken')
    store.logout()
  }, [])

  const handleCreateAccount = useCallback(async ({ name, password, role, ...apiResponse }) => {
    if (!name || !password || !role) {
      store.setAuth({ loginError: 'Please fill all fields to create account.' })
      return
    }
    try {
      if (apiResponse?.access_token) {
        localStorage.setItem('authToken', apiResponse.access_token)
      }
      store.setAuth({ loginError: 'Account created successfully! Please sign in.' })
    } catch (error) {
      store.setAuth({
        loginError: error.message || 'Failed to create account. Please try again.',
      })
    }
  }, [])

  return {
    isAuthenticated: store.isAuthenticated,
    userRole: store.userRole,
    userName: store.userName,
    loginError: store.loginError,
    isAdmin: store.userRole === 'admin',
    setLoginError: (v) => store.setAuth({ loginError: v }),
    handleLogin,
    handleLogout,
    handleCreateAccount,
  }
}
