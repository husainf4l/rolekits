import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary-700 focus-visible:outline-primary',
        secondary:
          'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400',
        ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-300',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>

export const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button className={clsx(buttonStyles({ variant, size }), className)} {...props} />
)

