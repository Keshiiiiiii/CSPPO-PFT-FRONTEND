import clsx from 'clsx'
import AnimatedNumber from '@/components/ui/AnimatedNumber.jsx'

/**
 * Compact SVG sparkline (trend decoration).
 */
function Sparkline({ values, className, strokeClassName = 'text-gray-300' }) {
  if (!values?.length) return null
  const w = 112
  const h = 32
  const padX = 2
  const padY = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const innerW = w - padX * 2
  const innerH = h - padY * 2
  const pts = values.map((v, i) => {
    const x = padX + (i / Math.max(values.length - 1, 1)) * innerW
    const y = padY + (1 - (v - min) / range) * innerH
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const d = `M ${pts.join(' L ')}`
  const last = pts[pts.length - 1]
  const [lx] = last.split(',').map(Number)
  const areaD = `${d} L ${lx},${h - padY} L ${padX},${h - padY} Z`

  return (
    <svg
      className={clsx('w-full max-w-[7rem] h-8 shrink-0', className)}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d={areaD} className={clsx(strokeClassName, 'opacity-[0.14]')} fill="currentColor" />
      <path
        d={d}
        className={clsx('stroke-[1.5] fill-none', strokeClassName)}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

const washStyles = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-gray-50 text-gray-600',
}

const sparkStroke = {
  blue: 'text-blue-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  violet: 'text-violet-400',
  rose: 'text-rose-400',
  slate: 'text-gray-400',
}

function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

/** Deterministic pseudo-random sparkline from label + value */
export function metricSparklineValues(label, value, trend = 'up') {
  const seed = hashSeed(`${label}:${value}`)
  const base = 35 + (seed % 28)
  return Array.from({ length: 9 }, (_, i) => {
    const wobble = Math.sin(seed * 0.11 + i * 0.65) * 14
    const drift = trend === 'up' ? i * 2.5 : trend === 'down' ? -i * 2 : Math.sin(i * 0.8) * 4
    return Math.max(10, Math.min(90, base + wobble + drift))
  })
}

/**
 * Elevated metric tile: icon wash, bold stat, sparkline.
 */
export default function MetricCard({
  label,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
  trend = 'up',
  className,
}) {
  const wash = washStyles[color] || washStyles.blue
  const sparkColor = sparkStroke[color] || sparkStroke.blue
  const sparkValues = metricSparklineValues(label, value, trend)

  return (
    <div
      className={clsx(
        'group relative rounded-xl border border-gray-100 bg-white',
        'shadow-[0_4px_24px_rgba(6,13,30,0.06),0_1px_2px_rgba(6,13,30,0.04)]',
        'hover:shadow-[0_12px_40px_rgba(6,13,30,0.1),0_2px_8px_rgba(6,13,30,0.06)]',
        'transition-all duration-300 ease-smooth',
        'p-4 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            className={clsx(
              'inline-flex items-center justify-center w-9 h-9 rounded-lg mb-2',
              '[&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:stroke-[1.75]',
              wash
            )}
          >
            {Icon ? <Icon /> : null}
          </div>
          <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{label}</div>
          {subtitle ? (
            <div className="text-2xs text-muted mt-0.5 line-clamp-2">{subtitle}</div>
          ) : null}
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold font-display tracking-tight text-navy tabular-nums">
            <AnimatedNumber value={value} duration={900} />
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2 pt-1 border-t border-gray-50">
        <span className="text-2xs text-muted">Trend</span>
        <Sparkline values={sparkValues} strokeClassName={sparkColor} />
      </div>
    </div>
  )
}
