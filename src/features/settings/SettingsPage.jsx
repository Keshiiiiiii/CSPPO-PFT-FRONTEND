import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { IconSettings, IconProfile, IconMonitor, IconAlertTriangle, IconShield, IconLogOut, IconZap, IconMoon } from '@/components/icons.jsx'
import { getInitials } from '@/lib/utils.js'

const SunIcon = IconZap
const MoonIcon = IconMoon

const cardIconClass = 'flex items-center justify-center w-10 h-10 rounded-lg bg-blue/10 text-blue [&_svg]:w-5 [&_svg]:h-5 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2'

/**
 * Settings page — session info, system details, dark mode, and logout.
 * Fully migrated to Tailwind CSS.
 */
function Settings({ userName, userRole, onLogout }) {
  const isAdmin = userRole === 'admin'
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pft-theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('pft-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="w-full animate-fade-in rounded-2xl border border-gray-100 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden">
      <div className="py-8 px-6 md:px-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8 max-w-4xl mx-auto">
          <div className={cardIconClass}><IconSettings /></div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Settings</h1>
            <p className="text-sm text-muted">Manage your session and account preferences</p>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Session Card */}
          <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
              <span className={cardIconClass}><IconProfile /></span>
              <div>
                <div className="text-sm font-semibold text-navy">Active Session</div>
                <div className="text-2xs text-muted">Your currently authenticated account</div>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-royal/20 border-2 border-royal/30 flex items-center justify-center text-sm font-bold text-blue-bright uppercase">
              {getInitials(userName || 'U')}
            </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-navy truncate">{userName || '—'}</div>
                <div className="mt-1">
                  <span className={clsx(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold [&_svg]:w-3 [&_svg]:h-3 [&_svg]:stroke-current [&_svg]:fill-none',
                    isAdmin ? 'bg-violet-pale text-violet' : 'bg-blue/10 text-blue'
                  )}>
                    <IconShield /> {isAdmin ? 'Administrator' : 'Officer'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-light animate-pulse" />
                <span className="text-xs text-emerald font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* Appearance Card */}
          <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
              <span className={cardIconClass}><IconMonitor /></span>
              <div>
                <div className="text-sm font-semibold text-navy">Appearance</div>
                <div className="text-2xs text-muted">Customize your viewing experience</div>
              </div>
            </div>
            <div className="px-6 py-5">
            {/* Toggle Row */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-sm font-medium text-navy">Theme Mode</div>
                <div className="text-2xs text-muted mt-0.5">Toggle between light and dark appearance</div>
              </div>
              <button
                type="button"
                className={clsx(
                  'relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer',
                  isDark ? 'bg-royal' : 'bg-gray-200'
                )}
                onClick={() => setIsDark(d => !d)}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className={clsx(
                  'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300',
                  isDark ? 'translate-x-7.5' : 'translate-x-0.5'
                )}>
                  {isDark ? <MoonIcon /> : <SunIcon />}
                </span>
              </button>
            </div>

            {/* Theme Preview Cards */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={clsx(
                  'rounded-lg border-2 p-3 text-center transition-all duration-fast cursor-pointer',
                  !isDark ? 'border-blue shadow-sm' : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => setIsDark(false)}
              >
                <div className="bg-gray-50 rounded-md p-3 mb-2">
                  <div className="h-2 w-full bg-gray-200 rounded mb-2" />
                  <div className="flex gap-1.5">
                    <div className="h-6 flex-1 bg-gray-200 rounded" />
                    <div className="h-6 flex-1 bg-gray-200 rounded" />
                    <div className="h-6 flex-1 bg-gray-200 rounded" />
                  </div>
                </div>
                <span className="text-xs font-medium text-navy">Light</span>
              </button>
              <button
                type="button"
                className={clsx(
                  'rounded-lg border-2 p-3 text-center transition-all duration-fast cursor-pointer',
                  isDark ? 'border-blue shadow-sm' : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => setIsDark(true)}
              >
                <div className="bg-navy rounded-md p-3 mb-2">
                  <div className="h-2 w-full bg-navy-mid rounded mb-2" />
                  <div className="flex gap-1.5">
                    <div className="h-6 flex-1 bg-navy-mid rounded" />
                    <div className="h-6 flex-1 bg-navy-mid rounded" />
                    <div className="h-6 flex-1 bg-navy-mid rounded" />
                  </div>
                </div>
                <span className="text-xs font-medium text-navy">Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Info Card */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <span className={cardIconClass}><IconMonitor /></span>
            <div>
              <div className="text-sm font-semibold text-navy">System Information</div>
              <div className="text-2xs text-muted">Portal and environment details</div>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            <InfoRow label="System" value="PNP HRDD Portal" />
            <InfoRow label="Access Level" value={isAdmin ? 'Full Admin Access' : 'Officer Access'} />
            <InfoRow label="Session Started" value={new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })} />
            <InfoRow label="Version" value="v2.0.0" />
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-white rounded-xl shadow-card border border-coral/20 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-coral/10">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-coral-pale text-coral [&_svg]:w-5 [&_svg]:h-5 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2">
              <IconAlertTriangle />
            </span>
            <div>
              <div className="text-sm font-semibold text-coral">Danger Zone</div>
              <div className="text-2xs text-muted">Actions here will end your current session</div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <div className="text-sm font-medium text-navy">Sign Out</div>
              <div className="text-2xs text-muted mt-0.5">You will be returned to the login screen. All unsaved changes will be lost.</div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-coral rounded-lg hover:bg-coral-light shadow-sm transition-colors duration-fast cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2"
              onClick={() => { if (window.confirm('Are you sure you want to sign out?')) onLogout() }}
            >
              <IconLogOut /> Sign Out
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="text-sm font-medium text-navy">{value}</span>
    </div>
  )
}

export default Settings
