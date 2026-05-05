import { useState, useEffect, useRef } from 'react'

/**
 * AnimatedNumber — Counts up from 0 to `value` with easing.
 * Used in stat cards for a premium data-loading feel.
 */
function AnimatedNumber({ value, duration = 800, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseInt(value, 10) || 0
    const start = prevValue.current
    const diff = target - start

    if (diff === 0) { setDisplayValue(target); return }

    const startTime = performance.now()

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + diff * eased)

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        prevValue.current = target
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <>{prefix}{displayValue.toLocaleString()}{suffix}</>
}

export default AnimatedNumber
