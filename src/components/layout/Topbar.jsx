import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import {
  IconBell,
  IconChevronDown,
  IconKeyboard,
  IconMenu,
  IconRefresh,
  IconProfile,
  IconSettings,
  IconLogOut,
  IconShield,
} from '@/components/icons.jsx'
import { getGreeting, getInitials } from '@/lib/utils.js'

function Topbar({ activePage, userName, isAdmin, setMobileMenuOpen, onRefresh, setActivePage, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef(null)

  const meta = {
    dashboard:      { crumb: 'Main / Dashboard',        title: 'Dashboard Overview' },
    officerProfile: { crumb: isAdmin ? 'Main / Admin Profile' : 'Main / Officer Profile', title: isAdmin ? 'Admin Profile' : 'Officer Profile' },
    user:           { crumb: 'Management / Users',       title: 'User Registry' },
    settings:       { crumb: 'System / Settings',        title: 'Settings' },
  }[activePage] || { crumb: '', title: '' }

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen])

  /* ── Global Keyboard Shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('.filter-input, .user-search input, input[placeholder*="Search"]')
        if (searchInput) searchInput.focus()
      }
      if (e.key === 'Escape') {
        if (profileOpen) { setProfileOpen(false); return }
        const modal = document.querySelector('.exercise-modal-overlay, .modal-overlay, .confirm-dialog__overlay')
        if (modal) {
          const closeBtn = modal.querySelector('.exercise-modal__close, .modal-close, .confirm-dialog__btn--cancel')
          if (closeBtn) closeBtn.click()
        }
      }
      if (e.altKey && setActivePage) {
        const pages = { '1': 'dashboard', '2': 'officerProfile', '3': 'user', '4': 'settings' }
        if (pages[e.key]) { e.preventDefault(); setActivePage(pages[e.key]) }
      }
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          onRefresh?.()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRefresh, setActivePage, profileOpen])

  const displayName = userName || (isAdmin ? 'Admin' : 'Officer')
  const roleLabel = isAdmin ? 'Administrator' : 'Officer'
  const sessionTime = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between h-topbar px-6 bg-white border-b border-gray-200/60 shadow-xs">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate hover:text-navy hover:bg-gray-100 active:scale-90 transition-all duration-fast md:hidden cursor-pointer [&_svg]:w-5 [&_svg]:h-5 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2"
          type="button"
          onClick={() => setMobileMenuOpen(o => !o)}
          title="Toggle menu"
        >
          <IconMenu />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate">{meta.crumb.split(' / ')[0]}</span>
          <span className="text-slate/40 text-sm">/</span>
          <span className="text-sm font-semibold text-navy">{meta.crumb.split(' / ')[1]}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 border border-gray-100 text-2xs text-muted cursor-default"
          title="Press Ctrl+K to search, Alt+1-4 to navigate"
        >
          <IconKeyboard />
          <span className="font-mono text-slate">Ctrl+K</span>
        </div>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate hover:text-navy hover:bg-gray-100 active:scale-90 transition-all duration-fast cursor-pointer [&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2"
          title="Refresh Data (F5)"
          type="button"
          onClick={onRefresh}
        >
          <IconRefresh />
        </button>

        {/* Notification Bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate hover:text-navy hover:bg-gray-100 active:scale-90 transition-all duration-fast cursor-pointer"
          title="Notifications"
          type="button"
        >
          <IconBell />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full ring-2 ring-white" />
        </button>

        {/* Separator */}
        <div className="hidden sm:block w-px h-8 bg-gray-200" />

        {/* Profile Button + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className={clsx(
              'flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl transition-all duration-200 cursor-pointer',
              'hover:bg-gray-50 active:scale-[0.97]',
              profileOpen && 'bg-gray-50'
            )}
            onClick={() => setProfileOpen(prev => !prev)}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal to-blue-bright flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                {getInitials(displayName)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-light rounded-full ring-2 ring-white" />
            </div>
            {/* Name + Role */}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-navy leading-tight truncate max-w-[120px]">{displayName}</div>
              <div className="text-2xs text-muted leading-tight">{roleLabel}</div>
            </div>
            {/* Chevron */}
            <span className={clsx('hidden md:block text-slate/50 transition-transform duration-200', profileOpen && 'rotate-180')}>
              <IconChevronDown />
            </span>
          </button>

          {/* Dropdown Panel */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200/80 overflow-hidden animate-scale-in origin-top-right z-50">
              {/* Dropdown Header */}
              <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-navy to-navy-mid">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal to-blue-bright flex items-center justify-center text-base font-bold text-white uppercase shadow-md ring-2 ring-white/20">
                    {getInitials(displayName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{displayName}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold',
                        isAdmin
                          ? 'bg-violet/20 text-violet-light [&_svg]:w-2.5 [&_svg]:h-2.5 [&_svg]:stroke-current [&_svg]:fill-none'
                          : 'bg-blue/20 text-blue-bright [&_svg]:w-2.5 [&_svg]:h-2.5 [&_svg]:stroke-current [&_svg]:fill-none'
                      )}>
                        <IconShield /> {roleLabel}
                      </span>
                      <span className="flex items-center gap-1 text-2xs text-emerald-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-light animate-pulse" /> Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropdown Body — Scrollable */}
              <div className="max-h-[320px] overflow-y-auto">
                {/* Quick Info Section */}
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <div className="text-2xs font-semibold text-muted uppercase tracking-wider mb-2.5">Account Details</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate">Role</span>
                      <span className="text-xs font-medium text-navy">{isAdmin ? 'Full Admin Access' : 'Officer Access'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate">System</span>
                      <span className="text-xs font-medium text-navy">PNP HRDD Portal</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate">Session</span>
                      <span className="text-xs font-medium text-navy">{sessionTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate">Version</span>
                      <span className="text-xs font-medium text-navy">v2.0.0</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="px-3 py-2">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy font-medium hover:bg-surface transition-colors duration-fast cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2"
                    onClick={() => { setActivePage('officerProfile'); setProfileOpen(false) }}
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue/10 text-blue">
                      <IconProfile />
                    </span>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-navy">{isAdmin ? 'Admin Profile' : 'Officer Profile'}</div>
                      <div className="text-2xs text-muted">View and manage your profile</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy font-medium hover:bg-surface transition-colors duration-fast cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2"
                    onClick={() => { setActivePage('settings'); setProfileOpen(false) }}
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber/10 text-amber">
                      <IconSettings />
                    </span>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-navy">Settings</div>
                      <div className="text-2xs text-muted">Appearance and preferences</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Logout Footer */}
              <div className="px-3 py-2.5 border-t border-gray-100 bg-surface/40">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-coral hover:bg-coral-pale/60 transition-colors duration-fast cursor-pointer [&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to sign out?')) {
                      setProfileOpen(false)
                      onLogout?.()
                    }
                  }}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-coral-pale text-coral">
                    <IconLogOut />
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-semibold">Sign Out</div>
                    <div className="text-2xs text-muted">End your current session</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Topbar
