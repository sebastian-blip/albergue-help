import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, sessionExpired: contextSessionExpired, clearSessionExpired } = useAuth()
  const sessionExpired = contextSessionExpired || location.state?.sessionExpired === true
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    clearSessionExpired()
    setSubmitting(true)

    try {
      await login(email, password)
      navigate('/admin')
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-1 text-xl font-semibold text-gray-900">
        Administración
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Inicia sesión para gestionar albergues y usuarios.
      </p>

      {sessionExpired && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Tu sesión ha expirado. Inicia sesión nuevamente.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-700 px-4 py-3 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-70"
        >
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}
