export type ShelterStatus = 'OPEN' | 'FULL' | 'CLOSED'
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface Shelter {
  id: string
  name: string
  description: string | null
  address: string
  neighborhood: string
  city: string
  department: string
  capacity: number | null
  current_occupancy: number | null
  available_capacity: number | null
  phone: string
  contact_name: string
  status: ShelterStatus
  verification_status: VerificationStatus
  created_at: string
  updated_at: string
}

export interface ShelterCreate {
  name: string
  description?: string | null
  address: string
  neighborhood: string
  city: string
  department: string
  capacity: number | null
  current_occupancy?: number | null
  phone: string
  contact_name: string
}

export interface ShelterUpdate {
  name?: string
  description?: string | null
  address?: string
  neighborhood?: string
  city?: string
  department?: string
  capacity?: number | null
  current_occupancy?: number | null
  phone?: string
  contact_name?: string
}

export interface ShelterOccupancyUpdate {
  current_occupancy: number
}

export interface ShelterFilters {
  page?: number
  page_size?: number
  city?: string
  neighborhood?: string
  department?: string
  status?: ShelterStatus
  verification_status?: VerificationStatus
  has_capacity?: boolean
}

export interface PaginatedShelters {
  items: Shelter[]
  total: number
  page: number
  page_size: number
  pages: number
}
