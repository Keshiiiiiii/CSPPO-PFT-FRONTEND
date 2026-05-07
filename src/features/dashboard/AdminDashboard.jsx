import { useMemo } from 'react'
import clsx from 'clsx'
import {
  IconActivity,
  IconClipboard,
  IconScale,
  IconSearch,
  IconTarget,
  IconTrendingUp,
  IconWalk,
  IconZap,
} from '@/components/icons.jsx'
import { getUserDisplayName, idsMatch, getBmiHeight } from '@/lib/utils.js'
import { buildOverallScores, OVERALL_EXERCISE_TOTAL } from '@/features/dashboard/buildOverallScores.js'
import GradeBadge, { StatusBadge } from '@/components/ui/GradeBadge.jsx'
import EmptyState from '@/components/ui/EmptyState.jsx'
import DataTable from '@/components/ui/DataTable.jsx'
import ExercisePillButton from '@/components/ui/ExercisePillButton.jsx'

function formatWalkTime(test) {
  if (!test) return '—'
  if (test.time_formatted) return test.time_formatted
  const m = test.minutes != null && test.minutes !== '' ? Number(test.minutes) : 0
  const s = test.seconds != null && test.seconds !== '' ? Number(test.seconds) : 0
  if (Number.isNaN(m) || Number.isNaN(s)) return '—'
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Admin Dashboard — read-only tab panel with tables for all exercise types.
 */
function AdminDashboard({
  users,
  adminWalkTests,
  adminBmiRecords,
  adminSitupRecords,
  adminPushupRecords,
  adminSprintRecords,
  dashboardSearch,
  setDashboardSearch,
  dashboardAdminTab,
  setDashboardAdminTab,
  getOfficerName,
  adminSummary,
  overallScoresOverride,
}) {
  const dashboardRows = useMemo(() => {
    const combinedRows = []
    const processedTestIds = new Set()
    const qLower = dashboardSearch.trim().toLowerCase()

    users.forEach((u) => {
      const uName = getUserDisplayName(u) || 'Unknown'
      const matchSearch = !qLower || uName.toLowerCase().includes(qLower)
      const userTests = adminWalkTests
        ? adminWalkTests.filter(
            (t) =>
              idsMatch(t.officer_id, u.id) ||
              idsMatch(t.officer_id, u.officer_id) ||
              idsMatch(t.officer_id, u.officer_profile_id) ||
              idsMatch(t.officer_id, u.account_id) ||
              idsMatch(t.officer_id, u.user_id)
          )
        : []
      if (matchSearch) {
        if (userTests.length === 0) {
          combinedRows.push({ type: 'user', u, test: null, isFirst: true, uName })
        } else {
          userTests.forEach((t, idx) => {
            processedTestIds.add(t.id)
            combinedRows.push({ type: 'mixed', u, test: t, isFirst: idx === 0, uName })
          })
        }
      } else {
        userTests.forEach((t) => processedTestIds.add(t.id))
      }
    })
    if (adminWalkTests) {
      adminWalkTests.forEach((t) => {
        if (!processedTestIds.has(t.id)) {
          const officerName = getOfficerName(t.officer_id)
          if (!qLower || officerName.toLowerCase().includes(qLower)) {
            combinedRows.push({ type: 'orphan', u: null, test: t, uName: officerName, isFirst: true })
          }
        }
      })
    }
    return combinedRows
  }, [users, adminWalkTests, dashboardSearch, getOfficerName])

  const walkTableRows = useMemo(
    () =>
      dashboardRows.map((row) => {
        if (row.type === 'user') {
          const { u, uName } = row
          return {
            _key: `user-${u.id}`,
            id: u.id,
            name: uName,
            gender: u.gender,
            age: u.age,
            time: '—',
            grade: null,
            testDate: '—',
          }
        }
        if (row.type === 'mixed') {
          const { u, test, uName } = row
          return {
            _key: `mixed-${u.id}-${test.id}`,
            id: u.id,
            name: uName,
            gender: test.gender || u.gender,
            age: test.age || u.age,
            time: formatWalkTime(test),
            grade: test.grade,
            testDate: test.test_date ? new Date(test.test_date).toLocaleDateString() : '—',
          }
        }
        const { test, uName } = row
        return {
          _key: `orphan-${test.id}`,
          id: test.officer_id,
          name: uName,
          gender: test.gender,
          age: test.age,
          time: formatWalkTime(test),
          grade: test.grade,
          testDate: test.test_date ? new Date(test.test_date).toLocaleDateString() : '—',
        }
      }),
    [dashboardRows]
  )

  const overallScores = useMemo(
    () =>
      buildOverallScores({
        adminSummary,
        adminWalkTests,
        adminBmiRecords,
        adminSitupRecords,
        adminPushupRecords,
        adminSprintRecords,
        users,
        searchQuery: dashboardSearch,
        getOfficerName,
      }),
    [
      users,
      adminWalkTests,
      adminBmiRecords,
      adminSitupRecords,
      adminPushupRecords,
      adminSprintRecords,
      adminSummary,
      dashboardSearch,
      getOfficerName,
    ]
  )

  const displayOverallScores = overallScoresOverride !== undefined ? overallScoresOverride : overallScores

  const filterBySearch = (records) => {
    const q = dashboardSearch.trim().toLowerCase()
    if (!q) return records
    return records.filter((r) =>
      getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)
        .toLowerCase()
        .includes(q)
    )
  }

  const bmiRows = useMemo(
    () =>
      filterBySearch(adminBmiRecords).map((r, i) => ({
        _key: `dash-bmi-${r.id ?? i}`,
        id: r.id ?? '—',
        officer: getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id),
        height: (() => {
          const h = getBmiHeight(r)
          return h != null ? h.toFixed(2) : '—'
        })(),
        weight: r.weight_kg ?? r.weight ?? '—',
        bmi: r.bmi ?? r.bmi_value ?? '—',
        category: r.category ?? r.status,
        month: r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—',
      })),
    [adminBmiRecords, dashboardSearch, getOfficerName]
  )

  const situpRows = useMemo(
    () =>
      filterBySearch(adminSitupRecords).map((r, i) => ({
        _key: `dash-situp-${r.id ?? i}`,
        officer: getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id),
        count: r.count ?? r.reps ?? r.situp_count ?? '—',
        grade: r.grade,
        testDate: r.test_date ? new Date(r.test_date).toLocaleDateString() : '—',
      })),
    [adminSitupRecords, dashboardSearch, getOfficerName]
  )

  const pushupRows = useMemo(
    () =>
      filterBySearch(adminPushupRecords).map((r, i) => ({
        _key: `dash-pushup-${r.id ?? i}`,
        officer: getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id),
        count: r.count ?? r.reps ?? r.pushup_count ?? '—',
        grade: r.grade,
        testDate: r.test_date ? new Date(r.test_date).toLocaleDateString() : '—',
      })),
    [adminPushupRecords, dashboardSearch, getOfficerName]
  )

  const sprintRows = useMemo(
    () =>
      filterBySearch(adminSprintRecords).map((r, i) => ({
        _key: `dash-sprint-${r.id ?? i}`,
        officer: getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id),
        time: r.time_formatted || `${r.minutes ?? '0'}:${String(r.seconds ?? 0).padStart(2, '0')}`,
        grade: r.grade,
        testDate: r.test_date ? new Date(r.test_date).toLocaleDateString() : '—',
      })),
    [adminSprintRecords, dashboardSearch, getOfficerName]
  )

  const walkColumns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'gender', header: 'Gender' },
    { key: 'age', header: 'Age', align: 'right' },
    { key: 'time', header: 'Time', align: 'right' },
    { key: 'grade', header: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> },
    { key: 'testDate', header: 'Test Date' },
  ]

  const bmiColumns = [
    { key: 'id', header: 'ID' },
    { key: 'officer', header: 'Officer' },
    { key: 'height', header: 'Height (m)', align: 'right' },
    { key: 'weight', header: 'Weight (kg)', align: 'right' },
    { key: 'bmi', header: 'BMI', align: 'right' },
    { key: 'category', header: 'Category', render: (r) => <GradeBadge grade={r.category} /> },
    { key: 'month', header: 'Month Taken' },
  ]

  const situpColumns = [
    { key: 'officer', header: 'Officer' },
    { key: 'count', header: 'Count', align: 'right' },
    { key: 'grade', header: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> },
    { key: 'testDate', header: 'Test Date' },
  ]

  const pushupColumns = [
    { key: 'officer', header: 'Officer' },
    { key: 'count', header: 'Count', align: 'right' },
    { key: 'grade', header: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> },
    { key: 'testDate', header: 'Test Date' },
  ]

  const sprintColumns = [
    { key: 'officer', header: 'Officer' },
    { key: 'time', header: 'Time', align: 'right' },
    { key: 'grade', header: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> },
    { key: 'testDate', header: 'Test Date' },
  ]

  const overallColumns = [
    { key: 'name', header: 'Officer' },
    {
      key: 'walk',
      header: 'Walk Test',
      render: (r) => <GradeBadge grade={r.tests.walk?.grade} />,
    },
    {
      key: 'situp',
      header: 'Sit-up',
      render: (r) => <GradeBadge grade={r.tests.situp?.grade} />,
    },
    {
      key: 'pushup',
      header: 'Push-up',
      render: (r) => <GradeBadge grade={r.tests.pushup?.grade} />,
    },
    {
      key: 'sprint',
      header: 'Sprint',
      render: (r) => <GradeBadge grade={r.tests.sprint?.grade} />,
    },
    {
      key: 'tests',
      header: 'Tests',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${(r.testCount / OVERALL_EXERCISE_TOTAL) * 100}%` }} />
          </div>
          <span className="text-2xs text-muted tabular-nums">{r.testCount}/{OVERALL_EXERCISE_TOTAL}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <div>
          <StatusBadge status={r.overallStatus} />
          <div className="text-2xs text-muted mt-1">(Edit in User Mgmt)</div>
        </div>
      ),
    },
  ]

  const tabs = [
    { key: 'walk', label: 'Walk Test', icon: IconWalk },
    { key: 'bmi', label: 'BMI', icon: IconScale },
    { key: 'situp', label: '1 Min Sit-up', icon: IconActivity },
    { key: 'pushup', label: 'Push-up', icon: IconTarget },
    { key: 'sprint', label: '300m Sprint', icon: IconZap },
    { key: 'overall', label: 'Overall Score', icon: IconTrendingUp },
  ]

  return (
    <div
      className={clsx(
        'w-full min-w-0 bg-white rounded-2xl overflow-hidden animate-fade-in',
        'border border-gray-100',
        'ring-1 ring-black/[0.03]',
        'shadow-[0_18px_45px_-12px_rgba(15,23,42,0.12),0_6px_16px_-6px_rgba(15,23,42,0.06)]'
      )}
    >
      <div className="px-6 pt-6 pb-5 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/40">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-800 border border-gray-100 shadow-sm">
                <IconClipboard />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-900">Admin Dashboard Records</h2>
                <p className="mt-0.5 text-sm text-gray-500">Search and review officer fitness test submissions (read-only).</p>
              </div>
            </div>
          </div>
          <div className="relative w-full lg:w-80 shrink-0">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <IconSearch />
            </span>
            <input
              type="text"
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
              placeholder="Search officer name or ID..."
              className="w-full rounded-full border border-gray-100 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors focus:border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/[0.06]"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const lockedOverall = overallScoresOverride !== undefined && tab.key !== 'overall'
            return (
              <ExercisePillButton
                key={tab.key}
                active={dashboardAdminTab === tab.key}
                disabled={lockedOverall}
                onClick={() => !lockedOverall && setDashboardAdminTab(tab.key)}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </ExercisePillButton>
            )
          })}
          <span className="ml-auto hidden text-[11px] font-medium text-gray-400 sm:block">Read-only view of officer test records</span>
        </div>
      </div>

      <div className="bg-gray-50/70 px-4 pb-5 pt-0 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {dashboardAdminTab === 'walk' && (
          <DataTable
            variant="admin"
            maxHeightClass="max-h-[560px]"
            columns={walkColumns}
            rows={walkTableRows}
            getRowKey={(r) => r._key}
            emptyState={
              dashboardRows.length === 0 ? (
                <EmptyState type="search" title="No Walk Test Records" description="No walk test results match your search criteria." />
              ) : null
            }
          />
        )}

        {dashboardAdminTab === 'bmi' && (
          <DataTable
            variant="admin"
            maxHeightClass="max-h-[560px]"
            columns={bmiColumns}
            rows={bmiRows}
            getRowKey={(r) => r._key}
            emptyState={
              bmiRows.length === 0 ? (
                <EmptyState type="records" title="No BMI Records" description="No BMI records match your search criteria." />
              ) : null
            }
          />
        )}

        {dashboardAdminTab === 'situp' && (
          <DataTable
            variant="admin"
            maxHeightClass="max-h-[560px]"
            columns={situpColumns}
            rows={situpRows}
            getRowKey={(r) => r._key}
            emptyState={
              situpRows.length === 0 ? (
                <EmptyState type="exercise" title="No Sit-up Records" description="No sit-up records match your search criteria." />
              ) : null
            }
          />
        )}

        {dashboardAdminTab === 'pushup' && (
          <DataTable
            variant="admin"
            maxHeightClass="max-h-[560px]"
            columns={pushupColumns}
            rows={pushupRows}
            getRowKey={(r) => r._key}
            emptyState={
              pushupRows.length === 0 ? (
                <EmptyState type="exercise" title="No Push-up Records" description="No push-up records match your search criteria." />
              ) : null
            }
          />
        )}

        {dashboardAdminTab === 'sprint' && (
          <DataTable
            variant="admin"
            maxHeightClass="max-h-[560px]"
            columns={sprintColumns}
            rows={sprintRows}
            getRowKey={(r) => r._key}
            emptyState={
              sprintRows.length === 0 ? (
                <EmptyState type="exercise" title="No Sprint Records" description="No sprint records match your search criteria." />
              ) : null
            }
          />
        )}

        {dashboardAdminTab === 'overall' && (
          <DataTable
            variant="admin"
            maxHeightClass="max-h-[560px]"
            columns={overallColumns}
            rows={displayOverallScores}
            getRowKey={(r, i) => `dash-overall-${r.id ?? i}`}
            emptyState={
              displayOverallScores.length === 0 ? (
                <EmptyState type="users" title="No Overall Scores" description="No officer records found matching your criteria." />
              ) : null
            }
          />
        )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
