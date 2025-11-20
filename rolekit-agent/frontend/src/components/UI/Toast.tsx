import { useEffect, useState } from 'react'
import clsx from 'clsx'

interface ToastProps {
  message: string
  variant?: 'info' | 'success' | 'error'
  duration?: number
}

export const Toast = ({
  message,
  variant = 'info',
  duration = 3000,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  return (
    <div
      className={clsx(
        'fixed bottom-6 right-6 rounded-lg px-4 py-3 text-sm text-white shadow-2xl',
        variant === 'info' && 'bg-slate-900',
        variant === 'success' && 'bg-emerald-600',
        variant === 'error' && 'bg-red-600',
      )}
    >
      {message}
    </div>
  )
}

