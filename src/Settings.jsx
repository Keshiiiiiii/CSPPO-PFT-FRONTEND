import { IconSettings, IconProfile, IconMonitor, IconAlertTriangle, IconShield, IconLogOut } from './icons.jsx'
import { getInitials } from './utils.js'

/**
 * Settings page — session info, system details, and logout.
 */
function Settings({ userName, userRole, onLogout }) {
  const isAdmin = userRole === 'admin'

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="settings-page-header">
        <div className="settings-page-header-icon"><IconSettings /></div>
        <div>
          <h1 className="settings-page-title">Settings</h1>
          <p className="settings-page-subtitle">Manage your session and account preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Session Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><IconProfile /></span>
            <div>
              <div className="settings-card-title">Active Session</div>
              <div className="settings-card-desc">Your currently authenticated account</div>
            </div>
          </div>
          <div className="settings-session-info">
            <div className="settings-session-avatar">{getInitials(userName || 'U')}</div>
            <div className="settings-session-details">
              <div className="settings-session-name">{userName || '—'}</div>
              <div className="settings-session-role">
                <span className={`settings-role-badge settings-role-badge--${userRole}`}>
                  <IconShield /> {isAdmin ? 'Administrator' : 'Officer'}
                </span>
              </div>
            </div>
            <div className="settings-session-status">
              <span className="settings-status-dot" />
              <span className="settings-status-text">Online</span>
            </div>
          </div>
        </div>

        {/* System Info Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><IconMonitor /></span>
            <div>
              <div className="settings-card-title">System Information</div>
              <div className="settings-card-desc">Portal and environment details</div>
            </div>
          </div>
          <div className="settings-info-list">
            <InfoRow label="System" value="PNP HRDD Portal" />
            <InfoRow label="Access Level" value={isAdmin ? 'Full Admin Access' : 'Officer Access'} />
            <InfoRow label="Session Started" value={new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })} />
            <InfoRow label="Version" value="v1.0.0" />
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="settings-card settings-card--danger">
          <div className="settings-card-header">
            <span className="settings-card-icon"><IconAlertTriangle /></span>
            <div>
              <div className="settings-card-title">Danger Zone</div>
              <div className="settings-card-desc">Actions here will end your current session</div>
            </div>
          </div>
          <div className="settings-danger-body">
            <div className="settings-danger-info">
              <div className="settings-danger-label">Sign Out</div>
              <div className="settings-danger-hint">
                You will be returned to the login screen. All unsaved changes will be lost.
              </div>
            </div>
            <button
              type="button"
              className="settings-logout-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  onLogout()
                }
              }}
            >
              <IconLogOut /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="settings-info-row">
      <span className="settings-info-label">{label}</span>
      <span className="settings-info-value">{value}</span>
    </div>
  )
}

export default Settings
