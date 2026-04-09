import { useMemo, useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import './App.css'
import Login from './Login.jsx'
import User from './user.jsx'
import OfficerExercises from './OfficerExercises.jsx'
import ExerciseModals from './ExerciseModals.jsx'
import {
  officerLogin,
  adminLogin,
  officerSignup,
  adminSignup,
  officerGetProfile,
  getOfficerInfo,
  officerGetWalkTests,
  officerCreateWalkTest,
  officerGetBmi,
  officerCreateBmi,
  officerGetSitupRecords,
  officerCreateSitupRecord,
  officerGetPushupRecords,
  officerCreatePushupRecord,
  officerGetSprintRecords,
  officerCreateSprintRecord,
  adminGetInfo,
  adminGetWalkTests,
  adminGetOfficerBmi,
  adminUpdateOfficerBmi,
  adminDeleteOfficerBmi,
  adminGetSitupRecords,
  adminGetPushupRecords,
  adminGetSprintRecords,
  adminGetAllOfficerProfiles,
  adminUpdateWalkTest,
  adminDeleteWalkTest,
  createUser,
  updateUser,
  deleteUser,
} from './api.js'

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const formatBirthdayDisplay = (v) => {
  if (v == null || v === '') return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatSexDisplay = (v) => {
  if (v == null || v === '') return '—'
  const s = String(v).toLowerCase()
  if (s === 'male' || s === 'female') return s.charAt(0).toUpperCase() + s.slice(1)
  return String(v)
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState('admin') // 'admin' | 'user'
  const [userName, setUserName] = useState('Ofc. J. Rivera')
  const [accounts, setAccounts] = useState([])
  const [adminWalkTests, setAdminWalkTests] = useState([])
  const [adminBmiRecords, setAdminBmiRecords] = useState([])
  const [adminSitupRecords, setAdminSitupRecords] = useState([])
  const [adminPushupRecords, setAdminPushupRecords] = useState([])
  const [adminSprintRecords, setAdminSprintRecords] = useState([])
  const [activePage, setActivePage] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [goNoGo, setGoNoGo] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [officerProfileLoading, setOfficerProfileLoading] = useState(false)
  const [officerProfileError, setOfficerProfileError] = useState('')
  /** Account info from GET /auth/officer/info (e.g. email) */
  const [officerInfo, setOfficerInfo] = useState(null)
  const [adminProfileForPage, setAdminProfileForPage] = useState(null)
  
  const [isWalkTestModalOpen, setIsWalkTestModalOpen] = useState(false)
  const [editingWalkTest, setEditingWalkTest] = useState(null)
  const [isBmiModalOpen, setIsBmiModalOpen] = useState(false)
  const [editingBmi, setEditingBmi] = useState(null)
  const [bmiEditForm, setBmiEditForm] = useState({
    height_meter: '',
    weight_kg: '',
    month_taken: '',
  })

  const getUserDisplayName = (u) => {
    if (!u) return ''
    const full = [u.first_name ?? u.firstName, u.last_name ?? u.lastName].filter(Boolean).join(' ').trim()
    return String(
      u.full_name ??
        u.name ??
        u.officer_name ??
        u.username ??
        u.user_name ??
        full ??
        ''
    ).trim()
  }

  const normalizeId = (v) => String(v ?? '').trim().replace(/^USR-/i, '').replace(/^0+/, '')
  const idsMatch = (a, b) => {
    const sa = String(a ?? '').trim()
    const sb = String(b ?? '').trim()
    if (!sa || !sb) return false
    if (sa === sb) return true
    return normalizeId(sa) === normalizeId(sb)
  }

  const normalizeUserRecord = (u) => {
    const idRaw = u?.id ?? u?.officer_id ?? u?.officer_profile_id ?? u?.account_id ?? u?.user_id ?? ''
    return {
      ...u,
      id: String(idRaw),
      name: getUserDisplayName(u)
    }
  }
  const toArray = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.data?.items)) return data.data.items
    if (Array.isArray(data?.data?.records)) return data.data.records
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.records)) return data.records
    if (Array.isArray(data?.pushup_records)) return data.pushup_records
    if (Array.isArray(data?.situp_records)) return data.situp_records
    if (Array.isArray(data?.bmi_records)) return data.bmi_records
    if (Array.isArray(data?.sprint_records)) return data.sprint_records
    // Some endpoints return a single record object
    if (data && typeof data === 'object') {
      const looksLikeRecord =
        data.id != null ||
        data.bmi != null ||
        data.height_meter != null ||
        data.weight_kg != null ||
        data.reps != null ||
        data.count != null ||
        data.pushup_count != null ||
        data.situp_count != null ||
        data.minutes != null ||
        data.seconds != null
      if (looksLikeRecord) return [data]
    }
    return []
  }

  const isPushupLikeRecord = (r) => {
    if (!r || typeof r !== 'object') return false
    return (
      r.id != null ||
      r.reps != null ||
      r.count != null ||
      r.pushup_count != null ||
      r.push_up_count != null ||
      r.total_reps != null ||
      r.grade != null ||
      r.test_date != null
    )
  }

  const normalizePushupRecords = (data) => {
    const candidates = [
      data,
      data?.data,
      data?.data?.data,
      data?.results,
      data?.items,
      data?.records,
      data?.pushup_records,
      data?.push_up_records,
      data?.officer_pushup_records,
      data?.officer_pushup_record,
      data?.pushup_record,
      data?.push_up_record,
    ]

    for (const c of candidates) {
      if (Array.isArray(c)) return c.filter((x) => x && typeof x === 'object')
    }
    for (const c of candidates) {
      if (isPushupLikeRecord(c)) return [c]
      if (c && typeof c === 'object' && isPushupLikeRecord(c.data)) return [c.data]
    }
    return []
  }

  const isSprintLikeRecord = (r) => {
    if (!r || typeof r !== 'object') return false
    return (
      r.id != null ||
      r.minutes != null ||
      r.seconds != null ||
      r.time_formatted != null ||
      r.grade != null ||
      r.test_date != null
    )
  }

  const normalizeSprintRecords = (data) => {
    const candidates = [
      data,
      data?.data,
      data?.data?.data,
      data?.results,
      data?.items,
      data?.records,
      data?.sprint_records,
      data?.sprint_record,
      data?.officer_sprint_records,
      data?.officer_sprint_record,
    ]

    for (const c of candidates) {
      if (Array.isArray(c)) return c.filter((x) => x && typeof x === 'object')
    }
    for (const c of candidates) {
      if (isSprintLikeRecord(c)) return [c]
      if (c && typeof c === 'object' && isSprintLikeRecord(c.data)) return [c.data]
    }
    return []
  }
  const [walkTestEditForm, setWalkTestEditForm] = useState({ minutes: '', seconds: '0', test_date: '', gender: '', age: '' })

  const [isAddingWalkTest, setIsAddingWalkTest] = useState(false)
  const [dashboardSearch, setDashboardSearch] = useState('')
  const [dashboardGoNoGo, setDashboardGoNoGo] = useState('')
  const [dashboardAdminTab, setDashboardAdminTab] = useState('walk')
  const [adminRecordsTab, setAdminRecordsTab] = useState('walk')
  const [bmiSearch, setBmiSearch] = useState('')
  const [loginError, setLoginError] = useState('')
  const [officerDashboardTab, setOfficerDashboardTab] = useState('walk')
  const [walkTestForm, setWalkTestForm] = useState({
    gender: 'male',
    minutes: '18',
    seconds: '0',
    test_date: '3-29-2026',
    age: '25'
  })
  const [walkTestMessage, setWalkTestMessage] = useState('')
  const [officerWalkRecords, setOfficerWalkRecords] = useState([])
  const [officerBmiRecords, setOfficerBmiRecords] = useState([])
  const [officerSitupRecords, setOfficerSitupRecords] = useState([])
  const [officerPushupRecords, setOfficerPushupRecords] = useState([])
  const [officerSprintRecords, setOfficerSprintRecords] = useState([])
  const [isAddingBmi, setIsAddingBmi] = useState(false)
  const [isAddingSitup, setIsAddingSitup] = useState(false)
  const [isAddingPushup, setIsAddingPushup] = useState(false)
  const [isAddingSprint, setIsAddingSprint] = useState(false)
  const [bmiMessage, setBmiMessage] = useState('')
  const [situpMessage, setSitupMessage] = useState('')
  const [pushupMessage, setPushupMessage] = useState('')
  const [sprintMessage, setSprintMessage] = useState('')
  const [bmiForm, setBmiForm] = useState({ height_meter: '', weight_kg: '', month_taken: '' })
  const [situpForm, setSitupForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })
  const [pushupForm, setPushupForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })
  const [sprintForm, setSprintForm] = useState({ minutes: '', seconds: '0', age: '', gender: 'male' })
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

  const isAdmin = userRole === 'admin'

  // Fetch data on component mount (no legacy /users or /accounts endpoints)
  useEffect(() => {
    const loadData = async () => {
      setUsers([])
      setAccounts([])
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!isAuthenticated || activePage !== 'officerProfile') return
    if (isAdmin) {
      setOfficerProfileError('')
      adminGetInfo()
        .then(setAdminProfileForPage)
        .catch(() => setAdminProfileForPage(null))
      return
    }
    let cancelled = false
    ;(async () => {
      setOfficerProfileLoading(true)
      setOfficerProfileError('')
      try {
        const [profileResult, infoResult] = await Promise.allSettled([
          officerGetProfile(),
          getOfficerInfo(),
        ])
        if (cancelled) return
        if (profileResult.status === 'fulfilled' && profileResult.value) {
          const data = profileResult.value
          setAccounts([data])
          const display = `${data?.first_name || ''} ${data?.last_name || ''}`.trim()
          if (display) setUserName(display)
        } else {
          setAccounts([])
          if (profileResult.status === 'rejected') {
            setOfficerProfileError(
              profileResult.reason?.message || 'Failed to load profile'
            )
          }
        }
        if (infoResult.status === 'fulfilled' && infoResult.value) {
          setOfficerInfo(infoResult.value)
        } else {
          setOfficerInfo(null)
        }
      } catch (e) {
        if (!cancelled) setOfficerProfileError(e.message || 'Failed to load profile')
      } finally {
        if (!cancelled) setOfficerProfileLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, activePage, isAdmin])

  const refreshProfilePage = async () => {
    if (activePage !== 'officerProfile') return
    if (isAdmin) {
      try {
        const info = await adminGetInfo()
        setAdminProfileForPage(info)
      } catch {
        setAdminProfileForPage(null)
      }
      return
    }
    setOfficerProfileLoading(true)
    setOfficerProfileError('')
    try {
      const [profileResult, infoResult] = await Promise.allSettled([
        officerGetProfile(),
        getOfficerInfo(),
      ])
      if (profileResult.status === 'fulfilled' && profileResult.value) {
        const data = profileResult.value
        setAccounts([data])
        const display = `${data?.first_name || ''} ${data?.last_name || ''}`.trim()
        if (display) setUserName(display)
      } else {
        setAccounts([])
        if (profileResult.status === 'rejected') {
          setOfficerProfileError(profileResult.reason?.message || 'Failed to load profile')
        }
      }
      if (infoResult.status === 'fulfilled' && infoResult.value) {
        setOfficerInfo(infoResult.value)
      } else {
        setOfficerInfo(null)
      }
    } catch (e) {
      setOfficerProfileError(e.message || 'Failed to load profile')
    } finally {
      setOfficerProfileLoading(false)
    }
  }

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
        const bmiRecords = await adminGetOfficerBmi().catch(() => [])
        const situpRecords = await adminGetSitupRecords().catch(() => [])
        const pushupRecords = await adminGetPushupRecords().catch(() => [])
        const sprintRecords = await adminGetSprintRecords().catch(() => [])
        setUserName(adminInfo?.username || adminInfo?.user_name || adminInfo?.email || email)
        const normalizedProfiles = Array.isArray(officerProfiles)
          ? officerProfiles.map(normalizeUserRecord)
          : []
        setAccounts(normalizedProfiles)
        setUsers(normalizedProfiles)
        setAdminWalkTests(walkTests)
        setAdminBmiRecords(toArray(bmiRecords))
        setAdminSitupRecords(toArray(situpRecords))
        setAdminPushupRecords(toArray(pushupRecords))
        setAdminSprintRecords(toArray(sprintRecords))
      } else {
        const profile = await officerGetProfile().catch(() => null)
        const info = await getOfficerInfo().catch(() => null)
        const [walkRecords, bmiRecords, situpRecords, pushupRecords, sprintRecords] = await Promise.all([
          officerGetWalkTests().catch(() => []),
          officerGetBmi().catch(() => []),
          officerGetSitupRecords().catch(() => []),
          officerGetPushupRecords().catch(() => []),
          officerGetSprintRecords().catch(() => []),
        ])
        setOfficerInfo(info)
        setUserName(`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || email)
        setUsers(walkRecords)
        setOfficerWalkRecords(walkRecords)
        setOfficerBmiRecords(toArray(bmiRecords))
        setOfficerSitupRecords(toArray(situpRecords))
        setOfficerPushupRecords(normalizePushupRecords(pushupRecords))
        setOfficerSprintRecords(normalizeSprintRecords(sprintRecords))
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
    setOfficerInfo(null)
  }

  const filteredUsers = useMemo(() => {
    const min = ageMin ? parseInt(ageMin, 10) : 0
    const max = ageMax ? parseInt(ageMax, 10) : 999
    const searchLower = search.toLowerCase()

    return users.filter((u) => {
      const matchSearch =
        !searchLower ||
        getUserDisplayName(u).toLowerCase().includes(searchLower) ||
        (u.policeGoNoGo && u.policeGoNoGo.toLowerCase().includes(searchLower)) ||
        String(u.id ?? '').toLowerCase().includes(searchLower)
      const matchGender = !gender || u.gender === gender
      const matchAge = u.age >= min && u.age <= max
      const matchGoNoGo = !goNoGo || (u.policeGoNoGo && u.policeGoNoGo.toUpperCase() === goNoGo)
      return matchSearch && matchGender && matchAge && matchGoNoGo
    })
  }, [users, search, gender, ageMin, ageMax, goNoGo])

  const dashboardUsers = useMemo(() => {
    const q = dashboardSearch.trim().toLowerCase()
    const matchName = (u) =>
      !q ||
      getUserDisplayName(u).toLowerCase().includes(q) ||
      (u.id && String(u.id).toLowerCase().includes(q))
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

  const handleDeleteWalkTest = async (testId) => {
    if (window.confirm(`Delete Walk Test record?`)) {
      try {
        await adminDeleteWalkTest(testId)
        setAdminWalkTests((prev) => prev.filter((t) => t.id !== testId))
      } catch (error) {
        window.alert('Failed to delete walk test. Please try again.')
      }
    }
  }

  const openBmiModal = (record) => {
    const dateRaw = record?.month_taken || ''
    let dateVal = ''
    if (dateRaw) {
      const d = new Date(dateRaw)
      if (!Number.isNaN(d.getTime())) {
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        dateVal = `${yyyy}-${mm}-${dd}`
      }
    }
    setEditingBmi(record)
    setBmiEditForm({
      height_meter: String(record?.height_meter ?? ''),
      weight_kg: String(record?.weight_kg ?? ''),
      month_taken: dateVal,
    })
    setIsBmiModalOpen(true)
  }

  const handleSaveBmi = async () => {
    if (!editingBmi?.id) return
    try {
      const normalizeDate = (v) => {
        const s = String(v ?? '').trim()
        if (!s) return ''
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
        const d = new Date(s)
        if (Number.isNaN(d.getTime())) return ''
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
      }

      const monthTaken =
        normalizeDate(bmiEditForm.month_taken) ||
        normalizeDate(editingBmi.month_taken) ||
        normalizeDate(new Date().toISOString())

      const payload = {
        height_meter: parseFloat(bmiEditForm.height_meter) || 0,
        weight_kg: parseFloat(bmiEditForm.weight_kg) || 0,
        month_taken: monthTaken,
      }
      const computedBmi =
        payload.height_meter > 0
          ? Number((payload.weight_kg / (payload.height_meter * payload.height_meter)).toFixed(2))
          : 0
      const computedCategory =
        computedBmi <= 0
          ? '—'
          : computedBmi < 18.5
            ? 'Underweight'
            : computedBmi < 25
              ? 'Normal'
              : computedBmi < 30
                ? 'Overweight'
                : 'Obese'

      const optimistic = {
        ...editingBmi,
        ...payload,
        bmi: computedBmi,
        category: computedCategory,
      }

      const updated = await adminUpdateOfficerBmi(editingBmi.id, payload).catch(() => null)

      // Immediately reflect edited weight/BMI/category in UI.
      setAdminBmiRecords((prev) =>
        prev.map((r) =>
          r.id === editingBmi.id
            ? {
                ...optimistic,
                ...(updated && typeof updated === 'object' && !Array.isArray(updated) ? updated : {}),
              }
            : r
        )
      )

      const fresh = await adminGetOfficerBmi().catch(() => null)
      if (fresh) {
        const fetched = toArray(fresh)
        setAdminBmiRecords((prev) =>
          prev.map((r) => {
            const serverRow = fetched.find((f) => f?.id === r?.id)
            if (!serverRow) return r
            // Preserve the just-submitted edit for the active row in case API read-after-write is stale.
            if (r.id === editingBmi.id) {
              return {
                ...serverRow,
                height_meter: payload.height_meter,
                weight_kg: payload.weight_kg,
                month_taken: payload.month_taken,
                bmi: serverRow.bmi ?? computedBmi,
                category: serverRow.category ?? computedCategory,
              }
            }
            return serverRow
          })
        )
      }
      setIsBmiModalOpen(false)
      setEditingBmi(null)
      window.alert('BMI record updated successfully.')
    } catch (error) {
      window.alert('Failed to update BMI record: ' + (error?.message || 'Unknown error'))
    }
  }

  const handleDeleteBmi = async (id) => {
    if (!id) return
    if (!window.confirm('Delete this BMI record?')) return
    try {
      await adminDeleteOfficerBmi(id)
      const fresh = await adminGetOfficerBmi().catch(() => null)
      if (fresh) {
        setAdminBmiRecords(toArray(fresh))
      } else {
        setAdminBmiRecords((prev) => prev.filter((r) => r.id !== id))
      }
    } catch (error) {
      window.alert('Failed to delete BMI record: ' + (error?.message || 'Unknown error'))
    }
  }

  const openWalkTestModal = (test) => {
    setEditingWalkTest(test)
    
    // Parse the date to ensure it's in YYYY-MM-DD format as required by the backend
    let displayDate = test.test_date || ''
    if (displayDate) {
      const d = new Date(displayDate)
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        displayDate = `${yyyy}-${mm}-${dd}`
      }
    }

    setWalkTestEditForm({
      minutes: String(test.minutes || ''),
      seconds: String(test.seconds || '0'),
      test_date: displayDate,
      gender: test.gender || '',
      age: String(test.age || '')
    })
    setIsWalkTestModalOpen(true)
  }

  const handleSaveWalkTest = async () => {
    if (!editingWalkTest) return
    try {
      const normalizeYYYYMMDD = (v) => {
        const s = String(v ?? '').trim()
        if (!s) return ''
        // Already yyyy-mm-dd
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
        const d = new Date(s)
        if (!Number.isNaN(d.getTime())) {
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          return `${yyyy}-${mm}-${dd}`
        }
        return s
      }

      const age = parseInt(walkTestEditForm.age, 10) || 0
      const minutes = parseInt(walkTestEditForm.minutes, 10) || 0
      const secondsRaw = parseInt(walkTestEditForm.seconds, 10) || 0
      const seconds = Math.min(59, Math.max(0, secondsRaw))
      const gender = String(walkTestEditForm.gender || '').toLowerCase()
      const test_date = normalizeYYYYMMDD(walkTestEditForm.test_date)

      await adminUpdateWalkTest(editingWalkTest.id, {
        age,
        gender,
        minutes,
        seconds,
        test_date,
      })
      const freshTests = await adminGetWalkTests()
      setAdminWalkTests(freshTests)
      setEditingWalkTest(null)
      setIsWalkTestModalOpen(false)
    } catch (error) {
      console.error("Backend Error:", error)
      window.alert('Failed to update walk test: ' + error.message)
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
      setOfficerWalkRecords(updatedWalkRecords)
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

  const handleSubmitBmi = async () => {
    const height = parseFloat(bmiForm.height_meter)
    const weight = parseFloat(bmiForm.weight_kg)
    const monthTaken = String(bmiForm.month_taken || '').trim()
    if (Number.isNaN(height) || height <= 0) {
      setBmiMessage('Please enter a valid height in meters.')
      return
    }
    if (Number.isNaN(weight) || weight <= 0) {
      setBmiMessage('Please enter a valid weight in kilograms.')
      return
    }
    if (!monthTaken) {
      setBmiMessage('Please select month taken.')
      return
    }

    try {
      setBmiMessage('Saving BMI record...')
      await officerCreateBmi({
        height_meter: height,
        weight_kg: weight,
        month_taken: monthTaken,
      })
      const fresh = await officerGetBmi().catch(() => [])
      setOfficerBmiRecords(toArray(fresh))
      setBmiMessage('BMI record created successfully.')
      setIsAddingBmi(false)
      setBmiForm({ height_meter: '', weight_kg: '', month_taken: '' })
    } catch (error) {
      setBmiMessage(error.message || 'Failed to create BMI record.')
    }
  }

  useEffect(() => {
    if (!isAuthenticated || isAdmin || activePage !== 'dashboard') return
    if (officerDashboardTab !== 'bmi') return
    ;(async () => {
      const fresh = await officerGetBmi().catch(() => [])
      setOfficerBmiRecords(toArray(fresh))
    })()
  }, [isAuthenticated, isAdmin, activePage, officerDashboardTab])

  useEffect(() => {
    if (!isAuthenticated || isAdmin || activePage !== 'dashboard') return
    if (officerDashboardTab !== 'pushup') return
    ;(async () => {
      setPushupMessage('')
      try {
        const fresh = await officerGetPushupRecords()
        setOfficerPushupRecords(normalizePushupRecords(fresh))
      } catch (error) {
        const msg = String(error?.message || '')
        if (msg.toLowerCase().includes('profile not found')) {
          setPushupMessage('Cannot load push-up records: Officer profile not found. Please complete your Officer Profile first.')
        } else {
          setPushupMessage(msg || 'Failed to load push-up records.')
        }
      }
    })()
  }, [isAuthenticated, isAdmin, activePage, officerDashboardTab])

  useEffect(() => {
    if (!isAuthenticated || isAdmin || activePage !== 'dashboard') return
    if (officerDashboardTab !== 'sprint') return
    ;(async () => {
      setSprintMessage('')
      try {
        const fresh = await officerGetSprintRecords()
        setOfficerSprintRecords(normalizeSprintRecords(fresh).filter(isSprintLikeRecord))
      } catch (error) {
        const msg = String(error?.message || '')
        if (msg.toLowerCase().includes('profile not found')) {
          setSprintMessage('Cannot load sprint records: Officer profile not found. Please complete your Officer Profile first.')
        } else {
          setSprintMessage(msg || 'Failed to load sprint records.')
        }
      }
    })()
  }, [isAuthenticated, isAdmin, activePage, officerDashboardTab])

  const handleSubmitSitup = async () => {
    const reps = parseInt(situpForm.reps, 10)
    const age = parseInt(situpForm.age, 10)
    if (Number.isNaN(reps) || reps < 0) {
      setSitupMessage('Please enter valid reps.')
      return
    }
    if (Number.isNaN(age) || age < 0) {
      setSitupMessage('Please enter valid age.')
      return
    }
    try {
      setSitupMessage('Saving sit-up record...')
      await officerCreateSitupRecord({
        reps,
        age,
        gender: situpForm.gender,
        test_date: situpForm.test_date || undefined,
      })
      const fresh = await officerGetSitupRecords().catch(() => [])
      setOfficerSitupRecords(toArray(fresh))
      setSitupMessage('Sit-up record created successfully.')
      setIsAddingSitup(false)
      setSitupForm({ reps: '', age: '', gender: 'male', test_date: '' })
    } catch (error) {
      setSitupMessage(error.message || 'Failed to create sit-up record.')
    }
  }

  const handleSubmitPushup = async () => {
    const reps = parseInt(pushupForm.reps, 10)
    const age = parseInt(pushupForm.age, 10)
    const testDate = String(pushupForm.test_date || '').trim()
    if (Number.isNaN(reps) || reps < 0) {
      setPushupMessage('Please enter valid reps.')
      return
    }
    if (Number.isNaN(age) || age < 0) {
      setPushupMessage('Please enter valid age.')
      return
    }
    if (!testDate) {
      setPushupMessage('Please select test month/date.')
      return
    }
    try {
      setPushupMessage('Saving push-up record...')
      const created = await officerCreatePushupRecord({
        reps,
        age,
        gender: pushupForm.gender,
        test_date: testDate,
      })
      if (created && typeof created === 'object' && !Array.isArray(created) && isPushupLikeRecord(created)) {
        setOfficerPushupRecords((prev) => {
          const next = [created, ...prev]
          const seen = new Set()
          return next.filter((r, idx) => {
            const key = r?.id ?? `tmp-${idx}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
        })
      }
      const fresh = await officerGetPushupRecords().catch(() => [])
      const normalized = normalizePushupRecords(fresh)
      if (normalized.length > 0) {
        setOfficerPushupRecords(normalized)
      } else {
        setOfficerPushupRecords((prev) => prev.filter((x) => x && typeof x === 'object'))
      }
      setPushupMessage('Push-up record created successfully.')
      setIsAddingPushup(false)
      setPushupForm({ reps: '', age: '', gender: 'male', test_date: '' })
    } catch (error) {
      const msg = String(error?.message || '')
      if (msg.toLowerCase().includes('profile not found')) {
        setPushupMessage('Cannot create push-up record: Officer profile not found. Please complete your Officer Profile first.')
      } else {
        setPushupMessage(msg || 'Failed to create push-up record.')
      }
    }
  }

  const handleSubmitSprint = async () => {
    try {
      setSprintMessage('Saving sprint record...')
      await officerCreateSprintRecord({
        minutes: parseInt(sprintForm.minutes, 10) || 0,
        seconds: parseInt(sprintForm.seconds, 10) || 0,
        age: parseInt(sprintForm.age, 10) || 0,
        gender: sprintForm.gender,
      })
      const fresh = await officerGetSprintRecords().catch(() => [])
      setOfficerSprintRecords(normalizeSprintRecords(fresh).filter(isSprintLikeRecord))
      setSprintMessage('Sprint record created successfully.')
      setIsAddingSprint(false)
      setSprintForm({ minutes: '', seconds: '0', age: '', gender: 'male' })
    } catch (error) {
      setSprintMessage(error.message || 'Failed to create sprint record.')
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setGender('')
    setAgeMin('')
    setAgeMax('')
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
    const oid = String(officerId)

    // First check users (officer profiles) since they contain full profile data
    const userMatch = users.find(
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

    // Fallback to accounts if users isn't loaded
    const match = accounts.find(
      (account) =>
        idsMatch(account?.id, oid) ||
        idsMatch(account?.officer_id, oid) ||
        idsMatch(account?.officer_profile_id, oid) ||
        idsMatch(account?.account_id, oid) ||
        idsMatch(account?.user_id, oid)
    )

    const name = match ? getUserDisplayName(match) || match.email : null

    if (name) {
      return name
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

  const adminDashboardRows = useMemo(() => {
    if (!isAdmin || !users) return []
    const combinedRows = []
    const processedTestIds = new Set()
    
    // We only filter by dashboardSearch
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
      adminWalkTests.forEach(t => {
        if (!processedTestIds.has(t.id)) {
          const officerName = getOfficerName ? getOfficerName(t.officer_id) : `Officer ${t.officer_id}`
          if (!qLower || officerName.toLowerCase().includes(qLower)) {
            combinedRows.push({ type: 'orphan', u: null, test: t, uName: officerName, isFirst: true })
          }
        }
      })
    }
    return combinedRows
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, users, adminWalkTests, dashboardSearch])

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
          <a
            className={`nav-item ${activePage === 'officerProfile' ? 'active' : ''}`}
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setActivePage('officerProfile')
            }}
          >
            <span className="icon">🪪</span> Officer Profile
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
                {activePage === 'officerProfile' && 'Main / Officer Profile'}
                {activePage === 'user' && 'Management / Users'}
                {activePage === 'settings' && 'System / Settings'}
              </div>
              <div className="page-title">
                {activePage === 'dashboard' && 'Dashboard Overview'}
                {activePage === 'officerProfile' && 'Officer Profile'}
                {activePage === 'user' && 'User Registry'}
                {activePage === 'settings' && 'Settings'}
              </div>
            </div>
          </div>
          <div className="topbar-right">
            <button
              className="topbar-btn"
              title="Refresh"
              type="button"
              onClick={() => {
                refreshProfilePage()
              }}
            >
              ↻
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          {activePage === 'dashboard' && (
            <div className="dashboard-go-nogo user-root">
              {!isAdmin && (
                <OfficerExercises
                  officerDashboardTab={officerDashboardTab}
                  setOfficerDashboardTab={setOfficerDashboardTab}
                  isAddingWalkTest={isAddingWalkTest}
                  setIsAddingWalkTest={setIsAddingWalkTest}
                  walkTestForm={walkTestForm}
                  setWalkTestForm={setWalkTestForm}
                  handleSubmitWalkTest={handleSubmitWalkTest}
                  walkTestMessage={walkTestMessage}
                  officerWalkRecords={officerWalkRecords}
                  isAddingBmi={isAddingBmi}
                  setIsAddingBmi={setIsAddingBmi}
                  bmiForm={bmiForm}
                  setBmiForm={setBmiForm}
                  handleSubmitBmi={handleSubmitBmi}
                  bmiMessage={bmiMessage}
                  officerBmiRecords={officerBmiRecords}
                  isAddingSitup={isAddingSitup}
                  setIsAddingSitup={setIsAddingSitup}
                  situpForm={situpForm}
                  setSitupForm={setSitupForm}
                  handleSubmitSitup={handleSubmitSitup}
                  situpMessage={situpMessage}
                  officerSitupRecords={officerSitupRecords}
                  isAddingPushup={isAddingPushup}
                  setIsAddingPushup={setIsAddingPushup}
                  pushupForm={pushupForm}
                  setPushupForm={setPushupForm}
                  handleSubmitPushup={handleSubmitPushup}
                  pushupMessage={pushupMessage}
                  officerPushupRecords={officerPushupRecords}
                  isAddingSprint={isAddingSprint}
                  setIsAddingSprint={setIsAddingSprint}
                  sprintForm={sprintForm}
                  setSprintForm={setSprintForm}
                  handleSubmitSprint={handleSubmitSprint}
                  sprintMessage={sprintMessage}
                  officerSprintRecords={officerSprintRecords}
                />
              )}

              {isAdmin && (
                <div className="user-panel" style={{ marginTop: 24 }}>
                  <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="user-title">Admin Dashboard Records</h2>
                    <div className="user-filter-group user-search" style={{ margin: 0, minWidth: 250 }}>
                      <input
                        type="text"
                        value={dashboardSearch}
                        onChange={(e) => setDashboardSearch(e.target.value)}
                        placeholder="Search officer name..."
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
                      />
                    </div>
                  </div>
                  <div className="admin-record-tabs" style={{ marginBottom: 12 }}>
                    <button type="button" className={`admin-record-tab ${dashboardAdminTab === 'walk' ? 'active' : ''}`} onClick={() => setDashboardAdminTab('walk')}>
                      Walk Test
                    </button>
                    <button type="button" className={`admin-record-tab ${dashboardAdminTab === 'bmi' ? 'active' : ''}`} onClick={() => setDashboardAdminTab('bmi')}>
                      BMI
                    </button>
                    <button type="button" className={`admin-record-tab ${dashboardAdminTab === 'situp' ? 'active' : ''}`} onClick={() => setDashboardAdminTab('situp')}>
                      1 Min Sit-up
                    </button>
                    <button type="button" className={`admin-record-tab ${dashboardAdminTab === 'pushup' ? 'active' : ''}`} onClick={() => setDashboardAdminTab('pushup')}>
                      Push-up
                    </button>
                    <button type="button" className={`admin-record-tab ${dashboardAdminTab === 'sprint' ? 'active' : ''}`} onClick={() => setDashboardAdminTab('sprint')}>
                      300m Sprint
                    </button>
                  </div>
                  <p className="dashboard-subtitle">Read-only view of officer test records by section.</p>
                  <div className="table-wrap">
                    {dashboardAdminTab === 'walk' && (
                      <>
                        <table className="user-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Police GO / NO GO</th>
                              <th>Gender</th>
                              <th>Age</th>
                              <th>Time</th>
                              <th>Grade</th>
                              <th>Test Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminDashboardRows.map((row) => {
                              const { type, u, test, uName } = row
                              if (type === 'user') {
                                return (
                                  <tr key={`user-${u.id}`}>
                                    <td>{u.id}</td>
                                    <td>{uName}</td>
                                    <td>{u.policeGoNoGo ?? '—'}</td>
                                    <td>{u.gender}</td>
                                    <td>{u.age}</td>
                                    <td>—</td>
                                    <td>—</td>
                                    <td>—</td>
                                  </tr>
                                )
                              } else if (type === 'mixed') {
                                return (
                                  <tr key={`mixed-${u.id}-${test.id}`}>
                                    <td>{u.id}</td>
                                    <td>{uName}</td>
                                    <td>{u.policeGoNoGo ?? '—'}</td>
                                    <td>{test.gender || u.gender}</td>
                                    <td>{test.age || u.age}</td>
                                    <td>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                                    <td>{test.grade}</td>
                                    <td>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                                  </tr>
                                )
                              }
                              return (
                                <tr key={`orphan-${test.id}`}>
                                  <td>{test.officer_id}</td>
                                  <td>{uName}</td>
                                  <td>—</td>
                                  <td>{test.gender}</td>
                                  <td>{test.age}</td>
                                  <td>{test.time_formatted || `${test.minutes}:${String(test.seconds).padStart(2, '0')}`}</td>
                                  <td>{test.grade}</td>
                                  <td>{test.test_date ? new Date(test.test_date).toLocaleDateString() : '—'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                        {adminDashboardRows.length === 0 && <p className="dashboard-empty">No results match your search.</p>}
                      </>
                    )}

                    {dashboardAdminTab === 'bmi' && (
                      <>
                        <table className="user-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Officer</th>
                              <th>Height (m)</th>
                              <th>Weight (kg)</th>
                              <th>BMI</th>
                              <th>Category</th>
                              <th>Month Taken</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminBmiRecords
                              .filter((r) => {
                                const q = dashboardSearch.trim().toLowerCase()
                                if (!q) return true
                                return getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q)
                              })
                              .map((r, i) => (
                                <tr key={`dash-bmi-${r.id ?? i}`}>
                                  <td>{r.id ?? '—'}</td>
                                  <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                                  <td>
                                    {(() => {
                                      const v = r.height_meter ?? r.height
                                      const n = parseFloat(v)
                                      return Number.isNaN(n) ? '—' : n.toFixed(2)
                                    })()}
                                  </td>
                                  <td>{r.weight_kg ?? r.weight ?? '—'}</td>
                                  <td>{r.bmi ?? '—'}</td>
                                  <td>{r.category ?? '—'}</td>
                                  <td>{r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </>
                    )}

                    {dashboardAdminTab === 'situp' && (
                      <table className="user-table">
                        <thead>
                          <tr>
                            <th>Officer</th>
                            <th>Count</th>
                            <th>Grade</th>
                            <th>Test Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminSitupRecords
                            .filter((r) => {
                              const q = dashboardSearch.trim().toLowerCase()
                              if (!q) return true
                              return getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q)
                            })
                            .map((r, i) => (
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

                    {dashboardAdminTab === 'pushup' && (
                      <table className="user-table">
                        <thead>
                          <tr>
                            <th>Officer</th>
                            <th>Count</th>
                            <th>Grade</th>
                            <th>Test Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminPushupRecords
                            .filter((r) => {
                              const q = dashboardSearch.trim().toLowerCase()
                              if (!q) return true
                              return getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q)
                            })
                            .map((r, i) => (
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

                    {dashboardAdminTab === 'sprint' && (
                      <table className="user-table">
                        <thead>
                          <tr>
                            <th>Officer</th>
                            <th>Time</th>
                            <th>Grade</th>
                            <th>Test Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminSprintRecords
                            .filter((r) => {
                              const q = dashboardSearch.trim().toLowerCase()
                              if (!q) return true
                              return getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q)
                            })
                            .map((r, i) => (
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
              )}
            </div>
          )}
          {activePage === 'officerProfile' && (
            <div className="profile-page">
              <div className="profile-hero">
                <div className="profile-avatar">{getInitials(userName || 'Officer')}</div>
                <div style={{ flex: 1 }}>
                  <h2>{isAdmin ? 'Admin Account Profile' : 'Officer Account Profile'}</h2>
                  <p>
                    {isAdmin
                      ? 'Administrator details from the server.'
                      : 'View only — data from GET /auth/officer/profile and GET /auth/officer/info.'}
                  </p>
                </div>
              </div>

              {officerProfileError && (
                <div
                  className="profile-banner profile-banner--error"
                  role="alert"
                >
                  {officerProfileError}
                </div>
              )}

              {!isAdmin && officerProfileLoading && !accounts?.[0] && (
                <p className="profile-loading">Loading profile…</p>
              )}

              <div className="profile-grid">
                {(() => {
                  const src = isAdmin
                    ? adminProfileForPage || {}
                    : accounts?.[0] || {}
                  const profileName =
                    getUserDisplayName(src) ||
                    userName ||
                    `${src?.first_name || ''} ${src?.last_name || ''}`.trim() ||
                    '—'
                  const loginId =
                    src?.badge_number ||
                    src?.badgeNumber ||
                    src?.username ||
                    src?.user_name ||
                    src?.email ||
                    src?.id ||
                    '—'
                  const goNoGo =
                    src?.policeGoNoGo || src?.police_go_no_go || src?.go_no_go || '—'

                  if (!isAdmin) {
                    const o = src
                    const accountEmail =
                      officerInfo?.email ??
                      officerInfo?.user_email ??
                      o?.email ??
                      '—'
                    return (
                      <div className="profile-card profile-card--full">
                        <h3>Officer profile</h3>
                        <div className="profile-fields">
                          <div className="profile-field">
                            <label>First name</label>
                            <span>{o?.first_name || '—'}</span>
                          </div>
                          <div className="profile-field">
                            <label>Last name</label>
                            <span>{o?.last_name || '—'}</span>
                          </div>
                          <div className="profile-field">
                            <label>Middle name</label>
                            <span>{o?.middle_name || '—'}</span>
                          </div>
                          <div className="profile-field">
                            <label>Email</label>
                            <span>{accountEmail}</span>
                          </div>
                          <div className="profile-field">
                            <label>Sex</label>
                            <span>{formatSexDisplay(o?.sex ?? o?.gender)}</span>
                          </div>
                          <div className="profile-field">
                            <label>Birthday</label>
                            <span>{formatBirthdayDisplay(o?.birthday)}</span>
                          </div>
                          <div className="profile-field">
                            <label>Office unit</label>
                            <span>{o?.office_unit || '—'}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <>
                      <div className="profile-card">
                        <h3>Identity</h3>
                        <div className="profile-fields">
                          <div className="profile-field">
                            <label>Full Name</label>
                            <span>{profileName}</span>
                          </div>
                          <div className="profile-field">
                            <label>Role</label>
                            <span>Administrator</span>
                          </div>
                          <div className="profile-field">
                            <label>Login / Badge</label>
                            <span>{loginId}</span>
                          </div>
                          <div className="profile-field">
                            <label>Email</label>
                            <span>{src?.email || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="profile-card">
                        <h3>Profile Details</h3>
                        <div className="profile-fields">
                          <div className="profile-field">
                            <label>Phone</label>
                            <span>{src?.phone || src?.phone_number || '—'}</span>
                          </div>
                          <div className="profile-field">
                            <label>Gender</label>
                            <span>{src?.gender || '—'}</span>
                          </div>
                          <div className="profile-field">
                            <label>Age</label>
                            <span>{src?.age ?? '—'}</span>
                          </div>
                          <div className="profile-field">
                            <label>Location</label>
                            <span>{src?.location || src?.city || '—'}</span>
                          </div>
                          <div className="profile-field">
                            <label>GO / NO GO</label>
                            <span>{goNoGo}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
          {activePage === 'user' && isAdmin && (
            <div className="user-root">
              <div className="admin-record-tabs">
                <button
                  type="button"
                  className={`admin-record-tab ${adminRecordsTab === 'walk' ? 'active' : ''}`}
                  onClick={() => setAdminRecordsTab('walk')}
                >
                  Walk Test Records
                </button>
                <button
                  type="button"
                  className={`admin-record-tab ${adminRecordsTab === 'bmi' ? 'active' : ''}`}
                  onClick={() => setAdminRecordsTab('bmi')}
                >
                  BMI Test Record
                </button>
                <button
                  type="button"
                  className={`admin-record-tab ${adminRecordsTab === 'situp' ? 'active' : ''}`}
                  onClick={() => setAdminRecordsTab('situp')}
                >
                  1 Min Sit-up Records
                </button>
                <button
                  type="button"
                  className={`admin-record-tab ${adminRecordsTab === 'pushup' ? 'active' : ''}`}
                  onClick={() => setAdminRecordsTab('pushup')}
                >
                  Push-up Test Record
                </button>
                <button
                  type="button"
                  className={`admin-record-tab ${adminRecordsTab === 'sprint' ? 'active' : ''}`}
                  onClick={() => setAdminRecordsTab('sprint')}
                >
                  300 Meters Sprint Test Record
                </button>
              </div>

              {adminRecordsTab === 'walk' && (
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
                  onDeleteWalkTest={handleDeleteWalkTest}
                  onEditWalkTest={openWalkTestModal}
                  search={search}
                  setSearch={setSearch}
                  gender={gender}
                  setGender={setGender}
                  ageMin={ageMin}
                  setAgeMin={setAgeMin}
                  ageMax={ageMax}
                  setAgeMax={setAgeMax}
                  goNoGo={goNoGo}
                  setGoNoGo={setGoNoGo}
                  onResetFilters={handleResetFilters}
                  onExportFiltered={handleExportFiltered}
                  onExportAll={handleExportAll}
                  adminWalkTests={adminWalkTests}
                  getOfficerName={getOfficerName}
                />
              )}

              {adminRecordsTab === 'bmi' && (
              <div className="user-panel">
                <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="user-title">BMI Test Record</h2>
                  <div className="user-filter-group user-search" style={{ margin: 0, minWidth: 250 }}>
                    <input
                      type="text"
                      value={bmiSearch}
                      onChange={(e) => setBmiSearch(e.target.value)}
                      placeholder="Search officer name..."
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}
                    />
                  </div>
                </div>
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Officer Profile ID</th>
                      <th>Officer</th>
                      <th>Height (m)</th>
                      <th>Weight (kg)</th>
                      <th>BMI</th>
                      <th>Category</th>
                      <th>Month Taken</th>
                      <th style={{ minWidth: 220 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminBmiRecords
                      .filter((r) => {
                        const q = bmiSearch.trim().toLowerCase()
                        if (!q) return true
                        return getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)
                          .toLowerCase()
                          .includes(q)
                      })
                      .map((r, i) => (
                      <tr key={`bmi-${r.id ?? i}`}>
                        <td>{r.id ?? '—'}</td>
                        <td>{r.officer_profile_id ?? r.officer_id ?? '—'}</td>
                        <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                        <td>
                          {(() => {
                            const v = r.height_meter ?? r.height ?? r.height_cm
                            const n = parseFloat(v)
                            return Number.isNaN(n) ? '—' : n.toFixed(2)
                          })()}
                        </td>
                        <td>{r.weight_kg ?? r.weight ?? '—'}</td>
                        <td>{r.bmi ?? r.bmi_value ?? '—'}</td>
                        <td>{r.category ?? r.status ?? '—'}</td>
                        <td>{r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—'}</td>
                        <td style={{ minWidth: 220 }}>
                          <div
                            className="user-action-btns"
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'nowrap',
                              alignItems: 'center',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <button type="button" className="user-btn-edit" onClick={() => openBmiModal(r)}>
                              Edit BMI
                            </button>
                            <button type="button" className="user-btn-delete" onClick={() => handleDeleteBmi(r.id)}>
                              Delete BMI
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminBmiRecords.filter((r) => {
                  const q = bmiSearch.trim().toLowerCase()
                  if (!q) return true
                  return getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)
                    .toLowerCase()
                    .includes(q)
                }).length === 0 && <p className="dashboard-empty">No BMI records match your search.</p>}
              </div>
              )}

              {adminRecordsTab === 'situp' && (
              <div className="user-panel">
                <div className="user-header-row">
                  <h2 className="user-title">1 Min Sit-up Records</h2>
                </div>
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Officer</th>
                      <th>Count</th>
                      <th>Grade</th>
                      <th>Test Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSitupRecords.map((r, i) => (
                      <tr key={`situp-${r.id ?? i}`}>
                        <td>{getOfficerName(r.officer_id || r.account_id || r.user_id)}</td>
                        <td>{r.count ?? r.reps ?? r.situp_count ?? '—'}</td>
                        <td>{r.grade ?? '—'}</td>
                        <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminSitupRecords.length === 0 && <p className="dashboard-empty">No sit-up records found.</p>}
              </div>
              )}

              {adminRecordsTab === 'pushup' && (
              <div className="user-panel">
                <div className="user-header-row">
                  <h2 className="user-title">Push-up Test Record</h2>
                </div>
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Officer</th>
                      <th>Count</th>
                      <th>Grade</th>
                      <th>Test Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminPushupRecords.map((r, i) => (
                      <tr key={`pushup-${r.id ?? i}`}>
                        <td>{getOfficerName(r.officer_id || r.account_id || r.user_id)}</td>
                        <td>{r.count ?? r.reps ?? r.pushup_count ?? '—'}</td>
                        <td>{r.grade ?? '—'}</td>
                        <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminPushupRecords.length === 0 && <p className="dashboard-empty">No push-up records found.</p>}
              </div>
              )}

              {adminRecordsTab === 'sprint' && (
              <div className="user-panel">
                <div className="user-header-row">
                  <h2 className="user-title">300 Meters Sprint Test Record</h2>
                </div>
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Officer</th>
                      <th>Time</th>
                      <th>Grade</th>
                      <th>Test Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSprintRecords.map((r, i) => (
                      <tr key={`sprint-${r.id ?? i}`}>
                        <td>{getOfficerName(r.officer_id || r.account_id || r.user_id)}</td>
                        <td>{r.time_formatted || `${r.minutes ?? '0'}:${String(r.seconds ?? 0).padStart(2, '0')}`}</td>
                        <td>{r.grade ?? '—'}</td>
                        <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminSprintRecords.length === 0 && <p className="dashboard-empty">No sprint records found.</p>}
              </div>
              )}
            </div>
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

      <ExerciseModals
        isWalkTestModalOpen={isWalkTestModalOpen}
        editingWalkTest={editingWalkTest}
        setIsWalkTestModalOpen={setIsWalkTestModalOpen}
        setEditingWalkTest={setEditingWalkTest}
        walkTestEditForm={walkTestEditForm}
        setWalkTestEditForm={setWalkTestEditForm}
        handleSaveWalkTest={handleSaveWalkTest}
        isBmiModalOpen={isBmiModalOpen}
        editingBmi={editingBmi}
        setIsBmiModalOpen={setIsBmiModalOpen}
        setEditingBmi={setEditingBmi}
        bmiEditForm={bmiEditForm}
        setBmiEditForm={setBmiEditForm}
        handleSaveBmi={handleSaveBmi}
      />
    </>
  )
}

export default App
