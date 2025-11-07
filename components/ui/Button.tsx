import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case 'destructive':
      return 'bg-red-600 text-white hover:bg-red-700'
    case 'outline':
      return 'border border-gray-300 bg-white hover:bg-gray-50'
    case 'secondary':
      return 'bg-gray-100 text-gray-900 hover:bg-gray-200'
    case 'ghost':
      return 'hover:bg-gray-100'
    case 'link':
      return 'underline-offset-4 hover:underline text-primary-600'
    default:
      return 'bg-primary-600 text-white hover:bg-primary-700'
  }
}

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'sm':
      return 'h-9 px-3 rounded-md'
    case 'lg':
      return 'h-11 px-8 rounded-md'
    case 'icon':
      return 'h-10 w-10'
    default:
      return 'h-10 py-2 px-4'
  }
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${getVariantClasses(variant)} ${getSizeClasses(size)} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }