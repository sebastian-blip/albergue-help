export function EmptyState() {
  return (
    <div className="py-10 text-center">
      <p className="text-base text-gray-700">
        No encontramos albergues con los filtros seleccionados.
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Prueba cambiando la ciudad o el barrio.
      </p>
    </div>
  )
}
