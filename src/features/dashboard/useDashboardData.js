import { useMemo, useCallback } from 'react'
import useAppStore from '@/stores/appStore'
import { getUserDisplayName, idsMatch } from '@/lib/utils.js'
import { buildOverallScores } from '@/features/dashboard/buildOverallScores.js'

/**
 * useDashboardData — derives dashboard statistics, overall exercise scores,
 * and the getOfficerName lookup function from the store.
 */
export function useDashboardData() {
  const store = useAppStore()
  const isAdmin = store.userRole === 'admin'

  // ─── Officer Name Lookup ───
  const getOfficerName = useCallback(
    (officerId) => {
      if (!officerId) return 'Unknown Officer'
      const oid = String(officerId)

      const userMatch = store.users.find(
        (u) =>
          idsMatch(u.id, oid) ||
          idsMatch(u.user_id, oid) ||
          idsMatch(u.account_id, oid) ||
          idsMatch(u.officer_id, oid) ||
          idsMatch(u.officer_profile_id, oid)
      )
      if (userMatch) {
        const n = getUserDisplayName(userMatch)
        if (n) return n
      }

      const match = store.accounts.find(
        (account) =>
          idsMatch(account?.id, oid) ||
          idsMatch(account?.officer_id, oid) ||
          idsMatch(account?.officer_profile_id, oid) ||
          idsMatch(account?.account_id, oid) ||
          idsMatch(account?.user_id, oid)
      )
      const name = match ? getUserDisplayName(match) || match.email : null
      if (name) return name

      return `Officer ${officerId}`
    },
    [store.users, store.accounts]
  )

  // ─── Stat Card Counts ───
  const statCounts = useMemo(() => {
    if (isAdmin) {
      return {
        total: store.users.length,
        walk: store.adminWalkTests?.length || 0,
        bmi: store.adminBmiRecords.length,
        situp: store.adminSitupRecords.length,
        pushup: store.adminPushupRecords.length,
        sprint: store.adminSprintRecords.length,
      }
    }
    return {
      total:
        store.officerWalkRecords.length +
        store.officerBmiRecords.length +
        store.officerSitupRecords.length +
        store.officerPushupRecords.length +
        store.officerSprintRecords.length,
      walk: store.officerWalkRecords.length,
      bmi: store.officerBmiRecords.length,
      situp: store.officerSitupRecords.length,
      pushup: store.officerPushupRecords.length,
      sprint: store.officerSprintRecords.length,
    }
  }, [
    isAdmin,
    store.users,
    store.adminWalkTests,
    store.adminBmiRecords,
    store.adminSitupRecords,
    store.adminPushupRecords,
    store.adminSprintRecords,
    store.officerWalkRecords,
    store.officerBmiRecords,
    store.officerSitupRecords,
    store.officerPushupRecords,
    store.officerSprintRecords,
  ])

  // ─── Overall Exercise Scores ───
  const overallScores = useMemo(
    () =>
      buildOverallScores({
        adminSummary: store.adminSummary,
        adminWalkTests: store.adminWalkTests,
        adminBmiRecords: store.adminBmiRecords,
        adminSitupRecords: store.adminSitupRecords,
        adminPushupRecords: store.adminPushupRecords,
        adminSprintRecords: store.adminSprintRecords,
        users: store.users,
        searchQuery: store.search,
        getOfficerName,
      }),
    [
      store.users,
      store.adminWalkTests,
      store.adminBmiRecords,
      store.adminSitupRecords,
      store.adminPushupRecords,
      store.adminSprintRecords,
      store.adminSummary,
      store.search,
      getOfficerName,
    ]
  )

  return {
    getOfficerName,
    statCounts,
    overallScores,
  }
}
