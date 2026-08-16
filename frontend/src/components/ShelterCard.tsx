import { MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Shelter } from '../types/shelter'
import { AvailabilityBadge } from './AvailabilityBadge'

interface ShelterCardProps {
  shelter: Shelter
}

export function ShelterCard({ shelter }: ShelterCardProps) {
  return (
    <article className="rounded border border-gray-300 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {shelter.name}
        </h2>
        <AvailabilityBadge
          status={shelter.status}
          capacity={shelter.capacity}
          currentOccupancy={shelter.current_occupancy}
        />
        {(shelter.capacity === null || shelter.current_occupancy === null) && (
          <a
            href={`tel:${shelter.phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {shelter.phone}
          </a>
        )}
      </div>

      <div className="mb-4 flex items-start gap-1.5 text-sm text-gray-700">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
        <div>
          <p>{shelter.neighborhood} · {shelter.city}</p>
          <p className="text-gray-600">{shelter.address}</p>
        </div>
      </div>

      <Link
        to={`/shelter/${shelter.id}`}
        className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
      >
        Ver detalle
        <span aria-hidden="true" className="ml-1">→</span>
      </Link>
    </article>
  )
}
