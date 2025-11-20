import { Fragment, type ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
  }
}

export const Modal = ({
  title,
  description,
  isOpen,
  onClose,
  children,
  primaryAction,
}: ModalProps) => {
  if (!isOpen) return null

  return (
    <Fragment>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-slate-600">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="mt-4">{children}</div>

          {primaryAction && (
            <div className="mt-6 flex justify-end">
              <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  )
}

