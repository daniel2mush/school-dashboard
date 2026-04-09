import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '#/locales/dashboard/en'
import fr from '#/locales/dashboard/fr'

const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
  })
}

export default i18n
