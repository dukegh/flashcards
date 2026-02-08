'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [registrationEnabled, setRegistrationEnabled] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Load app settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const settings = await response.json()
          setRegistrationEnabled(settings.registration_enabled !== false)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setSettingsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (isSignUp) {
        const redirectUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback`
          : 'http://localhost:3000/auth/callback'
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        })
        if (error) throw error
        setError(null)
        alert('Перевірте вашу пошту для підтвердження!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Помилка при авторизації')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Flash Cards 📚
        </h1>
        <h2 className="text-xl font-semibold text-center mb-6 text-gray-700">
          {isSignUp ? 'Реєстрація' : 'Вхід'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isSignUp && !registrationEnabled && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Реєстрація наразі недоступна. Спробуйте пізніше або зв'яжіться з адміністратором.
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || settingsLoading || (isSignUp && !registrationEnabled)}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Завантаження...' : settingsLoading ? 'Завантаження...' : isSignUp ? 'Зареєструватися' : 'Увійти'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            disabled={!isSignUp && !registrationEnabled}
            className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSignUp
              ? 'Вже маєте аккаунт? Увійти'
              : !registrationEnabled ? "Реєстрація наразі недоступна" : "Немаєте аккаунту? Зареєструватися"}
          </button>
        </div>
      </div>
    </div>
  )
}
