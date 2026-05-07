import clsx from 'clsx'

const badgeBase =
  'inline-flex items-center px-2.5 py-0.5 rounded-md text-2xs font-semibold tracking-wide uppercase whitespace-nowrap ring-1 ring-inset'

const variantStyles = {
  none: 'bg-gray-50 text-gray-400 ring-gray-100',
  default: 'bg-gray-50 text-gray-700 ring-gray-200/80',
  /** Success — pass / excellent / good */
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200/70',
  /** Warning — fair / marginal */
  warning: 'bg-amber-50 text-amber-900 ring-amber-200/70',
  /** Failure — fail / poor */
  danger: 'bg-red-50 text-red-800 ring-red-200/70',
  go: 'bg-emerald-50 text-emerald-800 ring-emerald-200/70',
  nogo: 'bg-red-50 text-red-800 ring-red-200/70',
  pending: 'bg-gray-50 text-gray-600 ring-gray-200/80',
}

/**
 * GradeBadge — Styled badge for exercise grade display.
 */
function gradeVariant(grade) {
  const g = String(grade).toLowerCase().trim()
  if (g === 'go') return 'go'
  if (g.includes('excellent') || g.includes('superior') || g.includes('good') || g.includes('very good') || g.includes('pass') || g.includes('normal')) return 'success'
  if (g.includes('fair') || g.includes('satisfactory') || g.includes('average') || g.includes('overweight') || g.includes('marginal')) return 'warning'
  if (
    g.includes('poor') ||
    g.includes('fail') ||
    g.includes('needs improvement') ||
    g === 'no go' ||
    g.includes('obese') ||
    g.includes('underweight')
  )
    return 'danger'
  const pct = parseFloat(g.replace(/%/g, ''))
  if (!Number.isNaN(pct) && g.includes('%')) {
    if (pct >= 70) return 'success'
    if (pct >= 50) return 'warning'
    return 'danger'
  }
  return 'default'
}

function GradeBadge({ grade }) {
  if (!grade || grade === '—') return <span className={clsx(badgeBase, variantStyles.none)}>—</span>

  const variant = gradeVariant(grade)

  return <span className={clsx(badgeBase, variantStyles[variant])}>{grade}</span>
}

/**
 * StatusBadge — For overall pass/fail status.
 */
export function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase()
  let variant = 'pending'
  let label = status || 'Pending'

  if (s.includes('pass') || s === 'go') {
    variant = 'go'
    label = 'Passed'
  } else if (s.includes('fail') || s === 'no go') {
    variant = 'nogo'
    label = 'Failed'
  } else if (s.includes('no data')) {
    variant = 'none'
    label = 'No Data'
  }

  return <span className={clsx(badgeBase, variantStyles[variant])}>{label}</span>
}

/**
 * GenderBadge — Styled gender display
 */
export function GenderBadge({ gender }) {
  const g = String(gender || '').toLowerCase()
  const icon = g === 'female' ? '♀' : '♂'
  const styles =
    g === 'female' ? 'bg-violet-50 text-violet-800 ring-violet-200/70' : 'bg-blue-50 text-blue-800 ring-blue-200/70'

  return (
    <span className={clsx(badgeBase, styles)}>
      {icon} {gender || '—'}
    </span>
  )
}

export default GradeBadge
