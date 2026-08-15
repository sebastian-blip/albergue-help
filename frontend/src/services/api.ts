import type { PaginatedShelters, Shelter, ShelterFilters } from '../types/shelter'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const API_BASE = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`

function buildQueryString(filters: ShelterFilters): string {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    if (typeof value === 'boolean') {
      params.append(key, value ? 'true' : 'false')
    } else {
      params.append(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `HTTP error ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function getShelters(
  filters: ShelterFilters = {}
): Promise<PaginatedShelters> {
  const response = await fetch(`${API_BASE}/v1/shelters${buildQueryString(filters)}`)
  return handleResponse<PaginatedShelters>(response)
}

export async function getShelter(id: string): Promise<Shelter> {
  const response = await fetch(`${API_BASE}/v1/shelters/${id}`)
  return handleResponse<Shelter>(response)
}
