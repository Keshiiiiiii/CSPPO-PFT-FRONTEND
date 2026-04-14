import ExerciseSection from './exercises/ExerciseSection.jsx'
import { getBmiHeight } from './utils.js'

/* ── Tab Icons ── */
const TabIconWalk = () => (<svg viewBox="0 0 24 24"><circle cx="14" cy="5" r="2"/><path d="M18 22l-3-3-1.5 3L9 16l-4 4"/><path d="M10 16l2-5 3 1"/></svg>)
const TabIconScale = () => (<svg viewBox="0 0 24 24"><path d="M16 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/><line x1="2" y1="12" x2="20" y2="12"/><path d="M12 2v20"/></svg>)
const TabIconActivity = () => (<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>)
const TabIconTarget = () => (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>)
const TabIconZap = () => (<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>)

/* ── Shared gender options ── */
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

/* ── Exercise configurations ──
   Each config defines the modal fields, table columns, and labels
   for one exercise type, keeping OfficerExercises purely declarative. */

const EXERCISE_CONFIGS = {
  walk: {
    title: 'Officer Walk Test Records',
    icon: <TabIconWalk />,
    modalTitle: 'New Walk Test Record',
    modalSub: 'Enter officer walk test results',
    saveLabel: 'Save Walk Test',
    keyPrefix: 'officer-walk',
    fields: [
      { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
      { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' },
      { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' },
      { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' },
      { name: 'test_date', label: 'Test Date', type: 'date', full: true },
    ],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'age', label: 'Age' },
      { key: 'gender', label: 'Gender' },
      { key: 'time', label: 'Time', render: (r) => r.time_formatted || r.time || `${r.minutes ?? 0}:${String(r.seconds ?? 0).padStart(2, '0')}` },
      { key: 'grade', label: 'Grade' },
      { key: 'test_date', label: 'Test Date', render: (r) => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' },
      { key: 'goNoGo', label: 'GO / NO GO', render: (r) => r.policeGoNoGo ?? r.go_no_go ?? '—' },
    ],
  },
  bmi: {
    title: 'BMI Test Records',
    icon: <TabIconScale />,
    modalTitle: 'New BMI Record',
    modalSub: 'Enter height and weight measurements',
    saveLabel: 'Save BMI',
    keyPrefix: 'officer-bmi',
    fields: [
      { name: 'height_meter', label: 'Height (m)', type: 'number', step: 0.01, min: 0, placeholder: 'e.g. 1.75' },
      { name: 'weight_kg', label: 'Weight (kg)', type: 'number', step: 0.1, min: 0, placeholder: 'e.g. 72.5' },
      { name: 'month_taken', label: 'Month Taken', type: 'date', full: true },
    ],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'height_meter', label: 'Height (m)', render: (r) => { const h = getBmiHeight(r); return h != null ? h.toFixed(2) : '—' } },
      { key: 'weight_kg', label: 'Weight (kg)' },
      { key: 'bmi', label: 'BMI' },
      { key: 'category', label: 'Category' },
      { key: 'month_taken', label: 'Month Taken', render: (r) => r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—' },
    ],
  },
  situp: {
    title: '1 Min Sit-up Records',
    icon: <TabIconActivity />,
    modalTitle: 'New Sit-up Record',
    modalSub: 'Log 1 minute sit-up test results',
    saveLabel: 'Save Sit-up',
    keyPrefix: 'officer-situp',
    fields: [
      { name: 'reps', label: 'Reps', type: 'number', min: 0, placeholder: 'Enter rep count' },
      { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' },
      { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
      { name: 'test_date', label: 'Test Date', type: 'date' },
    ],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'count', label: 'Count', render: (r) => r.count ?? r.reps ?? r.situp_count ?? '—' },
      { key: 'grade', label: 'Grade' },
      { key: 'test_date', label: 'Test Date', render: (r) => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' },
    ],
  },
  pushup: {
    title: 'Push-up Test Records',
    icon: <TabIconTarget />,
    modalTitle: 'New Push-up Record',
    modalSub: 'Log push-up test results',
    saveLabel: 'Save Push-up',
    keyPrefix: 'officer-pushup',
    fields: [
      { name: 'reps', label: 'Reps', type: 'number', min: 0, placeholder: 'Enter rep count' },
      { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' },
      { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
      { name: 'test_date', label: 'Test Date', type: 'date' },
    ],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'count', label: 'Count', render: (r) => r.count ?? r.reps ?? r.pushup_count ?? '—' },
      { key: 'grade', label: 'Grade' },
      { key: 'test_date', label: 'Test Date', render: (r) => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' },
    ],
  },
  sprint: {
    title: '300m Sprint Records',
    icon: <TabIconZap />,
    modalTitle: 'New Sprint Record',
    modalSub: 'Log 300 meters sprint test results',
    saveLabel: 'Save Sprint',
    keyPrefix: 'officer-sprint',
    fields: [
      { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' },
      { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' },
      { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' },
      { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
    ],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'time', label: 'Time', render: (r) => r.time_formatted || `${r.minutes ?? 0}:${String(r.seconds ?? 0).padStart(2, '0')}` },
      { key: 'grade', label: 'Grade' },
      { key: 'test_date', label: 'Test Date', render: (r) => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' },
    ],
  },
}

/* ── Maps tab key → prop names from App.jsx ── */
const TAB_PROP_MAP = {
  walk:   { isAdding: 'isAddingWalkTest',  setIsAdding: 'setIsAddingWalkTest',  form: 'walkTestForm',  setForm: 'setWalkTestForm',  onSave: 'handleSubmitWalkTest',  message: 'walkTestMessage',  records: 'officerWalkRecords' },
  bmi:    { isAdding: 'isAddingBmi',       setIsAdding: 'setIsAddingBmi',       form: 'bmiForm',       setForm: 'setBmiForm',       onSave: 'handleSubmitBmi',       message: 'bmiMessage',       records: 'officerBmiRecords' },
  situp:  { isAdding: 'isAddingSitup',     setIsAdding: 'setIsAddingSitup',     form: 'situpForm',     setForm: 'setSitupForm',     onSave: 'handleSubmitSitup',     message: 'situpMessage',     records: 'officerSitupRecords' },
  pushup: { isAdding: 'isAddingPushup',    setIsAdding: 'setIsAddingPushup',    form: 'pushupForm',    setForm: 'setPushupForm',    onSave: 'handleSubmitPushup',    message: 'pushupMessage',    records: 'officerPushupRecords' },
  sprint: { isAdding: 'isAddingSprint',    setIsAdding: 'setIsAddingSprint',    form: 'sprintForm',    setForm: 'setSprintForm',    onSave: 'handleSubmitSprint',    message: 'sprintMessage',    records: 'officerSprintRecords' },
}

const TABS = [
  { key: 'walk',   label: 'Walk Test',    icon: <TabIconWalk /> },
  { key: 'bmi',    label: 'BMI',          icon: <TabIconScale /> },
  { key: 'situp',  label: '1 Min Sit-up', icon: <TabIconActivity /> },
  { key: 'pushup', label: 'Push-up',      icon: <TabIconTarget /> },
  { key: 'sprint', label: '300m Sprint',  icon: <TabIconZap /> },
]

function OfficerExercises(props) {
  const { officerDashboardTab, setOfficerDashboardTab } = props

  return (
    <div className="officer-exercises">
      {/* ── Tab Buttons ── */}
      <div className="admin-record-tabs" style={{ marginBottom: 12 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-record-tab ${officerDashboardTab === tab.key ? 'active' : ''}`}
            onClick={() => setOfficerDashboardTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Active Exercise Section ── */}
      {TABS.map((tab) => {
        if (officerDashboardTab !== tab.key) return null
        const cfg = EXERCISE_CONFIGS[tab.key]
        const map = TAB_PROP_MAP[tab.key]
        return (
          <ExerciseSection
            key={tab.key}
            title={cfg.title}
            icon={cfg.icon}
            modalTitle={cfg.modalTitle}
            modalSub={cfg.modalSub}
            saveLabel={cfg.saveLabel}
            keyPrefix={cfg.keyPrefix}
            fields={cfg.fields}
            columns={cfg.columns}
            isOpen={props[map.isAdding]}
            onOpen={() => props[map.setIsAdding](true)}
            onClose={() => props[map.setIsAdding](false)}
            onSave={props[map.onSave]}
            message={props[map.message]}
            form={props[map.form]}
            setForm={props[map.setForm]}
            records={props[map.records]}
          />
        )
      })}
    </div>
  )
}

export default OfficerExercises
