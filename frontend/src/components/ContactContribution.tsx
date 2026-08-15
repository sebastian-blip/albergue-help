import { Phone } from 'lucide-react'

const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE

function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const withoutCountry = digits.startsWith('57') && digits.length > 9
    ? digits.slice(2)
    : digits

  if (withoutCountry.length === 10) {
    return `${withoutCountry.slice(0, 3)} ${withoutCountry.slice(3, 6)} ${withoutCountry.slice(6)}`
  }

  return phone
}

export function ContactContribution() {
  if (!CONTACT_PHONE) {
    return null
  }

  const displayPhone = formatPhoneForDisplay(CONTACT_PHONE)

  return (
    <section className="rounded border border-gray-300 bg-white p-4">
      <h2 className="mb-2 text-base font-semibold text-gray-900">
        ¿Conoces un albergue que no aparece?
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Si necesitas agregar un albergue o quieres contribuir a mantener actualizada la
        información, comunícate con nosotros.
      </p>
      <a
        href={`tel:${CONTACT_PHONE}`}
        className="inline-flex items-center gap-2 rounded bg-blue-700 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        {displayPhone}
      </a>
    </section>
  )
}
