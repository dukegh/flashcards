'use client'

import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  title: string
  children: ReactNode
  onClose?: () => void
  actions?: ReactNode
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  actions,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label="Закрити модальне вікно"
            >
              ×
            </button>
          )}
        </div>

        <div className="text-gray-600 space-y-3">{children}</div>

        {actions && <div className="mt-6 flex gap-3">{actions}</div>}
      </div>
    </div>
  )
}
