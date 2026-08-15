interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'No encontramos albergues con los filtros seleccionados.',
  description = 'Prueba cambiando la ciudad o el barrio.',
}: EmptyStateProps) {
  return (
    <div className="py-10 text-center">
      <p className="text-base text-gray-700">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
    </div>
  )
}
