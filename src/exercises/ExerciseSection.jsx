import { createPortal } from 'react-dom'
import '../css/ExerciseModal.css'

/* ── Shared SVG Icons ── */
const PlusIcon = () => (<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
const CheckIcon = () => (<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>)
const EmptyDocIcon = () => (<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>)

/**
 * Reusable exercise section: renders a header with "Add Record" button,
 * a premium modal for creating records, and a data table.
 *
 * @param {object}   props
 * @param {string}   props.title       – Section heading (e.g. "1 Min Sit-up Records")
 * @param {object}   props.icon        – JSX icon for the modal header ring
 * @param {string}   props.modalTitle  – Modal heading text
 * @param {string}   props.modalSub    – Modal subtitle text
 * @param {boolean}  props.isOpen      – Whether the modal is visible
 * @param {function} props.onOpen      – Opens the modal
 * @param {function} props.onClose     – Closes the modal
 * @param {function} props.onSave      – Saves the form
 * @param {string}   props.saveLabel   – Button text (e.g. "Save Sprint")
 * @param {string}   props.message     – Status / feedback message
 * @param {Array}    props.fields      – Form field definitions
 * @param {object}   props.form        – Current form state object
 * @param {function} props.setForm     – State setter for form
 * @param {Array}    props.columns     – Table column definitions [{ key, label, render? }]
 * @param {Array}    props.records     – Table data rows
 * @param {string}   props.keyPrefix   – Unique prefix for React keys
 */
function ExerciseSection({
  title, icon, modalTitle, modalSub,
  isOpen, onOpen, onClose, onSave, saveLabel,
  message, fields, form, setForm,
  columns, records, keyPrefix,
}) {
  return (
    <div className="user-panel">
      {/* ── Header ── */}
      <div className="user-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h2 className="user-title">{title}</h2>
        <button className="exercise-add-btn" onClick={onOpen}><PlusIcon /> Add Record</button>
      </div>

      {/* ── Create Modal ── */}
      {isOpen && createPortal(
        <div className="exercise-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
          <div className="exercise-modal">
            <div className="exercise-modal__header">
              <div className="exercise-modal__header-left">
                <div className="exercise-modal__icon-ring">{icon}</div>
                <div>
                  <div className="exercise-modal__title">{modalTitle}</div>
                  <div className="exercise-modal__subtitle">{modalSub}</div>
                </div>
              </div>
              <button className="exercise-modal__close" type="button" onClick={onClose}>✕</button>
            </div>
            <div className="exercise-modal__body">
              <div className="exercise-modal__grid">
                {fields.map((f) => (
                  <div key={f.name} className={`exercise-modal__field${f.full ? ' full' : ''}`}>
                    <label className="exercise-modal__label">{f.label}</label>
                    {f.type === 'select' ? (
                      <select
                        className="exercise-modal__select"
                        value={form[f.name] || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                      >
                        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type || 'text'}
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        placeholder={f.placeholder || ''}
                        className="exercise-modal__input"
                        value={form[f.name] || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                {message && <div className="exercise-modal__message">{message}</div>}
              </div>
            </div>
            <div className="exercise-modal__footer">
              <button className="exercise-modal__btn-cancel" type="button" onClick={onClose}>Cancel</button>
              <button className="exercise-modal__btn-save" type="button" onClick={onSave}><CheckIcon /> {saveLabel}</button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ── Data Table ── */}
      <table className="user-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={`${keyPrefix}-${r.id ?? i}`}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(r) : (r[c.key] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {records.length === 0 && (
        <div className="exercise-empty">
          <EmptyDocIcon />
          <p>No {title.toLowerCase()} yet</p>
        </div>
      )}
    </div>
  )
}

export default ExerciseSection
