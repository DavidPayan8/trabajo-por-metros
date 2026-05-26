import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pressable?: boolean
}

export function Card({ children, className = '', pressable, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-surface-grouped border border-black/5 rounded-2xl p-gutter-card shadow-sm
        ${pressable ? 'active:bg-surface-container-high transition-colors cursor-pointer ios-active' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
