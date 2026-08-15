import { AlertTriangle } from 'lucide-react'
import type { Shelter } from '../../types/shelter'

interface DeleteShelterDialogProps {
  shelter: Shelter | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isSubmitting: boolean
}

export function DeleteShelterDialog({
  shelter,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: DeleteShelterDialogProps) {
  if (!isOpen || !shelter) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-6 w-6 text-red-700" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Eliminar albergue</h2>
        </div>

        <p className="mb-2 text-base text-gray-700">
          ¿Estás seguro de eliminar <strong>"{shelter.name}"</strong>?
        </p>
        <p className="mb-6 text-sm text-gray-600">
          Esta acción eliminará permanentemente el albergue. No se puede deshacer.
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded bg-red-700 px-4 py-2.5 text-base font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:opacity-70"
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
