import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-base text-gray-700">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ sessionExpired: false }} />
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <p className="text-base text-red-800">
            No tienes permisos para administrar usuarios.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
