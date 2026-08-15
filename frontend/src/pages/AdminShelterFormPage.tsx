import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../components/admin/AdminLayout'
import { ShelterForm } from '../components/admin/ShelterForm'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { useAuth } from '../context/AuthContext'
import { createShelter, getShelter, updateShelter } from '../services/shelters'
import type { Shelter, ShelterCreate, ShelterUpdate } from '../types/shelter'

export function AdminShelterFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const isEditing = Boolean(id)

  const [shelter, setShelter] = useState<Shelter | null>(null)
  const [loading, setLoading] = useState(isEditing)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchShelter = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getShelter(id)
        setShelter(data)
      } catch (err) {
        if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
          logout()
          navigate('/admin/login', { state: { sessionExpired: true } })
          return
        }
        setError(err instanceof Error ? err.message : 'Error al cargar el albergue')
      } finally {
        setLoading(false)
      }
    }

    fetchShelter()
  }, [id, logout, navigate])

  const handleSubmit = async (data: ShelterCreate | ShelterUpdate) => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (isEditing && id) {
        await updateShelter(id, data as ShelterUpdate)
        navigate('/admin', { state: { successMessage: 'Albergue actualizado correctamente.' } })
      } else {
        await createShelter(data as ShelterCreate)
        navigate('/admin', { state: { successMessage: 'Albergue creado correctamente.' } })
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        logout()
        navigate('/admin/login', { state: { sessionExpired: true } })
        return
      }
      setError(err instanceof Error ? err.message : 'Error al guardar el albergue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al panel
        </Link>

        <h1 className="mb-6 text-xl font-semibold text-gray-900">
          {isEditing ? 'Editar albergue' : 'Nuevo albergue'}
        </h1>

        {error && (
          <div className="mb-4">
            <ErrorState message={error} />
          </div>
        )}

        {loading ? (
          <LoadingState message="Cargando albergue..." />
        ) : (
          <div className="rounded border border-gray-300 bg-white p-4 sm:p-6">
            <ShelterForm
              shelter={shelter}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admin')}
              isSubmitting={isSubmitting}
              submitLabel={isEditing ? 'Guardar cambios' : 'Crear albergue'}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
