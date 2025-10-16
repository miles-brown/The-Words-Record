/**
 * Admin Apps Page - Comprehensive integration and automation management
 * Manages external integrations, webhooks, scripts, automations, jobs, tasks, API keys, and custom apps
 */

import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import AppsLayout from '@/components/admin/apps/AppsLayout'
import ErrorBoundary from '@/components/admin/apps/components/ErrorBoundary'
import ClientOnly from '@/components/admin/apps/components/ClientOnly'

export default function AppsPage() {
  return (
    <>
      <Head>
        <title>Apps & Integrations - TWR Admin</title>
        <meta name="description" content="Manage external services, automations, and custom applications" />
      </Head>

      <AdminLayout title="Apps">
        <ErrorBoundary>
          <ClientOnly fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <AppsLayout />
          </ClientOnly>
        </ErrorBoundary>
      </AdminLayout>
    </>
  )
}
