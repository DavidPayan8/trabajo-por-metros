import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] safe-pt">
      <div className="max-w-[600px] mx-auto px-3 pt-3">
        <div className="bg-ios-blue text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
          <span
            className="material-symbols-outlined text-[22px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            system_update
          </span>
          <p className="flex-1 text-label-lg font-semibold">Nueva versión disponible</p>
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-white text-ios-blue text-label-lg font-bold px-4 py-1.5 rounded-full active:opacity-80 transition-opacity shrink-0"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}
