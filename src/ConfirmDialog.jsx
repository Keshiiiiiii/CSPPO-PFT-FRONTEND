import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

/* ── Icons ── */
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" className="confirm-dialog__icon-svg confirm-dialog__icon-svg--danger">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" className="confirm-dialog__icon-svg confirm-dialog__icon-svg--info">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

/**
 * Premium confirmation dialog — replaces window.confirm().
 */
function ConfirmDialog({ isOpen, title, message, confirmText, cancelText, variant, onConfirm, onCancel }) {
  if (!isOpen) return null
  const isDanger = variant === 'danger'

  return createPortal(
    <div className="confirm-dialog__overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}>
      <div className="confirm-dialog" role="alertdialog" aria-modal="true">
        <div className={`confirm-dialog__icon-wrap confirm-dialog__icon-wrap--${isDanger ? 'danger' : 'info'}`}>
          {isDanger ? <AlertIcon /> : <InfoIcon />}
        </div>
        <div className="confirm-dialog__body">
          <h3 className="confirm-dialog__title">{title || 'Confirm Action'}</h3>
          <p className="confirm-dialog__message">{message || 'Are you sure you want to proceed?'}</p>
        </div>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__btn confirm-dialog__btn--cancel" onClick={onCancel}>
            {cancelText || 'Cancel'}
          </button>
          <button
            type="button"
            className={`confirm-dialog__btn confirm-dialog__btn--${isDanger ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * Hook that provides a promise-based confirm dialog.
 * Usage: const result = await confirm({ title, message, variant: 'danger' })
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useConfirmDialog() {
  const [state, setState] = useState({ isOpen: false, config: {}, resolve: null })

  const confirm = useCallback((config = {}) => {
    return new Promise((resolve) => {
      setState({ isOpen: true, config, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState({ isOpen: false, config: {}, resolve: null })
  }, [state.resolve])

  const handleCancel = useCallback(() => {
    state.resolve?.(false)
    setState({ isOpen: false, config: {}, resolve: null })
  }, [state.resolve])

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={state.isOpen}
      {...state.config}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, ConfirmDialogComponent }
}

export default ConfirmDialog
