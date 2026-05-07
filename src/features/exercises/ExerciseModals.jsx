import { createPortal } from 'react-dom'
import FormSelect from '@/components/ui/FormSelect.jsx'
import {
  IconActivity as ActivityIcon,
  IconCheck as CheckIcon,
  IconScale as ScaleIcon,
  IconTarget as TargetIcon,
  IconWalk as WalkIcon,
  IconZap as ZapIcon,
} from '@/components/icons.jsx'

const inputClass = 'w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-navy placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors duration-fast'
const labelClass = 'block text-xs font-semibold text-navy/70 uppercase tracking-wider mb-1.5'

/* ── Shared gender options ── */
const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

/**
 * Generic edit modal — Tailwind-native.
 */
function EditModal({ isOpen, record, title, subtitle, icon, saveLabel, fields, form, setForm, onSave, onClose }) {
  if (!isOpen || !record) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative w-full max-w-lg mx-4 bg-white text-gray-900 rounded-xl shadow-xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue/10 text-blue flex items-center justify-center">{icon}</div>
            <div>
              <div className="text-base font-semibold text-navy">{title}</div>
              <div className="text-2xs text-muted">{subtitle}</div>
            </div>
          </div>
          <button className="flex items-center justify-center w-8 h-8 rounded-full text-slate hover:text-coral hover:bg-coral-pale/50 transition-colors duration-fast cursor-pointer text-lg" type="button" onClick={onClose}>✕</button>
        </div>
        {/* Body */}
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
                ) : f.readOnly ? (
                  <input type="text" className={`${inputClass} bg-gray-50 text-muted cursor-default`} readOnly value={f.compute?.(form) ?? '—'} />
                ) : (
                  <input type={f.type || 'text'} min={f.min} max={f.max} step={f.step} placeholder={f.placeholder || ''} className={inputClass} value={form[f.name] || ''} onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button className="px-5 py-2.5 text-sm font-medium text-slate bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-fast cursor-pointer" type="button" onClick={onClose}>Cancel</button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue rounded-lg shadow-sm hover:bg-blue-light transition-colors duration-fast cursor-pointer" type="button" onClick={onSave}>
            <CheckIcon /> {saveLabel}
          </button>
        </div>
      </div>
    </div>
  , document.body)
}

