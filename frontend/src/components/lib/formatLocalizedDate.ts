import type { DashboardLanguage } from '#/types/Types'

export function formatLocalizedFullDate(
  value: Date,
  language: DashboardLanguage,
) {
  const locale = language === 'fr' ? 'fr-FR' : 'en-GB'

  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value)

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
