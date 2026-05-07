import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { IconAlertTriangle, IconShield } from '@/components/icons.jsx'

/**
 * Premium confirmation dialog — replaces window.confirm().
 * Fully migrated to Tailwind CSS.
 */
function ConfirmDialog({ isOpen, title, message, confirmText, cancelText, variant, onConfirm, onCancel }) {
  if (!isOpen) return null
  const isDanger = variant === 'danger'

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-white rounded-xl shadow-xl animate-scale-in overflow-hidden"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Icon */}
        <div className={`flex items-center justify-center w-14 h-14 mx-auto mt-6 rounded-full text-2xl ${isDanger ? 'bg-coral-pale text-coral' : 'bg-blue/10 text-blue'}`}>
          {isDanger ? <IconAlertTriangle /> : <IconShield />}
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-2 text-center">
          <h3 className="text-lg font-semibold text-navy mb-1">
            {title || 'Confirm Action'}
          </h3>
          <p className="text-sm text-slate leading-relaxed">
            {message || 'Are you sure you want to proceed?'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 mt-2">
          <button
            type="button"
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-fast cursor-pointer"
            onClick={onCancel}
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors duration-fast cursor-pointer ${
              isDanger
                ? 'bg-coral hover:bg-coral-light'
                : 'bg-blue hover:bg-blue-light'
            }`}
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
