import { useEffect, useState } from 'react'
import type { Shelter } from '../../types/shelter'

interface OccupancyEditorProps {
  shelter: Shelter | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: string, occupancy: number) => Promise<void>
  isSubmitting: boolean
}

export function OccupancyEditor({
  shelter,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: OccupancyEditorProps) {
  const [value, setValue] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (shelter) {
      setValue(shelter.current_occupancy)
      setError(null)
    }
  }, [shelter])

  if (!isOpen || !shelter) return null

  const available = shelter.capacity - value

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (value < 0) {
      setError('La ocupación no puede ser negativa')
      return
    }
    if (value > shelter.capacity) {
      setError('La ocupación no puede superar la capacidad')
      return
    }

    await onSubmit(shelter.id, value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          Actualizar ocupación
        </h2>
        <p className="mb-4 text-sm text-gray-600">{shelter.name}</p>

        <div className="mb-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded bg-gray-50 p-3">
            <p className="text-xs text-gray-600">Capacidad</p>
            <p className="text-lg font-semibold text-gray-900">{shelter.capacity}</p>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <p className="text-xs text-gray-600">Ocupación actual</p>
            <p className="text-lg font-semibold text-gray-900">
              {shelter.current_occupancy}
            </p>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <p className="text-xs text-gray-600">Disponibles</p>
            <p className="text-lg font-semibold text-gray-900">
              {shelter.capacity - shelter.current_occupancy}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="occupancy" className="mb-1 block text-sm font-medium text-gray-700">
            Nueva ocupación
          </label>
          <input
            id="occupancy"
            type="number"
            min={0}
            max={shelter.capacity}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
          />
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

          <p className="mt-2 text-sm text-gray-600">
            Disponibles después de actualizar:{' '}
            <span className="font-semibold">{available}</span>
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-70"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-700 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
