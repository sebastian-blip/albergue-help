import { Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="border-b border-gray-300 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <Link to="/" className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2">
          <Building2 className="h-5 w-5 text-blue-700" aria-hidden="true" />
          <span className="text-base font-semibold tracking-wide text-gray-900 uppercase">
            Albergue Help
          </span>
        </Link>
      </div>
    </header>
  )
}
