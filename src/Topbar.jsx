import { IconMenu, IconRefresh } from './icons.jsx'
import { getGreeting } from './utils.js'

function Topbar({ activePage, userName, isAdmin, setMobileMenuOpen, onRefresh }) {
  const meta = {
    dashboard:      { crumb: 'Main / Dashboard',        title: 'Dashboard Overview' },
    officerProfile: { crumb: isAdmin ? 'Main / Admin Profile' : 'Main / Officer Profile',   title: isAdmin ? 'Admin Profile' : 'Officer Profile' },
    user:           { crumb: 'Management / Users',       title: 'User Registry' },
    settings:       { crumb: 'System / Settings',        title: 'Settings' },
  }[activePage] || { crumb: '', title: '' }

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
        <button className="topbar-btn" title="Refresh" type="button" onClick={onRefresh}>
          <IconRefresh />
        </button>
      </div>
    </div>
  )
}

export default Topbar
