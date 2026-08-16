import { Search } from 'lucide-react'
import { useState } from 'react'
import type { ShelterFilters } from '../types/shelter'

interface SearchFiltersProps {
  initialFilters: ShelterFilters
  onSearch: (filters: ShelterFilters) => void
}

export function SearchFilters({ initialFilters, onSearch }: SearchFiltersProps) {
  const [city, setCity] = useState(initialFilters.city || '')
  const [neighborhood, setNeighborhood] = useState(initialFilters.neighborhood || '')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSearch({
      page: 1,
      page_size: 20,
      city: city.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
          Ciudad
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ej: Cali"
          className="w-full rounded border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
        />
      </div>

      <div>
        <label htmlFor="neighborhood" className="mb-1 block text-sm font-medium text-gray-700">
          Barrio
        </label>
        <input
          id="neighborhood"
          type="text"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder="Ej: San José"
          className="w-full rounded border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
        />
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-blue-700 px-4 py-3 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 sm:w-auto"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        Buscar albergues
      </button>
    </form>
  )
}
