import { useMemo } from 'react'
import { IconClipboard, IconWalk, IconScale, IconActivity, IconTarget, IconZap } from './icons.jsx'
import { getUserDisplayName, idsMatch, getBmiHeight } from './utils.js'
import GradeBadge, { StatusBadge } from './GradeBadge.jsx'
import EmptyState from './EmptyState.jsx'

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

  /* ── Overall Score Combined Rows ── */
  const overallScores = useMemo(() => {
    const qLower = dashboardSearch.trim().toLowerCase()
    
    if (adminSummary && adminSummary.length > 0) {
      return adminSummary.filter(u => {
         const name = getOfficerName(u.officer_id || u.id);
         const idStr = String(u.officer_id || u.id).toLowerCase();
         return !qLower || name.toLowerCase().includes(qLower) || idStr.includes(qLower);
      }).map(u => ({
         ...u,
         name: u.officer_name || getOfficerName(u.officer_id || u.id),
         tests: {
           walk: { grade: u.walk_score != null ? `${parseFloat(u.walk_score).toFixed(2)}%` : '—' },
           situp: { grade: u.situp_score != null ? `${parseFloat(u.situp_score).toFixed(2)}%` : '—' },
           pushup: { grade: u.pushup_score != null ? `${parseFloat(u.pushup_score).toFixed(2)}%` : '—' },
           sprint: { grade: u.sprint_score != null ? `${parseFloat(u.sprint_score).toFixed(2)}%` : '—' }
         },
         testCount: (Number(u.walk_tests) > 0 ? 1 : 0) + (Number(u.situp_tests) > 0 ? 1 : 0) + (Number(u.pushup_tests) > 0 ? 1 : 0) + (Number(u.sprint_tests) > 0 ? 1 : 0),
         overallStatus: (() => {
           const st = String(u.status || u.overall_status || u.overallStatus || '').toLowerCase();
           if (st.includes('fail')) return 'Failed';
           if (st.includes('pass')) return 'Passed';
           return u.is_passed || u.isPassed ? 'Passed' : 'Failed';
         })(),
         baseUser: users.find(x => idsMatch(x.id, u.officer_id || u.id)) || {}
      }));
    }

    const map = new Map()

    const addTest = (record, type) => {
      const gId = record.officer_profile_id || record.officer_id || record.account_id || record.user_id;
      if (!gId) return;
      if (!map.has(gId)) {
        map.set(gId, { id: gId, name: getOfficerName(gId), tests: {} });
      }
      const data = map.get(gId);
      // Keep most recent (or at least one)
      data.tests[type] = record;
    };

    if (adminWalkTests) adminWalkTests.forEach(r => addTest(r, 'walk'))
    if (adminBmiRecords) adminBmiRecords.forEach(r => addTest(r, 'bmi'))
    if (adminSitupRecords) adminSitupRecords.forEach(r => addTest(r, 'situp'))
    if (adminPushupRecords) adminPushupRecords.forEach(r => addTest(r, 'pushup'))
    if (adminSprintRecords) adminSprintRecords.forEach(r => addTest(r, 'sprint'))

    // Merge in users data so we get user.policeGoNoGo just in case they don't have records yet
    users.forEach(u => {
      if (u.id && !map.has(u.id)) {
        map.set(u.id, { id: u.id, name: getUserDisplayName(u) || 'Unknown', tests: {}, baseUser: u })
      } else if (u.id) {
        map.get(u.id).baseUser = u
      }
    })

    return Array.from(map.values())
      .filter(u => !qLower || u.name.toLowerCase().includes(qLower))
      .map(u => {
        // Evaluate pass/fail logic: failed if any test grade is 'fail', 'poor', or user go/nogo is 'NO GO'
        let hasFailed = false;
        let testCount = 0;
        
        ['walk', 'bmi', 'situp', 'pushup', 'sprint'].forEach(t => {
          if (u.tests[t]) testCount++;
        })

        if (u.baseUser?.policeGoNoGo === 'NO GO') hasFailed = true;

        ['walk', 'situp', 'pushup', 'sprint'].forEach(t => {
          if (u.tests[t] && u.tests[t].grade) {
             const g = String(u.tests[t].grade).toLowerCase();
             if (g.includes('fail') || g.includes('poor')) hasFailed = true;
          }
        });
        
        if (u.tests['bmi'] && u.tests['bmi'].category) {
             const cat = String(u.tests['bmi'].category).toLowerCase();
             if (cat.includes('obese')) hasFailed = true; // example simplified logic
        }

        const overallStatus = testCount === 0 ? 'No Data' : (hasFailed ? 'Failed' : 'Passed')
        
        return { ...u, testCount, overallStatus, hasFailed }
      })
  }, [users, adminWalkTests, adminBmiRecords, adminSitupRecords, adminPushupRecords, adminSprintRecords, adminSummary, dashboardSearch, getOfficerName])

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
    { key: 'overall',label: 'Overall Score',icon: <IconActivity /> },
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
              placeholder="Search officer name or ID..."
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
                        <td><GradeBadge grade={test.grade} /></td><td>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                      </tr>
                    )
                  }
                  return (
                    <tr key={`orphan-${test.id}`}>
                      <td>{test.officer_id}</td><td>{uName}</td><td>—</td><td>{test.gender}</td><td>{test.age}</td>
                      <td>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                      <td><GradeBadge grade={test.grade} /></td><td>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {dashboardRows.length === 0 && <EmptyState type="search" title="No Walk Test Records" description="No walk test results match your search criteria." />}
          </>
        )}

        {/* BMI Tab */}
        {dashboardAdminTab === 'bmi' && (
          <>
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
                    <td><GradeBadge grade={r.category ?? r.status} /></td>
                    <td>{r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filterBySearch(adminBmiRecords).length === 0 && <EmptyState type="records" title="No BMI Records" description="No BMI records match your search criteria." />}
          </>
        )}

        {/* Sit-up Tab */}
        {dashboardAdminTab === 'situp' && (
          <>
            <table className="user-table">
              <thead><tr><th>Officer</th><th>Count</th><th>Grade</th><th>Test Date</th></tr></thead>
              <tbody>
                {filterBySearch(adminSitupRecords).map((r, i) => (
                  <tr key={`dash-situp-${r.id ?? i}`}>
                    <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                    <td>{r.count ?? r.reps ?? r.situp_count ?? '—'}</td>
                    <td><GradeBadge grade={r.grade} /></td>
                    <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filterBySearch(adminSitupRecords).length === 0 && <EmptyState type="exercise" title="No Sit-up Records" description="No sit-up records match your search criteria." />}
          </>
        )}

        {/* Push-up Tab */}
        {dashboardAdminTab === 'pushup' && (
          <>
            <table className="user-table">
              <thead><tr><th>Officer</th><th>Count</th><th>Grade</th><th>Test Date</th></tr></thead>
              <tbody>
                {filterBySearch(adminPushupRecords).map((r, i) => (
                  <tr key={`dash-pushup-${r.id ?? i}`}>
                    <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                    <td>{r.count ?? r.reps ?? r.pushup_count ?? '—'}</td>
                    <td><GradeBadge grade={r.grade} /></td>
                    <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filterBySearch(adminPushupRecords).length === 0 && <EmptyState type="exercise" title="No Push-up Records" description="No push-up records match your search criteria." />}
          </>
        )}

        {/* Overall Score Tab */}
        {dashboardAdminTab === 'overall' && (
          <>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Walk Test Grade</th>
                  <th>Sit-up Grade</th>
                  <th>Push-up Grade</th>
                  <th>300m Sprint Grade</th>
                  <th>Tests Completed</th>
                  <th>Overall Status</th>
                </tr>
              </thead>
              <tbody>
                {overallScores.map((r, i) => (
                  <tr key={`dash-overall-${r.id ?? i}`}>
                    <td>{r.name}</td>
                    <td><GradeBadge grade={r.tests.walk?.grade} /></td>
                    <td><GradeBadge grade={r.tests.situp?.grade} /></td>
                    <td><GradeBadge grade={r.tests.pushup?.grade} /></td>
                    <td><GradeBadge grade={r.tests.sprint?.grade} /></td>
                    <td>
                      <div className="tests-completed-bar">
                        <div className="tests-completed-fill" style={{ width: `${(r.testCount / 5) * 100}%` }} />
                        <span className="tests-completed-label">{r.testCount} / 5</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={r.overallStatus} />
                      <div style={{fontSize: '11px', color: '#6b7280', marginTop: '4px'}}>
                        (Edit in User Mgmt)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {overallScores.length === 0 && <EmptyState type="users" title="No Overall Scores" description="No officer records found matching your criteria." />}
          </>
        )}

        {/* Sprint Tab */}
        {dashboardAdminTab === 'sprint' && (
          <>
            <table className="user-table">
              <thead><tr><th>Officer</th><th>Time</th><th>Grade</th><th>Test Date</th></tr></thead>
              <tbody>
                {filterBySearch(adminSprintRecords).map((r, i) => (
                  <tr key={`dash-sprint-${r.id ?? i}`}>
                    <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                    <td>{r.time_formatted || `${r.minutes ?? '0'}:${String(r.seconds ?? 0).padStart(2, '0')}`}</td>
                    <td><GradeBadge grade={r.grade} /></td>
                    <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filterBySearch(adminSprintRecords).length === 0 && <EmptyState type="exercise" title="No Sprint Records" description="No sprint records match your search criteria." />}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
