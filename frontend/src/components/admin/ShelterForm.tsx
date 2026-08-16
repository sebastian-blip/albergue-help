import { useState } from 'react'
import type { Shelter, ShelterCreate, ShelterUpdate } from '../../types/shelter'

interface ShelterFormProps {
  shelter?: Shelter | null
  onSubmit: (data: ShelterCreate | ShelterUpdate) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}

export function ShelterForm({
  shelter,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: ShelterFormProps) {
  const [formData, setFormData] = useState<ShelterCreate>({
    name: shelter?.name ?? '',
    description: shelter?.description ?? '',
    address: shelter?.address ?? '',
    neighborhood: shelter?.neighborhood ?? '',
    city: shelter?.city ?? '',
    department: shelter?.department ?? '',
    capacity: shelter?.capacity ?? null,
    current_occupancy: shelter?.current_occupancy ?? null,
    phone: shelter?.phone ?? '',
    contact_name: shelter?.contact_name ?? '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof ShelterCreate, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}

    if (!formData.name.trim()) nextErrors.name = 'El nombre es obligatorio'
    if (!formData.address.trim()) nextErrors.address = 'La dirección es obligatoria'
    if (!formData.neighborhood.trim()) nextErrors.neighborhood = 'El barrio es obligatorio'
    if (!formData.city.trim()) nextErrors.city = 'La ciudad es obligatoria'
    if (!formData.department.trim()) nextErrors.department = 'El departamento es obligatorio'
    if (!formData.phone.trim()) nextErrors.phone = 'El teléfono es obligatorio'
    if (!formData.contact_name.trim()) nextErrors.contact_name = 'El nombre de contacto es obligatorio'

    if (formData.capacity !== null && formData.capacity <= 0) {
      nextErrors.capacity = 'La capacidad debe ser mayor a 0'
    }

    const occupancy = formData.current_occupancy ?? null
    if (occupancy !== null && occupancy < 0) {
      nextErrors.current_occupancy = 'La ocupación no puede ser negativa'
    } else if (
      formData.capacity !== null &&
      occupancy !== null &&
      occupancy > formData.capacity
    ) {
      nextErrors.current_occupancy = 'La ocupación no puede superar la capacidad'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate() || isSubmitting) return

    const data: ShelterCreate | ShelterUpdate = shelter
      ? ({
          name: formData.name,
          description: formData.description || null,
          address: formData.address,
          neighborhood: formData.neighborhood,
          city: formData.city,
          department: formData.department,
          capacity: formData.capacity,
          current_occupancy: formData.current_occupancy,
          phone: formData.phone,
          contact_name: formData.contact_name,
        } as ShelterUpdate)
      : ({
          ...formData,
          description: formData.description || null,
        } as ShelterCreate)

    onSubmit(data)
  }

  const inputClass = (field: string) =>
    `w-full rounded border px-3 py-2.5 text-base text-gray-900 focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-700 focus:ring-red-700'
        : 'border-gray-300 focus:border-blue-700 focus:ring-blue-700'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={inputClass('name')}
        />
        {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description ?? ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className={inputClass('description')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={inputClass('address')}
          />
          {errors.address && <p className="mt-1 text-sm text-red-700">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="neighborhood" className="mb-1 block text-sm font-medium text-gray-700">
            Barrio
          </label>
          <input
            id="neighborhood"
            type="text"
            value={formData.neighborhood}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
            className={inputClass('neighborhood')}
          />
          {errors.neighborhood && (
            <p className="mt-1 text-sm text-red-700">{errors.neighborhood}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
            Ciudad
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={inputClass('city')}
          />
          {errors.city && <p className="mt-1 text-sm text-red-700">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="department" className="mb-1 block text-sm font-medium text-gray-700">
            Departamento
          </label>
          <input
            id="department"
            type="text"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className={inputClass('department')}
          />
          {errors.department && <p className="mt-1 text-sm text-red-700">{errors.department}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="capacity" className="mb-1 block text-sm font-medium text-gray-700">
            Capacidad
          </label>
          <input
            id="capacity"
            type="number"
            value={formData.capacity ?? ''}
            onChange={(e) =>
              handleChange(
                'capacity',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
            className={inputClass('capacity')}
          />
          {errors.capacity && <p className="mt-1 text-sm text-red-700">{errors.capacity}</p>}
        </div>

        {!shelter && (
          <div>
            <label
              htmlFor="current_occupancy"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Ocupación actual
            </label>
            <input
              id="current_occupancy"
              type="number"
              min={0}
              value={formData.current_occupancy ?? ''}
              onChange={(e) =>
                handleChange(
                  'current_occupancy',
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              className={inputClass('current_occupancy')}
            />
            {errors.current_occupancy && (
              <p className="mt-1 text-sm text-red-700">{errors.current_occupancy}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClass('phone')}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-700">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="contact_name" className="mb-1 block text-sm font-medium text-gray-700">
            Nombre de contacto
          </label>
          <input
            id="contact_name"
            type="text"
            value={formData.contact_name}
            onChange={(e) => handleChange('contact_name', e.target.value)}
            className={inputClass('contact_name')}
          />
          {errors.contact_name && (
            <p className="mt-1 text-sm text-red-700">{errors.contact_name}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
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
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
