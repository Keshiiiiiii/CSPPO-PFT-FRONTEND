import { useCallback } from 'react'
import useAppStore from '@/stores/appStore'
import {
  officerCreateProfile,
  officerGetProfile,
  getOfficerInfo,
  adminGetInfo,
} from '@/services/api.js'

/**
 * useProfile — manages officer/admin profile loading,
 * profile creation, and the profile page refresh cycle.
 */
export function useProfile(toast) {
  const store = useAppStore()
  const isAdmin = store.userRole === 'admin'

  const refreshProfilePage = useCallback(async () => {
    if (store.activePage !== 'officerProfile') return

    if (isAdmin) {
      try {
        store.setAdminProfileForPage(await adminGetInfo())
      } catch {
        store.setAdminProfileForPage(null)
      }
      return
    }

    store.setOfficerProfileLoading(true)
    store.setOfficerProfileError('')

    try {
      const [profileResult, infoResult] = await Promise.allSettled([
        officerGetProfile(),
        getOfficerInfo(),
      ])

      if (profileResult.status === 'fulfilled' && profileResult.value) {
        const data = profileResult.value
        store.setAccounts([data])
        const display = `${data?.first_name || ''} ${data?.last_name || ''}`.trim()
        if (display) store.setAuth({ userName: display })
      } else {
        store.setAccounts([])
        if (profileResult.status === 'rejected') {
          store.setOfficerProfileError(
            profileResult.reason?.message || 'Failed to load profile'
          )
        }
      }

      if (infoResult.status === 'fulfilled' && infoResult.value) {
        store.setOfficerInfo(infoResult.value)
      } else {
        store.setOfficerInfo(null)
      }
    } catch (e) {
      store.setOfficerProfileError(e.message || 'Failed to load profile')
    } finally {
      store.setOfficerProfileLoading(false)
    }
  }, [isAdmin, store.activePage])

  const handleCreateOfficerProfile = useCallback(
    async (profileData) => {
      try {
        store.setOfficerProfileLoading(true)
        await officerCreateProfile(profileData)
        await refreshProfilePage()
        toast?.success('Profile created successfully!')
      } catch (error) {
        toast?.error('Failed to create profile: ' + (error?.message || 'Unknown error'))
      } finally {
        store.setOfficerProfileLoading(false)
      }
    },
    [refreshProfilePage, toast]
  )

  return {
    officerInfo: store.officerInfo,
    adminProfileForPage: store.adminProfileForPage,
    officerProfileLoading: store.officerProfileLoading,
    officerProfileError: store.officerProfileError,
    refreshProfilePage,
    handleCreateOfficerProfile,
  }
}
