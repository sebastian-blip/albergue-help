import type {
  PaginatedShelters,
  Shelter,
  ShelterCreate,
  ShelterFilters,
  ShelterOccupancyUpdate,
  ShelterUpdate,
} from '../types/shelter'
import { API_BASE } from './api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem('token')
    throw new Error('SESSION_EXPIRED')
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `HTTP error ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

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

export async function getShelters(filters: ShelterFilters = {}): Promise<PaginatedShelters> {
  const response = await fetch(`${API_BASE}/v1/shelters${buildQueryString(filters)}`, {
    headers: authHeaders(),
  })
  return handleResponse<PaginatedShelters>(response)
}

export async function getShelter(id: string): Promise<Shelter> {
  const response = await fetch(`${API_BASE}/v1/shelters/${id}`, {
    headers: authHeaders(),
  })
  return handleResponse<Shelter>(response)
}

export async function createShelter(data: ShelterCreate): Promise<Shelter> {
  const response = await fetch(`${API_BASE}/v1/shelters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse<Shelter>(response)
}

export async function updateShelter(id: string, data: ShelterUpdate): Promise<Shelter> {
  const response = await fetch(`${API_BASE}/v1/shelters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse<Shelter>(response)
}

export async function updateShelterOccupancy(
  id: string,
  occupancy: ShelterOccupancyUpdate
): Promise<Shelter> {
  const response = await fetch(`${API_BASE}/v1/shelters/${id}/occupancy`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(occupancy),
  })
  return handleResponse<Shelter>(response)
}

export async function deleteShelter(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/v1/shelters/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return handleResponse<void>(response)
}
