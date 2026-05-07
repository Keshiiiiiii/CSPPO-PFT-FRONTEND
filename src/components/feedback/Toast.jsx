import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { IconAlertTriangle, IconCheck, IconX } from '@/components/icons.jsx'

const DURATIONS = { success: 4200, error: 6500, warning: 5200, info: 4200 }

const ICONS = {
  success: IconCheck,
  error: IconX,
  warning: IconAlertTriangle,
  info: IconAlertTriangle,
}

const accent = {
  success: 'text-emerald-600 bg-emerald-50',
  error: 'text-red-600 bg-red-50',
  warning: 'text-amber-600 bg-amber-50',
  info: 'text-blue-600 bg-blue-50',
}

function ToastItem({ id, type, title, message, onDismiss }) {
  const [exiting, setExiting] = useState(false)
  const Icon = ICONS[type] || IconAlertTriangle

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(id), 280)
    }, DURATIONS[type] || 4000)
    return () => clearTimeout(timer)
  }, [id, type, onDismiss])

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => onDismiss(id), 280)
  }

  return (
    <div
      role="alert"
      className={clsx(
        'pointer-events-auto flex w-[min(100vw-2rem,22rem)] gap-3 overflow-hidden rounded-xl border border-gray-100 bg-white p-3.5 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.2)] ring-1 ring-black/[0.04] transition-all duration-300 ease-out',
        exiting ? 'translate-x-3 opacity-0' : 'translate-x-0 opacity-100'
      )}
    >
      <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', accent[type] || accent.info)}>
        <Icon />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {title && <div className="text-xs font-semibold text-gray-900">{title}</div>}
        <div className={clsx('text-sm text-gray-600', title && 'mt-0.5')}>{message}</div>
        <div
          className="mt-2 h-0.5 overflow-hidden rounded-full bg-gray-100"
          aria-hidden
        >
          <div
            className={clsx('h-full origin-left rounded-full', type === 'error' ? 'bg-red-400' : type === 'success' ? 'bg-emerald-400' : type === 'warning' ? 'bg-amber-400' : 'bg-blue-400')}
            style={{
              animation: `toast-progress ${DURATIONS[type] || 4000}ms linear forwards`,
            }}
          />
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        <IconX />
      </button>
    </div>
  )
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return createPortal(
    <div
      className="pointer-events-none fixed right-4 top-4 z-[300] flex max-h-[calc(100vh-2rem)] flex-col gap-2 sm:right-6 sm:top-6"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  )
}

const ToastContext = createContext(null)

let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type, message, title) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev.slice(-4), { id, type, message, title }])
    return id
  }, [])

  const toast = useCallback(
    {
      success: (msg, title) => addToast('success', msg, title || 'Success'),
      error: (msg, title) => addToast('error', msg, title || 'Error'),
      warning: (msg, title) => addToast('warning', msg, title || 'Warning'),
      info: (msg, title) => addToast('info', msg, title || 'Info'),
    },
    [addToast]
  )

  const value = { toast, dismiss }

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastState() {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type, message, title) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev.slice(-4), { id, type, message, title }])
    return id
  }, [])

  const toast = {
    success: (msg, title) => addToast('success', msg, title || 'Success'),
    error: (msg, title) => addToast('error', msg, title || 'Error'),
    warning: (msg, title) => addToast('warning', msg, title || 'Warning'),
    info: (msg, title) => addToast('info', msg, title || 'Info'),
  }

  return { toasts, toast, dismiss }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export { ToastContainer }
export default ToastContainer
