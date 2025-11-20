import type { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  title?: string
  description?: string
  className?: string
  children: ReactNode
  footer?: ReactNode
}

export const Card = ({
  title,
  description,
  className,
  children,
  footer,
}: CardProps) => (
  <div className={clsx('rounded-2xl border border-slate-100 bg-white p-6 shadow-sm', className)}>
    {(title || description) && (
      <div className="mb-4">
        {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
    )}
    {children}
    {footer && <div className="mt-4 border-t border-slate-100 pt-4">{footer}</div>}
  </div>
)

