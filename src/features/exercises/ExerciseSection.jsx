import { createPortal } from 'react-dom'
import EmptyState from '@/components/ui/EmptyState.jsx'
import FormSelect from '@/components/ui/FormSelect.jsx'
import { IconCheck as CheckIcon, IconPlus as PlusIcon } from '@/components/icons.jsx'

const inputClass = 'w-full px-3.5 py-2.5 text-sm bg-white border border-gray-100 rounded-lg text-navy placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-gray-100 transition-colors duration-fast'
const labelClass = 'block text-xs font-semibold text-navy/70 uppercase tracking-wider mb-1.5'

/**
 * Reusable exercise section — fully migrated to Tailwind CSS.
 */
function ExerciseSection({
  title, icon, modalTitle, modalSub,
  isOpen, onOpen, onClose, onSave, saveLabel,
  fields, form, setForm,
  columns, records, keyPrefix,
}) {
  return (
    <div className="w-full min-w-0 bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
        <h2 className="text-base font-semibold text-navy">{title}</h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0f] text-white text-xs font-semibold rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.12)] hover:bg-[#141418] transition-colors duration-fast cursor-pointer border border-transparent"
          onClick={onOpen}
        >
          <PlusIcon /> Add Record
        </button>
      </div>

      {/* Create Modal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
          <div className="relative w-full max-w-lg mx-4 bg-white text-gray-900 rounded-xl shadow-xl animate-scale-in max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue/10 text-blue flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 [&_svg]:stroke-current [&_svg]:fill-none [&_svg]:stroke-[1.5]">{icon}</div>
                <div>
                  <div className="text-base font-semibold text-navy">{modalTitle}</div>
                  <div className="text-2xs text-muted">{modalSub}</div>
                </div>
              </div>
              <button className="flex items-center justify-center w-8 h-8 rounded-full text-slate hover:text-coral hover:bg-coral-pale/50 transition-colors duration-fast cursor-pointer text-lg" type="button" onClick={onClose}>✕</button>
            </div>
            {/* Modal Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.name} className={f.full ? 'col-span-full' : ''}>
                    <label className={labelClass}>{f.label}</label>
                    {f.type === 'select' ? (
                      <FormSelect
                        value={form[f.name] ?? ''}
                        onChange={(v) => setForm((prev) => ({ ...prev, [f.name]: v }))}
                        options={f.options}
                        placeholder={f.placeholder || `Select ${f.label}`}
                      />
                    ) : (
                      <input type={f.type || 'text'} min={f.min} max={f.max} step={f.step} placeholder={f.placeholder || ''} className={inputClass} value={form[f.name] || ''} onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button className="px-5 py-2.5 text-sm font-medium text-slate bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-fast cursor-pointer" type="button" onClick={onClose}>Cancel</button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue rounded-lg shadow-sm hover:bg-blue-light transition-colors duration-fast cursor-pointer" type="button" onClick={onSave}>
                <CheckIcon /> {saveLabel}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 text-left text-2xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map((r, i) => (
              <tr key={`${keyPrefix}-${r.id ?? i}`} className="hover:bg-surface/50 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-navy whitespace-nowrap">{c.render ? c.render(r) : (r[c.key] ?? '—')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.length === 0 && (
        <EmptyState type="exercise" title={`No ${title}`} description={`No ${title.toLowerCase()} have been recorded yet. Click "Add Record" to get started.`} />
      )}
    </div>
  )
}

export default ExerciseSection
