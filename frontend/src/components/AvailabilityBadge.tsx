import type { ShelterStatus } from '../types/shelter'

interface AvailabilityBadgeProps {
  status: ShelterStatus
  availableCapacity: number
}

const statusConfig: Record<
  ShelterStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  OPEN: {
    label: 'Disponible',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  FULL: {
    label: 'Lleno',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  CLOSED: {
    label: 'Cerrado',
    bgColor: 'bg-gray-200',
    textColor: 'text-gray-700',
  },
}

export function AvailabilityBadge({ status, availableCapacity }: AvailabilityBadgeProps) {
  const config = statusConfig[status]

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex w-fit items-center rounded px-2 py-0.5 text-xs font-semibold ${config.bgColor} ${config.textColor}`}
      >
        {config.label}
      </span>
      {status === 'OPEN' && (
        <span className="text-sm text-gray-700">
          {availableCapacity} {availableCapacity === 1 ? 'cupo disponible' : 'cupos disponibles'}
        </span>
      )}
    </div>
  )
}
