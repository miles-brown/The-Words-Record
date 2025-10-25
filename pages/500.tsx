import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import styles from '@/styles/NotFound.module.css' // Reuse same styles

export default function InternalServerErrorPage() {
  const router = useRouter()

  return (
    <Layout
      title="500 - Internal Server Error"
      description="Something went wrong on our end. We're working to fix it."
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h1 className={styles.title}>500 – Internal Server Error</h1>

          <p className={styles.subtitle}>
            Something went wrong on our end. We're working to fix it.
          </p>

          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            If this problem persists, please contact us at{' '}
            <a
              href="mailto:support@thewordsrecord.com"
              style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}
            >
              support@thewordsrecord.com
            </a>
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
              onClick={() => router.reload()}
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
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
