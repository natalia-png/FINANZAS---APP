'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o contraseña incorrectos')
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError('Revisa tu email para confirmar la cuenta')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gradient-bg">
      {/* Logo / Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="text-6xl mb-3">💕</div>
        <h1 className="text-3xl font-bold text-gray-800">Finanzas</h1>
        <p className="text-gray-500 mt-1">
          <span className="text-pink-400 font-semibold">Nat</span>
          {' & '}
          <span className="text-blue-400 font-semibold">Alejo</span>
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-6 w-full max-w-sm animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">
          {mode === 'login' ? 'Bienvenida/o 👋' : 'Crear cuenta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            />
          </div>

          {error && (
            <p className={`text-sm px-3 py-2 rounded-lg ${
              error.includes('Revisa') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white gradient-nat shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-6">Hecho con 💕 para ustedes dos</p>
    </div>
  )
}
