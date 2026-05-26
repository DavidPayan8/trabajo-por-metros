import { useState } from 'react'
import { useInstallPWA } from '../hooks/useInstallPWA'

export function InstallBanner() {
  const { canShowBanner, install, isIOS } = useInstallPWA()
  const [dismissed, setDismissed] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  if (!canShowBanner || dismissed) return null

  return (
    <>
      {/* Banner */}
      <div className="fixed top-0 left-0 right-0 z-[70] safe-pt">
        <div className="max-w-[600px] mx-auto mx-3 mt-3">
          <div className="bg-white border border-black/10 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
            <img src="/icon-192.png" alt="Metros" className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-body-lg font-semibold text-charcoal-text leading-tight">Instalar Planificador</p>
              <p className="text-label-md text-ios-gray">Accede más rápido desde tu pantalla de inicio</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={isIOS ? () => setShowIOSGuide(true) : install}
                className="bg-ios-blue text-white text-label-lg font-semibold px-4 py-1.5 rounded-full active:opacity-80 transition-opacity"
              >
                Instalar
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-ios-gray active:opacity-60 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal instrucciones iOS */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[80] flex items-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowIOSGuide(false)}
          />
          <div className="relative w-full max-w-[600px] mx-auto bg-white rounded-t-3xl p-6 flex flex-col gap-4 safe-pb"
            style={{ animation: 'slide-up 0.3s ease' }}>
            <div className="w-10 h-1 bg-black/20 rounded-full mx-auto -mt-2" />
            <div className="flex items-center gap-3">
              <img src="/icon-192.png" alt="Metros" className="w-12 h-12 rounded-2xl" />
              <div>
                <h3 className="text-headline-md-mobile font-bold text-charcoal-text">Añadir a inicio</h3>
                <p className="text-label-lg text-ios-gray">Sigue estos pasos en Safari</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Step n={1} icon="ios_share">
                Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari
              </Step>
              <Step n={2} icon="add_box">
                Desplázate y elige <strong>"Añadir a pantalla de inicio"</strong>
              </Step>
              <Step n={3} icon="check_circle">
                Pulsa <strong>Añadir</strong> — el icono aparecerá en tu pantalla de inicio
              </Step>
            </div>

            <button
              onClick={() => { setShowIOSGuide(false); setDismissed(true) }}
              className="w-full min-h-[44px] bg-ios-blue text-white font-semibold rounded-2xl active:opacity-80 transition-opacity"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function Step({ n, icon, children }: { n: number; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-ios-blue/10 text-ios-blue flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-label-md font-bold">{n}</span>
      </div>
      <div className="flex items-start gap-2 flex-1">
        <span className="material-symbols-outlined text-ios-blue text-[22px] shrink-0 mt-0.5">{icon}</span>
        <p className="text-body-md text-charcoal-text">{children}</p>
      </div>
    </div>
  )
}
