import clsx from 'clsx'
import GradeBadge from '@/components/ui/GradeBadge.jsx'

const variants = {
  default: {
    th: 'px-4 py-4 text-2xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap bg-white/95 backdrop-blur-sm border-b border-gray-100',
    td: 'px-4 py-4 text-sm text-navy whitespace-nowrap border-b border-gray-50',
    row: 'hover:bg-gray-50/90',
  },
  /** Admin dashboard — soft header band, zebra rows, extra vertical rhythm */
  admin: {
    th: 'px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100/90 border-b border-gray-200/80',
    td: 'px-5 py-4 text-sm text-gray-900 whitespace-nowrap',
    row: 'odd:bg-white even:bg-gray-50/60 hover:bg-gray-100/70',
  },
}

/**
 * Declarative data table with optional grade column styling and column alignment.
 *
 * @param {Array<{ key: string, header: string, align?: 'left'|'right'|'center', render?: (row: object) => React.ReactNode, gradeKey?: string }>} columns
 */
export default function DataTable({
  columns,
  rows,
  getRowKey,
  emptyState,
  maxHeightClass = 'max-h-[520px]',
  className,
  variant = 'default',
}) {
  const alignClass = (a) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left')
  const v = variants[variant] || variants.default

  return (
    <div className={clsx('w-full min-w-0 overflow-x-auto overflow-y-auto', maxHeightClass, className)}>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={clsx(v.th, alignClass(col.align))} scope="col">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/80">
          {rows.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              className={clsx(
                v.row,
                'transition-colors duration-200',
                'animate-fade-in',
                `stagger-${Math.min(i + 1, 8)}`
              )}
            >
              {columns.map((col) => {
                let content
                if (col.render) {
                  content = col.render(row, i)
                } else if (col.gradeKey) {
                  const g = row[col.gradeKey]
                  content = <GradeBadge grade={g} />
                } else {
                  content = row[col.key]
                }
                const isGradeCol = col.gradeKey || col.key === 'grade' || col.header?.toLowerCase() === 'grade' || col.header?.toLowerCase() === 'category'
                return (
                  <td
                    key={col.key}
                    className={clsx(
                      v.td,
                      alignClass(col.align),
                      isGradeCol && 'align-middle'
                    )}
                  >
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {emptyState}
    </div>
  )
}
