import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'

/* ── Toast Icons ── */
const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" className="toast__icon-svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
)
const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" className="toast__icon-svg"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
)
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" className="toast__icon-svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
)
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" className="toast__icon-svg"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="toast__close-svg"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)

const ICONS = { success: SuccessIcon, error: ErrorIcon, warning: WarningIcon, info: InfoIcon }
const DURATIONS = { success: 4000, error: 6000, warning: 5000, info: 4000 }

/* ── Single Toast Item ── */
function ToastItem({ id, type, title, message, onDismiss }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(id), 350)
    }, DURATIONS[type] || 4000)
    return () => clearTimeout(timer)
  }, [id, type, onDismiss])

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => onDismiss(id), 350)
  }

  const Icon = ICONS[type] || InfoIcon

  return (
    <div className={`toast toast--${type}${exiting ? ' toast--exit' : ''}`} role="alert">
      <div className="toast__accent" />
      <div className="toast__icon"><Icon /></div>
      <div className="toast__content">
        {title && <div className="toast__title">{title}</div>}
        <div className="toast__message">{message}</div>
      </div>
      <button className="toast__close" onClick={handleClose} aria-label="Dismiss">
        <CloseIcon />
      </button>
      <div className="toast__progress" style={{ animationDuration: `${DURATIONS[type] || 4000}ms` }} />
    </div>
  )
}

/* ── Toast Container ── */
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return createPortal(
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  )
}

/* ── Toast Context ── */
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

  const toast = useCallback({
    success: (msg, title) => addToast('success', msg, title || 'Success'),
    error: (msg, title) => addToast('error', msg, title || 'Error'),
    warning: (msg, title) => addToast('warning', msg, title || 'Warning'),
    info: (msg, title) => addToast('info', msg, title || 'Info'),
  }, [addToast])

  // Make toast callable: toast.success(), toast.error(), etc.
  const value = { toast, dismiss }

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

// No-context version: standalone provider for App usage
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
