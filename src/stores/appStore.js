import { create } from 'zustand'
import {
  normalizeUserRecord,
  toArray,
  normalizePushupRecords,
  normalizeSprintRecords,
} from '@/lib/utils.js'

/**
 * Central application store using Zustand.
 * Replaces 50+ useState calls in App.jsx with a single, predictable store.
 *
 * Slices:
 *  - auth: authentication state
 *  - ui: sidebar, active page, tabs
 *  - data: users, accounts, officer info
 *  - adminRecords: admin exercise records
 *  - officerRecords: officer personal records
 *  - profile: officer profile loading state
 */
const useAppStore = create((set, get) => ({
  // ─── Auth Slice ───
  isAuthenticated: false,
  userRole: 'admin',
  userName: '',
  loginError: '',

  setAuth: (payload) => set(payload),
  logout: () =>
    set({
      isAuthenticated: false,
      userRole: 'admin',
      userName: '',
      loginError: '',
      users: [],
      accounts: [],
      officerInfo: null,
      adminProfileForPage: null,
      adminWalkTests: [],
      adminBmiRecords: [],
      adminSitupRecords: [],
      adminPushupRecords: [],
      adminSprintRecords: [],
      adminSummary: [],
      officerWalkRecords: [],
      officerBmiRecords: [],
      officerSitupRecords: [],
      officerPushupRecords: [],
      officerSprintRecords: [],
    }),

  // ─── UI Slice ───
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  activePage: 'dashboard',

  setSidebarCollapsed: (v) =>
    set({ sidebarCollapsed: typeof v === 'function' ? v(get().sidebarCollapsed) : v }),
  setMobileMenuOpen: (v) =>
    set({ mobileMenuOpen: typeof v === 'function' ? v(get().mobileMenuOpen) : v }),
  setActivePage: (page) => set({ activePage: page, mobileMenuOpen: false }),

  // ─── Data Slice ───
  accounts: [],
  users: [],
  officerInfo: null,
  adminProfileForPage: null,

  setAccounts: (v) => set({ accounts: typeof v === 'function' ? v(get().accounts) : v }),
  setUsers: (v) => set({ users: typeof v === 'function' ? v(get().users) : v }),
  setOfficerInfo: (v) => set({ officerInfo: v }),
  setAdminProfileForPage: (v) => set({ adminProfileForPage: v }),

  // ─── Admin Records Slice ───
  adminWalkTests: [],
  adminBmiRecords: [],
  adminSitupRecords: [],
  adminPushupRecords: [],
  adminSprintRecords: [],
  adminSummary: [],

  setAdminWalkTests: (v) => set({ adminWalkTests: v }),
  setAdminBmiRecords: (v) => set({ adminBmiRecords: typeof v === 'function' ? v(get().adminBmiRecords) : v }),
  setAdminSitupRecords: (v) => set({ adminSitupRecords: typeof v === 'function' ? v(get().adminSitupRecords) : v }),
  setAdminPushupRecords: (v) => set({ adminPushupRecords: typeof v === 'function' ? v(get().adminPushupRecords) : v }),
  setAdminSprintRecords: (v) => set({ adminSprintRecords: typeof v === 'function' ? v(get().adminSprintRecords) : v }),
  setAdminSummary: (v) => set({ adminSummary: typeof v === 'function' ? v(get().adminSummary) : v }),

  // ─── Officer Records Slice ───
  officerWalkRecords: [],
  officerBmiRecords: [],
  officerSitupRecords: [],
  officerPushupRecords: [],
  officerSprintRecords: [],

  setOfficerWalkRecords: (v) => set({ officerWalkRecords: v }),
  setOfficerBmiRecords: (v) => set({ officerBmiRecords: typeof v === 'function' ? v(get().officerBmiRecords) : v }),
  setOfficerSitupRecords: (v) => set({ officerSitupRecords: typeof v === 'function' ? v(get().officerSitupRecords) : v }),
  setOfficerPushupRecords: (v) => set({ officerPushupRecords: typeof v === 'function' ? v(get().officerPushupRecords) : v }),
  setOfficerSprintRecords: (v) => set({ officerSprintRecords: typeof v === 'function' ? v(get().officerSprintRecords) : v }),

  // ─── Profile Slice ───
  officerProfileLoading: false,
  officerProfileError: '',

  setOfficerProfileLoading: (v) => set({ officerProfileLoading: v }),
  setOfficerProfileError: (v) => set({ officerProfileError: v }),

  // ─── Dashboard / Filter Slice ───
  dashboardSearch: '',
  dashboardAdminTab: 'walk',
  adminRecordsTab: 'walk',
  officerDashboardTab: 'walk',
  search: '',
  gender: '',
  ageMin: '',
  ageMax: '',
  bmiSearch: '',
  situpSearch: '',
  pushupSearch: '',
  sprintSearch: '',
  dashboardGoNoGo: '',

  setDashboardSearch: (v) => set({ dashboardSearch: v }),
  setDashboardAdminTab: (v) => set({ dashboardAdminTab: v }),
  setAdminRecordsTab: (v) => set({ adminRecordsTab: v }),
  setOfficerDashboardTab: (v) => set({ officerDashboardTab: v }),
  setSearch: (v) => set({ search: v }),
  setGender: (v) => set({ gender: v }),
  setAgeMin: (v) => set({ ageMin: v }),
  setAgeMax: (v) => set({ ageMax: v }),
  setBmiSearch: (v) => set({ bmiSearch: v }),
  setSitupSearch: (v) => set({ situpSearch: v }),
  setPushupSearch: (v) => set({ pushupSearch: v }),
  setSprintSearch: (v) => set({ sprintSearch: v }),
  setDashboardGoNoGo: (v) => set({ dashboardGoNoGo: v }),

  resetFilters: () =>
    set({ search: '', gender: '', ageMin: '', ageMax: '' }),

  // ─── Derived ───
  get isAdmin() {
    return get().userRole === 'admin'
  },
}))

export default useAppStore
