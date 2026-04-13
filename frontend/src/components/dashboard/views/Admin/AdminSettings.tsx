'use client'

import { useEffect, useState } from 'react'
import { Languages, School } from 'lucide-react'
import { useSchoolData } from '#/components/store/SchoolDatatStore'
import { useDashboardTranslation } from '#/components/dashboard/i18n'
import type { DashboardLanguage } from '#/types/Types'
import styles from './AdminSettings.module.scss'
import { Button, Input } from '#/components/ui'
import { useSaveSchoolSettings } from '#/components/query/AdminQuery'

export function AdminSettings() {
  const { school, updateSchoolSettings } = useSchoolData()
  const { mutateAsync: updateSchoolSettingsAsync } = useSaveSchoolSettings()
  const { t } = useDashboardTranslation()
  const [form, setForm] = useState({
    name: school.name,
    term: school.term,
    description: school.description,
    year: school.year,
    language: school.language,
  })

  useEffect(() => {
    setForm({
      name: school.name,
      term: school.term,
      year: school.year,
      description: school.description,
      language: school.language,
    })
  }, [school])

  const handleChange = (
    field: 'name' | 'term' | 'year' | 'description',
    value: string,
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleLanguageChange = (value: DashboardLanguage) => {
    setForm((current) => ({ ...current, language: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await updateSchoolSettingsAsync(form)
    updateSchoolSettings(form)
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

          <Input
            label={t('settings.schoolName')}
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            leftIcon={<School />}
          />

          <Input
            label={t('settings.schoolDescription')}
            value={form.description}
            onChange={(event) =>
              handleChange('description', event.target.value)
            }
            leftIcon={<School />}
          />

          <div className={styles.fieldGrid}>
            <Input
              label={t('settings.schoolTerm')}
              value={form.term}
              onChange={(event) => handleChange('term', event.target.value)}
              leftIcon={<School />}
            />

            <Input
              label={t('settings.schoolYear')}
              value={form.year}
              onChange={(event) => handleChange('year', event.target.value)}
              leftIcon={<School />}
            />
          </div>

          <div className="form-group fullWidth">
            <label className="form-label">{t('settings.language')}</label>

            <div className="input-wrapper">
              <div className="input-left-icon">
                <Languages size={16} />
              </div>

              <select
                className="input has-left-icon"
                value={form.language}
                onChange={(event) =>
                  handleLanguageChange(event.target.value as DashboardLanguage)
                }
              >
                <option value="en">{t('settings.english')}</option>
                <option value="fr">{t('settings.french')}</option>
              </select>
            </div>
          </div>

          <Button className={styles.saveButton} type="submit">
            {t('settings.save')}
          </Button>
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
