interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4">
      <p className="text-base text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-red-800 underline hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}
