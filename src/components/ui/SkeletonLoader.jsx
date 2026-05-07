/**
 * SkeletonLoader — Animated skeleton placeholders for loading states.
 * Premium shimmer effect that mirrors the shape of actual content.
 */

const shimmerBase = 'bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded'

/** Single skeleton line */
export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return <div className={`${shimmerBase} ${width} ${height}`} />
}

/** Skeleton table row */
export function SkeletonTableRow({ columns = 6 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`${shimmerBase} h-4 ${i === 0 ? 'w-12' : i === columns - 1 ? 'w-20' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  )
}

/** Skeleton table — multiple rows */
export function SkeletonTable({ rows = 5, columns = 6 }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className={`${shimmerBase} h-5 w-40`} />
        <div className="flex gap-3">
          <div className={`${shimmerBase} h-9 w-32 rounded-lg`} />
          <div className={`${shimmerBase} h-9 w-48 rounded-lg`} />
        </div>
      </div>
      {/* Table skeleton */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className={`${shimmerBase} h-3 w-16`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Skeleton stat cards — 4 cards */
export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`bg-white rounded-xl border-l-4 border-l-gray-200 p-5 shadow-card animate-pulse stagger-${i + 1}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2">
              <div className={`${shimmerBase} h-3 w-20`} />
              <div className={`${shimmerBase} h-8 w-16`} />
            </div>
            <div className={`${shimmerBase} w-11 h-11 rounded-lg`} />
          </div>
          <div className={`${shimmerBase} h-3 w-28`} />
        </div>
      ))}
    </div>
  )
}

export default SkeletonTable
