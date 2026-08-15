import { useCallback, useEffect, useState } from 'react'
import { AvailabilityWarning } from '../components/AvailabilityWarning'
import { ContactContribution } from '../components/ContactContribution'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { SearchFilters } from '../components/SearchFilters'
import { ShelterCard } from '../components/ShelterCard'
import { getShelters } from '../services/api'
import type { PaginatedShelters, ShelterFilters } from '../types/shelter'

export function HomePage() {
  const [filters, setFilters] = useState<ShelterFilters>({ page: 1, page_size: 20 })
  const [result, setResult] = useState<PaginatedShelters | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchShelters = useCallback(async (searchFilters: ShelterFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getShelters(searchFilters)
      setResult(data)
    } catch {
      setError('No pudimos cargar los albergues. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShelters(filters)
  }, [filters, fetchShelters])

  const handleSearch = (newFilters: ShelterFilters) => {
    setFilters(newFilters)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <section className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Encuentra un albergue disponible
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Información actualizada sobre albergues habilitados durante emergencias en Colombia.
        </p>
      </section>

      <section className="mb-6 rounded border border-gray-300 bg-white p-4">
        <SearchFilters initialFilters={filters} onSearch={handleSearch} />
      </section>

      <section aria-live="polite" aria-busy={loading}>
        {loading && <LoadingState />}

        {!loading && error && (
          <ErrorState message={error} onRetry={() => fetchShelters(filters)} />
        )}

        {!loading && !error && result && result.items.length === 0 && <EmptyState />}

        {!loading && !error && result && result.items.length > 0 && (
          <div className="space-y-4">
            <AvailabilityWarning variant="list" />
            <p className="text-sm text-gray-600">
              {result.total} {result.total === 1 ? 'albergue encontrado' : 'albergues encontrados'}
            </p>
            {result.items.map((shelter) => (
              <ShelterCard key={shelter.id} shelter={shelter} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <ContactContribution />
      </section>
    </main>
  )
}
