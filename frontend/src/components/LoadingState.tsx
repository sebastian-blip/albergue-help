interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="py-8 text-center">
      <p className="text-base text-gray-700">{message}</p>
    </div>
  )
}
