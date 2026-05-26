interface DialogProps {
  isOpen: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function Dialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: DialogProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 ios-blur" />

      {/* Card */}
      <div
        className="relative w-full max-w-[320px] bg-surface-grouped rounded-2xl shadow-xl overflow-hidden animate-[scale-in_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 text-center">
          {title && (
            <h3 className="text-headline-md-mobile text-charcoal-text mb-1">{title}</h3>
          )}
          <p className="text-body-md text-ios-gray">{message}</p>
        </div>

        <div className="border-t border-outline-variant/30 flex divide-x divide-outline-variant/30">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-body-lg text-ios-blue active:bg-surface-container-high transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 text-body-lg font-semibold active:bg-surface-container-high transition-colors
              ${variant === 'danger' ? 'text-ios-red' : 'text-ios-blue'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
