import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Input = ({
  label,
  helperText,
  error,
  className,
  id,
  ...props
}: InputProps) => {
  const inputId = id ?? props.name

  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label && <span>{label}</span>}
      <input
        id={inputId}
        className={clsx(
          'rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-200/60',
          className,
        )}
        {...props}
      />
      {(helperText || error) && (
        <span className={clsx('text-xs', error ? 'text-red-600' : 'text-slate-500')}>
          {error ?? helperText}
        </span>
      )}
    </label>
  )
}

