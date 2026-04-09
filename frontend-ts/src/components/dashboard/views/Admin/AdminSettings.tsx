'use client'

import { useEffect, useState } from 'react'
import { Globe, GraduationCap, Languages, School } from 'lucide-react'
import { toast } from 'sonner'
import { useSchoolData } from '#/components/providers/SchoolDataProvider'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import type { DashboardLanguage } from '#/types/Types'
import styles from './AdminSettings.module.scss'

export function AdminSettings() {
  const { school, updateSchoolSettings } = useSchoolData()
  const { t } = useDashboardTranslation()
  const [form, setForm] = useState({
    name: school.name,
    term: school.term,
    year: school.year,
    language: school.language,
  })

  useEffect(() => {
    setForm({
      name: school.name,
      term: school.term,
      year: school.year,
      language: school.language,
    })
  }, [school])

  const handleChange = (field: 'name' | 'term' | 'year', value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleLanguageChange = (value: DashboardLanguage) => {
    setForm((current) => ({ ...current, language: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void (async () => {
      const res = await fetch('/api/admin/school-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const responseData = await res.json()

      if (!res.ok) {
        toast.error(responseData.message || 'Failed to save settings')
        return
      }

      updateSchoolSettings(form)
      toast.success(t('settings.saved'))
    })()
  }

  return (
    <div className={styles.view}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>{t('nav.settings')}</div>
        <h1 className={styles.title}>{t('settings.title')}</h1>
        <p className={styles.copy}>{t('settings.subtitle')}</p>
      </section>

      <div className={styles.layout}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.sectionHeading}>
            <h2>{t('settings.schoolProfile')}</h2>
            <p>{t('settings.schoolProfileText')}</p>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>
              <School size={16} />
              {t('settings.schoolName')}
            </span>
            <input
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
          </label>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.label}>
                <GraduationCap size={16} />
                {t('settings.schoolTerm')}
              </span>
              <input
                value={form.term}
                onChange={(event) => handleChange('term', event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                <Globe size={16} />
                {t('settings.schoolYear')}
              </span>
              <input
                value={form.year}
                onChange={(event) => handleChange('year', event.target.value)}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>
              <Languages size={16} />
              {t('settings.language')}
            </span>
            <select
              value={form.language}
              onChange={(event) =>
                handleLanguageChange(event.target.value as DashboardLanguage)
              }
            >
              <option value="en">{t('settings.english')}</option>
              <option value="fr">{t('settings.french')}</option>
            </select>
          </label>

          <button className={styles.saveButton} type="submit">
            {t('settings.save')}
          </button>
        </form>

        <aside className={styles.previewCard}>
          <div className={styles.sectionHeading}>
            <h2>{t('settings.preview')}</h2>
            <p>{t('settings.previewText')}</p>
          </div>

          <div className={styles.previewPanel}>
            <div className={styles.previewEyebrow}>{t('common.dashboard')}</div>
            <div className={styles.previewName}>{form.name}</div>
            <div className={styles.previewMeta}>
              {form.term} - {form.year}
            </div>
          </div>

          <div className={styles.noteCard}>
            <h3>{t('settings.adminExperience')}</h3>
            <p>{t('settings.adminExperienceText')}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
