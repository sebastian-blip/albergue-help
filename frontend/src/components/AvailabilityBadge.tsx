import type { ShelterStatus } from '../types/shelter'

interface AvailabilityBadgeProps {
  status: ShelterStatus
  capacity: number | null
  currentOccupancy: number | null
}

export function AvailabilityBadge({
  status,
  capacity,
  currentOccupancy,
}: AvailabilityBadgeProps) {
  const known = capacity !== null && currentOccupancy !== null
  const available = known ? capacity - currentOccupancy : null
  const hasAvailability = known && currentOccupancy < capacity

  if (status === 'CLOSED') {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex w-fit items-center rounded bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
          Cerrado
        </span>
        <span className="text-sm text-gray-700">
          {known
            ? hasAvailability
              ? `${available} ${available === 1 ? 'cupo disponible' : 'cupos disponibles'}`
              : 'Sin disponibilidad'
            : 'Disponibilidad no informada'}
        </span>
      </div>
    )
  }

  if (!known) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex w-fit items-center rounded bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
          Disponibilidad no informada
        </span>
        <span className="text-sm text-gray-700">Disponibilidad no informada</span>
      </div>
    )
  }

  if (hasAvailability) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex w-fit items-center rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
          Disponible
        </span>
        <span className="text-sm text-gray-700">
          {available} {available === 1 ? 'cupo disponible' : 'cupos disponibles'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex w-fit items-center rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
        Sin disponibilidad
      </span>
      <span className="text-sm text-gray-700">Sin disponibilidad</span>
    </div>
  )
}
