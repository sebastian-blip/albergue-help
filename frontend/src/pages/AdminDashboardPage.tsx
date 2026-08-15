import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/admin/AdminLayout'
import { AdminShelterCard } from '../components/admin/AdminShelterCard'
import { DeleteShelterDialog } from '../components/admin/DeleteShelterDialog'
import { OccupancyEditor } from '../components/admin/OccupancyEditor'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { useAuth } from '../context/AuthContext'
import { deleteShelter, getShelters, updateShelterOccupancy } from '../services/shelters'
import type { Shelter } from '../types/shelter'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const [shelters, setShelters] = useState<Shelter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.successMessage ?? null
  )

  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null)
  const [isOccupancyOpen, setIsOccupancyOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchShelters = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getShelters({ page_size: 100 })
      setShelters(response.items)
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        logout()
        navigate('/admin/login', { state: { sessionExpired: true } })
        return
      }
      setError(err instanceof Error ? err.message : 'Error al cargar albergues')
    } finally {
      setLoading(false)
    }
  }, [logout, navigate])

  useEffect(() => {
    fetchShelters()
  }, [fetchShelters])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleUpdateOccupancy = (shelter: Shelter) => {
    setSelectedShelter(shelter)
    setIsOccupancyOpen(true)
  }

  const handleSubmitOccupancy = async (id: string, occupancy: number) => {
    setIsSubmitting(true)
    try {
      await updateShelterOccupancy(id, { current_occupancy: occupancy })
      setIsOccupancyOpen(false)
      setSelectedShelter(null)
      setSuccessMessage('Ocupación actualizada correctamente.')
      await fetchShelters()
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        logout()
        navigate('/admin/login', { state: { sessionExpired: true } })
        return
      }
      setError(err instanceof Error ? err.message : 'Error al actualizar ocupación')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (shelter: Shelter) => {
    setSelectedShelter(shelter)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedShelter) return
    setIsSubmitting(true)
    try {
      await deleteShelter(selectedShelter.id)
      setIsDeleteOpen(false)
      setSelectedShelter(null)
      setSuccessMessage('Albergue eliminado correctamente.')
      await fetchShelters()
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        logout()
        navigate('/admin/login', { state: { sessionExpired: true } })
        return
      }
      setError(err instanceof Error ? err.message : 'Error al eliminar albergue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Panel de administración</h1>
            <p className="text-sm text-gray-600">Gestiona los albergues disponibles.</p>
          </div>
          <Link
            to="/admin/shelters/new"
            className="inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Nuevo albergue
          </Link>
        </div>

        {successMessage && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4">
            <ErrorState message={error} onRetry={fetchShelters} />
          </div>
        )}

        {loading ? (
          <LoadingState message="Cargando albergues..." />
        ) : shelters.length === 0 ? (
          <EmptyState
            title="No hay albergues registrados."
            description="Crea el primer albergue para comenzar."
          />
        ) : (
          <div className="space-y-4">
            {shelters.map((shelter) => (
              <AdminShelterCard
                key={shelter.id}
                shelter={shelter}
                onUpdateOccupancy={handleUpdateOccupancy}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <OccupancyEditor
        shelter={selectedShelter}
        isOpen={isOccupancyOpen}
        onClose={() => {
          setIsOccupancyOpen(false)
          setSelectedShelter(null)
        }}
        onSubmit={handleSubmitOccupancy}
        isSubmitting={isSubmitting}
      />

      <DeleteShelterDialog
        shelter={selectedShelter}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setSelectedShelter(null)
        }}
        onConfirm={handleConfirmDelete}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  )
}
