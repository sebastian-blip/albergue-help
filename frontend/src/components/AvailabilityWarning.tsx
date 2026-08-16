import { AlertTriangle } from 'lucide-react'

interface AvailabilityWarningProps {
  variant: 'list' | 'detail'
}

export function AvailabilityWarning({ variant }: AvailabilityWarningProps) {
  const message =
    variant === 'list'
      ? 'La disponibilidad puede cambiar rápidamente. Confirma la disponibilidad antes de desplazarte.'
      : 'Los cupos mostrados corresponden a la última actualización reportada y pueden haber cambiado.'

  return (
    <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}
