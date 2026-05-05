import { useEffect, useRef } from 'react'
import { IconMenu, IconRefresh } from './icons.jsx'
import { getGreeting } from './utils.js'

/* ── Keyboard Icon ── */
const KeyboardIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6.01" y2="8"/><line x1="10" y1="8" x2="10.01" y2="8"/><line x1="14" y1="8" x2="14.01" y2="8"/><line x1="18" y1="8" x2="18.01" y2="8"/><line x1="8" y1="12" x2="8.01" y2="12"/><line x1="12" y1="12" x2="12.01" y2="12"/><line x1="16" y1="12" x2="16.01" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/>
  </svg>
)

function Topbar({ activePage, userName, isAdmin, setMobileMenuOpen, onRefresh, setActivePage }) {
  const searchRef = useRef(null)
  const meta = {
    dashboard:      { crumb: 'Main / Dashboard',        title: 'Dashboard Overview' },
    officerProfile: { crumb: isAdmin ? 'Main / Admin Profile' : 'Main / Officer Profile',   title: isAdmin ? 'Admin Profile' : 'Officer Profile' },
    user:           { crumb: 'Management / Users',       title: 'User Registry' },
    settings:       { crumb: 'System / Settings',        title: 'Settings' },
  }[activePage] || { crumb: '', title: '' }

  /* ── Global Keyboard Shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K => focus search (if available)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('.filter-input, .user-search input, input[placeholder*="Search"]')
        if (searchInput) searchInput.focus()
      }

      // Escape => close any modal
      if (e.key === 'Escape') {
        const modal = document.querySelector('.exercise-modal-overlay, .modal-overlay, .confirm-dialog__overlay')
        if (modal) {
          const closeBtn = modal.querySelector('.exercise-modal__close, .modal-close, .confirm-dialog__btn--cancel')
          if (closeBtn) closeBtn.click()
        }
      }

      // Alt+1..4 navigation shortcuts
      if (e.altKey && setActivePage) {
        const pages = { '1': 'dashboard', '2': 'officerProfile', '3': 'user', '4': 'settings' }
        if (pages[e.key]) {
          e.preventDefault()
          setActivePage(pages[e.key])
        }
      }

      // Ctrl+R or F5 => refresh data (prevent browser refresh)
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
        // Only if not in an input
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          onRefresh?.()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRefresh, setActivePage])

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" type="button" onClick={() => setMobileMenuOpen(o => !o)} title="Toggle menu">
          <IconMenu />
        </button>
        <div>
          <div className="page-crumb">{meta.crumb}</div>
          <div className="page-title">{meta.title}</div>
        </div>
        <span className="topbar-greeting">{getGreeting()}, {userName || (isAdmin ? 'Admin' : 'Officer')}</span>
      </div>
      <div className="topbar-right">
        <div className="topbar-shortcut-hint" title="Press Ctrl+K to search, Alt+1-4 to navigate">
          <KeyboardIcon />
          <span className="shortcut-key">Ctrl+K</span>
        </div>
        <button className="topbar-btn" title="Refresh Data (F5)" type="button" onClick={onRefresh}>
          <IconRefresh />
        </button>
      </div>
    </div>
  )
}

export default Topbar