/* ── Modal configurations ── */
const MODAL_CONFIGS = {
  walkTest: { title: 'Edit Walk Test Record', subtitle: 'Update officer walk test data', icon: <WalkIcon />, saveLabel: 'Save Walk Test', fields: [{ name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' }, { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' }, { name: 'test_date', label: 'Test Date', type: 'date', full: true }] },
  bmi: { title: 'Edit BMI Record', subtitle: 'Update height, weight and date', icon: <ScaleIcon />, saveLabel: 'Save BMI', fields: [{ name: 'height_meter', label: 'Height (m)', type: 'number', min: 0, step: 0.01, placeholder: 'e.g. 1.75' }, { name: 'weight_kg', label: 'Weight (kg)', type: 'number', min: 0, step: 0.1, placeholder: 'e.g. 72.5' }, { name: 'bmi_auto', label: 'BMI (auto)', readOnly: true, compute: (f) => parseFloat(f.height_meter) > 0 && parseFloat(f.weight_kg) > 0 ? (parseFloat(f.weight_kg) / (parseFloat(f.height_meter) ** 2)).toFixed(2) : '—' }, { name: 'month_taken', label: 'Month Taken', type: 'date', full: true }] },
  situp: { title: 'Edit Sit-up Record', subtitle: 'Update 1 min sit-up test data', icon: <ActivityIcon />, saveLabel: 'Save Sit-up', fields: [{ name: 'reps', label: 'Reps (Count)', type: 'number', min: 0, placeholder: 'Enter rep count' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'test_date', label: 'Test Date', type: 'date' }] },
  pushup: { title: 'Edit Push-up Record', subtitle: 'Update push-up test data', icon: <TargetIcon />, saveLabel: 'Save Push-up', fields: [{ name: 'reps', label: 'Reps (Count)', type: 'number', min: 0, placeholder: 'Enter rep count' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'test_date', label: 'Test Date', type: 'date' }] },
  sprint: { title: 'Edit Sprint Record', subtitle: 'Update 300m sprint test data', icon: <ZapIcon />, saveLabel: 'Save Sprint', fields: [{ name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' }, { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' }, { name: 'test_date', label: 'Test Date', type: 'date', full: true }] },
  addOtherBmi: { title: 'Add Other Officer BMI', subtitle: 'Create a BMI record for another officer', icon: <ScaleIcon />, saveLabel: 'Create Record', fields: [{ name: 'officer_profile_id', label: 'Officer Profile ID', type: 'number', min: 1, placeholder: 'e.g. 11' }, { name: 'height_meter', label: 'Height (m)', type: 'number', min: 0, step: 0.01, placeholder: 'e.g. 1.75' }, { name: 'weight_kg', label: 'Weight (kg)', type: 'number', min: 0, step: 0.1, placeholder: 'e.g. 70.5' }, { name: 'month_taken', label: 'Month Taken', type: 'date', full: true }] },
  addOtherSprint: { title: 'Add Other Officer Sprint', subtitle: 'Create a 300m sprint record for another officer', icon: <ZapIcon />, saveLabel: 'Create Record', fields: [{ name: 'officer_id', label: 'Officer ID', type: 'number', min: 1, placeholder: 'e.g. 11' }, { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' }, { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'test_date', label: 'Test Date', type: 'date', full: true }] },
  addOtherPushup: { title: 'Add Other Officer Push-up', subtitle: 'Create a push-up record for another officer', icon: <ActivityIcon />, saveLabel: 'Create Record', fields: [{ name: 'officer_id', label: 'Officer ID', type: 'number', min: 1, placeholder: 'e.g. 11' }, { name: 'reps', label: 'Reps (Count)', type: 'number', min: 0, placeholder: 'e.g. 30' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'test_date', label: 'Test Date', type: 'date', full: true }] },
  addOtherSitup: { title: 'Add Other Officer Sit-up', subtitle: 'Create a sit-up record for another officer', icon: <ActivityIcon />, saveLabel: 'Create Record', fields: [{ name: 'officer_id', label: 'Officer ID', type: 'number', min: 1, placeholder: 'e.g. 11' }, { name: 'reps', label: 'Reps (Count)', type: 'number', min: 0, placeholder: 'e.g. 50' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'test_date', label: 'Test Date', type: 'date', full: true }] },
  addOtherWalkTest: { title: 'Add Other Officer Walk Test', subtitle: 'Create a walk test record for another officer', icon: <ActivityIcon />, saveLabel: 'Create Record', fields: [{ name: 'officer_id', label: 'Officer ID', type: 'number', min: 1, placeholder: 'e.g. 11' }, { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: 'e.g. 17' }, { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: 'e.g. 40' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'test_date', label: 'Test Date', type: 'date', full: true }] },
}

/**
 * Renders all admin exercise edit modals.
 */
function ExerciseModals(props) {
  const modals = [
    { key: 'walkTest', isOpen: props.isWalkTestModalOpen, record: props.editingWalkTest, form: props.walkTestEditForm, setForm: props.setWalkTestEditForm, onSave: props.handleSaveWalkTest, onClose: () => { props.setIsWalkTestModalOpen(false); props.setEditingWalkTest(null) } },
    { key: 'bmi', isOpen: props.isBmiModalOpen, record: props.editingBmi, form: props.bmiEditForm, setForm: props.setBmiEditForm, onSave: props.handleSaveBmi, onClose: () => { props.setIsBmiModalOpen(false); props.setEditingBmi(null) } },
    { key: 'situp', isOpen: props.isSitupModalOpen, record: props.editingSitup, form: props.situpEditForm, setForm: props.setSitupEditForm, onSave: props.handleSaveSitup, onClose: () => { props.setIsSitupModalOpen(false); props.setEditingSitup(null) } },
    { key: 'pushup', isOpen: props.isPushupModalOpen, record: props.editingPushup, form: props.pushupEditForm, setForm: props.setPushupEditForm, onSave: props.handleSavePushup, onClose: () => { props.setIsPushupModalOpen(false); props.setEditingPushup(null) } },
    { key: 'sprint', isOpen: props.isSprintModalOpen, record: props.editingSprint, form: props.sprintEditForm, setForm: props.setSprintEditForm, onSave: props.handleSaveSprint, onClose: () => { props.setIsSprintModalOpen(false); props.setEditingSprint(null) } },
    { key: 'addOtherBmi', isOpen: props.isAddOtherBmiModalOpen, record: {}, form: props.addOtherBmiForm, setForm: props.setAddOtherBmiForm, onSave: props.handleAddOtherBmi, onClose: () => { props.setIsAddOtherBmiModalOpen(false) } },
    { key: 'addOtherSprint', isOpen: props.isAddOtherSprintModalOpen, record: {}, form: props.addOtherSprintForm, setForm: props.setAddOtherSprintForm, onSave: props.handleAddOtherSprint, onClose: () => { props.setIsAddOtherSprintModalOpen(false) } },
    { key: 'addOtherPushup', isOpen: props.isAddOtherPushupModalOpen, record: {}, form: props.addOtherPushupForm, setForm: props.setAddOtherPushupForm, onSave: props.handleAddOtherPushup, onClose: () => { props.setIsAddOtherPushupModalOpen(false) } },
    { key: 'addOtherSitup', isOpen: props.isAddOtherSitupModalOpen, record: {}, form: props.addOtherSitupForm, setForm: props.setAddOtherSitupForm, onSave: props.handleAddOtherSitup, onClose: () => { props.setIsAddOtherSitupModalOpen(false) } },
    { key: 'addOtherWalkTest', isOpen: props.isAddOtherWalkTestModalOpen, record: {}, form: props.addOtherWalkTestForm, setForm: props.setAddOtherWalkTestForm, onSave: props.handleAddOtherWalkTest, onClose: () => { props.setIsAddOtherWalkTestModalOpen(false) } },
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
