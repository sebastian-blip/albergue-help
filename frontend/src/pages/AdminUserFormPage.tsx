import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/admin/AdminLayout'
import { ErrorState } from '../components/ErrorState'
import { useAuth } from '../context/AuthContext'
import { createUser } from '../services/auth'
import type { UserCreate } from '../types/user'

export function AdminUserFormPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [formData, setFormData] = useState<UserCreate>({
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-3xl">
          <div className="rounded border border-red-200 bg-red-50 p-4">
            <p className="text-base text-red-800">
              No tienes permisos para administrar usuarios.
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await createUser(formData)
      navigate('/admin/users', { state: { successMessage: 'Usuario creado correctamente.' } })
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        logout()
        navigate('/admin/login', { state: { sessionExpired: true } })
        return
      }
      setError(err instanceof Error ? err.message : 'Error al crear usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/users"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a usuarios
        </Link>

        <h1 className="mb-6 text-xl font-semibold text-gray-900">Crear usuario</h1>

        {error && (
          <div className="mb-4">
            <ErrorState message={error} />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded border border-gray-300 bg-white p-4 sm:p-6"
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full rounded border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserCreate['role'] })}
              className="w-full rounded border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
            >
              <option value="OPERATOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              to="/admin/users"
              className="rounded border border-gray-300 bg-white px-4 py-2.5 text-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-700 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? 'Guardando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
