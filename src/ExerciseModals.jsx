import { createPortal } from 'react-dom'
import './css/ExerciseModal.css'

/* ── Shared Icons ── */
const CheckIcon = () => (<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>)
const WalkIcon = () => (<svg viewBox="0 0 24 24"><circle cx="14" cy="5" r="2"/><path d="M18 22l-3-3-1.5 3L9 16l-4 4"/><path d="M10 16l2-5 3 1"/></svg>)
const ScaleIcon = () => (<svg viewBox="0 0 24 24"><path d="M16 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/><line x1="2" y1="12" x2="20" y2="12"/><path d="M12 2v20"/></svg>)
const ActivityIcon = () => (<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>)
const TargetIcon = () => (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>)
const ZapIcon = () => (<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>)

/* ── Shared gender options ── */
const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

/**
 * Generic edit modal — renders a premium modal with configurable fields.
 * Eliminates the need for 5 separate modal JSX blocks.
 */
function EditModal({ isOpen, record, title, subtitle, icon, saveLabel, fields, form, setForm, onSave, onClose }) {
  if (!isOpen || !record) return null
  return createPortal(
    <div className="exercise-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="exercise-modal">
        <div className="exercise-modal__header">
          <div className="exercise-modal__header-left">
            <div className="exercise-modal__icon-ring">{icon}</div>
            <div>
              <div className="exercise-modal__title">{title}</div>
              <div className="exercise-modal__subtitle">{subtitle}</div>
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
                ) : f.readOnly ? (
                  <input type="text" className="exercise-modal__input" readOnly value={f.compute?.(form) ?? '—'} />
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
          </div>
        </div>
        <div className="exercise-modal__footer">
          <button className="exercise-modal__btn-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="exercise-modal__btn-save" type="button" onClick={onSave}><CheckIcon /> {saveLabel}</button>
        </div>
      </div>
    </div>
  , document.body)
}

/* ── Modal configurations for each exercise type ── */
const MODAL_CONFIGS = {
  walkTest: {
    title: 'Edit Walk Test Record',
    subtitle: 'Update officer walk test data',
    icon: <WalkIcon />,
    saveLabel: 'Save Walk Test',
    fields: [
      { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
      { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' },
      { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' },
      { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' },
      { name: 'test_date', label: 'Test Date', type: 'date', full: true },
    ],
  },
  bmi: {
    title: 'Edit BMI Record',
    subtitle: 'Update height, weight and date',
    icon: <ScaleIcon />,
    saveLabel: 'Save BMI',
    fields: [
      { name: 'height_meter', label: 'Height (m)', type: 'number', min: 0, step: 0.01, placeholder: 'e.g. 1.75' },
      { name: 'weight_kg', label: 'Weight (kg)', type: 'number', min: 0, step: 0.1, placeholder: 'e.g. 72.5' },
      {
        name: 'bmi_auto', label: 'BMI (auto)', readOnly: true,
        compute: (f) => parseFloat(f.height_meter) > 0 && parseFloat(f.weight_kg) > 0
          ? (parseFloat(f.weight_kg) / (parseFloat(f.height_meter) ** 2)).toFixed(2) : '—',
      },
      { name: 'month_taken', label: 'Month Taken', type: 'date', full: true },
    ],
  },
  situp: {
    title: 'Edit Sit-up Record',
    subtitle: 'Update 1 min sit-up test data',
    icon: <ActivityIcon />,
    saveLabel: 'Save Sit-up',
    fields: [
      { name: 'reps', label: 'Reps (Count)', type: 'number', min: 0, placeholder: 'Enter rep count' },
      { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' },
      { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
      { name: 'test_date', label: 'Test Date', type: 'date' },
    ],
  },
  pushup: {
    title: 'Edit Push-up Record',
    subtitle: 'Update push-up test data',
    icon: <TargetIcon />,
    saveLabel: 'Save Push-up',
    fields: [
      { name: 'reps', label: 'Reps (Count)', type: 'number', min: 0, placeholder: 'Enter rep count' },
      { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' },
      { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
      { name: 'test_date', label: 'Test Date', type: 'date' },
    ],
  },
  sprint: {
    title: 'Edit Sprint Record',
    subtitle: 'Update 300m sprint test data',
    icon: <ZapIcon />,
    saveLabel: 'Save Sprint',
    fields: [
      { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
      { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' },
      { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' },
      { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' },
      { name: 'test_date', label: 'Test Date', type: 'date', full: true },
    ],
  },
}

/**
 * Renders all admin exercise edit modals.
 * Each modal only mounts when its `isOpen` prop is true.
 */
function ExerciseModals(props) {
  const modals = [
    { key: 'walkTest', isOpen: props.isWalkTestModalOpen, record: props.editingWalkTest, form: props.walkTestEditForm, setForm: props.setWalkTestEditForm, onSave: props.handleSaveWalkTest, onClose: () => { props.setIsWalkTestModalOpen(false); props.setEditingWalkTest(null) } },
    { key: 'bmi',      isOpen: props.isBmiModalOpen,      record: props.editingBmi,      form: props.bmiEditForm,      setForm: props.setBmiEditForm,      onSave: props.handleSaveBmi,      onClose: () => { props.setIsBmiModalOpen(false); props.setEditingBmi(null) } },
    { key: 'situp',    isOpen: props.isSitupModalOpen,    record: props.editingSitup,    form: props.situpEditForm,    setForm: props.setSitupEditForm,    onSave: props.handleSaveSitup,    onClose: () => { props.setIsSitupModalOpen(false); props.setEditingSitup(null) } },
    { key: 'pushup',   isOpen: props.isPushupModalOpen,   record: props.editingPushup,   form: props.pushupEditForm,   setForm: props.setPushupEditForm,   onSave: props.handleSavePushup,   onClose: () => { props.setIsPushupModalOpen(false); props.setEditingPushup(null) } },
    { key: 'sprint',   isOpen: props.isSprintModalOpen,   record: props.editingSprint,   form: props.sprintEditForm,   setForm: props.setSprintEditForm,   onSave: props.handleSaveSprint,   onClose: () => { props.setIsSprintModalOpen(false); props.setEditingSprint(null) } },
  ]

  return (
    <>
      {modals.map((m) => {
        const cfg = MODAL_CONFIGS[m.key]
        return (
          <EditModal
            key={m.key}
            isOpen={m.isOpen}
            record={m.record}
            title={cfg.title}
            subtitle={cfg.subtitle}
            icon={cfg.icon}
            saveLabel={cfg.saveLabel}
            fields={cfg.fields}
            form={m.form}
            setForm={m.setForm}
            onSave={m.onSave}
            onClose={m.onClose}
          />
        )
      })}
    </>
  )
}

export default ExerciseModals
