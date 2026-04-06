import { useMemo, useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import './App.css'
import Login from './Login.jsx'
import User from './user.jsx'
import {
  officerLogin,
  adminLogin,
  officerSignup,
  adminSignup,
  officerGetProfile,
  officerGetWalkTests,
  officerCreateWalkTest,
  officerGetBmi,
  adminGetInfo,
  adminGetWalkTests,
  adminGetAllOfficerProfiles,
} from './api.js'

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState('admin') // 'admin' | 'user'
  const [userName, setUserName] = useState('Ofc. J. Rivera')
  const [accounts, setAccounts] = useState([])
  const [adminWalkTests, setAdminWalkTests] = useState([])
  const [activePage, setActivePage] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [status, setStatus] = useState('')
  const [goNoGo, setGoNoGo] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isAddingWalkTest, setIsAddingWalkTest] = useState(false)
  const [dashboardSearch, setDashboardSearch] = useState('')
  const [dashboardGoNoGo, setDashboardGoNoGo] = useState('')
  const [loginError, setLoginError] = useState('')
  const [walkTestForm, setWalkTestForm] = useState({
    gender: 'male',
    minutes: '18',
    seconds: '0',
    test_date: '3-29-2026',
    age: '25'
  })
  const [walkTestMessage, setWalkTestMessage] = useState('')
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    policeGoNoGo: 'GO',
    phone: '',
    gender: '',
    age: '',
    location: '',
    status: 'Active',
    password: '',
    notes: ''
  })

  // Fetch data on component mount (no legacy /users or /accounts endpoints)
  useEffect(() => {
    const loadData = async () => {
      setUsers([])
      setAccounts([])
    }
    loadData()
  }, [])

  const handleLogin = async ({ email, password, userType, user }) => {
    try {
      // Store authentication token from bearer or access token results
      if (user && (user.bearer_token || user.access_token || user.token)) {
        localStorage.setItem('authToken', user.bearer_token || user.access_token || user.token)
      }

      const role = userType === 'admin' ? 'admin' : 'officer'
      setUserRole(role)
      setUserName(email)
      setIsAuthenticated(true)
      setActivePage('dashboard')
      setLoginError('')

      // Fetch profile data for the signed in user to cache and display
      if (role === 'admin') {
        const adminInfo = await adminGetInfo().catch(() => null)
        const officerProfiles = await adminGetAllOfficerProfiles().catch(() => [])
        const walkTests = await adminGetWalkTests().catch(() => [])
        setUserName(adminInfo?.username || adminInfo?.user_name || adminInfo?.email || email)
        setAccounts(officerProfiles)
        setUsers(officerProfiles)
        setAdminWalkTests(walkTests)
      } else {
        const profile = await officerGetProfile().catch(() => null)
        const walkRecords = await officerGetWalkTests().catch(() => [])
        setUserName(`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || email)
        setUsers(walkRecords)
        setAccounts(profile ? [profile] : [])
      }
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.')
    }
  }

  const handleCreateAccount = async ({ name, password, role, ...apiResponse }) => {
    if (!name || !password || !role) {
      setLoginError('Please fill all fields to create account.')
      return
    }

    try {
      // Backend signup is already handled in CreateAccount component
      // Just store the token and redirect to login
      if (apiResponse && apiResponse.access_token) {
        localStorage.setItem('authToken', apiResponse.access_token)
      }
      
      setLoginError('Account created successfully! Please sign in.')
      // User will be able to login with their new credentials
    } catch (error) {
      setLoginError(error.message || 'Failed to create account. Please try again.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserName('')
    setActivePage('dashboard')
  }

  const isAdmin = userRole === 'admin'

  const filteredUsers = useMemo(() => {
    const min = ageMin ? parseInt(ageMin, 10) : 0
    const max = ageMax ? parseInt(ageMax, 10) : 999
    const searchLower = search.toLowerCase()

    return users.filter((u) => {
      const matchSearch =
        !searchLower ||
        u.name.toLowerCase().includes(searchLower) ||
        (u.policeGoNoGo && u.policeGoNoGo.toLowerCase().includes(searchLower)) ||
        u.id.toLowerCase().includes(searchLower)
      const matchGender = !gender || u.gender === gender
      const matchAge = u.age >= min && u.age <= max
      const matchStatus = !status || u.status === status
      const matchGoNoGo = !goNoGo || (u.policeGoNoGo && u.policeGoNoGo.toUpperCase() === goNoGo)
      return matchSearch && matchGender && matchAge && matchStatus && matchGoNoGo
    })
  }, [users, search, gender, ageMin, ageMax, status, goNoGo])

  const dashboardUsers = useMemo(() => {
    const q = dashboardSearch.trim().toLowerCase()
    const matchName = (u) => !q || u.name.toLowerCase().includes(q) || (u.id && u.id.toLowerCase().includes(q))
    const matchGoNoGo = (u) => !dashboardGoNoGo || (u.policeGoNoGo && u.policeGoNoGo.toUpperCase() === dashboardGoNoGo)
    return users.filter((u) => matchName(u) && matchGoNoGo(u))
  }, [users, dashboardSearch, dashboardGoNoGo])

  const exportCsv = (usersToExport, label) => {
    if (!usersToExport.length) {
      window.alert('No users to export for this selection.')
      return
    }
    const headers = [
      'ID',
      'Name',
      'Police GO / NO GO',
      'Gender',
      'Age',
      'Location',
      'Status',
      'Registered'
    ]
    const escapeCell = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`
    const rows = usersToExport.map((u) => [
      u.id,
      u.name,
      u.policeGoNoGo ?? '',
      u.gender,
      u.age,
      u.location ?? '',
      u.status ?? '',
      u.date ?? ''
    ])
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map(escapeCell).join(','))
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    link.download = `users-${label}-${timestamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportFiltered = () => exportCsv(filteredUsers, 'filtered')
  const handleExportAll = (list) => exportCsv(list || users, 'all')

  const handleDeleteUser = async (id) => {
    if (window.confirm(`Delete user ${id}?`)) {
      try {
        await deleteUser(id)
        setUsers((prev) => prev.filter((u) => u.id !== id))
      } catch (error) {
        window.alert('Failed to delete user. Please try again.')
      }
    }
  }

  const handleSubmitWalkTest = async () => {
    if (!walkTestForm.gender || !walkTestForm.age || !walkTestForm.test_date || !walkTestForm.minutes) {
      setWalkTestMessage('Please fill in gender, age, minutes, and test date.')
      return
    }

    try {
      setWalkTestMessage('Saving walk test record...')
      await officerCreateWalkTest({
        gender: walkTestForm.gender,
        minutes: walkTestForm.minutes,
        seconds: walkTestForm.seconds || '0',
        test_date: walkTestForm.test_date,
        age: walkTestForm.age
      })
      const updatedWalkRecords = await officerGetWalkTests()
      setUsers(updatedWalkRecords)
      setWalkTestMessage('Walk test record created successfully.')
      setWalkTestForm((prev) => ({
        ...prev,
        minutes: '',
        seconds: '0',
        age: ''
      }))
    } catch (error) {
      setWalkTestMessage(error.message || 'Failed to create walk test record.')
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setGender('')
    setAgeMin('')
    setAgeMax('')
    setStatus('')
    setGoNoGo('')
  }

  const normalizeGoNoGo = (val) => {
    if (val == null || val === '') return null
    const s = String(val).trim().toUpperCase()
    if (s === 'GO' || s === 'G O') return 'GO'
    if (s === 'NO GO' || s === 'NOGO' || s === 'NO-GO') return 'NO GO'
    return null
  }

  const getOfficerName = (officerId) => {
    if (!officerId) return 'Unknown Officer'
    const match = accounts.find(
      (account) =>
        account?.id === officerId ||
        account?.officer_id === officerId ||
        account?.officer_profile_id === officerId ||
        account?.account_id === officerId ||
        account?.user_id === officerId
    )

    const name = match
      ? match.full_name || match.name || match.username || match.user_name || match.email
      : null

    if (name) {
      return `${name} (${officerId})`
    }

    return `Officer ${officerId}`
  }

  const handleImportExcel = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })
        if (!rows.length) {
          window.alert('Excel file is empty or has no data.')
          return
        }
        const headers = rows[0].map((h) => String(h ?? '').trim())
        const idIdx = headers.findIndex((h) => /^id$/i.test(h))
        const nameIdx = headers.findIndex((h) => /^name$/i.test(h))
        const goNoGoIdx = headers.findIndex((h) =>
          /go\s*[\/\-]?\s*no\s*go|police\s*go|go\s*no\s*go|status/i.test(h)
        )
        if (goNoGoIdx < 0) {
          window.alert(
            'Excel must have a column for GO/NO GO (e.g. "Police GO / NO GO", "GO/NO GO", or "Status").'
          )
          return
        }
        const nameCol = nameIdx >= 0 ? nameIdx : headers.findIndex((_, i) => i === 1)
        const idCol = idIdx >= 0 ? idIdx : headers.findIndex((_, i) => i === 0)
        setUsers((prev) => {
          const next = prev.map((u) => ({ ...u }))
          const nums = next.map((u) => parseInt(String(u.id).replace(/\D/g, ''), 10)).filter(Boolean)
          let nextNum = nums.length ? Math.max(...nums) + 1 : 1
          let updated = 0
          let added = 0
          for (let r = 1; r < rows.length; r++) {
            const row = rows[r]
            const goNoGoVal = normalizeGoNoGo(row[goNoGoIdx])
            if (goNoGoVal !== 'GO' && goNoGoVal !== 'NO GO') continue
            const rowId = idCol >= 0 && row[idCol] != null ? String(row[idCol]).trim() : ''
            const rowName = nameCol >= 0 && row[nameCol] != null ? String(row[nameCol]).trim() : ''
            const existing = next.find(
              (u) =>
                (rowId && u.id === rowId) ||
                (rowName && u.name.toLowerCase() === rowName.toLowerCase())
            )
            if (existing) {
              existing.policeGoNoGo = goNoGoVal
              updated++
            } else if (rowName && goNoGoVal) {
              next.push({
                id: `USR-${String(nextNum++).padStart(3, '0')}`,
                name: rowName,
                policeGoNoGo: goNoGoVal,
                gender: 'Male',
                age: 0,
                location: '',
                status: 'Active',
                date: new Date().toISOString().slice(0, 10)
              })
              added++
            }
          }
          setTimeout(() => {
            window.alert(
              `Import complete. Updated ${updated} user(s), added ${added} new user(s) with GO/NO GO from Excel.`
            )
          }, 0)
          return next
        })
      } catch (err) {
        console.error(err)
        window.alert('Failed to read Excel file. Please use .xlsx or .xls with columns: ID, Name, and a GO/NO GO column.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleRegisterUser = async () => {
    const name = [addForm.firstName.trim(), addForm.lastName.trim()].filter(Boolean).join(' ')
    if (!name || !addForm.gender || !addForm.age) {
      window.alert('Please fill in required fields: First Name, Last Name, Gender, Age.')
      return
    }
    try {
      const newUser = await createUser({
        name,
        policeGoNoGo: addForm.policeGoNoGo || 'GO',
        gender: addForm.gender,
        age: parseInt(addForm.age, 10) || 0,
        location: addForm.location || '',
        status: addForm.status || 'Active',
        date: new Date().toISOString().slice(0, 10)
      })
      setUsers((prev) => [...prev, newUser])
      setAddForm({
        firstName: '',
        lastName: '',
        policeGoNoGo: 'GO',
        phone: '',
        gender: '',
        age: '',
        location: '',
        status: 'Active',
        password: '',
        notes: ''
      })
      setIsModalOpen(false)
    } catch (error) {
      window.alert('Failed to register user. Please try again.')
    }
  }

  const handleSaveEditUser = async () => {
    if (!editingUser) return
    const name = [addForm.firstName.trim(), addForm.lastName.trim()].filter(Boolean).join(' ')
    if (!name || !addForm.gender || !addForm.age) {
      window.alert('Please fill in required fields: First Name, Last Name, Gender, Age.')
      return
    }
    try {
      const updatedUser = await updateUser(editingUser.id, {
        name,
        policeGoNoGo: addForm.policeGoNoGo || editingUser.policeGoNoGo,
        gender: addForm.gender,
        age: parseInt(addForm.age, 10) || editingUser.age,
        location: addForm.location ?? editingUser.location,
        status: addForm.status ?? editingUser.status
      })
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? updatedUser : u
        )
      )
      setEditingUser(null)
      setIsModalOpen(false)
      setAddForm({
        firstName: '',
        lastName: '',
        policeGoNoGo: 'GO',
        phone: '',
        gender: '',
        age: '',
        location: '',
        status: 'Active',
        password: '',
        notes: ''
      })
    } catch (error) {
      window.alert('Failed to update user. Please try again.')
    }
  }

  const openEditModal = (user) => {
    const [first = '', ...rest] = (user.name || '').split(' ')
    setAddForm({
      firstName: first,
      lastName: rest.join(' '),
      policeGoNoGo: user.policeGoNoGo || 'GO',
      phone: '',
      gender: user.gender || '',
      age: String(user.age ?? ''),
      location: user.location || '',
      status: user.status || 'Active',
      password: '',
      notes: ''
    })
    setEditingUser(user)
    setIsModalOpen(true)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onCreateAccount={handleCreateAccount} loginError={loginError} setLoginError={setLoginError} />
  }

  return (
    <>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="badge-icon">
            <img
              src="https://static.wikia.nocookie.net/logopedia/images/3/31/Philippine_National_Police.png/revision/latest?cb=20200626051209"
              alt="Philippine National Police"
              style={{ width: '100%', height: '100%', objectFit: 'cover ', borderRadius: '100%' }}
            />
          </div>
          <div className="brand-title">Human Resource and Doctorine Management Dept.</div>
          <div className="brand-sub">Command Center</div>
        </div>
        <nav className="nav-section">
          <div className="nav-label">Main</div>
          <a
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setActivePage('dashboard')
            }}
          >
            <span className="icon">📊</span> Dashboard
          </a>
          {isAdmin && (
            <>
              <div className="nav-label">Management</div>
              <a
                className={`nav-item ${activePage === 'user' ? 'active' : ''}`}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage('user')
                }}
              >
                <span className="icon">👥</span> User Management <span className="status-dot" />
              </a>
            </>
          )}
          <a
            className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setActivePage('settings')
            }}
          >
            <span className="icon">⚙️</span> Settings
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="officer-card">
            <div className="officer-avatar">{getInitials(userName || 'Guest')}</div>
            <div>
              <div className="officer-name">{userName ? `Ofc. ${userName}` : 'Ofc. Guest'}</div>
              <div className="officer-rank">{isAdmin ? 'Admin' : 'User'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <div>
              <div className="page-crumb">
                {activePage === 'dashboard' && 'Main / Dashboard'}
                {activePage === 'user' && 'Management / Users'}
                {activePage === 'settings' && 'System / Settings'}
              </div>
              <div className="page-title">
                {activePage === 'dashboard' && 'Dashboard Overview'}
                {activePage === 'user' && 'User Registry'}
                {activePage === 'settings' && 'Settings'}
              </div>
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn" title="Refresh">
              ↻
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          {activePage === 'dashboard' && (
            <div className="dashboard-go-nogo user-root">
              {!isAdmin && (
                <>
                  {accounts.length > 0 && (
                    <div className="user-panel" style={{ marginBottom: 24 }}>
                      <div className="user-header-row">
                        <h2 className="user-title">Officer Profile</h2>
                      </div>
                      <div className="profile-info">
                        <p><strong>Full Name:</strong> {accounts[0].first_name} {accounts[0].last_name}</p>
                        <p><strong>Email:</strong> {accounts[0].email}</p>
                        <p><strong>Badge Number:</strong> {accounts[0].badge_number || accounts[0].username}</p>
                        {/* Add more fields as needed */}
                      </div>
                    </div>
                  )}

                  {isAddingWalkTest && (
                    <div className="user-panel" style={{ marginBottom: 24, position: 'relative' }}>
                      <div className="user-header-row">
                        <h2 className="user-title">Create Walk Test Record</h2>
                      </div>
                      <p className="dashboard-subtitle">Enter your walk test data and submit to save your officer record.</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          className="form-select"
                          value={walkTestForm.gender}
                          onChange={(e) => setWalkTestForm((f) => ({ ...f, gender: e.target.value }))}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Age</label>
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          placeholder="25"
                          value={walkTestForm.age}
                          onChange={(e) => setWalkTestForm((f) => ({ ...f, age: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Minutes</label>
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          placeholder="18"
                          value={walkTestForm.minutes}
                          onChange={(e) => setWalkTestForm((f) => ({ ...f, minutes: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Seconds</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          className="form-input"
                          placeholder="0"
                          value={walkTestForm.seconds}
                          onChange={(e) => setWalkTestForm((f) => ({ ...f, seconds: e.target.value }))}
                        />
                      </div>
                      <div className="form-group full">
                        <label>Test Date</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="3-29-2026"
                          value={walkTestForm.test_date}
                          onChange={(e) => setWalkTestForm((f) => ({ ...f, test_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-primary" onClick={handleSubmitWalkTest}>
                        Save Walk Test
                      </button>
                      {walkTestMessage && (
                        <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{walkTestMessage}</span>
                      )}
                      <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => setIsAddingWalkTest(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                  )}
              <div className="user-panel">
                <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="user-title">Officer Walk Test Records</h2>
                  {!isAdmin && !isAddingWalkTest && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setIsAddingWalkTest(true)}
                    >
                      ADD WALK TEST RECORD
                    </button>
                  )}
                </div>
                <p className="dashboard-subtitle">Your walk test records with details.</p>
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Time</th>
                      <th>Grade</th>
                      <th>Test Date</th>
                      <th>GO / NO GO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.age}</td>
                        <td>{u.gender}</td>
                        <td>{u.time}</td>
                        <td>{u.grade}</td>
                        <td>{u.test_date}</td>
                        <td>
                          <span className={`dashboard-badge dashboard-badge--${(u.policeGoNoGo || '').toLowerCase().replace(/\s/g, '-')}`}>
                            {u.policeGoNoGo ?? '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dashboardUsers.length === 0 && (
                  <p className="dashboard-empty">No results match your search.</p>
                )}
              </div>
                </>
              )}

            </div>
          )}
          {activePage === 'user' && isAdmin && (
            <User
              users={users}
              filteredUsers={filteredUsers}
              setUsers={setUsers}
              onDeleteUser={handleDeleteUser}
              onImportExcel={handleImportExcel}
              onOpenAddModal={() => {
                setAddForm({
                  firstName: '',
                  lastName: '',
                  policeGoNoGo: 'GO',
                  phone: '',
                  gender: '',
                  age: '',
                  location: '',
                  status: 'Active',
                  password: '',
                  notes: ''
                })
                setEditingUser(null)
                setIsModalOpen(true)
              }}
              onEditUser={openEditModal}
              search={search}
              setSearch={setSearch}
              gender={gender}
              setGender={setGender}
              ageMin={ageMin}
              setAgeMin={setAgeMin}
              ageMax={ageMax}
              setAgeMax={setAgeMax}
              status={status}
              setStatus={setStatus}
              goNoGo={goNoGo}
              setGoNoGo={setGoNoGo}
              onResetFilters={handleResetFilters}
              onExportFiltered={handleExportFiltered}
              onExportAll={handleExportAll}
              adminWalkTests={adminWalkTests}
              getOfficerName={getOfficerName}
            />
          )}
          {activePage === 'settings' && (
            <div style={{ padding: 24 }}>
              <h2 style={{ fontFamily: 'Rajdhani', fontSize: 22, marginBottom: 16 }}>Settings</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
                Manage your session and application preferences.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#b00020',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Rajdhani',
                  letterSpacing: '0.03em'
                }}
              >
                ⏻ Log Out
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT USER MODAL */}
      {(isModalOpen || editingUser) && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false)
              setEditingUser(null)
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {editingUser ? '✏️ Edit User' : '🛡️ Register New User'}
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingUser(null)
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Doe"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Police GO / NO GO *</label>
                  <select
                    className="form-select"
                    value={addForm.policeGoNoGo}
                    onChange={(e) => setAddForm((f) => ({ ...f, policeGoNoGo: e.target.value }))}
                  >
                    <option value="GO">GO</option>
                    <option value="NO GO">NO GO</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    className="form-select"
                    value={addForm.gender}
                    onChange={(e) => setAddForm((f) => ({ ...f, gender: e.target.value }))}
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 34"
                    min="1"
                    max="120"
                    value={addForm.age}
                    onChange={(e) => setAddForm((f) => ({ ...f, age: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Location / City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="New York, NY"
                    value={addForm.location}
                    onChange={(e) => setAddForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-select"
                    value={addForm.status}
                    onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Pending</option>
                  </select>
                </div>
                {!editingUser && (
                  <>
                    <div className="divider-label">
                      <span>Security</span>
                    </div>
                    <div className="form-group">
                      <label>Assign Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                        value={addForm.password}
                        onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                )}
                <div className="form-group full">
                  <label>Notes / Remarks</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional internal notes..."
                    value={addForm.notes}
                    onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingUser(null)
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={editingUser ? handleSaveEditUser : handleRegisterUser}
              >
                {editingUser ? '✔ Save Changes' : '✔ Register User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
