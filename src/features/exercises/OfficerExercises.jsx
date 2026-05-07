import ExerciseSection from '@/features/exercises/ExerciseSection.jsx'
import { getBmiHeight } from '@/lib/utils.js'
import GradeBadge from '@/components/ui/GradeBadge.jsx'
import ExercisePillButton from '@/components/ui/ExercisePillButton.jsx'
import {
  IconActivity as TabIconActivity,
  IconScale as TabIconScale,
  IconTarget as TabIconTarget,
  IconWalk as TabIconWalk,
  IconZap as TabIconZap,
} from '@/components/icons.jsx'

/* ── Shared gender options ── */
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

/* ── Exercise configurations ── */
const EXERCISE_CONFIGS = {
  walk: {
    title: 'Officer Walk Test Records', icon: <TabIconWalk />, modalTitle: 'New Walk Test Record', modalSub: 'Enter officer walk test results', saveLabel: 'Save Walk Test', keyPrefix: 'officer-walk',
    fields: [{ name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' }, { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' }, { name: 'test_date', label: 'Test Date', type: 'date', full: true }],
    columns: [{ key: 'id', label: 'ID' }, { key: 'age', label: 'Age' }, { key: 'gender', label: 'Gender' }, { key: 'time', label: 'Time', render: (r) => r.time_formatted || r.time || `${r.minutes ?? 0}:${String(r.seconds ?? 0).padStart(2, '0')}` }, { key: 'grade', label: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> }, { key: 'test_date', label: 'Test Date', render: (r) => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' }],
  },
  bmi: {
    title: 'BMI Test Records', icon: <TabIconScale />, modalTitle: 'New BMI Record', modalSub: 'Enter height and weight measurements', saveLabel: 'Save BMI', keyPrefix: 'officer-bmi',
    fields: [{ name: 'height_meter', label: 'Height (m)', type: 'number', step: 0.01, min: 0, placeholder: 'e.g. 1.75' }, { name: 'weight_kg', label: 'Weight (kg)', type: 'number', step: 0.1, min: 0, placeholder: 'e.g. 72.5' }, { name: 'month_taken', label: 'Month Taken', type: 'date', full: true }],
    columns: [{ key: 'id', label: 'ID' }, { key: 'height_meter', label: 'Height (m)', render: (r) => { const h = getBmiHeight(r); return h != null ? h.toFixed(2) : '—' } }, { key: 'weight_kg', label: 'Weight (kg)' }, { key: 'bmi', label: 'BMI' }, { key: 'category', label: 'Category' }, { key: 'month_taken', label: 'Month Taken', render: (r) => r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—' }],
  },
  situp: {
    title: '1 Min Sit-up Records', icon: <TabIconActivity />, modalTitle: 'New Sit-up Record', modalSub: 'Log 1 minute sit-up test results', saveLabel: 'Save Sit-up', keyPrefix: 'officer-situp',
    fields: [{ name: 'reps', label: 'Reps', type: 'number', min: 0, placeholder: 'Enter rep count' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'test_date', label: 'Test Date', type: 'date' }],
    columns: [{ key: 'id', label: 'ID' }, { key: 'count', label: 'Count', render: (r) => r.count ?? r.reps ?? r.situp_count ?? '—' }, { key: 'grade', label: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> }, { key: 'test_date', label: 'Test Date', render: (r) => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' }],
  },
  pushup: {
    title: 'Push-up Test Records', icon: <TabIconTarget />, modalTitle: 'New Push-up Record', modalSub: 'Log push-up test results', saveLabel: 'Save Push-up', keyPrefix: 'officer-pushup',
    fields: [{ name: 'reps', label: 'Reps', type: 'number', min: 0, placeholder: 'Enter rep count' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }, { name: 'test_date', label: 'Test Date', type: 'date' }],
    columns: [{ key: 'id', label: 'ID' }, { key: 'count', label: 'Count', render: (r) => r.count ?? r.reps ?? r.pushup_count ?? '—' }, { key: 'grade', label: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> }, { key: 'test_date', label: 'Test Date', render: (r) => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' }],
  },
  sprint: {
    title: '300m Sprint Records', icon: <TabIconZap />, modalTitle: 'New Sprint Record', modalSub: 'Log 300 meters sprint test results', saveLabel: 'Save Sprint', keyPrefix: 'officer-sprint',
    fields: [{ name: 'minutes', label: 'Minutes', type: 'number', min: 0, placeholder: '0' }, { name: 'seconds', label: 'Seconds', type: 'number', min: 0, max: 59, placeholder: '0' }, { name: 'age', label: 'Age', type: 'number', min: 0, placeholder: 'Enter age' }, { name: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS }],
    columns: [{ key: 'id', label: 'ID' }, { key: 'time', label: 'Time', render: (r) => r.time_formatted || `${r.minutes ?? 0}:${String(r.seconds ?? 0).padStart(2, '0')}` }, { key: 'grade', label: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> }, { key: 'test_date', label: 'Test Date', render: (r) => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' }],
  },
}

const TAB_PROP_MAP = {
  walk:   { isAdding: 'isAddingWalkTest', setIsAdding: 'setIsAddingWalkTest', form: 'walkTestForm', setForm: 'setWalkTestForm', onSave: 'handleSubmitWalkTest', records: 'officerWalkRecords' },
  bmi:    { isAdding: 'isAddingBmi', setIsAdding: 'setIsAddingBmi', form: 'bmiForm', setForm: 'setBmiForm', onSave: 'handleSubmitBmi', records: 'officerBmiRecords' },
  situp:  { isAdding: 'isAddingSitup', setIsAdding: 'setIsAddingSitup', form: 'situpForm', setForm: 'setSitupForm', onSave: 'handleSubmitSitup', records: 'officerSitupRecords' },
  pushup: { isAdding: 'isAddingPushup', setIsAdding: 'setIsAddingPushup', form: 'pushupForm', setForm: 'setPushupForm', onSave: 'handleSubmitPushup', records: 'officerPushupRecords' },
  sprint: { isAdding: 'isAddingSprint', setIsAdding: 'setIsAddingSprint', form: 'sprintForm', setForm: 'setSprintForm', onSave: 'handleSubmitSprint', records: 'officerSprintRecords' },
}

const TABS = [
  { key: 'walk', label: 'Walk Test', icon: <TabIconWalk /> },
  { key: 'bmi', label: 'BMI', icon: <TabIconScale /> },
  { key: 'situp', label: '1 Min Sit-up', icon: <TabIconActivity /> },
  { key: 'pushup', label: 'Push-up', icon: <TabIconTarget /> },
  { key: 'sprint', label: '300m Sprint', icon: <TabIconZap /> },
]

function OfficerExercises(props) {
  const { officerDashboardTab, setOfficerDashboardTab } = props

  return (
    <div className="w-full min-w-0 space-y-5 animate-fade-in">
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-gray-50/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        {TABS.map((tab) => (
          <ExercisePillButton
            key={tab.key}
            active={officerDashboardTab === tab.key}
            onClick={() => setOfficerDashboardTab(tab.key)}
          >
            {tab.icon}
            <span className="whitespace-nowrap">{tab.label}</span>
          </ExercisePillButton>
        ))}
      </div>

      {/* Active Exercise Section */}
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
