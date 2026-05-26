import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-margin-main overflow-hidden">
      <main className="w-full max-w-[400px] flex flex-col items-center">
        {/* Logo */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary-container rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <span className="material-symbols-outlined text-on-primary-container text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <h1 className="text-headline-lg-mobile text-charcoal-text mb-2">Bienvenido</h1>
          <p className="text-body-md text-ios-gray">Gestione su facturación profesional</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@empresa.com"
            autoComplete="email"
            icon="mail"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-label-lg text-charcoal-text ml-1">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-ios-gray text-[20px]">lock</span>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full min-h-[44px] pl-11 pr-12 bg-surface-container-low border border-outline-variant/30 rounded-xl text-body-lg text-charcoal-text placeholder-ios-gray focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ios-gray active:text-ios-blue transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && <p className="text-label-lg text-ios-red ml-1">{error}</p>}

          <Button type="submit" loading={loading} size="lg" className="w-full mt-2" icon="arrow_forward">
            Iniciar Sesión
          </Button>
        </form>

        {/* Background decorations */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-fixed/30 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-tertiary-fixed/20 blur-[120px]" />
        </div>
      </main>
    </div>
  )
}
