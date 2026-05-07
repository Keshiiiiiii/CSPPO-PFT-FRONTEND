import { useState } from 'react'
import {
  IconActivity,
  IconChevronDown,
  IconClipboard,
  IconDashboard,
  IconScale,
  IconTarget,
  IconUsers,
  IconWalk,
  IconZap,
} from '@/components/icons.jsx'
import clsx from 'clsx'
import MetricCard from '@/components/ui/MetricCard.jsx'

/**
 * Dashboard summary — elevated metric cards (Linear-inspired), collapsible on small viewports.
 */
function StatCards({ role, counts }) {
  const isAdmin = role === 'admin'
  const [isExpanded, setIsExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const cards = [
    {
      label: isAdmin ? 'Total Officers' : 'Total Tests',
      value: counts.total,
      icon: isAdmin ? IconUsers : IconClipboard,
      color: 'blue',
      subtitle: isAdmin ? 'Registered profiles in the system' : 'All exercise records combined',
      trend: 'up',
    },
    {
      label: 'Walk Tests',
      value: counts.walk,
      icon: IconWalk,
      color: 'emerald',
      subtitle: isAdmin ? 'Walk test submissions' : 'Your walk test history',
      trend: 'up',
    },
    {
      label: 'BMI Records',
      value: counts.bmi,
      icon: IconScale,
      color: 'amber',
      subtitle: isAdmin ? 'Body mass index entries' : 'BMI log entries',
      trend: 'neutral',
    },
    {
      label: '1 Min Sit-up',
      value: counts.situp,
      icon: IconActivity,
      color: 'violet',
      subtitle: isAdmin ? 'Sit-up test records' : 'Sit-up history',
      trend: 'up',
    },
    {
      label: 'Push-up',
      value: counts.pushup,
      icon: IconTarget,
      color: 'rose',
      subtitle: isAdmin ? 'Push-up test records' : 'Push-up history',
      trend: 'up',
    },
    {
      label: '300m Sprint',
      value: counts.sprint,
      icon: IconZap,
      color: 'blue',
      subtitle: isAdmin ? 'Sprint test records' : 'Sprint history',
      trend: 'neutral',
    },
  ]

  const visibleCards = isExpanded ? cards : cards.slice(0, 3)

  return (
    <div
      className={clsx(
        'rounded-2xl border border-gray-100 bg-white overflow-hidden animate-fade-in flex flex-col',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)]'
      )}
    >
      {/* Mobile / tablet: collapsible shell */}
      <div className="xl:hidden border-b border-gray-100 bg-white">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50/90 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
              <IconDashboard />
            </span>
            <div>
              <div className="text-sm font-semibold text-navy">Summary</div>
              <div className="text-2xs text-muted truncate">Key metrics · tap to {mobileOpen ? 'hide' : 'show'}</div>
            </div>
          </div>
          <span className={clsx('text-gray-400 shrink-0 transition-transform duration-300', mobileOpen && 'rotate-180')}>
            <IconChevronDown />
          </span>
        </button>
      </div>

      <div
        className={clsx(
          'px-5 py-5 border-b border-gray-100 flex items-center justify-between',
          'hidden xl:flex'
        )}
      >
        <div className="text-base font-semibold text-navy tracking-tight">Summary</div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-gray-600 hover:text-navy transition-colors duration-200 cursor-pointer"
        >
          {isExpanded ? 'Show less' : 'See all'}
        </button>
      </div>

      <div
        className={clsx(
          'p-5 flex-1 space-y-4 bg-[#fafbfc] flex flex-col',
          !mobileOpen && 'max-xl:hidden'
        )}
      >
        {visibleCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            subtitle={card.subtitle}
            trend={card.trend}
          />
        ))}
      </div>
    </div>
  )
}

export default StatCards
