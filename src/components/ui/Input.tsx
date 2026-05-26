import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: string
}

export function Input({ label, error, icon, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-label-lg text-charcoal-text ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-ios-gray text-[20px]">{icon}</span>
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full min-h-[44px] px-4 bg-surface-container-low
            border border-outline-variant/30 rounded-xl
            text-body-lg text-charcoal-text placeholder-ios-gray
            focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue
            transition-all duration-200
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-ios-red' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-label-lg text-ios-red ml-1">{error}</p>}
    </div>
  )
}
