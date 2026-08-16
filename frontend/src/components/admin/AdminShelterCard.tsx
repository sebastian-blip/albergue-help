import { Edit, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Shelter } from '../../types/shelter'
import { formatRelativeTime } from '../../utils/formatRelativeTime'

interface AdminShelterCardProps {
  shelter: Shelter
  onUpdateOccupancy: (shelter: Shelter) => void
  onDelete: (shelter: Shelter) => void
}

export function AdminShelterCard({
  shelter,
  onUpdateOccupancy,
  onDelete,
}: AdminShelterCardProps) {
  const capacity = shelter.capacity
  const occupancy = shelter.current_occupancy
  const availabilityKnown = capacity !== null && occupancy !== null
  const available = availabilityKnown ? capacity - occupancy : null
  const hasAvailability = availabilityKnown && available !== null && available > 0

  return (
    <div className="rounded border border-gray-300 bg-white p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{shelter.name}</h3>
          <p className="text-sm text-gray-600">
            {shelter.neighborhood} · {shelter.city}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              shelter.status === 'OPEN'
                ? 'bg-green-100 text-green-800'
                : shelter.status === 'FULL'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            {shelter.status === 'OPEN' && 'Disponible'}
            {shelter.status === 'FULL' && 'Lleno'}
            {shelter.status === 'CLOSED' && 'Cerrado'}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              shelter.verification_status === 'VERIFIED'
                ? 'bg-blue-100 text-blue-800'
                : shelter.verification_status === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {shelter.verification_status === 'VERIFIED' && 'Verificado'}
            {shelter.verification_status === 'PENDING' && 'Pendiente'}
            {shelter.verification_status === 'REJECTED' && 'Rechazado'}
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-gray-50 p-2">
          <p className="text-xs text-gray-600">Capacidad</p>
          <p className="text-lg font-semibold text-gray-900">
            {shelter.capacity ?? 'No informada'}
          </p>
        </div>
        <div className="rounded bg-gray-50 p-2">
          <p className="text-xs text-gray-600">Ocupados</p>
          <p className="text-lg font-semibold text-gray-900">
            {shelter.current_occupancy ?? 'No informada'}
          </p>
        </div>
        <div className="rounded bg-gray-50 p-2">
          <p className="text-xs text-gray-600">Disponibles</p>
          <p className="text-lg font-semibold text-gray-900">
            {!availabilityKnown ? '—' : hasAvailability ? available : 'Sin disponibilidad'}
          </p>
        </div>
      </div>

      <p className="mb-3 text-xs text-gray-500">
        Actualizado {formatRelativeTime(shelter.updated_at)}
      </p>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`/admin/shelters/${shelter.id}/edit`}
          className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          <Edit className="h-4 w-4" aria-hidden="true" />
          Editar
        </Link>

        <button
          type="button"
          onClick={() => onUpdateOccupancy(shelter)}
          className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Actualizar ocupación
        </button>

        <button
          type="button"
          onClick={() => onDelete(shelter)}
          className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar
        </button>
      </div>
    </div>
  )
}
