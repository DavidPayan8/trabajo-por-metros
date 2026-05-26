import { useState, useCallback } from 'react'

interface DialogOptions {
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

interface DialogState extends DialogOptions {
  message: string
  resolve: (ok: boolean) => void
}

export function useDialog() {
  const [state, setState] = useState<DialogState | null>(null)

  const confirm = useCallback((message: string, options?: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ message, ...options, resolve })
    })
  }, [])

  const dialogProps = {
    isOpen: state !== null,
    title: state?.title,
    message: state?.message ?? '',
    confirmLabel: state?.confirmLabel,
    cancelLabel: state?.cancelLabel,
    variant: state?.variant,
    onConfirm: () => { state?.resolve(true); setState(null) },
    onCancel: () => { state?.resolve(false); setState(null) },
  }

  return { confirm, dialogProps }
}
