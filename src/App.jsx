import { useMemo, useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import './CSS/App.css'
import './CSS/Toast.css'

import { useToastState, ToastContainer } from './Toast.jsx'
import { useConfirmDialog } from './ConfirmDialog.jsx'
import GradeBadge, { StatusBadge } from './GradeBadge.jsx'
import EmptyState from './EmptyState.jsx'

/* ── Extracted Modules ── */
import Login from './Login.jsx'
import User from './user.jsx'
import OfficerExercises from './OfficerExercises.jsx'
import ExerciseModals from './ExerciseModals.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import StatCards from './StatCards.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import OfficerProfile from './OfficerProfile.jsx'
import Settings from './Settings.jsx'
import UserFormModal from './UserFormModal.jsx'

/* ── Shared Utilities ── */
import {
  getUserDisplayName,
  normalizeUserRecord,
  toArray,
  normalizePushupRecords,
  normalizeSprintRecords,
  isPushupLikeRecord,
  isSprintLikeRecord,
  normalizeDate,
  normalizeGoNoGo,
  idsMatch,
  getOfficerName as getOfficerNameUtil,
  EMPTY_ADD_FORM,
  getBmiHeight,
} from './utils.js'

/* ── API Functions ── */
import {
  officerCreateProfile,
  officerGetProfile,
  getOfficerInfo,
  officerGetWalkTests,
  officerCreateWalkTest,
  officerGetBmi,
  officerCreateBmi,
  officerCreateOtherBmi,
  officerCreateOtherSprint,
  officerCreateOtherPushup,
  officerCreateOtherSitup,
  officerCreateOtherWalkTest,
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
  adminUpdateSitupRecord,
  adminDeleteSitupRecord,
  adminGetPushupRecords,
  adminUpdatePushupRecord,
  adminDeletePushupRecord,
  adminGetSprintRecords,
  adminUpdateSprintRecord,
  adminDeleteSprintRecord,
  adminGetAllOfficerProfiles,
  adminUpdateWalkTest,
  adminDeleteWalkTest,
  adminGetSummary,
  createUser,
  updateUser,
  deleteUser,
} from './api.js'

/* ============================================================
   APP COMPONENT
   ============================================================ */

function App() {
  /* ── Toast & Confirm Dialog ── */
  const { toasts, toast, dismiss: dismissToast } = useToastState()
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  /* ── Authentication State ── */
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState('admin')
  const [userName, setUserName] = useState('Ofc. J. Rivera')
  const [loginError, setLoginError] = useState('')

  /* ── UI State ── */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  /* ── Data State ── */
  const [accounts, setAccounts] = useState([])
  const [users, setUsers] = useState([])
  const [officerInfo, setOfficerInfo] = useState(null)
  const [adminProfileForPage, setAdminProfileForPage] = useState(null)

  /* ── Admin Records ── */
  const [adminWalkTests, setAdminWalkTests] = useState([])
  const [adminBmiRecords, setAdminBmiRecords] = useState([])
  const [adminSitupRecords, setAdminSitupRecords] = useState([])
  const [adminPushupRecords, setAdminPushupRecords] = useState([])
  const [adminSprintRecords, setAdminSprintRecords] = useState([])
  const [adminSummary, setAdminSummary] = useState([])

  /* ── Officer Records ── */
  const [officerWalkRecords, setOfficerWalkRecords] = useState([])
  const [officerBmiRecords, setOfficerBmiRecords] = useState([])
  const [officerSitupRecords, setOfficerSitupRecords] = useState([])
  const [officerPushupRecords, setOfficerPushupRecords] = useState([])
  const [officerSprintRecords, setOfficerSprintRecords] = useState([])

  /* ── Profile Page State ── */
  const [officerProfileLoading, setOfficerProfileLoading] = useState(false)
  const [officerProfileError, setOfficerProfileError] = useState('')

  /* ── Officer Exercise Forms ── */
  const [officerDashboardTab, setOfficerDashboardTab] = useState('walk')
  const [isAddingWalkTest, setIsAddingWalkTest] = useState(false)
  const [walkTestForm, setWalkTestForm] = useState({ gender: 'male', minutes: '18', seconds: '0', test_date: '3-29-2026', age: '25' })
  const [walkTestMessage, setWalkTestMessage] = useState('')
  const [isAddingBmi, setIsAddingBmi] = useState(false)
  const [bmiForm, setBmiForm] = useState({ height_meter: '', weight_kg: '', month_taken: '' })
  const [bmiMessage, setBmiMessage] = useState('')
  const [isAddingSitup, setIsAddingSitup] = useState(false)
  const [situpForm, setSitupForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })
  const [situpMessage, setSitupMessage] = useState('')
  const [isAddingPushup, setIsAddingPushup] = useState(false)
  const [pushupForm, setPushupForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })
  const [pushupMessage, setPushupMessage] = useState('')
  const [isAddingSprint, setIsAddingSprint] = useState(false)
  const [sprintForm, setSprintForm] = useState({ minutes: '', seconds: '0', age: '', gender: 'male' })
  const [sprintMessage, setSprintMessage] = useState('')

  /* ── Admin Dashboard / User Management State ── */
  const [dashboardSearch, setDashboardSearch] = useState('')
  const [dashboardAdminTab, setDashboardAdminTab] = useState('walk')
  const [adminRecordsTab, setAdminRecordsTab] = useState('walk')
  const [bmiSearch, setBmiSearch] = useState('')
  const [situpSearch, setSitupSearch] = useState('')
  const [pushupSearch, setPushupSearch] = useState('')
  const [sprintSearch, setSprintSearch] = useState('')
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [goNoGo, setGoNoGo] = useState('')

  /* ── Modal State ── */
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM)
  const [isWalkTestModalOpen, setIsWalkTestModalOpen] = useState(false)
  const [editingWalkTest, setEditingWalkTest] = useState(null)
  const [walkTestEditForm, setWalkTestEditForm] = useState({ minutes: '', seconds: '0', test_date: '', gender: '', age: '' })
  const [isBmiModalOpen, setIsBmiModalOpen] = useState(false)
  const [editingBmi, setEditingBmi] = useState(null)
  const [bmiEditForm, setBmiEditForm] = useState({ height_meter: '', weight_kg: '', month_taken: '' })
  const [isSitupModalOpen, setIsSitupModalOpen] = useState(false)
  const [editingSitup, setEditingSitup] = useState(null)
  const [situpEditForm, setSitupEditForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })
  const [isPushupModalOpen, setIsPushupModalOpen] = useState(false)
  const [editingPushup, setEditingPushup] = useState(null)
  const [pushupEditForm, setPushupEditForm] = useState({ reps: '', age: '', gender: 'male', test_date: '' })
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)
  const [sprintEditForm, setSprintEditForm] = useState({ minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })

  const [isAddOtherBmiModalOpen, setIsAddOtherBmiModalOpen] = useState(false)
  const [addOtherBmiForm, setAddOtherBmiForm] = useState({ officer_profile_id: '', height_meter: '', weight_kg: '', month_taken: '' })

  const [isAddOtherSprintModalOpen, setIsAddOtherSprintModalOpen] = useState(false)
  const [addOtherSprintForm, setAddOtherSprintForm] = useState({ officer_id: '', minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })

  const [isAddOtherPushupModalOpen, setIsAddOtherPushupModalOpen] = useState(false)
  const [addOtherPushupForm, setAddOtherPushupForm] = useState({ officer_id: '', reps: '', age: '', gender: 'male', test_date: '' })

  const [isAddOtherSitupModalOpen, setIsAddOtherSitupModalOpen] = useState(false)
  const [addOtherSitupForm, setAddOtherSitupForm] = useState({ officer_id: '', reps: '', age: '', gender: 'male', test_date: '' })

  const [isAddOtherWalkTestModalOpen, setIsAddOtherWalkTestModalOpen] = useState(false)
  const [addOtherWalkTestForm, setAddOtherWalkTestForm] = useState({ officer_id: '', minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })

  const [dashboardGoNoGo, setDashboardGoNoGo] = useState('')

  /* ── Derived Values ── */
  const isAdmin = userRole === 'admin'

  // Bind getOfficerName with current users/accounts
  const getOfficerName = (officerId) => getOfficerNameUtil(officerId, users, accounts)

  /* ============================================================
     EFFECTS — Data Fetching
     ============================================================ */

  useEffect(() => {
    setUsers([])
    setAccounts([])
  }, [])

  // Profile page loader
  useEffect(() => {
    if (!isAuthenticated || activePage !== 'officerProfile') return
    if (isAdmin) {
      setOfficerProfileError('')
      adminGetInfo().then(setAdminProfileForPage).catch(() => setAdminProfileForPage(null))
      return
    }
    let cancelled = false
      ; (async () => {
        setOfficerProfileLoading(true)
        setOfficerProfileError('')
        try {
          const [profileResult, infoResult] = await Promise.allSettled([officerGetProfile(), getOfficerInfo()])
          if (cancelled) return
          if (profileResult.status === 'fulfilled' && profileResult.value) {
            const data = profileResult.value
            setAccounts([data])
            const display = `${data?.first_name || ''} ${data?.last_name || ''}`.trim()
            if (display) setUserName(display)
          } else {
            setAccounts([])
            if (profileResult.status === 'rejected') setOfficerProfileError(profileResult.reason?.message || 'Failed to load profile')
          }
          if (infoResult.status === 'fulfilled' && infoResult.value) setOfficerInfo(infoResult.value)
          else setOfficerInfo(null)
        } catch (e) {
          if (!cancelled) setOfficerProfileError(e.message || 'Failed to load profile')
        } finally {
          if (!cancelled) setOfficerProfileLoading(false)
        }
      })()
    return () => { cancelled = true }
  }, [isAuthenticated, activePage, isAdmin])

  // Auto-refresh BMI when tab changes
  useEffect(() => {
    if (!isAuthenticated || isAdmin || activePage !== 'dashboard' || officerDashboardTab !== 'bmi') return
      ; (async () => { const fresh = await officerGetBmi().catch(() => []); setOfficerBmiRecords(toArray(fresh)) })()
  }, [isAuthenticated, isAdmin, activePage, officerDashboardTab])

  // Auto-refresh pushup when tab changes
  useEffect(() => {
    if (!isAuthenticated || isAdmin || activePage !== 'dashboard' || officerDashboardTab !== 'pushup') return
      ; (async () => {
        setPushupMessage('')
        try { const fresh = await officerGetPushupRecords(); setOfficerPushupRecords(normalizePushupRecords(fresh)) }
        catch (error) {
          const msg = String(error?.message || '')
          setPushupMessage(msg.toLowerCase().includes('profile not found')
            ? 'Cannot load push-up records: Officer profile not found. Please complete your Officer Profile first.'
            : msg || 'Failed to load push-up records.')
        }
      })()
  }, [isAuthenticated, isAdmin, activePage, officerDashboardTab])

  // Auto-refresh sprint when tab changes
  useEffect(() => {
    if (!isAuthenticated || isAdmin || activePage !== 'dashboard' || officerDashboardTab !== 'sprint') return
      ; (async () => {
        setSprintMessage('')
        try { const fresh = await officerGetSprintRecords(); setOfficerSprintRecords(normalizeSprintRecords(fresh).filter(isSprintLikeRecord)) }
        catch (error) {
          const msg = String(error?.message || '')
          setSprintMessage(msg.toLowerCase().includes('profile not found')
            ? 'Cannot load sprint records: Officer profile not found. Please complete your Officer Profile first.'
            : msg || 'Failed to load sprint records.')
        }
      })()
  }, [isAuthenticated, isAdmin, activePage, officerDashboardTab])

  // Auto-refresh admin summary when switching to overall score tab
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return
    const isOverallTabActive =
      (activePage === 'dashboard' && dashboardAdminTab === 'overall') ||
      (activePage === 'user' && adminRecordsTab === 'overall')
    
    if (!isOverallTabActive) return

    let cancelled = false;
    (async () => {
      try {
        const summaryRecords = await adminGetSummary()
        if (!cancelled) setAdminSummary(toArray(summaryRecords))
      } catch (error) {
        console.error('Failed to load admin summary:', error)
      }
    })()
    
    return () => { cancelled = true }
  }, [isAuthenticated, isAdmin, activePage, dashboardAdminTab, adminRecordsTab])

  /* ============================================================
     HANDLERS — Authentication
     ============================================================ */

  const handleLogin = async ({ email, password, userType, user }) => {
    try {
      if (user && (user.bearer_token || user.access_token || user.token)) {
        localStorage.setItem('authToken', user.bearer_token || user.access_token || user.token)
      }
      const role = userType === 'admin' ? 'admin' : 'officer'
      setUserRole(role)
      setUserName(email)
      setIsAuthenticated(true)
      setActivePage('dashboard')
      setLoginError('')

      if (role === 'admin') {
        const adminInfo = await adminGetInfo().catch(() => null)
        const officerProfiles = await adminGetAllOfficerProfiles().catch(() => [])
        const walkTests = await adminGetWalkTests().catch(() => [])
        const bmiRecords = await adminGetOfficerBmi().catch(() => [])
        const situpRecords = await adminGetSitupRecords().catch(() => [])
        const pushupRecords = await adminGetPushupRecords().catch(() => [])
        const sprintRecords = await adminGetSprintRecords().catch(() => [])
        const summaryRecords = await adminGetSummary().catch(() => [])
        setUserName(adminInfo?.username || adminInfo?.user_name || adminInfo?.email || email)
        const normalizedProfiles = Array.isArray(officerProfiles) ? officerProfiles.map(normalizeUserRecord) : []
        setAccounts(normalizedProfiles)
        setUsers(normalizedProfiles)
        setAdminWalkTests(walkTests)
        setAdminBmiRecords(toArray(bmiRecords))
        setAdminSitupRecords(toArray(situpRecords))
        setAdminPushupRecords(toArray(pushupRecords))
        setAdminSprintRecords(toArray(sprintRecords))
        setAdminSummary(toArray(summaryRecords))
      } else {
        const profile = await officerGetProfile().catch(() => null)
        const info = await getOfficerInfo().catch(() => null)
        const [walkRecords, bmiRecords, situpRecords, pushupRecords, sprintRecords] = await Promise.all([
          officerGetWalkTests().catch(() => []), officerGetBmi().catch(() => []),
          officerGetSitupRecords().catch(() => []), officerGetPushupRecords().catch(() => []),
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
    if (!name || !password || !role) { setLoginError('Please fill all fields to create account.'); return }
    try {
      if (apiResponse?.access_token) localStorage.setItem('authToken', apiResponse.access_token)
      setLoginError('Account created successfully! Please sign in.')
    } catch (error) {
      setLoginError(error.message || 'Failed to create account. Please try again.')
    }
  }

  const handleCreateOfficerProfile = async (profileData) => {
    try {
      setOfficerProfileLoading(true)
      await officerCreateProfile(profileData)
      await refreshProfilePage()
      toast.success('Profile created successfully!')
    } catch (error) {
      toast.error('Failed to create profile: ' + (error?.message || 'Unknown error'))
    } finally {
      setOfficerProfileLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserName('')
    setActivePage('dashboard')
    setOfficerInfo(null)
  }

  /* ============================================================
     HANDLERS — Data Refresh
     ============================================================ */

  const handleGlobalRefresh = async () => {
    if (activePage === 'officerProfile') {
      await refreshProfilePage()
      return
    }

    if (isAdmin) {
      try {
        const adminInfo = await adminGetInfo().catch(() => null)
        const officerProfiles = await adminGetAllOfficerProfiles().catch(() => [])
        const walkTests = await adminGetWalkTests().catch(() => [])
        const bmiRecords = await adminGetOfficerBmi().catch(() => [])
        const situpRecords = await adminGetSitupRecords().catch(() => [])
        const pushupRecords = await adminGetPushupRecords().catch(() => [])
        const sprintRecords = await adminGetSprintRecords().catch(() => [])
        const summaryRecords = await adminGetSummary().catch(() => [])

        if (adminInfo) setUserName(adminInfo?.username || adminInfo?.user_name || adminInfo?.email || userName)
        const normalizedProfiles = Array.isArray(officerProfiles) ? officerProfiles.map(normalizeUserRecord) : []
        setAccounts(normalizedProfiles)
        setUsers(normalizedProfiles)
        setAdminWalkTests(walkTests)
        setAdminBmiRecords(toArray(bmiRecords))
        setAdminSitupRecords(toArray(situpRecords))
        setAdminPushupRecords(toArray(pushupRecords))
        setAdminSprintRecords(toArray(sprintRecords))
        setAdminSummary(toArray(summaryRecords))
      } catch (error) {
        console.error('Refresh error:', error)
      }
    } else {
      try {
        const profile = await officerGetProfile().catch(() => null)
        const info = await getOfficerInfo().catch(() => null)
        const [walkRecords, bmiRecords, situpRecords, pushupRecords, sprintRecords] = await Promise.all([
          officerGetWalkTests().catch(() => []), officerGetBmi().catch(() => []),
          officerGetSitupRecords().catch(() => []), officerGetPushupRecords().catch(() => []),
          officerGetSprintRecords().catch(() => []),
        ])

        if (info) setOfficerInfo(info)
        if (profile) {
          const display = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || userName
          setUserName(display)
          setAccounts([profile])
        }
        setUsers(walkRecords)
        setOfficerWalkRecords(walkRecords)
        setOfficerBmiRecords(toArray(bmiRecords))
        setOfficerSitupRecords(toArray(situpRecords))
        setOfficerPushupRecords(normalizePushupRecords(pushupRecords))
        setOfficerSprintRecords(normalizeSprintRecords(sprintRecords))
      } catch (error) {
        console.error('Refresh error:', error)
      }
    }
  }

  /* ============================================================
     HANDLERS — Profile Refresh
     ============================================================ */

  const refreshProfilePage = async () => {
    if (activePage !== 'officerProfile') return
    if (isAdmin) {
      try { setAdminProfileForPage(await adminGetInfo()) } catch { setAdminProfileForPage(null) }
      return
    }
    setOfficerProfileLoading(true)
    setOfficerProfileError('')
    try {
      const [profileResult, infoResult] = await Promise.allSettled([officerGetProfile(), getOfficerInfo()])
      if (profileResult.status === 'fulfilled' && profileResult.value) {
        const data = profileResult.value
        setAccounts([data])
        const display = `${data?.first_name || ''} ${data?.last_name || ''}`.trim()
        if (display) setUserName(display)
      } else {
        setAccounts([])
        if (profileResult.status === 'rejected') setOfficerProfileError(profileResult.reason?.message || 'Failed to load profile')
      }
      if (infoResult.status === 'fulfilled' && infoResult.value) setOfficerInfo(infoResult.value)
      else setOfficerInfo(null)
    } catch (e) {
      setOfficerProfileError(e.message || 'Failed to load profile')
    } finally {
      setOfficerProfileLoading(false)
    }
  }

  /* ============================================================
     HANDLERS — Exercise Submissions
     ============================================================ */

  const handleSubmitWalkTest = async () => {
    if (!walkTestForm.gender || !walkTestForm.age || !walkTestForm.test_date || !walkTestForm.minutes) {
      setWalkTestMessage('Please fill in gender, age, minutes, and test date.'); return
    }
    try {
      setWalkTestMessage('Saving walk test record...')
      await officerCreateWalkTest({ gender: walkTestForm.gender, minutes: walkTestForm.minutes, seconds: walkTestForm.seconds || '0', test_date: walkTestForm.test_date, age: walkTestForm.age })
      const updatedWalkRecords = await officerGetWalkTests()
      setUsers(updatedWalkRecords); setOfficerWalkRecords(updatedWalkRecords)
      setWalkTestMessage('Walk test record created successfully.')
      setWalkTestForm((prev) => ({ ...prev, minutes: '', seconds: '0', age: '' }))
    } catch (error) { setWalkTestMessage(error.message || 'Failed to create walk test record.') }
  }

  const handleSubmitBmi = async () => {
    const height = parseFloat(bmiForm.height_meter), weight = parseFloat(bmiForm.weight_kg), monthTaken = String(bmiForm.month_taken || '').trim()
    if (Number.isNaN(height) || height <= 0) { setBmiMessage('Please enter a valid height in meters.'); return }
    if (Number.isNaN(weight) || weight <= 0) { setBmiMessage('Please enter a valid weight in kilograms.'); return }
    if (!monthTaken) { setBmiMessage('Please select month taken.'); return }
    try {
      setBmiMessage('Saving BMI record...')
      await officerCreateBmi({ height_meter: height, weight_kg: weight, month_taken: monthTaken })
      setOfficerBmiRecords(toArray(await officerGetBmi().catch(() => [])))
      setBmiMessage('BMI record created successfully.'); setIsAddingBmi(false)
      setBmiForm({ height_meter: '', weight_kg: '', month_taken: '' })
    } catch (error) { setBmiMessage(error.message || 'Failed to create BMI record.') }
  }

  const handleSubmitSitup = async () => {
    const reps = parseInt(situpForm.reps, 10), age = parseInt(situpForm.age, 10)
    if (Number.isNaN(reps) || reps < 0) { setSitupMessage('Please enter valid reps.'); return }
    if (Number.isNaN(age) || age < 0) { setSitupMessage('Please enter valid age.'); return }
    try {
      setSitupMessage('Saving sit-up record...')
      await officerCreateSitupRecord({ reps, age, gender: situpForm.gender, test_date: situpForm.test_date || undefined })
      setOfficerSitupRecords(toArray(await officerGetSitupRecords().catch(() => [])))
      setSitupMessage('Sit-up record created successfully.'); setIsAddingSitup(false)
      setSitupForm({ reps: '', age: '', gender: 'male', test_date: '' })
    } catch (error) { setSitupMessage(error.message || 'Failed to create sit-up record.') }
  }

  const handleSubmitPushup = async () => {
    const reps = parseInt(pushupForm.reps, 10), age = parseInt(pushupForm.age, 10), testDate = String(pushupForm.test_date || '').trim()
    if (Number.isNaN(reps) || reps < 0) { setPushupMessage('Please enter valid reps.'); return }
    if (Number.isNaN(age) || age < 0) { setPushupMessage('Please enter valid age.'); return }
    if (!testDate) { setPushupMessage('Please select test month/date.'); return }
    try {
      setPushupMessage('Saving push-up record...')
      const created = await officerCreatePushupRecord({ reps, age, gender: pushupForm.gender, test_date: testDate })
      const createdRecords = normalizePushupRecords(created)
      if (createdRecords.length > 0) {
        setOfficerPushupRecords((prev) => {
          const next = [...createdRecords, ...prev]; const seen = new Set()
          return next.filter((r, idx) => { const key = r?.id ?? `tmp-${idx}`; if (seen.has(key)) return false; seen.add(key); return true })
        })
      }

      const fresh = await officerGetPushupRecords().catch(() => [])
      const normalized = normalizePushupRecords(fresh)
      if (normalized.length > 0) setOfficerPushupRecords(normalized)
      else if (createdRecords.length === 0) setOfficerPushupRecords((prev) => prev.filter((x) => x && typeof x === 'object'))
      setPushupMessage('Push-up record created successfully.'); setIsAddingPushup(false)
      setPushupForm({ reps: '', age: '', gender: 'male', test_date: '' })
    } catch (error) {
      const msg = String(error?.message || '')
      setPushupMessage(msg.toLowerCase().includes('profile not found')
        ? 'Cannot create push-up record: Officer profile not found. Please complete your Officer Profile first.' : msg || 'Failed to create push-up record.')
    }
  }

  const handleSubmitSprint = async () => {
    try {
      setSprintMessage('Saving sprint record...')
      await officerCreateSprintRecord({ minutes: parseInt(sprintForm.minutes, 10) || 0, seconds: parseInt(sprintForm.seconds, 10) || 0, age: parseInt(sprintForm.age, 10) || 0, gender: sprintForm.gender })
      setOfficerSprintRecords(normalizeSprintRecords(await officerGetSprintRecords().catch(() => [])).filter(isSprintLikeRecord))
      setSprintMessage('Sprint record created successfully.'); setIsAddingSprint(false)
      setSprintForm({ minutes: '', seconds: '0', age: '', gender: 'male' })
    } catch (error) { setSprintMessage(error.message || 'Failed to create sprint record.') }
  }

  /* ============================================================
     HANDLERS — Admin CRUD & Officer Other Actions
     ============================================================ */

  const handleAddOtherBmi = async () => {
    const profileId = parseInt(addOtherBmiForm.officer_profile_id, 10)
    const height = parseFloat(addOtherBmiForm.height_meter)
    const weight = parseFloat(addOtherBmiForm.weight_kg)
    const monthTaken = normalizeDate(addOtherBmiForm.month_taken) || normalizeDate(new Date().toISOString())

    if (!profileId || Number.isNaN(profileId)) { toast.warning('Please enter a valid Officer Profile ID.'); return }
    if (!height || Number.isNaN(height)) { toast.warning('Please enter a valid height in meters.'); return }
    if (!weight || Number.isNaN(weight)) { toast.warning('Please enter a valid weight in kg.'); return }

    try {
      await officerCreateOtherBmi({ officer_profile_id: profileId, height_meter: height, weight_kg: weight, month_taken: monthTaken })
      toast.success('Other BMI record created successfully.')
      setIsAddOtherBmiModalOpen(false)
      setAddOtherBmiForm({ officer_profile_id: '', height_meter: '', weight_kg: '', month_taken: '' })

      if (isAdmin) {
        const fresh = await adminGetOfficerBmi().catch(() => null)
        if (fresh) setAdminBmiRecords(toArray(fresh))
      }
    } catch (error) { toast.error('Failed to create other BMI record: ' + (error?.message || 'Unknown error')) }
  }

  const handleAddOtherSprint = async () => {
    const officerId = parseInt(addOtherSprintForm.officer_id, 10)
    const minutes = parseInt(addOtherSprintForm.minutes, 10) || 0
    const seconds = parseInt(addOtherSprintForm.seconds, 10) || 0
    const age = parseInt(addOtherSprintForm.age, 10)
    const gender = addOtherSprintForm.gender
    const testDate = normalizeDate(addOtherSprintForm.test_date) || normalizeDate(new Date().toISOString())

    if (!officerId || Number.isNaN(officerId)) { toast.warning('Please enter a valid Officer ID.'); return }
    if (!age || Number.isNaN(age)) { toast.warning('Please enter a valid age.'); return }
    if (!gender) { toast.warning('Please select a gender.'); return }

    try {
      await officerCreateOtherSprint({ officer_id: officerId, minutes, seconds, age, gender, test_date: testDate })
      toast.success('Other Sprint record created successfully.')
      setIsAddOtherSprintModalOpen(false)
      setAddOtherSprintForm({ officer_id: '', minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })

      if (isAdmin) {
        const fresh = await adminGetSprintRecords().catch(() => null)
        if (fresh) setAdminSprintRecords(toArray(fresh))
      }
    } catch (error) { toast.error('Failed to create other Sprint record: ' + (error?.message || 'Unknown error')) }
  }

  const handleAddOtherPushup = async () => {
    const officerId = parseInt(addOtherPushupForm.officer_id, 10)
    const reps = parseInt(addOtherPushupForm.reps, 10)
    const age = parseInt(addOtherPushupForm.age, 10)
    const gender = addOtherPushupForm.gender
    const testDate = normalizeDate(addOtherPushupForm.test_date) || normalizeDate(new Date().toISOString())

    if (!officerId || Number.isNaN(officerId)) { toast.warning('Please enter a valid Officer ID.'); return }
    if (!reps || Number.isNaN(reps)) { toast.warning('Please enter valid reps.'); return }
    if (!age || Number.isNaN(age)) { toast.warning('Please enter a valid age.'); return }
    if (!gender) { toast.warning('Please select a gender.'); return }

    try {
      await officerCreateOtherPushup({ officer_id: officerId, reps, age, gender, test_date: testDate })
      toast.success('Other Push-up record created successfully.')
      setIsAddOtherPushupModalOpen(false)
      setAddOtherPushupForm({ officer_id: '', reps: '', age: '', gender: 'male', test_date: '' })

      if (isAdmin) {
        const fresh = await adminGetPushupRecords().catch(() => null)
        if (fresh) setAdminPushupRecords(toArray(fresh))
      }
    } catch (error) { toast.error('Failed to create other Push-up record: ' + (error?.message || 'Unknown error')) }
  }

  const handleAddOtherSitup = async () => {
    const officerId = parseInt(addOtherSitupForm.officer_id, 10)
    const reps = parseInt(addOtherSitupForm.reps, 10)
    const age = parseInt(addOtherSitupForm.age, 10)
    const gender = addOtherSitupForm.gender
    const testDate = normalizeDate(addOtherSitupForm.test_date) || normalizeDate(new Date().toISOString())

    if (!officerId || Number.isNaN(officerId)) { toast.warning('Please enter a valid Officer ID.'); return }
    if (!reps || Number.isNaN(reps)) { toast.warning('Please enter valid reps.'); return }
    if (!age || Number.isNaN(age)) { toast.warning('Please enter a valid age.'); return }
    if (!gender) { toast.warning('Please select a gender.'); return }

    try {
      await officerCreateOtherSitup({ officer_id: officerId, reps, age, gender, test_date: testDate })
      toast.success('Other Sit-up record created successfully.')
      setIsAddOtherSitupModalOpen(false)
      setAddOtherSitupForm({ officer_id: '', reps: '', age: '', gender: 'male', test_date: '' })

      if (isAdmin) {
        const fresh = await adminGetSitupRecords().catch(() => null)
        if (fresh) setAdminSitupRecords(toArray(fresh))
      }
    } catch (error) { toast.error('Failed to create other Sit-up record: ' + (error?.message || 'Unknown error')) }
  }

  const handleAddOtherWalkTest = async () => {
    const officerId = parseInt(addOtherWalkTestForm.officer_id, 10)
    const minutes = parseInt(addOtherWalkTestForm.minutes, 10) || 0
    const seconds = parseInt(addOtherWalkTestForm.seconds, 10) || 0
    const age = parseInt(addOtherWalkTestForm.age, 10)
    const gender = addOtherWalkTestForm.gender
    const testDate = normalizeDate(addOtherWalkTestForm.test_date) || normalizeDate(new Date().toISOString())

    if (!officerId || Number.isNaN(officerId)) { toast.warning('Please enter a valid Officer ID.'); return }
    if (!age || Number.isNaN(age)) { toast.warning('Please enter a valid age.'); return }
    if (!gender) { toast.warning('Please select a gender.'); return }

    try {
      await officerCreateOtherWalkTest({ officer_id: officerId, minutes, seconds, age, gender, test_date: testDate })
      toast.success('Other Walk Test record created successfully.')
      setIsAddOtherWalkTestModalOpen(false)
      setAddOtherWalkTestForm({ officer_id: '', minutes: '', seconds: '0', age: '', gender: 'male', test_date: '' })

      if (isAdmin) {
        const fresh = await adminGetWalkTests().catch(() => null)
        if (fresh) setAdminWalkTests(toArray(fresh))
      }
    } catch (error) { toast.error('Failed to create other Walk Test record: ' + (error?.message || 'Unknown error')) }
  }

  const handleDeleteWalkTest = async (testId) => {
    const confirmed = await confirm({ title: 'Delete Walk Test', message: 'Are you sure you want to delete this walk test record?', variant: 'danger', confirmText: 'Delete' })
    if (confirmed) {
      try { await adminDeleteWalkTest(testId); setAdminWalkTests((prev) => prev.filter((t) => t.id !== testId)); toast.success('Walk test deleted.') }
      catch { toast.error('Failed to delete walk test. Please try again.') }
    }
  }

  const handleDeleteBmi = async (id) => {
    if (!id) return
    const confirmed = await confirm({ title: 'Delete BMI Record', message: 'Are you sure you want to delete this BMI record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try {
      await adminDeleteOfficerBmi(id)
      const fresh = await adminGetOfficerBmi().catch(() => null)
      if (fresh) setAdminBmiRecords(toArray(fresh)); else setAdminBmiRecords((prev) => prev.filter((r) => r.id !== id))
      toast.success('BMI record deleted.')
    } catch (error) { toast.error('Failed to delete BMI record: ' + (error?.message || 'Unknown error')) }
  }

  const openBmiModal = (record) => {
    const dateVal = normalizeDate(record?.month_taken)
    setEditingBmi(record)
    const h = getBmiHeight(record)
    setBmiEditForm({ height_meter: h != null ? String(h) : '', weight_kg: String(record?.weight_kg ?? ''), month_taken: dateVal })
    setIsBmiModalOpen(true)
  }

  const handleSaveBmi = async () => {
    if (!editingBmi?.id) return
    try {
      const monthTaken = normalizeDate(bmiEditForm.month_taken) || normalizeDate(editingBmi.month_taken) || normalizeDate(new Date().toISOString())
      const payload = { height_meter: parseFloat(bmiEditForm.height_meter) || 0, weight_kg: parseFloat(bmiEditForm.weight_kg) || 0, month_taken: monthTaken }
      const computedBmi = payload.height_meter > 0 ? Number((payload.weight_kg / (payload.height_meter * payload.height_meter)).toFixed(2)) : 0
      const computedCategory = computedBmi <= 0 ? '—' : computedBmi < 18.5 ? 'Underweight' : computedBmi < 25 ? 'Normal' : computedBmi < 30 ? 'Overweight' : 'Obese'
      const optimistic = { ...editingBmi, ...payload, bmi: computedBmi, category: computedCategory }
      const updated = await adminUpdateOfficerBmi(editingBmi.id, payload).catch(() => null)
      setAdminBmiRecords((prev) => prev.map((r) => r.id === editingBmi.id ? { ...optimistic, ...(updated && typeof updated === 'object' && !Array.isArray(updated) ? updated : {}) } : r))
      const fresh = await adminGetOfficerBmi().catch(() => null)
      if (fresh) {
        const fetched = toArray(fresh)
        setAdminBmiRecords((prev) => prev.map((r) => {
          const serverRow = fetched.find((f) => f?.id === r?.id)
          if (!serverRow) return r
          if (r.id === editingBmi.id) return { ...serverRow, height_meter: payload.height_meter, weight_kg: payload.weight_kg, month_taken: payload.month_taken, bmi: serverRow.bmi ?? computedBmi, category: serverRow.category ?? computedCategory }
          return serverRow
        }))
      }
      setIsBmiModalOpen(false); setEditingBmi(null)
      toast.success('BMI record updated successfully.')
    } catch (error) { toast.error('Failed to update BMI record: ' + (error?.message || 'Unknown error')) }
  }

  const handleDeleteSitup = async (id) => {
    if (!id) return
    const confirmed = await confirm({ title: 'Delete Sit-up Record', message: 'Are you sure you want to delete this sit-up record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try {
      await adminDeleteSitupRecord(id)
      const fresh = await adminGetSitupRecords().catch(() => null)
      if (fresh) setAdminSitupRecords(toArray(fresh)); else setAdminSitupRecords((prev) => prev.filter((r) => r.id !== id))
      toast.success('Sit-up record deleted.')
    } catch (error) { toast.error('Failed to delete sit-up record: ' + (error?.message || 'Unknown error')) }
  }

  const openSitupModal = (record) => {
    setEditingSitup(record)
    setSitupEditForm({
      reps: String(record.count ?? record.reps ?? record.situp_count ?? ''),
      age: String(record.age || ''),
      gender: record.gender || '',
      test_date: normalizeDate(record.test_date)
    })
    setIsSitupModalOpen(true)
  }

  const handleSaveSitup = async () => {
    if (!editingSitup?.id) return
    try {
      const payload = {
        age: parseInt(situpEditForm.age, 10) || 0,
        gender: String(situpEditForm.gender || '').toLowerCase(),
        reps: parseInt(situpEditForm.reps, 10) || 0,
        count: parseInt(situpEditForm.reps, 10) || 0, // Fallback for backend
        minutes: 1, // Using the user's JSON structure format just in case
        seconds: 0,
        test_date: normalizeDate(situpEditForm.test_date) || normalizeDate(new Date().toISOString())
      }
      await adminUpdateSitupRecord(editingSitup.id, payload)

      const fresh = await adminGetSitupRecords().catch(() => null)
      if (fresh) setAdminSitupRecords(toArray(fresh))
      else setAdminSitupRecords((prev) => prev.map(r => r.id === editingSitup.id ? { ...r, ...payload } : r))

      setIsSitupModalOpen(false)
      setEditingSitup(null)
      toast.success('Sit-up record updated successfully.')
    } catch (error) { toast.error('Failed to update sit-up record: ' + (error?.message || 'Unknown error')) }
  }

  const handleDeletePushup = async (id) => {
    if (!id) return
    const confirmed = await confirm({ title: 'Delete Push-up Record', message: 'Are you sure you want to delete this push-up record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try {
      await adminDeletePushupRecord(id)
      const fresh = await adminGetPushupRecords().catch(() => null)
      if (fresh) setAdminPushupRecords(toArray(fresh)); else setAdminPushupRecords((prev) => prev.filter((r) => r.id !== id))
      toast.success('Push-up record deleted.')
    } catch (error) { toast.error('Failed to delete push-up record: ' + (error?.message || 'Unknown error')) }
  }

  const openPushupModal = (record) => {
    setEditingPushup(record)
    setPushupEditForm({
      reps: String(record.count ?? record.reps ?? record.pushup_count ?? ''),
      age: String(record.age || ''),
      gender: record.gender || '',
      test_date: normalizeDate(record.test_date)
    })
    setIsPushupModalOpen(true)
  }

  const handleSavePushup = async () => {
    if (!editingPushup?.id) return
    try {
      const payload = {
        age: parseInt(pushupEditForm.age, 10) || 0,
        gender: String(pushupEditForm.gender || '').toLowerCase(),
        reps: parseInt(pushupEditForm.reps, 10) || 0,
        count: parseInt(pushupEditForm.reps, 10) || 0,
        test_date: normalizeDate(pushupEditForm.test_date) || normalizeDate(new Date().toISOString())
      }
      await adminUpdatePushupRecord(editingPushup.id, payload)

      const fresh = await adminGetPushupRecords().catch(() => null)
      if (fresh) setAdminPushupRecords(toArray(fresh))
      else setAdminPushupRecords((prev) => prev.map(r => r.id === editingPushup.id ? { ...r, ...payload } : r))

      setIsPushupModalOpen(false)
      setEditingPushup(null)
      toast.success('Push-up record updated successfully.')
    } catch (error) { toast.error('Failed to update push-up record: ' + (error?.message || 'Unknown error')) }
  }

  const handleDeleteSprint = async (id) => {
    const confirmed = await confirm({ title: 'Delete Sprint Record', message: 'Are you sure you want to delete this sprint record?', variant: 'danger', confirmText: 'Delete' })
    if (!confirmed) return
    try {
      await adminDeleteSprintRecord(id)
      const fresh = await adminGetSprintRecords().catch(() => null)
      if (fresh) setAdminSprintRecords(toArray(fresh)); else setAdminSprintRecords((prev) => prev.filter((r) => r.id !== id))
    } catch (error) { toast.error('Failed to delete sprint record: ' + (error?.message || 'Unknown error')) }
  }

  const openSprintModal = (record) => {
    setEditingSprint(record)
    setSprintEditForm({
      minutes: String(record.minutes || '0'),
      seconds: String(record.seconds || '0'),
      age: String(record.age || ''),
      gender: record.gender || '',
      test_date: normalizeDate(record.test_date)
    })
    setIsSprintModalOpen(true)
  }

  const handleSaveSprint = async () => {
    if (!editingSprint?.id) return
    try {
      const payload = {
        age: parseInt(sprintEditForm.age, 10) || 0,
        gender: String(sprintEditForm.gender || '').toLowerCase(),
        minutes: parseInt(sprintEditForm.minutes, 10) || 0,
        seconds: parseInt(sprintEditForm.seconds, 10) || 0,
        test_date: normalizeDate(sprintEditForm.test_date) || normalizeDate(new Date().toISOString())
      }
      await adminUpdateSprintRecord(editingSprint.id, payload)

      const fresh = await adminGetSprintRecords().catch(() => null)
      if (fresh) setAdminSprintRecords(toArray(fresh))
      else setAdminSprintRecords((prev) => prev.map(r => r.id === editingSprint.id ? { ...r, ...payload } : r))

      setIsSprintModalOpen(false)
      setEditingSprint(null)
      toast.success('Sprint record updated successfully.')
    } catch (error) { toast.error('Failed to update sprint record: ' + (error?.message || 'Unknown error')) }
  }

  const openWalkTestModal = (test) => {
    setEditingWalkTest(test)
    setWalkTestEditForm({ minutes: String(test.minutes || ''), seconds: String(test.seconds || '0'), test_date: normalizeDate(test.test_date), gender: test.gender || '', age: String(test.age || '') })
    setIsWalkTestModalOpen(true)
  }

  const handleSaveWalkTest = async () => {
    if (!editingWalkTest) return
    try {
      const age = parseInt(walkTestEditForm.age, 10) || 0
      const minutes = parseInt(walkTestEditForm.minutes, 10) || 0
      const seconds = Math.min(59, Math.max(0, parseInt(walkTestEditForm.seconds, 10) || 0))
      await adminUpdateWalkTest(editingWalkTest.id, { age, gender: String(walkTestEditForm.gender || '').toLowerCase(), minutes, seconds, test_date: normalizeDate(walkTestEditForm.test_date) })
      setAdminWalkTests(await adminGetWalkTests())
      setEditingWalkTest(null); setIsWalkTestModalOpen(false)
    } catch (error) { console.error("Backend Error:", error); toast.error('Failed to update walk test: ' + error.message) }
  }

  const handleDeleteUser = async (id) => {
    const confirmed = await confirm({ title: 'Delete User', message: `Are you sure you want to delete user ${id}?`, variant: 'danger', confirmText: 'Delete' })
    if (confirmed) {
      try { await deleteUser(id); setUsers((prev) => prev.filter((u) => u.id !== id)); toast.success('User deleted successfully.') }
      catch { toast.error('Failed to delete user. Please try again.') }
    }
  }

  /* ============================================================
     HANDLERS — User Registration / Edit
     ============================================================ */

  const handleRegisterUser = async () => {
    const name = [addForm.firstName.trim(), addForm.lastName.trim()].filter(Boolean).join(' ')
    if (!name || !addForm.gender || !addForm.age) { toast.warning('Please fill in required fields: First Name, Last Name, Gender, Age.'); return }
    try {
      const newUser = await createUser({ name, policeGoNoGo: addForm.policeGoNoGo || 'GO', gender: addForm.gender, age: parseInt(addForm.age, 10) || 0, location: addForm.location || '', status: addForm.status || 'Active', date: new Date().toISOString().slice(0, 10) })
      setUsers((prev) => [...prev, newUser]); setAddForm(EMPTY_ADD_FORM); setIsModalOpen(false)
    } catch { toast.error('Failed to register user. Please try again.') }
  }

  const handleSaveEditUser = async () => {
    if (!editingUser) return
    const name = [addForm.firstName.trim(), addForm.lastName.trim()].filter(Boolean).join(' ')
    if (!name || !addForm.gender || !addForm.age) { toast.warning('Please fill in required fields: First Name, Last Name, Gender, Age.'); return }
    try {
      const updatedUser = await updateUser(editingUser.id, { name, policeGoNoGo: addForm.policeGoNoGo || editingUser.policeGoNoGo, gender: addForm.gender, age: parseInt(addForm.age, 10) || editingUser.age, location: addForm.location ?? editingUser.location, status: addForm.status ?? editingUser.status })
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? updatedUser : u))
      setEditingUser(null); setIsModalOpen(false); setAddForm(EMPTY_ADD_FORM)
    } catch { toast.error('Failed to update user. Please try again.') }
  }

  const openEditModal = (user) => {
    const [first = '', ...rest] = (user.name || '').split(' ')
    setAddForm({ ...EMPTY_ADD_FORM, firstName: first, lastName: rest.join(' '), policeGoNoGo: user.policeGoNoGo || 'GO', gender: user.gender || '', age: String(user.age ?? ''), location: user.location || '', status: user.status || 'Active' })
    setEditingUser(user); setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingUser(null) }

  /* ============================================================
     HANDLERS — Filters & Export
     ============================================================ */

  const filteredUsers = useMemo(() => {
    const min = ageMin ? parseInt(ageMin, 10) : 0, max = ageMax ? parseInt(ageMax, 10) : 999, searchLower = search.toLowerCase()
    return users.filter((u) => {
      const matchSearch = !searchLower || getUserDisplayName(u).toLowerCase().includes(searchLower) || (u.policeGoNoGo && u.policeGoNoGo.toLowerCase().includes(searchLower)) || String(u.id ?? '').toLowerCase().includes(searchLower)
    })
  }, [users, search, gender, ageMin, ageMax, goNoGo])

  /* ── Overall Score Combined Rows ── */
  const overallScores = useMemo(() => {
    const qLower = search.trim().toLowerCase()
    
    // Check if adminSummary is populated
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

    // Fallback if adminSummary is not available
    const map = new Map()

    const addTest = (record, type) => {
      const gId = record.officer_profile_id || record.officer_id || record.account_id || record.user_id;
      if (!gId) return;
      if (!map.has(gId)) {
        map.set(gId, { id: gId, name: getOfficerName(gId), tests: {} });
      }
      const data = map.get(gId);
      data.tests[type] = record;
    };

    if (adminWalkTests) adminWalkTests.forEach(r => addTest(r, 'walk'))
    if (adminBmiRecords) adminBmiRecords.forEach(r => addTest(r, 'bmi'))
    if (adminSitupRecords) adminSitupRecords.forEach(r => addTest(r, 'situp'))
    if (adminPushupRecords) adminPushupRecords.forEach(r => addTest(r, 'pushup'))
    if (adminSprintRecords) adminSprintRecords.forEach(r => addTest(r, 'sprint'))

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
          if (cat.includes('obese')) hasFailed = true;
        }

        const overallStatus = testCount === 0 ? 'No Data' : (hasFailed ? 'Failed' : 'Passed')
        return { ...u, testCount, overallStatus, hasFailed }
      })
  }, [users, adminWalkTests, adminBmiRecords, adminSitupRecords, adminPushupRecords, adminSprintRecords, adminSummary, search, getOfficerName])

  const handleResetFilters = () => { setSearch(''); setGender(''); setAgeMin(''); setAgeMax(''); setGoNoGo('') }

  const exportCsv = (usersToExport, label) => {
    if (!usersToExport.length) { toast.warning('No users to export for this selection.'); return }
    const headers = ['ID', 'Name', 'Police GO / NO GO', 'Gender', 'Age', 'Location', 'Status', 'Registered']
    const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const rows = usersToExport.map((u) => [u.id, u.name, u.policeGoNoGo ?? '', u.gender, u.age, u.location ?? '', u.status ?? '', u.date ?? ''])
    const csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `users-${label}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url)
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
        if (!rows.length) { toast.warning('Excel file is empty or has no data.'); return }
        const headers = rows[0].map((h) => String(h ?? '').trim())
        const idIdx = headers.findIndex((h) => /^id$/i.test(h))
        const nameIdx = headers.findIndex((h) => /^name$/i.test(h))
        const goNoGoIdx = headers.findIndex((h) => /go\s*[\/\-]?\s*no\s*go|police\s*go|go\s*no\s*go|status/i.test(h))
        if (goNoGoIdx < 0) { toast.warning('Excel must have a column for GO/NO GO (e.g. "Police GO / NO GO", "GO/NO GO", or "Status").'); return }
        const nameCol = nameIdx >= 0 ? nameIdx : headers.findIndex((_, i) => i === 1)
        const idCol = idIdx >= 0 ? idIdx : headers.findIndex((_, i) => i === 0)
        setUsers((prev) => {
          const next = prev.map((u) => ({ ...u }))
          const nums = next.map((u) => parseInt(String(u.id).replace(/\D/g, ''), 10)).filter(Boolean)
          let nextNum = nums.length ? Math.max(...nums) + 1 : 1
          let updated = 0, added = 0
          for (let r = 1; r < rows.length; r++) {
            const row = rows[r]
            const goNoGoVal = normalizeGoNoGo(row[goNoGoIdx])
            if (goNoGoVal !== 'GO' && goNoGoVal !== 'NO GO') continue
            const rowId = idCol >= 0 && row[idCol] != null ? String(row[idCol]).trim() : ''
            const rowName = nameCol >= 0 && row[nameCol] != null ? String(row[nameCol]).trim() : ''
            const existing = next.find((u) => (rowId && u.id === rowId) || (rowName && u.name.toLowerCase() === rowName.toLowerCase()))
            if (existing) { existing.policeGoNoGo = goNoGoVal; updated++ }
            else if (rowName && goNoGoVal) { next.push({ id: `USR-${String(nextNum++).padStart(3, '0')}`, name: rowName, policeGoNoGo: goNoGoVal, gender: 'Male', age: 0, location: '', status: 'Active', date: new Date().toISOString().slice(0, 10) }); added++ }
          }
          setTimeout(() => toast.success(`Import complete. Updated ${updated} user(s), added ${added} new user(s) with GO/NO GO from Excel.`), 0)
          return next
        })
      } catch (err) { console.error(err); toast.error('Failed to read Excel file. Please use .xlsx or .xls with columns: ID, Name, and a GO/NO GO column.') }
    }
    reader.readAsArrayBuffer(file)
  }

  /* ============================================================
     RENDER
     ============================================================ */

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} onCreateAccount={handleCreateAccount} loginError={loginError} setLoginError={setLoginError} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        {ConfirmDialogComponent}
      </>
    )
  }

  /* ── Stat card counts ── */
  const statCounts = isAdmin
    ? { total: users.length, walk: adminWalkTests?.length || 0, bmi: adminBmiRecords.length, fitness: adminSitupRecords.length + adminPushupRecords.length + adminSprintRecords.length }
    : { total: officerWalkRecords.length + officerBmiRecords.length + officerSitupRecords.length + officerPushupRecords.length + officerSprintRecords.length, walk: officerWalkRecords.length, bmi: officerBmiRecords.length, fitness: officerPushupRecords.length + officerSitupRecords.length + officerSprintRecords.length }

  return (
    <>
      <Sidebar
        activePage={activePage} setActivePage={setActivePage} isAdmin={isAdmin}
        userName={userName} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="main">
        <Topbar activePage={activePage} userName={userName} isAdmin={isAdmin} setMobileMenuOpen={setMobileMenuOpen} onRefresh={handleGlobalRefresh} setActivePage={setActivePage} />

        <div className="content">
          {/* ── Dashboard ── */}
          {activePage === 'dashboard' && (
            <div className="dashboard-go-nogo user-root">
              <StatCards role={isAdmin ? 'admin' : 'officer'} counts={statCounts} />

              {!isAdmin && (
                <OfficerExercises
                  officerDashboardTab={officerDashboardTab} setOfficerDashboardTab={setOfficerDashboardTab}
                  isAddingWalkTest={isAddingWalkTest} setIsAddingWalkTest={setIsAddingWalkTest}
                  walkTestForm={walkTestForm} setWalkTestForm={setWalkTestForm} handleSubmitWalkTest={handleSubmitWalkTest} walkTestMessage={walkTestMessage} officerWalkRecords={officerWalkRecords}
                  isAddingBmi={isAddingBmi} setIsAddingBmi={setIsAddingBmi}
                  bmiForm={bmiForm} setBmiForm={setBmiForm} handleSubmitBmi={handleSubmitBmi} bmiMessage={bmiMessage} officerBmiRecords={officerBmiRecords}
                  isAddingSitup={isAddingSitup} setIsAddingSitup={setIsAddingSitup}
                  situpForm={situpForm} setSitupForm={setSitupForm} handleSubmitSitup={handleSubmitSitup} situpMessage={situpMessage} officerSitupRecords={officerSitupRecords}
                  isAddingPushup={isAddingPushup} setIsAddingPushup={setIsAddingPushup}
                  pushupForm={pushupForm} setPushupForm={setPushupForm} handleSubmitPushup={handleSubmitPushup} pushupMessage={pushupMessage} officerPushupRecords={officerPushupRecords}
                  isAddingSprint={isAddingSprint} setIsAddingSprint={setIsAddingSprint}
                  sprintForm={sprintForm} setSprintForm={setSprintForm} handleSubmitSprint={handleSubmitSprint} sprintMessage={sprintMessage} officerSprintRecords={officerSprintRecords}
                />
              )}

              {isAdmin && (
                <AdminDashboard
                  users={users} adminWalkTests={adminWalkTests} adminBmiRecords={adminBmiRecords}
                  adminSitupRecords={adminSitupRecords} adminPushupRecords={adminPushupRecords} adminSprintRecords={adminSprintRecords}
                  adminSummary={adminSummary}
                  dashboardSearch={dashboardSearch} setDashboardSearch={setDashboardSearch}
                  dashboardAdminTab={dashboardAdminTab} setDashboardAdminTab={setDashboardAdminTab}
                  getOfficerName={getOfficerName}
                />
              )}
            </div>
          )}

          {/* ── Officer Profile ── */}
          {activePage === 'officerProfile' && (
            <OfficerProfile isAdmin={isAdmin} userName={userName} accounts={accounts} officerInfo={officerInfo}
              officerProfileError={officerProfileError} officerProfileLoading={officerProfileLoading} adminProfileForPage={adminProfileForPage}
              onCreateProfile={handleCreateOfficerProfile}
            />
          )}

          {/* ── User Management ── */}
          {activePage === 'user' && (
            <div className="user-root">
              <div className="admin-record-tabs">
                {['walk', 'bmi', 'situp', 'pushup', 'sprint', 'overall'].map((tab) => (
                  <button key={tab} type="button" className={`admin-record-tab ${adminRecordsTab === tab ? 'active' : ''}`} onClick={() => setAdminRecordsTab(tab)}>
                    {{ walk: 'Walk Test Records', bmi: 'BMI Test Record', situp: '1 Min Sit-up Records', pushup: 'Push-up Test Record', sprint: '300 Meters Sprint Test Record', overall: 'Overall Exercise Score' }[tab]}
                  </button>
                ))}
              </div>

              {adminRecordsTab === 'walk' && (
                <User users={users} filteredUsers={filteredUsers} setUsers={setUsers} onDeleteUser={handleDeleteUser} onImportExcel={handleImportExcel}
                  onOpenAddModal={() => { setAddForm(EMPTY_ADD_FORM); setEditingUser(null); setIsModalOpen(true) }}
                  onAddWalkTest={() => setIsAddOtherWalkTestModalOpen(true)}
                  onEditUser={openEditModal} onDeleteWalkTest={handleDeleteWalkTest} onEditWalkTest={openWalkTestModal}
                  search={search} setSearch={setSearch} gender={gender} setGender={setGender}
                  ageMin={ageMin} setAgeMin={setAgeMin} ageMax={ageMax} setAgeMax={setAgeMax}
                  goNoGo={goNoGo} setGoNoGo={setGoNoGo} onResetFilters={handleResetFilters}
                  onExportFiltered={() => exportCsv(filteredUsers, 'filtered')} onExportAll={(list) => exportCsv(list || users, 'all')}
                  adminWalkTests={adminWalkTests} getOfficerName={getOfficerName}
                />
              )}

              {adminRecordsTab === 'bmi' && (
                <div className="user-panel">
                  <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="user-title">BMI Test Record</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button type="button" className="user-btn-add" onClick={() => setIsAddOtherBmiModalOpen(true)}>
                        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg> Add BMI Record
                      </button>
                      <div className="user-filter-group user-search" style={{ margin: 0, minWidth: 250 }}>
                        <input type="text" value={bmiSearch} onChange={(e) => setBmiSearch(e.target.value)} placeholder="Search officer name or ID..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>
                  <table className="user-table">
                    <thead><tr><th>ID</th><th>Officer Profile ID</th><th>Officer</th><th>Height (m)</th><th>Weight (kg)</th><th>BMI</th><th>Category</th><th>Month Taken</th><th style={{ minWidth: 220 }}>Actions</th></tr></thead>
                    <tbody>
                      {adminBmiRecords.filter((r) => { const q = bmiSearch.trim().toLowerCase(); if (!q) return true; return getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q) }).map((r, i) => (
                        <tr key={`bmi-${r.id ?? i}`}>
                          <td>{r.id ?? '—'}</td>
                          <td>{r.officer_profile_id ?? r.officer_id ?? '—'}</td>
                          <td>{getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id)}</td>
                          <td>{(() => { const h = getBmiHeight(r); return h != null ? h.toFixed(2) : '—' })()}</td>
                          <td>{r.weight_kg ?? r.weight ?? '—'}</td>
                          <td>{r.bmi ?? r.bmi_value ?? '—'}</td>
                          <td>{r.category ?? r.status ?? '—'}</td>
                          <td>{r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—'}</td>
                          <td style={{ minWidth: 220 }}>
                            <div className="user-action-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center', whiteSpace: 'nowrap' }}>
                              <button type="button" className="user-btn-edit" onClick={() => openBmiModal(r)}>Edit BMI</button>
                              <button type="button" className="user-btn-delete" onClick={() => handleDeleteBmi(r.id)}>Delete BMI</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {adminBmiRecords.filter((r) => { const q = bmiSearch.trim().toLowerCase(); if (!q) return true; return getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q) }).length === 0 && <p className="dashboard-empty">No BMI records match your search.</p>}
                </div>
              )}

              {adminRecordsTab === 'situp' && (
                <div className="user-panel">
                  <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="user-title">1 Min Sit-up Records</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button type="button" className="user-btn-add" onClick={() => setIsAddOtherSitupModalOpen(true)}>
                        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg> Add Sit-up Record
                      </button>
                      <div className="user-filter-group user-search" style={{ margin: 0, minWidth: 250 }}>
                        <input type="text" value={situpSearch} onChange={(e) => setSitupSearch(e.target.value)} placeholder="Search officer name or ID..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>
                  <table className="user-table">
                    <thead><tr><th>ID</th><th>Officer</th><th>Count (Reps)</th><th>Grade</th><th>Test Date</th><th style={{ minWidth: 220 }}>Actions</th></tr></thead>
                    <tbody>
                      {adminSitupRecords.filter((r) => { const q = situpSearch.trim().toLowerCase(); if (!q) return true; return getOfficerName(r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q) }).map((r, i) => (
                        <tr key={`situp-${r.id ?? i}`}>
                          <td>{r.id ?? '—'}</td>
                          <td>{getOfficerName(r.officer_id || r.account_id || r.user_id)}</td>
                          <td>{r.count ?? r.reps ?? r.situp_count ?? '—'}</td>
                          <td>{r.grade ?? '—'}</td>
                          <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                          <td style={{ minWidth: 220 }}>
                            <div className="user-action-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center', whiteSpace: 'nowrap' }}>
                              <button type="button" className="user-btn-edit" onClick={() => openSitupModal(r)}>Edit Sit-up</button>
                              <button type="button" className="user-btn-delete" onClick={() => handleDeleteSitup(r.id)}>Delete Sit-up</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {adminSitupRecords.filter((r) => { const q = situpSearch.trim().toLowerCase(); if (!q) return true; return getOfficerName(r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q) }).length === 0 && <p className="dashboard-empty">No sit-up records match your search.</p>}
                </div>
              )}

              {adminRecordsTab === 'pushup' && (
                <div className="user-panel">
                  <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="user-title">Push-up Test Record</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button type="button" className="user-btn-add" onClick={() => setIsAddOtherPushupModalOpen(true)}>
                        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg> Add Push-up Record
                      </button>
                      <div className="user-filter-group user-search" style={{ margin: 0, minWidth: 250 }}>
                        <input type="text" value={pushupSearch} onChange={(e) => setPushupSearch(e.target.value)} placeholder="Search officer name or ID..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>
                  <table className="user-table">
                    <thead><tr><th>ID</th><th>Officer</th><th>Count (Reps)</th><th>Grade</th><th>Test Date</th><th style={{ minWidth: 220 }}>Actions</th></tr></thead>
                    <tbody>
                      {adminPushupRecords.filter((r) => { const q = pushupSearch.trim().toLowerCase(); if (!q) return true; return getOfficerName(r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q) }).map((r, i) => (
                        <tr key={`pushup-${r.id ?? i}`}>
                          <td>{r.id ?? '—'}</td>
                          <td>{getOfficerName(r.officer_id || r.account_id || r.user_id)}</td>
                          <td>{r.count ?? r.reps ?? r.pushup_count ?? '—'}</td>
                          <td>{r.grade ?? '—'}</td>
                          <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                          <td style={{ minWidth: 220 }}>
                            <div className="user-action-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center', whiteSpace: 'nowrap' }}>
                              <button type="button" className="user-btn-edit" onClick={() => openPushupModal(r)}>Edit Push-up</button>
                              <button type="button" className="user-btn-delete" onClick={() => handleDeletePushup(r.id)}>Delete Push-up</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {adminPushupRecords.filter((r) => { const q = pushupSearch.trim().toLowerCase(); if (!q) return true; return getOfficerName(r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q) }).length === 0 && <p className="dashboard-empty">No push-up records match your search.</p>}
                </div>
              )}

              {adminRecordsTab === 'overall' && (
                <div className="user-panel">
                  <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="user-title">Overall Exercise Score</h2>
                    <div className="user-filter-group user-search" style={{ margin: 0, minWidth: 250 }}>
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search officer name or ID..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
                    </div>
                  </div>
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
                        <tr key={`user-dash-overall-${r.id ?? i}`}>
                          <td>{r.name}</td>
                          <td>{r.tests.walk?.grade || '—'}</td>
                          <td>{r.tests.situp?.grade || '—'}</td>
                          <td>{r.tests.pushup?.grade || '—'}</td>
                          <td>{r.tests.sprint?.grade || '—'}</td>
                          <td>{r.testCount} / 5</td>
                          <td>
                            <select
                              value={r.overallStatus === 'Failed' ? 'Failed' : 'Passed'}
                              onChange={async (e) => {
                                const newStatus = e.target.value === 'Failed' ? 'NO GO' : 'GO';
                                try {
                                  if (r.baseUser && r.baseUser.id) {
                                    await updateUser(r.baseUser.id, { ...r.baseUser, policeGoNoGo: newStatus });
                                    setUsers(prev => prev.map(u => u.id === r.baseUser.id ? { ...u, policeGoNoGo: newStatus } : u));
                                  } else {
                                    toast.warning('User account not fully registered yet.');
                                  }
                                } catch (error) {
                                  console.error(error);
                                  toast.error('Failed to update status.');
                                }
                              }}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: 13,
                                color: r.overallStatus === 'Failed' ? '#991b1b' : '#065f46',
                                backgroundColor: r.overallStatus === 'Failed' ? '#fee2e2' : '#d1fae5',
                                border: '1px solid transparent',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Passed">Passed</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {overallScores.length === 0 && <p className="dashboard-empty">No records match your search.</p>}
                </div>
              )}

              {adminRecordsTab === 'sprint' && (
                <div className="user-panel">
                  <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="user-title">300 Meters Sprint Test Record</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button type="button" className="user-btn-add" onClick={() => setIsAddOtherSprintModalOpen(true)}>
                        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg> Add Sprint Record
                      </button>
                      <div className="user-filter-group user-search" style={{ margin: 0, minWidth: 250 }}>
                        <input type="text" value={sprintSearch} onChange={(e) => setSprintSearch(e.target.value)} placeholder="Search officer name or ID..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>
                  <table className="user-table">
                    <thead><tr><th>ID</th><th>Officer</th><th>Time</th><th>Grade</th><th>Test Date</th><th style={{ minWidth: 220 }}>Actions</th></tr></thead>
                    <tbody>
                      {adminSprintRecords.filter((r) => { const q = sprintSearch.trim().toLowerCase(); if (!q) return true; return getOfficerName(r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q) }).map((r, i) => (
                        <tr key={`sprint-${r.id ?? i}`}>
                          <td>{r.id ?? '—'}</td>
                          <td>{getOfficerName(r.officer_id || r.account_id || r.user_id)}</td>
                          <td>{r.time_formatted || `${r.minutes ?? '0'}:${String(r.seconds ?? 0).padStart(2, '0')}`}</td>
                          <td>{r.grade ?? '—'}</td>
                          <td>{r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'}</td>
                          <td style={{ minWidth: 220 }}>
                            <div className="user-action-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center', whiteSpace: 'nowrap' }}>
                              <button type="button" className="user-btn-edit" onClick={() => openSprintModal(r)}>Edit Sprint</button>
                              <button type="button" className="user-btn-delete" onClick={() => handleDeleteSprint(r.id)}>Delete Sprint</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {adminSprintRecords.filter((r) => { const q = sprintSearch.trim().toLowerCase(); if (!q) return true; return getOfficerName(r.officer_id || r.account_id || r.user_id).toLowerCase().includes(q) }).length === 0 && <p className="dashboard-empty">No sprint records match your search.</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {activePage === 'settings' && (
            <Settings userName={userName} userRole={userRole} onLogout={handleLogout} />
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      <UserFormModal isOpen={isModalOpen} editingUser={editingUser} addForm={addForm} setAddForm={setAddForm}
        onSubmit={editingUser ? handleSaveEditUser : handleRegisterUser} onClose={closeModal}
      />

      <ExerciseModals
        isWalkTestModalOpen={isWalkTestModalOpen} editingWalkTest={editingWalkTest}
        setIsWalkTestModalOpen={setIsWalkTestModalOpen} setEditingWalkTest={setEditingWalkTest}
        walkTestEditForm={walkTestEditForm} setWalkTestEditForm={setWalkTestEditForm} handleSaveWalkTest={handleSaveWalkTest}
        isBmiModalOpen={isBmiModalOpen} editingBmi={editingBmi}
        setIsBmiModalOpen={setIsBmiModalOpen} setEditingBmi={setEditingBmi}
        bmiEditForm={bmiEditForm} setBmiEditForm={setBmiEditForm} handleSaveBmi={handleSaveBmi}
        isSitupModalOpen={isSitupModalOpen} editingSitup={editingSitup}
        setIsSitupModalOpen={setIsSitupModalOpen} setEditingSitup={setEditingSitup}
        situpEditForm={situpEditForm} setSitupEditForm={setSitupEditForm} handleSaveSitup={handleSaveSitup}
        isPushupModalOpen={isPushupModalOpen} editingPushup={editingPushup}
        setIsPushupModalOpen={setIsPushupModalOpen} setEditingPushup={setEditingPushup}
        pushupEditForm={pushupEditForm} setPushupEditForm={setPushupEditForm} handleSavePushup={handleSavePushup}
        isSprintModalOpen={isSprintModalOpen} editingSprint={editingSprint}
        setIsSprintModalOpen={setIsSprintModalOpen} setEditingSprint={setEditingSprint}
        sprintEditForm={sprintEditForm} setSprintEditForm={setSprintEditForm} handleSaveSprint={handleSaveSprint}
        isAddOtherBmiModalOpen={isAddOtherBmiModalOpen} setIsAddOtherBmiModalOpen={setIsAddOtherBmiModalOpen}
        addOtherBmiForm={addOtherBmiForm} setAddOtherBmiForm={setAddOtherBmiForm} handleAddOtherBmi={handleAddOtherBmi}
        isAddOtherSprintModalOpen={isAddOtherSprintModalOpen} setIsAddOtherSprintModalOpen={setIsAddOtherSprintModalOpen}
        addOtherSprintForm={addOtherSprintForm} setAddOtherSprintForm={setAddOtherSprintForm} handleAddOtherSprint={handleAddOtherSprint}
        isAddOtherPushupModalOpen={isAddOtherPushupModalOpen} setIsAddOtherPushupModalOpen={setIsAddOtherPushupModalOpen}
        addOtherPushupForm={addOtherPushupForm} setAddOtherPushupForm={setAddOtherPushupForm} handleAddOtherPushup={handleAddOtherPushup}
        isAddOtherSitupModalOpen={isAddOtherSitupModalOpen} setIsAddOtherSitupModalOpen={setIsAddOtherSitupModalOpen}
        addOtherSitupForm={addOtherSitupForm} setAddOtherSitupForm={setAddOtherSitupForm} handleAddOtherSitup={handleAddOtherSitup}
        isAddOtherWalkTestModalOpen={isAddOtherWalkTestModalOpen} setIsAddOtherWalkTestModalOpen={setIsAddOtherWalkTestModalOpen}
        addOtherWalkTestForm={addOtherWalkTestForm} setAddOtherWalkTestForm={setAddOtherWalkTestForm} handleAddOtherWalkTest={handleAddOtherWalkTest}
      />

      {/* ── Toast Notifications & Confirm Dialog ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {ConfirmDialogComponent}
    </>
  )
}

export default App
