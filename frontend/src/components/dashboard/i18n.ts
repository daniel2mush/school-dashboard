import { useTranslation } from 'react-i18next'
import type { DashboardLanguage } from '#/types/Types'
import i18n from '#/components/dashboard/i18n.instance'
import { useSchoolData } from '#/components/store/SchoolDatatStore'

type DashboardTranslationOptions = Record<string, unknown>

export type { DashboardLanguage } from '#/types/Types'

export function translate(
  language: DashboardLanguage,
  key: string,
  options?: DashboardTranslationOptions,
) {
  return i18n.t(key, {
    ...options,
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
    t: (key: string, options?: DashboardTranslationOptions) =>
      t(key, {
        ...options,
        lng: language,
        defaultValue: key,
      }),
  }
}
