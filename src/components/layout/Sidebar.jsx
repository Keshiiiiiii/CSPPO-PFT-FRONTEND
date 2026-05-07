import clsx from 'clsx'
import { IconDashboard, IconProfile, IconUsers, IconSettings, IconChevronLeft, IconMessageCircle } from '@/components/icons.jsx'
import { getInitials } from '@/lib/utils.js'

const PNP_LOGO = 'https://static.wikia.nocookie.net/logopedia/images/3/31/Philippine_National_Police.png/revision/latest?cb=20200626051209'

function Sidebar({ activePage, setActivePage, isAdmin, userName, sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <IconDashboard />, section: 'Main' },
    { key: 'user', label: 'User Management', icon: <IconUsers />, section: 'Management', showDot: true },
  ]

  const handleNavClick = (key) => (e) => {
    e.preventDefault()
    setActivePage(key)
    setMobileMenuOpen(false)
  }

  let currentSection = null

  return (
    <>
      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen z-40 flex flex-col bg-navy/95 backdrop-blur-xl border-r border-white/[0.07] transition-all duration-300 ease-smooth overflow-hidden',
          'shadow-[1px_0_30px_rgba(37,99,235,0.06)]',
          sidebarCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
          mobileMenuOpen && 'translate-x-0 !w-sidebar',
          !mobileMenuOpen && 'max-md:-translate-x-full md:translate-x-0'
        )}
      >
        {/* Toggle Button */}
        <button
          className={clsx(
            'absolute top-5 right-3 z-10 w-7 h-7 rounded-full bg-navy-mid border border-white/10',
            'flex items-center justify-center text-muted hover:text-white hover:bg-royal/30 active:scale-90 transition-all duration-fast cursor-pointer',
            '[&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-2',
            sidebarCollapsed && 'rotate-180'
          )}
          onClick={() => setSidebarCollapsed(c => !c)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconChevronLeft />
        </button>

        {/* Brand */}
        <div className={clsx('flex items-center gap-3 px-5 py-6 border-b border-white/5', sidebarCollapsed && 'justify-center px-0')}>
          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-royal/40 shadow-glow">
            <img src={PNP_LOGO} alt="Philippine National Police" className="w-full h-full object-cover" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <div className="text-2xs font-semibold text-white/90 leading-tight truncate">
                Human Resource and Doctrine Development Dept.
              </div>
              <div className="text-2xs text-blue-bright/60 uppercase tracking-widest mt-0.5">
                Command Center
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => {
            const showSection = item.section && item.section !== currentSection
            if (item.section) currentSection = item.section
            return (
              <span key={item.key}>
                {showSection && !sidebarCollapsed && (
                  <div className="text-2xs font-semibold text-muted/60 uppercase tracking-widest px-3 pt-5 pb-2">
                    {item.section}
                  </div>
                )}
                <a
                  className={clsx(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-fast no-underline active:scale-[0.97]',
                    '[&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-[1.8]',
                    activePage === item.key
                      ? 'bg-royal/20 text-white shadow-sm border border-royal/20'
                      : 'text-muted hover:text-white hover:bg-white/5',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                  href="#"
                  onClick={handleNavClick(item.key)}
                >
                  <span className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-fast',
                    activePage === item.key ? 'bg-royal/30 text-blue-bright' : 'text-muted group-hover:text-white'
                  )}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  {item.showDot && !sidebarCollapsed && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-light animate-pulse" />
                  )}
                </a>
              </span>
            )
          })}
        </nav>

        {/* Footer — Support Card */}
        <div className="mt-auto px-3 pb-4 pt-2 flex flex-col gap-3">
          {!sidebarCollapsed && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-royal/20 to-navy-light/40 border border-royal/20 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-bright/10 rounded-full blur-xl group-hover:bg-blue-bright/20 transition-all duration-500" />
              <div className="flex items-start gap-3 relative">
                <div className="w-8 h-8 rounded-full bg-royal/30 text-blue-bright flex items-center justify-center flex-shrink-0">
                  <IconMessageCircle />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/90">Need some advice?</div>
                  <button className="mt-2 text-2xs px-3 py-1.5 rounded-lg bg-white text-navy font-semibold w-full hover:bg-off-white transition-colors duration-fast active:scale-95 shadow-sm">
                    Let's chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <button className="w-10 h-10 mx-auto rounded-full bg-royal/20 text-blue-bright flex items-center justify-center hover:bg-royal/30 transition-colors duration-fast">
              <IconMessageCircle />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
