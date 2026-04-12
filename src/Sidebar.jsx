import { IconDashboard, IconProfile, IconUsers, IconSettings, IconChevronLeft } from './icons.jsx'
import { getInitials } from './utils.js'

const PNP_LOGO = 'https://static.wikia.nocookie.net/logopedia/images/3/31/Philippine_National_Police.png/revision/latest?cb=20200626051209'

function Sidebar({ activePage, setActivePage, isAdmin, userName, sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <IconDashboard />, section: 'Main' },
    { key: 'officerProfile', label: isAdmin ? 'Admin Profile' : 'Officer Profile', icon: <IconProfile />, section: 'Main' },
    ...(isAdmin ? [{ key: 'user', label: 'User Management', icon: <IconUsers />, section: 'Management', showDot: true }] : []),
    { key: 'settings', label: 'Settings', icon: <IconSettings />, section: null },
  ]

  const handleNavClick = (key) => (e) => {
    e.preventDefault()
    setActivePage(key)
    setMobileMenuOpen(false)
  }

  // Group items by section
  let currentSection = null

  return (
    <>
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}${mobileMenuOpen ? ' mobile-open' : ''}`}>
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(c => !c)} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <IconChevronLeft />
        </button>
        <div className="sidebar-brand">
          <div className="badge-icon">
            <img src={PNP_LOGO} alt="Philippine National Police" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '100%' }} />
          </div>
          <div className="brand-title">Human Resource and Doctrine Development Dept.</div>
          <div className="brand-sub">Command Center</div>
        </div>
        <nav className="nav-section">
          {navItems.map((item) => {
            const showSection = item.section && item.section !== currentSection
            if (item.section) currentSection = item.section
            return (
              <span key={item.key}>
                {showSection && <div className="nav-label">{item.section}</div>}
                <a
                  className={`nav-item ${activePage === item.key ? 'active' : ''}`}
                  href="#"
                  onClick={handleNavClick(item.key)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                  {item.showDot && <span className="status-dot" />}
                </a>
              </span>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="officer-card">
            <div className="officer-avatar">{getInitials(userName || 'Guest')}</div>
            <div>
              <div className="officer-name">{userName ? `${isAdmin ? 'Adm.' : 'Ofc.'} ${userName}` : (isAdmin ? 'Adm. Guest' : 'Ofc. Guest')}</div>
              <div className="officer-rank">{isAdmin ? 'Administrator' : 'Officer'}</div>
            </div>
          </div>
        </div>
      </aside>
      {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />}
    </>
  )
}

export default Sidebar
