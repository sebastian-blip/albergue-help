import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/admin/AdminLayout'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { useAuth } from '../context/AuthContext'
import { getUsers, updateUserStatus } from '../services/auth'
import type { User } from '../types/user'

export function AdminUsersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.successMessage ?? null
  )

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        logout()
        navigate('/admin/login', { state: { sessionExpired: true } })
        return
      }
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [logout, navigate])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const toggleStatus = async (targetUser: User) => {
    setError(null)
    try {
      await updateUserStatus(targetUser.id, { is_active: !targetUser.is_active })
      setSuccessMessage('Estado de usuario actualizado correctamente.')
      await fetchUsers()
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        logout()
        navigate('/admin/login', { state: { sessionExpired: true } })
        return
      }
      setError(err instanceof Error ? err.message : 'Error al actualizar estado')
    }
  }

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

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Usuarios administrativos</h1>
            <p className="text-sm text-gray-600">Crear, activar o desactivar usuarios.</p>
          </div>
          <Link
            to="/admin/users/new"
            className="inline-flex items-center justify-center rounded bg-blue-700 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            Crear usuario
          </Link>
        </div>

        {successMessage && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4">
            <ErrorState message={error} onRetry={fetchUsers} />
          </div>
        )}

        {loading ? (
          <LoadingState message="Cargando usuarios..." />
        ) : users.length === 0 ? (
          <EmptyState title="No hay usuarios registrados." description="Crea el primer usuario administrativo." />
        ) : (
          <div className="overflow-x-auto rounded border border-gray-300 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-300 px-4 py-2 font-semibold text-gray-700">Nombre</th>
                  <th className="border-b border-gray-300 px-4 py-2 font-semibold text-gray-700">Email</th>
                  <th className="border-b border-gray-300 px-4 py-2 font-semibold text-gray-700">Rol</th>
                  <th className="border-b border-gray-300 px-4 py-2 font-semibold text-gray-700">Estado</th>
                  <th className="border-b border-gray-300 px-4 py-2 font-semibold text-gray-700">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((targetUser) => (
                  <tr key={targetUser.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-4 py-3 text-gray-900">{targetUser.name}</td>
                    <td className="px-4 py-3 text-gray-700">{targetUser.email}</td>
                    <td className="px-4 py-3 text-gray-700">{targetUser.role}</td>
                    <td className="px-4 py-3">
                      {targetUser.is_active ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Activo</span>
                      ) : (
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleStatus(targetUser)}
                        className="text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                      >
                        {targetUser.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
