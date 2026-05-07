import { useRef } from 'react'
import { getUserDisplayName, idsMatch } from '@/lib/utils.js'
import GradeBadge from '@/components/ui/GradeBadge.jsx'
import { IconPlus } from '@/components/icons.jsx'

const thClass = 'px-4 py-3 text-left text-2xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap bg-surface/80 backdrop-blur-sm'
const tdClass = 'px-4 py-3 text-sm text-navy whitespace-nowrap'
const filterInputClass = 'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-navy placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors duration-fast'
const filterSelectClass = 'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors duration-fast cursor-pointer appearance-none'
const btnSecondary = 'px-3 py-2 text-xs font-medium text-slate bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all duration-fast cursor-pointer'

function User({
  users, filteredUsers, onImportExcel,
  onAddWalkTest, onEditWalkTest, onDeleteWalkTest,
  search, setSearch, gender, setGender, ageMin, setAgeMin, ageMax, setAgeMax,
  onResetFilters, onExportFiltered, onExportAll, adminWalkTests, getOfficerName,
}) {
  const fileInputRef = useRef(null)
  const handleImportClick = () => fileInputRef.current?.click()
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const ext = (file.name || '').toLowerCase()
      if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls')) { console.warn('Please select an Excel file (.xlsx or .xls).'); e.target.value = ''; return }
      onImportExcel?.(file)
      e.target.value = ''
    }
  }

  const combinedRows = []
  const processedTestIds = new Set()
  const hasLocationColumn = Boolean(users?.some((u) => u?.location != null))

  if (filteredUsers) {
    filteredUsers.forEach((u) => {
      const userTests = adminWalkTests ? adminWalkTests.filter((t) => idsMatch(t.officer_id, u.id) || idsMatch(t.officer_id, u.officer_id) || idsMatch(t.officer_id, u.officer_profile_id) || idsMatch(t.officer_id, u.account_id) || idsMatch(t.officer_id, u.user_id)) : []
      if (userTests.length === 0) {
        combinedRows.push({ type: 'user', u, test: null, isFirst: true })
      } else {
        userTests.forEach((t, idx) => { processedTestIds.add(t.id); combinedRows.push({ type: 'mixed', u, test: t, isFirst: idx === 0, groupSize: userTests.length }) })
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
        if (matchSearch && matchGender && matchAge) combinedRows.push({ type: 'orphan', u: null, test: t, name: officerName, isFirst: true })
      }
    })
  }

  return (
    <div className="w-full min-w-0 space-y-5 animate-fade-in">
      <div className="w-full min-w-0 bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-navy">Walk Test Records</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
            {onImportExcel && (
              <button type="button" className={btnSecondary} onClick={handleImportClick}>📄 Import Excel</button>
            )}
            {onAddWalkTest && (
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue rounded-lg shadow-sm hover:bg-blue-light hover:shadow-md active:scale-95 transition-all duration-fast cursor-pointer" onClick={onAddWalkTest}>
                <IconPlus /> Add Walk Test Record
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-6 py-4 bg-surface/30 border-b border-gray-50">
          <div className="col-span-2 sm:col-span-1 lg:col-span-2">
            <label className="block text-2xs font-semibold text-muted uppercase tracking-wider mb-1">Search by name</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type name or ID to search..." className={filterInputClass} />
          </div>
          <div>
            <label className="block text-2xs font-semibold text-muted uppercase tracking-wider mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={filterSelectClass}>
              <option value="">All</option><option value="Male">Male</option><option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-2xs font-semibold text-muted uppercase tracking-wider mb-1">Age Min</label>
            <input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="Min" className={filterInputClass} />
          </div>
          <div>
            <label className="block text-2xs font-semibold text-muted uppercase tracking-wider mb-1">Age Max</label>
            <input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="Max" className={filterInputClass} />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-50 flex-wrap">
          {onResetFilters && <button type="button" className={btnSecondary} onClick={onResetFilters}>Reset Filters</button>}
          {onExportFiltered && <button type="button" className={btnSecondary} onClick={onExportFiltered}>Download Filtered CSV</button>}
          {onExportAll && <button type="button" className={btnSecondary} onClick={() => onExportAll(users)}>Download All CSV</button>}
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-100">
                <th className={thClass}>ID</th><th className={thClass}>Name</th><th className={thClass}>Gender</th><th className={thClass}>Age</th>
                {hasLocationColumn && <th className={thClass}>Location</th>}
                <th className={thClass}>Time</th><th className={thClass}>Grade</th><th className={thClass}>Test Date</th>
                {(onEditWalkTest || onDeleteWalkTest) && <th className={thClass}>Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {combinedRows.map((row, idx) => {
                const { type, u, test, name } = row
                const rowClass = `hover:bg-surface/60 hover:-translate-y-[1px] hover:shadow-sm transition-all duration-200 animate-fade-in stagger-${Math.min(idx + 1, 8)}`
                const btnEdit = "px-2.5 py-1 text-2xs font-medium text-blue bg-blue/10 rounded-md hover:bg-blue/20 active:scale-95 transition-all cursor-pointer"
                const btnDel = "px-2.5 py-1 text-2xs font-medium text-coral bg-coral-pale rounded-md hover:bg-coral-pale/80 active:scale-95 transition-all cursor-pointer"
                
                if (type === 'user') {
                  return (
                    <tr key={`user-${u.id}`} className={rowClass}>
                      <td className={tdClass}>{u.id}</td><td className={tdClass}>{getUserDisplayName(u) || '—'}</td><td className={tdClass}>{u.gender}</td><td className={tdClass}>{u.age}</td>
                      {hasLocationColumn && <td className={tdClass}>{u.location ?? '—'}</td>}
                      <td className={tdClass}>—</td><td className={tdClass}>—</td><td className={tdClass}>—</td>
                      {(onEditWalkTest || onDeleteWalkTest) && <td className={`${tdClass} text-muted text-xs`}>No walk test record</td>}
                    </tr>
                  )
                }
                if (type === 'mixed') {
                  return (
                    <tr key={`mixed-${u.id}-${test.id}`} className={rowClass}>
                      <td className={tdClass}>{u.id}</td><td className={tdClass}>{getUserDisplayName(u) || '—'}</td><td className={tdClass}>{test.gender || u.gender}</td><td className={tdClass}>{test.age || u.age}</td>
                      {hasLocationColumn && <td className={tdClass}>{u.location ?? '—'}</td>}
                      <td className={tdClass}>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                      <td className={tdClass}><GradeBadge grade={test.grade} /></td>
                      <td className={tdClass}>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                      {(onEditWalkTest || onDeleteWalkTest) && (
                        <td className={tdClass}>
                          <div className="flex gap-2 flex-wrap">
                            {onEditWalkTest && <button type="button" className={btnEdit} onClick={() => onEditWalkTest(test)}>Edit</button>}
                            {onDeleteWalkTest && <button type="button" className={btnDel} onClick={() => onDeleteWalkTest(test.id)}>Delete</button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                }
                if (type === 'orphan') {
                  return (
                    <tr key={`orphan-${test.id}`} className={rowClass}>
                      <td className={tdClass}>{test.officer_id || test.account_id || test.user_id || '—'}</td>
                      <td className={`${tdClass} font-medium`}>{name || `Officer ${test.officer_id || test.id}`}</td>
                      <td className={tdClass}>{test.gender}</td><td className={tdClass}>{test.age}</td>
                      {hasLocationColumn && <td className={tdClass}>—</td>}
                      <td className={tdClass}>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                      <td className={tdClass}><GradeBadge grade={test.grade} /></td>
                      <td className={tdClass}>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                      {(onEditWalkTest || onDeleteWalkTest) && (
                        <td className={tdClass}>
                          <div className="flex gap-2 flex-wrap">
                            {onEditWalkTest && <button type="button" className={btnEdit} onClick={() => onEditWalkTest(test)}>Edit</button>}
                            {onDeleteWalkTest && <button type="button" className={btnDel} onClick={() => onDeleteWalkTest(test.id)}>Delete</button>}
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
    </div>
  )
}

export default User
