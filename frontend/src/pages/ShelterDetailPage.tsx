import { ArrowLeft, MapPin, Phone, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AvailabilityBadge } from '../components/AvailabilityBadge'
import { AvailabilityWarning } from '../components/AvailabilityWarning'
import { ContactContribution } from '../components/ContactContribution'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { getShelter } from '../services/api'
import type { Shelter } from '../types/shelter'

export function ShelterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [shelter, setShelter] = useState<Shelter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Identificador de albergue no válido.')
      setLoading(false)
      return
    }

    const fetchShelter = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getShelter(id)
        setShelter(data)
      } catch {
        setError('No pudimos cargar la información del albergue.')
      } finally {
        setLoading(false)
      }
    }

    fetchShelter()
  }, [id])

  if (loading) {
    return <LoadingState />
  }

  if (error || !shelter) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ErrorState
          message={error || 'No se encontró el albergue.'}
          onRetry={() => window.location.reload()}
        />
      </main>
    )
  }

  const phoneHref = `tel:${shelter.phone.replace(/\s/g, '')}`

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al listado
      </Link>

      <article className="rounded border border-gray-300 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">{shelter.name}</h1>
          <div className="mt-2">
            <AvailabilityBadge
              status={shelter.status}
              capacity={shelter.capacity}
              currentOccupancy={shelter.current_occupancy}
            />
          </div>
        </div>

        <div className="mb-6 space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <div>
              <p>{shelter.address}</p>
              <p>{shelter.neighborhood} · {shelter.city}, {shelter.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <p>
              Capacidad total: {shelter.capacity ?? 'Capacidad no informada'} · Ocupación actual: {shelter.current_occupancy ?? 'Ocupación no informada'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <AvailabilityWarning variant="detail" />
        </div>

        <a
          href={phoneHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-blue-700 px-4 py-3 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 sm:w-auto"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Llamar al albergue
        </a>

        {shelter.contact_name && (
          <p className="mt-3 text-sm text-gray-600">
            Contacto: {shelter.contact_name}
          </p>
        )}

        {shelter.available_capacity === null && (
          <p className="mt-3 text-sm text-gray-700">
            La disponibilidad no está registrada. Te recomendamos llamar al albergue para confirmar.
          </p>
        )}

        {shelter.description && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Información adicional</h2>
            <p className="text-sm text-gray-700">{shelter.description}</p>
          </div>
        )}
      </article>

      <section className="mt-8">
        <ContactContribution />
      </section>
    </main>
  )
}
