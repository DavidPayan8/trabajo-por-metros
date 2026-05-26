import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Login } from './pages/Login'
import { Tipos } from './pages/Tipos'
import { Trabajos } from './pages/Trabajos'
import { TrabajoDetalle } from './pages/TrabajoDetalle'
import { Historial } from './pages/Historial'
import { Estadisticas } from './pages/Estadisticas'
import { InstallBanner } from './components/InstallBanner'
import { UpdateBanner } from './components/UpdateBanner'
import { NetworkBanner } from './components/NetworkBanner'

function AppLayout() {
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center h-full w-full gap-0.5 transition-colors rounded-xl
    ${isActive ? 'text-ios-blue' : 'text-ios-gray'}`

  return (
    <div className="flex flex-col min-h-dvh">
      <UpdateBanner />
      <NetworkBanner />
      <InstallBanner />
      <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] max-w-[600px] mx-auto w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/trabajos" replace />} />
          <Route path="/trabajos" element={<Trabajos />} />
          <Route path="/trabajos/:id" element={<TrabajoDetalle />} />
          <Route path="/tipos" element={<Tipos />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 ios-blur bg-surface/80 border-t border-outline-variant/30 safe-pb">
        <div className="flex justify-around items-center h-16 max-w-[600px] mx-auto">
          <NavLink to="/trabajos" className={tabClass} end={false}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[26px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  work
                </span>
                <span className="text-label-md">Trabajos</span>
              </>
            )}
          </NavLink>
          <NavLink to="/tipos" className={tabClass}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[26px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  category
                </span>
                <span className="text-label-md">Tipos</span>
              </>
            )}
          </NavLink>
          <NavLink to="/historial" className={tabClass}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[26px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  history
                </span>
                <span className="text-label-md">Historial</span>
              </>
            )}
          </NavLink>
          <NavLink to="/estadisticas" className={tabClass}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[26px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  bar_chart
                </span>
                <span className="text-label-md">Estadísticas</span>
              </>
            )}
          </NavLink>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex flex-col items-center justify-center h-full w-full gap-0.5 text-ios-gray active:text-ios-red transition-colors rounded-xl"
          >
            <span className="material-symbols-outlined text-[26px]">logout</span>
            <span className="text-label-md">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  return (
    <BrowserRouter>
      {session ? <AppLayout /> : <Login />}
    </BrowserRouter>
  )
}
