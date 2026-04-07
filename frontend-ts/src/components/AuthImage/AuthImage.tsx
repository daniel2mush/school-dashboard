'use client'

import styles from './AuthImage.module.scss'

export default function AuthImage() {
  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <img
          style={{
            objectFit: 'contain',
            scale: 1.5,
          }}
          src={'/authImage.svg'}
          alt="Auth Image"
          loading="eager"
        />
        <div className={styles.texts}>
          <h1>Sunridge Academy</h1>
          <p>Where Eductation meets performance</p>
        </div>
      </div>
    </div>
  )
}
