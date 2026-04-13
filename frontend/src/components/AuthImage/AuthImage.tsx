'use client'

import styles from './AuthImage.module.scss'
import { useSchoolData } from '#/components/store/SchoolDatatStore'

export default function AuthImage() {
  const { school } = useSchoolData()

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <img src={'/authImage.svg'} alt="Auth Image" loading="eager" />
        <div className={styles.texts}>
          <h1>{school.name}</h1>
          <p>Where Eductation meets performance</p>
        </div>
      </div>
    </div>
  )
}
