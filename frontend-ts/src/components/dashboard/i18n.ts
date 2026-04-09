import { useTranslation } from 'react-i18next'
import { useSchoolData } from '#/components/providers/SchoolDataProvider'
import type { DashboardLanguage } from '#/types/Types'
import i18n from '#/components/dashboard/i18n.instance'

export function translate(language: DashboardLanguage, key: string) {
  return i18n.t(key, {
    lng: language,
    defaultValue: key,
  })
}

export function useDashboardLanguage() {
  const { school } = useSchoolData()
  return school.language
}

export function useDashboardTranslation() {
  const language = useDashboardLanguage()
  const { t } = useTranslation()

  return {
    language,
    t: (key: string) =>
      t(key, {
        lng: language,
        defaultValue: key,
      }),
  }
}
