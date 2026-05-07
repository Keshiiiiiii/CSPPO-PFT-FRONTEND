import clsx from 'clsx'

/**
 * Exercise / record filter pills — active: near-black + white (reference UI),
 * inactive: white outline. Same treatment for admin and officer dashboards.
 */
export default function ExercisePillButton({ active, disabled, className, children, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-full border transition-all duration-200',
        '[&_svg]:shrink-0',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        active
          ? 'bg-[#0a0a0f] text-white border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.14)] [&_svg]:text-white'
          : 'border-gray-100 bg-white text-gray-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-gray-100 hover:bg-gray-50/80',
        !active && !disabled && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
