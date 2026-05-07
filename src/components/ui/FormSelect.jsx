import { useState, useRef, useEffect, useId } from 'react'
import clsx from 'clsx'
import { IconCheck, IconChevronDown } from '@/components/icons.jsx'

/**
 * Custom listbox-style select — consistent with dashboard forms, click-outside close, keyboard-friendly trigger.
 */
export default function FormSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled,
  className,
  id: idProp,
}) {
  const autoId = useId()
  const id = idProp || autoId
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const list = options.filter((o) => o.label != null)
  const selected = list.find((o) => String(o.value) === String(value))
  const showPlaceholder = selected == null || value === '' || value === undefined

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={clsx(
          'flex w-full min-h-[42px] items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-left text-sm shadow-sm transition-all',
          'hover:border-gray-300 hover:bg-gray-50/50',
          'focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span className={clsx('truncate', showPlaceholder ? 'text-gray-500' : 'text-gray-900')}>{showPlaceholder ? placeholder : selected.label}</span>
        <span className={clsx('shrink-0 text-gray-400 transition-transform duration-200', open && 'rotate-180')}>
          <IconChevronDown />
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] ring-1 ring-black/[0.04]"
        >
          {list.map((o) => {
            const isSel = String(o.value) === String(value)
            return (
              <li key={String(o.value) + o.label} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  className={clsx(
                    'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors',
                    isSel ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                >
                  <span>{o.label}</span>
                  {isSel && <span className="shrink-0 text-emerald-600"><IconCheck /></span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
