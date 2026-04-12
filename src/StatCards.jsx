import { IconClipboard, IconTrendingUp, IconWalk, IconScale, IconActivity, IconUsers } from './icons.jsx'

/**
 * Dashboard summary stat cards.
 * @param {object} props
 * @param {'officer'|'admin'} props.role
 * @param {object} props.counts - { total, walk, bmi, fitness }
 */
function StatCards({ role, counts }) {
  const isAdmin = role === 'admin'

  const cards = [
    {
      label: isAdmin ? 'Total Officers' : 'Total Tests',
      value: counts.total,
      icon: isAdmin ? <IconUsers /> : <IconClipboard />,
      variant: '',
      iconClass: 'stat-icon--blue',
      change: isAdmin ? <><IconTrendingUp /> Registered profiles</> : <><IconTrendingUp /> All exercise records</>,
    },
    {
      label: 'Walk Tests',
      value: counts.walk,
      icon: <IconWalk />,
      variant: 'stat-card--emerald',
      iconClass: 'stat-icon--emerald',
      change: isAdmin ? 'Total walk test records' : 'Walk test records',
    },
    {
      label: 'BMI Records',
      value: counts.bmi,
      icon: <IconScale />,
      variant: 'stat-card--amber',
      iconClass: 'stat-icon--amber',
      change: isAdmin ? 'Body mass index tests' : 'Body mass index',
    },
    {
      label: isAdmin ? 'All Exercises' : 'Fitness Score',
      value: counts.fitness,
      icon: <IconActivity />,
      variant: 'stat-card--violet',
      iconClass: 'stat-icon--violet',
      change: isAdmin ? 'Sit-up + Push-up + Sprint' : 'Combined exercises',
    },
  ]

  return (
    <div className="stats-row">
      {cards.map((card) => (
        <div key={card.label} className={`stat-card ${card.variant}`}>
          <div className="stat-card-header">
            <div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
            <div className={`stat-icon ${card.iconClass}`}>{card.icon}</div>
          </div>
          <div className="stat-change">{card.change}</div>
        </div>
      ))}
    </div>
  )
}

export default StatCards
