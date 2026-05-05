/**
 * EmptyState — Premium empty state component with SVG illustration.
 * Use instead of plain text "No records found" messages.
 */
function EmptyState({ type, title, description, actionLabel, onAction }) {
  const illustrations = {
    search: (
      <svg viewBox="0 0 120 120" className="empty-state__illustration">
        <circle cx="52" cy="52" r="30" fill="none" stroke="var(--ice, #dbeafe)" strokeWidth="6"/>
        <circle cx="52" cy="52" r="30" fill="none" stroke="var(--blue-light, #3b82f6)" strokeWidth="2" strokeDasharray="8 6" opacity="0.5"/>
        <line x1="74" y1="74" x2="95" y2="95" stroke="var(--blue, #2563eb)" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="52" cy="52" r="12" fill="none" stroke="var(--blue-bright, #60a5fa)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="0 52 52" to="360 52 52" dur="12s" repeatCount="indefinite"/>
        </circle>
        <circle cx="45" cy="46" r="2" fill="var(--blue-bright, #60a5fa)" opacity="0.5"/>
        <circle cx="59" cy="46" r="2" fill="var(--blue-bright, #60a5fa)" opacity="0.5"/>
        <path d="M46 58 Q52 62 58 58" fill="none" stroke="var(--blue-bright, #60a5fa)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    records: (
      <svg viewBox="0 0 120 120" className="empty-state__illustration">
        <rect x="25" y="20" width="70" height="80" rx="8" fill="none" stroke="var(--ice, #dbeafe)" strokeWidth="4"/>
        <rect x="25" y="20" width="70" height="80" rx="8" fill="none" stroke="var(--blue-light, #3b82f6)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4"/>
        <line x1="38" y1="42" x2="82" y2="42" stroke="var(--blue-bright, #60a5fa)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="38" y1="55" x2="72" y2="55" stroke="var(--blue-bright, #60a5fa)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
        <line x1="38" y1="68" x2="62" y2="68" stroke="var(--blue-bright, #60a5fa)" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
        <line x1="38" y1="81" x2="55" y2="81" stroke="var(--blue-bright, #60a5fa)" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
        <circle cx="85" cy="85" r="18" fill="var(--surface, #f8faff)" stroke="var(--blue, #2563eb)" strokeWidth="2.5"/>
        <path d="M80 85 L83 88 L91 80" fill="none" stroke="var(--emerald, #059669)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    exercise: (
      <svg viewBox="0 0 120 120" className="empty-state__illustration">
        <circle cx="60" cy="45" r="22" fill="none" stroke="var(--ice, #dbeafe)" strokeWidth="4"/>
        <path d="M50 42 L55 50 L70 38" fill="none" stroke="var(--blue-light, #3b82f6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        <rect x="20" y="75" width="12" height="25" rx="4" fill="var(--blue-bright, #60a5fa)" opacity="0.2"/>
        <rect x="38" y="65" width="12" height="35" rx="4" fill="var(--blue-bright, #60a5fa)" opacity="0.35"/>
        <rect x="56" y="55" width="12" height="45" rx="4" fill="var(--blue-bright, #60a5fa)" opacity="0.5"/>
        <rect x="74" y="45" width="12" height="55" rx="4" fill="var(--blue, #2563eb)" opacity="0.65"/>
        <rect x="92" y="60" width="12" height="40" rx="4" fill="var(--blue-bright, #60a5fa)" opacity="0.4"/>
        <path d="M26 73 L44 63 L62 53 L80 42 L98 58" fill="none" stroke="var(--blue, #2563eb)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite"/>
        </path>
      </svg>
    ),
    users: (
      <svg viewBox="0 0 120 120" className="empty-state__illustration">
        <circle cx="60" cy="40" r="18" fill="none" stroke="var(--ice, #dbeafe)" strokeWidth="4"/>
        <circle cx="60" cy="40" r="18" fill="none" stroke="var(--blue-light, #3b82f6)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.4"/>
        <path d="M35 95 C35 75, 45 65, 60 65 C75 65, 85 75, 85 95" fill="none" stroke="var(--ice, #dbeafe)" strokeWidth="4"/>
        <circle cx="60" cy="36" r="6" fill="none" stroke="var(--blue-bright, #60a5fa)" strokeWidth="1.5" opacity="0.5"/>
        <line x1="57" y1="34" x2="57" y2="34.5" stroke="var(--blue-bright, #60a5fa)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="63" y1="34" x2="63" y2="34.5" stroke="var(--blue-bright, #60a5fa)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <circle cx="90" cy="78" r="14" fill="var(--surface, #f8faff)" stroke="var(--blue, #2563eb)" strokeWidth="2"/>
        <line x1="90" y1="73" x2="90" y2="83" stroke="var(--blue, #2563eb)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="85" y1="78" x2="95" y2="78" stroke="var(--blue, #2563eb)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  }

  return (
    <div className="empty-state-premium">
      <div className="empty-state__illustration-wrap">
        {illustrations[type] || illustrations.records}
      </div>
      <h3 className="empty-state__title">{title || 'No Records Found'}</h3>
      <p className="empty-state__description">{description || 'There are no records to display at this time.'}</p>
      {actionLabel && onAction && (
        <button type="button" className="empty-state__action" onClick={onAction}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
