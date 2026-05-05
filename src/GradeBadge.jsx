/**
 * GradeBadge — Styled badge for exercise grade display.
 * Utilizes the existing .grade-badge CSS classes.
 */
function GradeBadge({ grade }) {
  if (!grade || grade === '—') return <span className="grade-badge grade-badge--none">—</span>

  const g = String(grade).toLowerCase()
  let variant = 'default'

  if (g.includes('excellent') || g.includes('superior')) variant = 'excellent'
  else if (g.includes('good') || g.includes('very good') || g.includes('pass')) variant = 'good'
  else if (g.includes('fair') || g.includes('satisfactory') || g.includes('average')) variant = 'fair'
  else if (g.includes('poor') || g.includes('fail') || g.includes('needs improvement') || g === 'no go') variant = 'poor'
  else if (g === 'go') variant = 'go'

  return <span className={`grade-badge grade-badge--${variant}`}>{grade}</span>
}

/**
 * StatusBadge — For overall pass/fail status.
 */
export function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase()
  let variant = 'pending'
  let label = status || 'Pending'

  if (s.includes('pass') || s === 'go') { variant = 'go'; label = 'Passed' }
  else if (s.includes('fail') || s === 'no go') { variant = 'nogo'; label = 'Failed' }
  else if (s.includes('no data')) { variant = 'none'; label = 'No Data' }

  return <span className={`grade-badge grade-badge--${variant}`}>{label}</span>
}

/**
 * GenderBadge — Styled gender display
 */
export function GenderBadge({ gender }) {
  const g = String(gender || '').toLowerCase()
  const icon = g === 'female' ? '♀' : '♂'
  return <span className="gender-badge">{icon} {gender || '—'}</span>
}

export default GradeBadge
