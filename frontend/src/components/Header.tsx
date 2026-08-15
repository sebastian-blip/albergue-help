import { Building2, LayoutDashboard } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return null
  }

  return (
    <header className="border-b border-gray-300 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2">
          <Building2 className="h-5 w-5 text-blue-700" aria-hidden="true" />
          <span className="text-base font-semibold tracking-wide text-gray-900 uppercase">
            Albergue Help
          </span>
        </Link>

        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Admin
        </Link>
      </div>
    </header>
  )
}
