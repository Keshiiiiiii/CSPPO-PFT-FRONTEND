import React from 'react'
import { IconAlertTriangle, IconCheck, IconShield, IconX } from '@/components/icons.jsx'

const IconSuccess = () => (
  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-emerald-pale border border-emerald/20 shadow-[0_0_15px_rgba(5,150,105,0.2)] flex items-center justify-center text-emerald text-xl">
    <IconCheck />
  </div>
)

const IconError = () => (
  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-coral-pale border border-coral/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center justify-center text-coral text-xl">
    <IconAlertTriangle />
  </div>
)

const IconInfo = () => (
  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue/10 border border-blue/20 shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center justify-center text-blue text-xl">
    <IconShield />
  </div>
)

function Modal({ isOpen, onClose, title, children, footer, className }) {
  if (!isOpen) return null

  // Determine intent based on title
  const tLower = (title || '').toLowerCase()
  const isSuccess = tLower.includes('success')
  const isError = tLower.includes('fail') || tLower.includes('error') || tLower.includes('warning')
  
  let Icon = IconInfo
  let accentBorder = 'border-t-blue'
  
  if (isSuccess) {
    Icon = IconSuccess
    accentBorder = 'border-t-emerald'
  } else if (isError) {
    Icon = IconError
    accentBorder = 'border-t-coral'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(6,13,30,0.3)] border-t-4 ${accentBorder} animate-scale-in overflow-hidden ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Body Content */}
        <div className="p-6 pb-5">
          <div className="flex items-start gap-4">
            <Icon />
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold font-display text-navy tracking-tight">{title}</h2>
                <button
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 -mt-1 -mr-2 rounded-full text-muted hover:text-coral hover:bg-coral-pale/50 active:scale-95 transition-all duration-fast cursor-pointer"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <IconX />
                </button>
              </div>
              <div className="mt-2 text-sm text-slate leading-relaxed">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {footer ? (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
            {footer}
          </div>
        ) : (
          <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
             <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-white bg-navy hover:bg-navy-light active:scale-95 transition-all rounded-lg shadow-sm cursor-pointer">
               Continue
             </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
