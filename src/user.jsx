import { useRef } from 'react'
import './css/user.css'
import { getUserDisplayName, normalizeId, idsMatch } from './utils.js'

function User({
  users,
  filteredUsers,
  setUsers,
  onDeleteUser,
  onImportExcel,
  onOpenAddModal,
  onEditUser,
  onEditWalkTest,
  onDeleteWalkTest,
  search,
  setSearch,
  gender,
  setGender,
  ageMin,
  setAgeMin,
  ageMax,
  setAgeMax,
  goNoGo,
  setGoNoGo,
  onResetFilters,
  onExportFiltered,
  onExportAll,
  adminWalkTests,
  getOfficerName,
}) {
  const fileInputRef = useRef(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const ext = (file.name || '').toLowerCase()
      if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls')) {
        window.alert('Please select an Excel file (.xlsx or .xls).')
        e.target.value = ''
        return
      }
      onImportExcel?.(file)
      e.target.value = ''
    }
  }

  const combinedRows = []
  const processedTestIds = new Set()
  const hasLocationColumn = Boolean(users?.some((u) => u?.location != null))

  if (filteredUsers) {
    filteredUsers.forEach((u) => {
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

      if (userTests.length === 0) {
        combinedRows.push({ type: 'user', u, test: null, isFirst: true })
      } else {
        userTests.forEach((t, idx) => {
          processedTestIds.add(t.id)
          combinedRows.push({ type: 'mixed', u, test: t, isFirst: idx === 0, groupSize: userTests.length })
        })
      }
    })
  }

  if (adminWalkTests) {
    adminWalkTests.forEach(t => {
      if (!processedTestIds.has(t.id)) {
        const officerName = getOfficerName ? getOfficerName(t.officer_id) : `Officer ${t.officer_id}`
        const searchLower = search?.toLowerCase() || ''
        const matchSearch = !searchLower || officerName.toLowerCase().includes(searchLower)
        const matchGender = !gender || t.gender?.toLowerCase() === gender.toLowerCase()
        const matchAge = (!ageMin || t.age >= parseInt(ageMin, 10)) && (!ageMax || t.age <= parseInt(ageMax, 10))
        const matchGoNoGo = !goNoGo
        if (matchSearch && matchGender && matchAge && matchGoNoGo) {
          combinedRows.push({ type: 'orphan', u: null, test: t, name: officerName, isFirst: true })
        }
      }
    })
  }

  return (
    <div className="user-root">
      <div className="user-panel">
        <div className="user-header-row">
          <h2 className="user-title">Walk Test Records</h2>
          <div className="user-header-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {onImportExcel && (
              <button type="button" className="user-btn-import" onClick={handleImportClick}>
                📄 Import Excel (GO/NO GO)
              </button>
            )}
          </div>
        </div>

        <div className="user-filters">
          <div className="user-filter-group user-search">
            <label>Search by name</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type name to search..."
            />
          </div>

          <div className="user-filter-group">
            <label>GO / NO GO</label>
            <select
              value={goNoGo ?? ''}
              onChange={(e) => setGoNoGo(e.target.value)}
            >
              <option value="">All</option>
              <option value="GO">GO</option>
              <option value="NO GO">NO GO</option>
            </select>
          </div>

          <div className="user-filter-group">
            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="user-filter-group">
            <label>Age Min</label>
            <input
              type="number"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              placeholder="Min"
            />
          </div>

          <div className="user-filter-group">
            <label>Age Max</label>
            <input
              type="number"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              placeholder="Max"
            />
          </div>

          <div className="user-filter-actions">
            {onResetFilters && (
              <button type="button" onClick={onResetFilters}>
                Reset Filters
              </button>
            )}
            {onExportFiltered && (
              <button type="button" onClick={onExportFiltered}>
                Download Filtered CSV
              </button>
            )}
            {onExportAll && (
              <button type="button" onClick={() => onExportAll(users)}>
                Download All CSV
              </button>
            )}
          </div>
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Police GO / NO GO</th>
              <th>Gender</th>
              <th>Age</th>
              {hasLocationColumn && <th>Location</th>}
              <th>Time</th>
              <th>Grade</th>
              <th>Test Date</th>
              {(onEditWalkTest || onDeleteWalkTest) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {combinedRows.map((row, idx) => {
              const { type, u, test, name, isFirst, groupSize } = row
              if (type === 'user') {
                return (
                  <tr key={`user-${u.id}`}>
                    <td>{u.id}</td>
                    <td>{getUserDisplayName(u) || '—'}</td>
                    <td>{u.policeGoNoGo ?? '—'}</td>
                    <td>{u.gender}</td>
                    <td>{u.age}</td>
                    {hasLocationColumn && <td>{u.location ?? '—'}</td>}
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    {(onEditWalkTest || onDeleteWalkTest) && (
                      <td>
                        <span style={{ color: 'var(--muted)' }}>No walk test record</span>
                      </td>
                    )}
                  </tr>
                )
              } else if (type === 'mixed') {
                return (
                  <tr key={`mixed-${u.id}-${test.id}`}>
                    <td>{u.id}</td>
                    <td>{getUserDisplayName(u) || '—'}</td>
                    <td>{u.policeGoNoGo ?? '—'}</td>
                    <td>{test.gender || u.gender}</td>
                    <td>{test.age || u.age}</td>
                    {hasLocationColumn && <td>{u.location ?? '—'}</td>}
                    <td>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                    <td>{test.grade}</td>
                    <td>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                    {(onEditWalkTest || onDeleteWalkTest) && (
                      <td>
                        <div className="user-action-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {onEditWalkTest && (
                            <button type="button" className="user-btn-edit" onClick={() => onEditWalkTest(test)}>
                              Edit Walk Test
                            </button>
                          )}
                          {onDeleteWalkTest && (
                            <button type="button" className="user-btn-delete" onClick={() => onDeleteWalkTest(test.id)}>
                              Delete Walk Test
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              } else if (type === 'orphan') {
                return (
                  <tr key={`orphan-${test.id}`}>
                    <td>{test.officer_id || test.account_id || test.user_id || '—'}</td>
                    <td className="user-name">
                      {name || `Officer ${test.officer_id || test.id}`}
                    </td>
                    <td>—</td>
                    <td>{test.gender}</td>
                    <td>{test.age}</td>
                    {hasLocationColumn && <td>—</td>}
                    <td>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                    <td>{test.grade}</td>
                    <td>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                    {(onEditWalkTest || onDeleteWalkTest) && (
                      <td>
                        <div className="user-action-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {onEditWalkTest && (
                            <button type="button" className="user-btn-edit" onClick={() => onEditWalkTest(test)}>
                              Edit Walk Test
                            </button>
                          )}
                          {onDeleteWalkTest && (
                            <button type="button" className="user-btn-delete" onClick={() => onDeleteWalkTest(test.id)}>
                              Delete Walk Test
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              }
              return null
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default User

