import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string
}

const variants = {
  primary: 'bg-ios-blue text-white shadow-sm shadow-ios-blue/20 active:brightness-95',
  secondary: 'bg-white border border-black/5 text-charcoal-text active:bg-surface-container-high',
  danger: 'bg-white border border-black/5 text-ios-red active:bg-error-container/30',
  ghost: 'bg-transparent text-ios-blue active:opacity-60',
}

const sizes = {
  sm: 'px-3 py-2 text-label-lg min-h-[36px] rounded-lg',
  md: 'px-4 text-body-lg font-semibold min-h-[44px] rounded-xl',
  lg: 'px-4 text-headline-md-mobile min-h-[52px] rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2 transition-all duration-100
        active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
