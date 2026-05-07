import { useEffect } from 'react'
import clsx from 'clsx'


/* ── Zustand Store ── */
import useAppStore from '@/stores/appStore'

/* ── Custom Hooks ── */
import { useAuth } from '@/features/auth/useAuth'
import { useProfile } from '@/features/profile/useProfile'
import { useGlobalRefresh } from '@/hooks/useGlobalRefresh'
import { useExerciseSubmissions } from '@/features/exercises/useExerciseSubmissions'
import { useAdminRecords } from '@/features/exercises/useAdminRecords'
import { useUserManagement } from '@/features/users/useUserManagement'
import { useDashboardData } from '@/features/dashboard/useDashboardData'

/* ── Feedback Hooks ── */
import { useToastState, ToastContainer } from '@/components/feedback/Toast.jsx'
import { useConfirmDialog } from '@/components/feedback/ConfirmDialog.jsx'

/* ── UI Components ── */
import GradeBadge, { StatusBadge } from '@/components/ui/GradeBadge.jsx'
import EmptyState from '@/components/ui/EmptyState.jsx'

/* ── Layout ── */
import Sidebar from '@/components/layout/Sidebar.jsx'
import Topbar from '@/components/layout/Topbar.jsx'
import StatCards from '@/components/ui/StatCards.jsx'
import ExercisePillButton from '@/components/ui/ExercisePillButton.jsx'

/* ── Feature Pages ── */
import Login from '@/features/auth/LoginPage.jsx'
import AdminDashboard from '@/features/dashboard/AdminDashboard.jsx'
import OfficerExercises from '@/features/exercises/OfficerExercises.jsx'
import ExerciseModals from '@/features/exercises/ExerciseModals.jsx'
import OfficerProfile from '@/features/profile/ProfilePage.jsx'
import User from '@/features/users/UserTable.jsx'
import UserFormModal from '@/features/users/UserFormModal.jsx'
import { BmiPanel, RepsPanel, SprintPanel } from '@/features/users/RecordPanel.jsx'
import Settings from '@/features/settings/SettingsPage.jsx'

/* ── Utils ── */
import {
  toArray,
  normalizePushupRecords,
  normalizeSprintRecords,
  isSprintLikeRecord,
  EMPTY_ADD_FORM,
} from '@/lib/utils.js'

/* ── API (for tab-refresh effects) ── */
import {
  officerGetBmi,
  officerGetPushupRecords,
  officerGetSprintRecords,
  adminGetSummary,
} from '@/services/api.js'

/* ============================================================
   APP COMPONENT — Slim Orchestrator
   All business logic lives in hooks. App.jsx only handles:
   1. Hook composition
   2. Tab-based data refresh effects
   3. Page routing (render switch)
   ============================================================ */

