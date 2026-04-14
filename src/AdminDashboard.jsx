import { useMemo } from 'react'
import { IconClipboard, IconWalk, IconScale, IconActivity, IconTarget, IconZap } from './icons.jsx'
import { getUserDisplayName, idsMatch, getBmiHeight } from './utils.js'

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
}) {
  /* ── Walk test combined rows ── */
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

  /* ── Helper: filter records by search ── */
  const filterBySearch = (records) => {
    const q = dashboardSearch.trim().toLowerCase()
    if (!q) return records
    return records.filter((r) =>
      getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)
        .toLowerCase()
        .includes(q)
    )
  }

  const tabs = [
    { key: 'walk',   label: 'Walk Test',    icon: <IconWalk /> },
    { key: 'bmi',    label: 'BMI',          icon: <IconScale /> },
    { key: 'situp',  label: '1 Min Sit-up', icon: <IconActivity /> },
    { key: 'pushup', label: 'Push-up',      icon: <IconTarget /> },
    { key: 'sprint', label: '300m Sprint',  icon: <IconZap /> },
  ]

  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="panel-header">
        <div className="panel-title"><IconClipboard /> Admin Dashboard Records</div>
        <div className="header-actions">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
              placeholder="Search officer name..."
              className="filter-input"
              style={{ minWidth: 240 }}
            />
          </div>
        </div>
      </div>

      <div className="filter-bar" style={{ gap: 8, flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-record-tab ${dashboardAdminTab === tab.key ? 'active' : ''}`}
            onClick={() => setDashboardAdminTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>
          Read-only view of officer test records
        </span>
      </div>

      <div className="table-wrap">
        {/* Walk Test Tab */}
        {dashboardAdminTab === 'walk' && (
          <>
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Police GO / NO GO</th><th>Gender</th><th>Age</th><th>Time</th><th>Grade</th><th>Test Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardRows.map((row) => {
                  const { type, u, test, uName } = row
                  if (type === 'user') {
                    return (
                      <tr key={`user-${u.id}`}>
                        <td>{u.id}</td><td>{uName}</td><td>{u.policeGoNoGo ?? '—'}</td><td>{u.gender}</td><td>{u.age}</td><td>—</td><td>—</td><td>—</td>
                      </tr>
                    )
                  } else if (type === 'mixed') {
                    return (
                      <tr key={`mixed-${u.id}-${test.id}`}>
                        <td>{u.id}</td><td>{uName}</td><td>{u.policeGoNoGo ?? '—'}</td><td>{test.gender || u.gender}</td><td>{test.age || u.age}</td>
                        <td>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                        <td>{test.grade}</td><td>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                      </tr>
                    )
                  }
                  return (
                    <tr key={`orphan-${test.id}`}>
                      <td>{test.officer_id}</td><td>{uName}</td><td>—</td><td>{test.gender}</td><td>{test.age}</td>
                      <td>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                      <td>{test.grade}</td><td>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {dashboardRows.length === 0 && <p className="dashboard-empty">No results match your search.</p>}
          </>
        )}

        {/* BMI Tab */}
        {dashboardAdminTab === 'bmi' && (
          <table className="user-table">
            <thead>
              <tr><th>ID</th><th>Officer</th><th>Height (m)</th><th>Weight (kg)</th><th>BMI</th><th>Category</th><th>Month Taken</th></tr>
            </thead>
            <tbody>
              {filterBySearch(adminBmiRecords).map((r, i) => (
                <tr key={`dash-bmi-${r.id ?? i}`}>
                  <td>{r.id ?? '—'}</td>
                  <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                  <td>{(() => { const h = getBmiHeight(r); return h != null ? h.toFixed(2) : '—' })()}</td>
                  <td>{r.weight_kg ?? r.weight ?? '—'}</td>
                  <td>{r.bmi ?? r.bmi_value ?? '—'}</td>
                  <td>{r.category ?? r.status ?? '—'}</td>
                  <td>{r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Sit-up Tab */}
        {dashboardAdminTab === 'situp' && (
          <table className="user-table">
            <thead><tr><th>Officer</th><th>Count</th><th>Grade</th><th>Test Date</th></tr></thead>
            <tbody>
              {filterBySearch(adminSitupRecords).map((r, i) => (
                <tr key={`dash-situp-${r.id ?? i}`}>
                  <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                  <td>{r.count ?? r.reps ?? r.situp_count ?? '—'}</td>
                  <td>{r.grade ?? '—'}</td>
                  <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Push-up Tab */}
        {dashboardAdminTab === 'pushup' && (
          <table className="user-table">
            <thead><tr><th>Officer</th><th>Count</th><th>Grade</th><th>Test Date</th></tr></thead>
            <tbody>
              {filterBySearch(adminPushupRecords).map((r, i) => (
                <tr key={`dash-pushup-${r.id ?? i}`}>
                  <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                  <td>{r.count ?? r.reps ?? r.pushup_count ?? '—'}</td>
                  <td>{r.grade ?? '—'}</td>
                  <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Sprint Tab */}
        {dashboardAdminTab === 'sprint' && (
          <table className="user-table">
            <thead><tr><th>Officer</th><th>Time</th><th>Grade</th><th>Test Date</th></tr></thead>
            <tbody>
              {filterBySearch(adminSprintRecords).map((r, i) => (
                <tr key={`dash-sprint-${r.id ?? i}`}>
                  <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                  <td>{r.time_formatted || `${r.minutes ?? '0'}:${String(r.seconds ?? 0).padStart(2, '0')}`}</td>
                  <td>{r.grade ?? '—'}</td>
                  <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
