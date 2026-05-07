import { IconPlus } from '@/components/icons.jsx'

/**
 * EmptyState — Premium empty state with dashed border, animated SVG illustration, and floating effect.
 * Use instead of plain text "No records found" messages.
 */
function EmptyState({ type, title, description, actionLabel, onAction }) {
  const illustrations = {
    search: (
      <svg viewBox="0 0 120 120" className="w-24 h-24 mx-auto">
        <circle cx="52" cy="52" r="30" fill="none" stroke="#dbeafe" strokeWidth="6"/>
        <circle cx="52" cy="52" r="30" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 6" opacity="0.5"/>
        <line x1="74" y1="74" x2="95" y2="95" stroke="#2563eb" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="52" cy="52" r="12" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="0 52 52" to="360 52 52" dur="12s" repeatCount="indefinite"/>
        </circle>
        <circle cx="45" cy="46" r="2" fill="#60a5fa" opacity="0.5"/>
        <circle cx="59" cy="46" r="2" fill="#60a5fa" opacity="0.5"/>
        <path d="M46 58 Q52 62 58 58" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    records: (
      <svg viewBox="0 0 120 120" className="w-24 h-24 mx-auto">
        <rect x="25" y="20" width="70" height="80" rx="8" fill="none" stroke="#dbeafe" strokeWidth="4"/>
        <rect x="25" y="20" width="70" height="80" rx="8" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4"/>
        <line x1="38" y1="42" x2="82" y2="42" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="38" y1="55" x2="72" y2="55" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
        <line x1="38" y1="68" x2="62" y2="68" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
        <line x1="38" y1="81" x2="55" y2="81" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
        <circle cx="85" cy="85" r="18" fill="#f8faff" stroke="#2563eb" strokeWidth="2.5"/>
        <path d="M80 85 L83 88 L91 80" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    exercise: (
      <svg viewBox="0 0 120 120" className="w-24 h-24 mx-auto">
        <circle cx="60" cy="45" r="22" fill="none" stroke="#dbeafe" strokeWidth="4"/>
        <path d="M50 42 L55 50 L70 38" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        <rect x="20" y="75" width="12" height="25" rx="4" fill="#60a5fa" opacity="0.2"/>
        <rect x="38" y="65" width="12" height="35" rx="4" fill="#60a5fa" opacity="0.35"/>
        <rect x="56" y="55" width="12" height="45" rx="4" fill="#60a5fa" opacity="0.5"/>
        <rect x="74" y="45" width="12" height="55" rx="4" fill="#2563eb" opacity="0.65"/>
        <rect x="92" y="60" width="12" height="40" rx="4" fill="#60a5fa" opacity="0.4"/>
        <path d="M26 73 L44 63 L62 53 L80 42 L98 58" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite"/>
        </path>
      </svg>
    ),
    users: (
      <svg viewBox="0 0 120 120" className="w-24 h-24 mx-auto">
        <circle cx="60" cy="40" r="18" fill="none" stroke="#dbeafe" strokeWidth="4"/>
        <circle cx="60" cy="40" r="18" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.4"/>
        <path d="M35 95 C35 75, 45 65, 60 65 C75 65, 85 75, 85 95" fill="none" stroke="#dbeafe" strokeWidth="4"/>
        <circle cx="60" cy="36" r="6" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="90" cy="78" r="14" fill="#f8faff" stroke="#2563eb" strokeWidth="2"/>
        <line x1="90" y1="73" x2="90" y2="83" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
        <line x1="85" y1="78" x2="95" y2="78" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {/* Dashed border container */}
      <div className="w-full max-w-sm mx-auto border-2 border-dashed border-blue/20 rounded-2xl p-10 bg-gradient-to-b from-blue/[0.02] to-transparent">
        <div className="mb-6 opacity-80 animate-float">
          {illustrations[type] || illustrations.records}
        </div>
        <h3 className="text-xl font-semibold text-navy mb-2 text-balance">
          {title || 'No Records Found'}
        </h3>
        <p className="text-sm text-slate max-w-xs mx-auto leading-relaxed mb-6 text-balance">
          {description || 'There are no records to display at this time.'}
        </p>
        {actionLabel && onAction && (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-light hover:shadow-md active:scale-95 transition-all duration-normal cursor-pointer"
            onClick={onAction}
          >
            <IconPlus />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default EmptyState
