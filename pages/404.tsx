import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import styles from '@/styles/NotFound.module.css'

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <Layout
      title="404 - Page Not Found"
      description="The page you were looking for doesn't exist or may have been moved."
    >
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.iconWrapper}>
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
              <path d="M11 8v3"></path>
              <path d="M11 14h.01"></path>
            </svg>
          </div>

          <h1 className={styles.title}>404 – Page Not Found</h1>

          <p className={styles.subtitle}>
            The page you were looking for doesn't exist or may have been moved.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={`${styles.btn} ${styles.primary}`}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Go to Homepage
            </Link>

            <button
              onClick={() => router.back()}
              className={`${styles.btn} ${styles.secondary}`}
              type="button"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 8 8 12 12 16"></polyline>
                <path d="M16 12H8"></path>
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}