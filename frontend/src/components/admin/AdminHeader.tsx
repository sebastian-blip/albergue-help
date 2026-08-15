import { Building2, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminHeader() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'

  const linkClass =
    'inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 rounded px-1 py-1'
  const activeClass = 'text-blue-700'

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b border-gray-300 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            <Building2 className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <span className="text-base font-semibold tracking-wide text-gray-900 uppercase">
              Resurge
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to="/admin"
              className={`${linkClass} ${isActive('/admin') ? activeClass : ''}`}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Albergues
            </Link>

            {isAdmin && (
              <Link
                to="/admin/users"
                className={`${linkClass} ${isActive('/admin/users') ? activeClass : ''}`}
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                Usuarios
              </Link>
            )}

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 rounded px-1 py-1"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Salir
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
