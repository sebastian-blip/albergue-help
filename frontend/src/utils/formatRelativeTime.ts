const formatter = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' })

const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
]

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  let duration = (date.getTime() - now.getTime()) / 1000

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }

  return formatter.format(Math.round(duration), 'years')
}
