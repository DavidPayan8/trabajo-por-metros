import { useState, useEffect } from 'react'

export function NetworkBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOffline = () => setIsOnline(false)
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (isOnline && !showReconnected) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] safe-pt pointer-events-none">
      <div className="max-w-[600px] mx-auto px-3 pt-3">
        <div className={`rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 transition-colors ${
          isOnline ? 'bg-ios-green text-white' : 'bg-ios-orange text-white'
        }`}>
          <span
            className="material-symbols-outlined text-[22px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isOnline ? 'wifi' : 'wifi_off'}
          </span>
          <div className="flex-1">
            <p className="text-label-lg font-semibold">
              {isOnline ? 'Conexión restaurada' : 'Sin conexión a internet'}
            </p>
            {!isOnline && (
              <p className="text-label-md opacity-80">Los datos pueden no estar actualizados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
