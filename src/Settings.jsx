import { useState, useEffect } from 'react'
import { IconSettings, IconProfile, IconMonitor, IconAlertTriangle, IconShield, IconLogOut } from './icons.jsx'
import { getInitials } from './utils.js'

/* ── Dark Mode Icons ── */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

/**
 * Settings page — session info, system details, dark mode, and logout.
 */
function Settings({ userName, userRole, onLogout }) {
  const isAdmin = userRole === 'admin'
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('pft-theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('pft-theme', isDark ? 'dark' : 'light')
  }, [isDark])

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

        {/* Appearance Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><IconMonitor /></span>
            <div>
              <div className="settings-card-title">Appearance</div>
              <div className="settings-card-desc">Customize your viewing experience</div>
            </div>
          </div>
          <div className="settings-appearance-body">
            <div className="settings-theme-toggle">
              <div className="settings-theme-info">
                <div className="settings-theme-label">Theme Mode</div>
                <div className="settings-theme-hint">Toggle between light and dark appearance</div>
              </div>
              <button
                type="button"
                className={`settings-theme-switch ${isDark ? 'active' : ''}`}
                onClick={() => setIsDark(d => !d)}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="settings-theme-switch__thumb">
                  {isDark ? <MoonIcon /> : <SunIcon />}
                </span>
              </button>
            </div>
            <div className="settings-theme-preview">
              <div className={`settings-theme-card ${!isDark ? 'active' : ''}`} onClick={() => setIsDark(false)}>
                <div className="settings-theme-card__preview settings-theme-card__preview--light">
                  <div className="stcp__bar" />
                  <div className="stcp__content"><div /><div /><div /></div>
                </div>
                <span>Light</span>
              </div>
              <div className={`settings-theme-card ${isDark ? 'active' : ''}`} onClick={() => setIsDark(true)}>
                <div className="settings-theme-card__preview settings-theme-card__preview--dark">
                  <div className="stcp__bar" />
                  <div className="stcp__content"><div /><div /><div /></div>
                </div>
                <span>Dark</span>
              </div>
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
            <InfoRow label="Version" value="v2.0.0" />
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
