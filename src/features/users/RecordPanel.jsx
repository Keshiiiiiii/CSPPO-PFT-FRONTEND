import clsx from 'clsx'
import GradeBadge from '@/components/ui/GradeBadge.jsx'
import DataTable from '@/components/ui/DataTable.jsx'
import { IconPlus, IconSearch } from '@/components/icons.jsx'
import { getBmiHeight } from '@/lib/utils.js'

const editBtn =
  'px-2.5 py-1.5 text-2xs font-semibold text-blue bg-blue/10 rounded-md ring-1 ring-blue/15 hover:bg-blue/15 active:scale-[0.98] transition-all cursor-pointer'
const delBtn =
  'px-2.5 py-1.5 text-2xs font-semibold text-red-700 bg-red-50 rounded-md ring-1 ring-red-200/70 hover:bg-red-100/80 active:scale-[0.98] transition-all cursor-pointer'

/**
 * User Management record panels — matches Admin Dashboard Records shell + DataTable (admin variant).
 */
export function RecordPanel({ title, records, columns, search, setSearch, onAdd, addLabel, getOfficerName }) {
  const filtered = records.filter((r) => {
    const q = (search || '').trim().toLowerCase()
    if (!q) return true
    const id = r.officer_profile_id || r.officer_id || r.account_id || r.user_id
    return getOfficerName(id).toLowerCase().includes(q)
  })

  const tableColumns = columns.map((c) => ({
    key: c.key,
    header: c.label,
    align: c.align,
    ...(c.render ? { render: (row) => c.render(row) } : {}),
  }))

  return (
    <div
      className={clsx(
        'w-full min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white animate-scale-in',
        'ring-1 ring-black/[0.03]',
        'shadow-[0_18px_45px_-12px_rgba(15,23,42,0.12),0_6px_16px_-6px_rgba(15,23,42,0.06)]'
      )}
    >
      <div className="border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/40 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0f] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#141418] cursor-pointer border border-transparent"
              onClick={onAdd}
            >
              <IconPlus />
              {addLabel}
            </button>
            <div className="relative w-full sm:w-72">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <IconSearch />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search officer name or ID..."
                className="w-full rounded-full border border-gray-100 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors focus:border-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900/[0.06]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/70 px-4 pb-5 pt-4 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <DataTable
            variant="admin"
            maxHeightClass="max-h-[560px]"
            columns={tableColumns}
            rows={filtered}
            getRowKey={(r, i) => `rec-${r.id ?? i}`}
            emptyState={
              filtered.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-gray-500">No records match your search.</p>
              ) : null
            }
          />
        </div>
      </div>
    </div>
  )
}

export function BmiPanel({ records, search, setSearch, onAdd, getOfficerName, onEdit, onDelete }) {
  const cols = [
    { key: 'id', label: 'ID' },
    {
      key: 'officer',
      label: 'Officer',
      render: (r) => getOfficerName(r.officer_profile_id || r.officer_id || r.account_id || r.user_id),
    },
    {
      key: 'height',
      label: 'Height (m)',
      align: 'right',
      render: (r) => {
        const h = getBmiHeight(r)
        return h != null ? h.toFixed(2) : '—'
      },
    },
    { key: 'weight', label: 'Weight (kg)', align: 'right', render: (r) => r.weight_kg ?? '—' },
    { key: 'bmi', label: 'BMI', align: 'right', render: (r) => r.bmi ?? '—' },
    { key: 'category', label: 'Category', render: (r) => <GradeBadge grade={r.category} /> },
    {
      key: 'month',
      label: 'Month',
      render: (r) => (r.month_taken ? new Date(r.month_taken).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={editBtn} onClick={() => onEdit(r)}>
            Edit
          </button>
          <button type="button" className={delBtn} onClick={() => onDelete(r.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ]
  return (
    <RecordPanel
      title="BMI Test Record"
      records={records}
      columns={cols}
      search={search}
      setSearch={setSearch}
      onAdd={onAdd}
      addLabel="Add BMI Record"
      getOfficerName={getOfficerName}
    />
  )
}

export function RepsPanel({
  title,
  addLabel,
  records,
  search,
  setSearch,
  onAdd,
  getOfficerName,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}) {
  const cols = [
    { key: 'id', label: 'ID' },
    {
      key: 'officer',
      label: 'Officer',
      render: (r) => getOfficerName(r.officer_id || r.account_id || r.user_id),
    },
    { key: 'reps', label: 'Reps', align: 'right', render: (r) => r.count ?? r.reps ?? '—' },
    { key: 'grade', label: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> },
    {
      key: 'date',
      label: 'Test Date',
      render: (r) => (r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={editBtn} onClick={() => onEdit(r)}>
            {editLabel}
          </button>
          <button type="button" className={delBtn} onClick={() => onDelete(r.id)}>
            {deleteLabel}
          </button>
        </div>
      ),
    },
  ]
  return (
    <RecordPanel
      title={title}
      records={records}
      columns={cols}
      search={search}
      setSearch={setSearch}
      onAdd={onAdd}
      addLabel={addLabel}
      getOfficerName={getOfficerName}
    />
  )
}

export function SprintPanel({ records, search, setSearch, onAdd, getOfficerName, onEdit, onDelete }) {
  const cols = [
    { key: 'id', label: 'ID' },
    {
      key: 'officer',
      label: 'Officer',
      render: (r) => getOfficerName(r.officer_id || r.account_id || r.user_id),
    },
    {
      key: 'time',
      label: 'Time',
      align: 'right',
      render: (r) => r.time_formatted || `${r.minutes ?? '0'}:${String(r.seconds ?? 0).padStart(2, '0')}`,
    },
    { key: 'grade', label: 'Grade', render: (r) => <GradeBadge grade={r.grade} /> },
    {
      key: 'date',
      label: 'Test Date',
      render: (r) => (r.test_date ? new Date(r.test_date).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={editBtn} onClick={() => onEdit(r)}>
            Edit Sprint
          </button>
          <button type="button" className={delBtn} onClick={() => onDelete(r.id)}>
            Delete Sprint
          </button>
        </div>
      ),
    },
  ]
  return (
    <RecordPanel
      title="300 Meters Sprint Test Record"
      records={records}
      columns={cols}
      search={search}
      setSearch={setSearch}
      onAdd={onAdd}
      addLabel="Add Sprint Record"
      getOfficerName={getOfficerName}
    />
  )
}
