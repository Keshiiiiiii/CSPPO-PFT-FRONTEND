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
  officerGetSitupRecords as officerGetSitups,
  officerGetPushupRecords as officerGetPushups,
  officerGetSprintRecords as officerGetSprints,
} from '@/services/api.js'

/**
 * useGlobalRefresh — handles F5/refresh button data reload
 * for both admin and officer roles.
 */
export function useGlobalRefresh(refreshProfilePage) {
  const store = useAppStore()
  const isAdmin = store.userRole === 'admin'

  const refreshAdminData = useCallback(async () => {
    try {
      const adminInfo = await adminGetInfo().catch(() => null)
      const officerProfiles = await adminGetAllOfficerProfiles().catch(() => [])
      const walkTests = await adminGetWalkTests().catch(() => [])
      const bmiRecords = await adminGetOfficerBmi().catch(() => [])
      const situpRecords = await adminGetSitupRecords().catch(() => [])
      const pushupRecords = await adminGetPushupRecords().catch(() => [])
      const sprintRecords = await adminGetSprintRecords().catch(() => [])
      const summaryRecords = await adminGetSummary().catch(() => [])

      if (adminInfo) {
        store.setAuth({
          userName: adminInfo?.username || adminInfo?.user_name || adminInfo?.email || store.userName,
        })
      }
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
    } catch (error) {
      console.error('Admin refresh error:', error)
    }
  }, [isAdmin])

  const refreshOfficerData = useCallback(async () => {
    try {
      const profile = await officerGetProfile().catch(() => null)
      const info = await getOfficerInfo().catch(() => null)
      const [walkRecords, bmiRecords, situpRecords, pushupRecords, sprintRecords] =
        await Promise.all([
          officerGetWalkTests().catch(() => []),
          officerGetBmi().catch(() => []),
          officerGetSitups().catch(() => []),
          officerGetPushups().catch(() => []),
          officerGetSprints().catch(() => []),
        ])

      if (info) store.setOfficerInfo(info)
      if (profile) {
        const display =
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || store.userName
        store.setAuth({ userName: display })
        store.setAccounts([profile])
      }
      store.setUsers(walkRecords)
      store.setOfficerWalkRecords(walkRecords)
      store.setOfficerBmiRecords(toArray(bmiRecords))
      store.setOfficerSitupRecords(toArray(situpRecords))
      store.setOfficerPushupRecords(normalizePushupRecords(pushupRecords))
      store.setOfficerSprintRecords(normalizeSprintRecords(sprintRecords))
    } catch (error) {
      console.error('Officer refresh error:', error)
    }
  }, [isAdmin])

  const handleGlobalRefresh = useCallback(async () => {
    if (store.activePage === 'officerProfile') {
      await refreshProfilePage?.()
      return
    }
    if (isAdmin) {
      await refreshAdminData()
    } else {
      await refreshOfficerData()
    }
  }, [isAdmin, store.activePage, refreshProfilePage, refreshAdminData, refreshOfficerData])

  return { handleGlobalRefresh, refreshAdminData, refreshOfficerData }
}