function App() {
  /* ── Feedback ── */
  const { toasts, toast, dismiss: dismissToast } = useToastState()
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  /* ── Global Store ── */
  const store = useAppStore()
  const isAdmin = store.userRole === 'admin'

  /* ── Domain Hooks ── */
  const auth = useAuth()
  const profile = useProfile(toast)
  const { handleGlobalRefresh } = useGlobalRefresh(profile.refreshProfilePage)
  const exercises = useExerciseSubmissions(toast)
  const adminRecords = useAdminRecords(toast, confirm)
  const userMgmt = useUserManagement(toast, confirm)
  const dashboard = useDashboardData()

  /* ============================================================
     EFFECTS — Tab-Based Data Refresh
     ============================================================ */

  // Clear data on mount
  useEffect(() => {
    store.setUsers([])
    store.setAccounts([])
  }, [])

  // Profile page loader
  useEffect(() => {
    if (!store.isAuthenticated || store.activePage !== 'officerProfile') return
    profile.refreshProfilePage()
  }, [store.isAuthenticated, store.activePage, isAdmin])

  // Auto-refresh BMI when officer switches to BMI tab
  useEffect(() => {
    if (!store.isAuthenticated || isAdmin || store.activePage !== 'dashboard' || store.officerDashboardTab !== 'bmi') return
    ;(async () => {
      const fresh = await officerGetBmi().catch(() => [])
      store.setOfficerBmiRecords(toArray(fresh))
    })()
  }, [store.isAuthenticated, isAdmin, store.activePage, store.officerDashboardTab])

  // Auto-refresh pushup records
  useEffect(() => {
    if (!store.isAuthenticated || isAdmin || store.activePage !== 'dashboard' || store.officerDashboardTab !== 'pushup') return
    ;(async () => {
      try {
        const fresh = await officerGetPushupRecords()
        store.setOfficerPushupRecords(normalizePushupRecords(fresh))
      } catch (error) {
        console.error('Failed to load push-up records:', error)
      }
    })()
  }, [store.isAuthenticated, isAdmin, store.activePage, store.officerDashboardTab])

  // Auto-refresh sprint records
  useEffect(() => {
    if (!store.isAuthenticated || isAdmin || store.activePage !== 'dashboard' || store.officerDashboardTab !== 'sprint') return
    ;(async () => {
      try {
        const fresh = await officerGetSprintRecords()
        store.setOfficerSprintRecords(normalizeSprintRecords(fresh).filter(isSprintLikeRecord))
      } catch (error) {
        console.error('Failed to load sprint records:', error)
      }
    })()
  }, [store.isAuthenticated, isAdmin, store.activePage, store.officerDashboardTab])

  // Auto-refresh admin summary for overall score tab
  useEffect(() => {
    if (!store.isAuthenticated || !isAdmin) return
    const isOverallTabActive =
      (store.activePage === 'dashboard' && store.dashboardAdminTab === 'overall') ||
      (store.activePage === 'user' && store.adminRecordsTab === 'overall')
    if (!isOverallTabActive) return

    let cancelled = false
    ;(async () => {
      try {
        const summaryRecords = await adminGetSummary()
        if (!cancelled) store.setAdminSummary(toArray(summaryRecords))
      } catch (error) {
        console.error('Failed to load admin summary:', error)
      }
    })()
    return () => { cancelled = true }
  }, [store.isAuthenticated, isAdmin, store.activePage, store.dashboardAdminTab, store.adminRecordsTab])

  /* ============================================================
     RENDER — Login Gate
     ============================================================ */

  if (!store.isAuthenticated) {
    return (
      <div className="w-full min-h-screen">
        <Login
          onLogin={auth.handleLogin}
          onCreateAccount={auth.handleCreateAccount}
          loginError={auth.loginError}
          setLoginError={auth.setLoginError}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        {ConfirmDialogComponent}
      </div>
    )
  }

  /* ============================================================
     RENDER — Main App
     ============================================================ */

  return (
    <div className="min-h-screen w-full bg-surface text-navy animate-fade-in">
      <Sidebar
        activePage={store.activePage}
        setActivePage={store.setActivePage}
        isAdmin={isAdmin}
        userName={store.userName}
        sidebarCollapsed={store.sidebarCollapsed}
        setSidebarCollapsed={store.setSidebarCollapsed}
        mobileMenuOpen={store.mobileMenuOpen}
        setMobileMenuOpen={store.setMobileMenuOpen}
      />

      <main
        style={{
          '--app-sidebar-offset': store.sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        }}
        className={clsx(
          'h-screen w-full min-w-0 overflow-y-auto overflow-x-hidden bg-surface transition-all duration-300 ease-smooth animate-slide-up',
          'lg:ml-[var(--app-sidebar-offset)] lg:w-[calc(100%-var(--app-sidebar-offset))]'
        )}
      >
        <Topbar
          activePage={store.activePage}
          userName={store.userName}
          isAdmin={isAdmin}
          setMobileMenuOpen={store.setMobileMenuOpen}
          onRefresh={handleGlobalRefresh}
          setActivePage={store.setActivePage}
          onLogout={auth.handleLogout}
        />

        <div className="w-full min-h-[calc(100vh-var(--topbar-height))]">
          {/* ── Dashboard ── */}
          {store.activePage === 'dashboard' && (
            <div className="min-h-[calc(100vh-var(--topbar-height))] w-full min-w-0 p-4 md:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 animate-fade-in rounded-2xl border border-gray-100 bg-gray-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              {/* Left Column - Main Content (Tables) */}
              <div className="flex-1 min-w-0 order-2 xl:order-1">
                {!isAdmin && (
                  <OfficerExercises
                    officerDashboardTab={store.officerDashboardTab}
                    setOfficerDashboardTab={store.setOfficerDashboardTab}
                    {...exercises}
                    officerWalkRecords={store.officerWalkRecords}
                    officerBmiRecords={store.officerBmiRecords}
                    officerSitupRecords={store.officerSitupRecords}
                    officerPushupRecords={store.officerPushupRecords}
                    officerSprintRecords={store.officerSprintRecords}
                  />
                )}

                {isAdmin && (
                  <AdminDashboard
                    users={store.users}
                    adminWalkTests={store.adminWalkTests}
                    adminBmiRecords={store.adminBmiRecords}
                    adminSitupRecords={store.adminSitupRecords}
                    adminPushupRecords={store.adminPushupRecords}
                    adminSprintRecords={store.adminSprintRecords}
                    adminSummary={store.adminSummary}
                    dashboardSearch={store.dashboardSearch}
                    setDashboardSearch={store.setDashboardSearch}
                    dashboardAdminTab={store.dashboardAdminTab}
                    setDashboardAdminTab={store.setDashboardAdminTab}
                    getOfficerName={dashboard.getOfficerName}
                  />
                )}
              </div>

              {/* Right Column - Status & Summary (StatCards) */}
              <div className="w-full xl:w-[380px] flex-shrink-0 order-1 xl:order-2 space-y-6">
                <StatCards role={isAdmin ? 'admin' : 'officer'} counts={dashboard.statCounts} />
              </div>
            </div>
          )}

          {/* ── Officer Profile ── */}
          {store.activePage === 'officerProfile' && (
            <div className="min-h-[calc(100vh-var(--topbar-height))] w-full min-w-0 p-4 md:p-6 lg:p-8">
              <OfficerProfile
                isAdmin={isAdmin}
                userName={store.userName}
                accounts={store.accounts}
                officerInfo={profile.officerInfo}
                officerProfileError={profile.officerProfileError}
                officerProfileLoading={profile.officerProfileLoading}
                adminProfileForPage={profile.adminProfileForPage}
                onCreateProfile={profile.handleCreateOfficerProfile}
              />
            </div>
          )}

          {/* ── User Management ── */}
          {store.activePage === 'user' && (
            <div className="min-h-[calc(100vh-var(--topbar-height))] w-full min-w-0 p-4 md:p-6 lg:p-8">
              <div className="w-full min-w-0 space-y-6">
              <div className="flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-gray-50/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                {['walk', 'bmi', 'situp', 'pushup', 'sprint', 'overall'].map((tab) => (
                  <ExercisePillButton
                    key={tab}
                    active={store.adminRecordsTab === tab}
                    onClick={() => store.setAdminRecordsTab(tab)}
                  >
                    <span className="whitespace-nowrap">
                      {{
                        walk: 'Walk Test Records',
                        bmi: 'BMI Test Record',
                        situp: '1 Min Sit-up Records',
                        pushup: 'Push-up Test Record',
                        sprint: '300 Meters Sprint Test Record',
                        overall: 'Overall Exercise Score',
                      }[tab]}
                    </span>
                  </ExercisePillButton>
                ))}
              </div>

              {store.adminRecordsTab === 'walk' && (
                <User
                  users={store.users}
                  filteredUsers={userMgmt.filteredUsers}
                  setUsers={store.setUsers}
                  onDeleteUser={userMgmt.handleDeleteUser}
                  onImportExcel={userMgmt.handleImportExcel}
                  onOpenAddModal={() => { userMgmt.setAddForm(EMPTY_ADD_FORM); userMgmt.setEditingUser(null); userMgmt.setIsModalOpen(true) }}
                  onAddWalkTest={() => adminRecords.setIsAddOtherWalkTestModalOpen(true)}
                  onEditUser={userMgmt.openEditModal}
                  onDeleteWalkTest={adminRecords.handleDeleteWalkTest}
                  onEditWalkTest={adminRecords.openWalkTestModal}
                  search={store.search} setSearch={store.setSearch}
                  gender={store.gender} setGender={store.setGender}
                  ageMin={store.ageMin} setAgeMin={store.setAgeMin}
                  ageMax={store.ageMax} setAgeMax={store.setAgeMax}
                  onResetFilters={store.resetFilters}
                  onExportFiltered={() => userMgmt.exportCsv(userMgmt.filteredUsers, 'filtered')}
                  onExportAll={(list) => userMgmt.exportCsv(list || store.users, 'all')}
                  adminWalkTests={store.adminWalkTests}
                  getOfficerName={dashboard.getOfficerName}
                />
              )}

              {store.adminRecordsTab === 'bmi' && (
                <BmiPanel records={store.adminBmiRecords} search={store.bmiSearch} setSearch={store.setBmiSearch} onAdd={() => adminRecords.setIsAddOtherBmiModalOpen(true)} getOfficerName={dashboard.getOfficerName} onEdit={adminRecords.openBmiModal} onDelete={adminRecords.handleDeleteBmi} />
              )}

              {store.adminRecordsTab === 'situp' && (
                <RepsPanel title="1 Min Sit-up Records" addLabel="Add Sit-up Record" records={store.adminSitupRecords} search={store.situpSearch} setSearch={store.setSitupSearch} onAdd={() => adminRecords.setIsAddOtherSitupModalOpen(true)} getOfficerName={dashboard.getOfficerName} onEdit={adminRecords.openSitupModal} onDelete={adminRecords.handleDeleteSitup} editLabel="Edit Sit-up" deleteLabel="Delete Sit-up" />
              )}

              {store.adminRecordsTab === 'pushup' && (
                <RepsPanel title="Push-up Test Record" addLabel="Add Push-up Record" records={store.adminPushupRecords} search={store.pushupSearch} setSearch={store.setPushupSearch} onAdd={() => adminRecords.setIsAddOtherPushupModalOpen(true)} getOfficerName={dashboard.getOfficerName} onEdit={adminRecords.openPushupModal} onDelete={adminRecords.handleDeletePushup} editLabel="Edit Push-up" deleteLabel="Delete Push-up" />
              )}

              {store.adminRecordsTab === 'sprint' && (
                <SprintPanel records={store.adminSprintRecords} search={store.sprintSearch} setSearch={store.setSprintSearch} onAdd={() => adminRecords.setIsAddOtherSprintModalOpen(true)} getOfficerName={dashboard.getOfficerName} onEdit={adminRecords.openSprintModal} onDelete={adminRecords.handleDeleteSprint} />
              )}

              {store.adminRecordsTab === 'overall' && (
                <AdminDashboard
                  users={store.users}
                  adminWalkTests={store.adminWalkTests}
                  adminBmiRecords={store.adminBmiRecords}
                  adminSitupRecords={store.adminSitupRecords}
                  adminPushupRecords={store.adminPushupRecords}
                  adminSprintRecords={store.adminSprintRecords}
                  adminSummary={store.adminSummary}
                  dashboardSearch={store.search}
                  setDashboardSearch={store.setSearch}
                  dashboardAdminTab="overall"
                  setDashboardAdminTab={() => {}}
                  getOfficerName={dashboard.getOfficerName}
                  overallScoresOverride={dashboard.overallScores}
                />
              )}
              </div>
            </div>
          )}



          {/* ── Settings ── */}
          {store.activePage === 'settings' && (
            <div className="min-h-[calc(100vh-var(--topbar-height))] w-full min-w-0 p-4 md:p-6 lg:p-8">
              <Settings userName={store.userName} userRole={store.userRole} onLogout={auth.handleLogout} />
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      <UserFormModal
        isOpen={userMgmt.isModalOpen}
        editingUser={userMgmt.editingUser}
        addForm={userMgmt.addForm}
        setAddForm={userMgmt.setAddForm}
        onSubmit={userMgmt.editingUser ? userMgmt.handleSaveEditUser : userMgmt.handleRegisterUser}
        onClose={userMgmt.closeModal}
      />

      <ExerciseModals
        {...adminRecords}
      />

      {/* ── Toast Notifications & Confirm Dialog ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {ConfirmDialogComponent}
    </div>
  )
}

export default App
