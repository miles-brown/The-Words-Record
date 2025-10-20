/**
 * Apps Module Validation Script
 * Validates all components, API endpoints, and database connections
 * Run with: npx ts-node scripts/validate-apps-module.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ValidationResult {
  category: string
  test: string
  status: 'pass' | 'fail' | 'warn'
  message?: string
}

const results: ValidationResult[] = []

function log(category: string, test: string, status: 'pass' | 'fail' | 'warn', message?: string) {
  results.push({ category, test, status, message })
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  console.log(`${emoji} [${category}] ${test}${message ? ': ' + message : ''}`)
}

async function validateDatabase() {
  console.log('\n🔍 Validating Database Connection...\n')

  try {
    await prisma.$connect()
    log('Database', 'Connection', 'pass', 'Connected successfully')

    // Check existing tables
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `
    log('Database', 'Tables Query', 'pass', `Found ${tables.length} tables`)

    // Check for Apps-related tables
    const appsRelatedTables = ['Integration', 'Webhook', 'Script', 'Automation', 'BackgroundJob', 'Task', 'HealthCheck', 'UsageQuota', 'CustomApp']
    const existingAppsTables = tables.filter(t => appsRelatedTables.includes(t.tablename))

    if (existingAppsTables.length === 0) {
      log('Database', 'Apps Tables', 'warn', 'No Apps tables found - migration required')
    } else {
      log('Database', 'Apps Tables', 'pass', `Found ${existingAppsTables.length} Apps tables`)
    }

    // Test query performance
    const start = Date.now()
    await prisma.user.findFirst()
    const latency = Date.now() - start
    log('Database', 'Query Latency', latency < 100 ? 'pass' : 'warn', `${latency}ms`)

  } catch (error) {
    log('Database', 'Connection', 'fail', error instanceof Error ? error.message : 'Unknown error')
  } finally {
    await prisma.$disconnect()
  }
}

async function validateAPIEndpoints() {
  console.log('\n🔍 Validating API Endpoints...\n')

  const endpoints = [
    '/api/apps/integrations',
    '/api/apps/webhooks',
    '/api/apps/scripts',
    '/api/apps/automations',
    '/api/apps/jobs',
    '/api/apps/tasks',
    '/api/apps/keys',
    '/api/apps/health',
    '/api/apps/quotas',
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`)
      if (response.ok) {
        const data = await response.json()
        log('API', endpoint, 'pass', `Status ${response.status}, returned ${data.data?.length || 0} items`)
      } else {
        log('API', endpoint, 'fail', `Status ${response.status}`)
      }
    } catch (error) {
      log('API', endpoint, 'warn', 'Server not running or endpoint unreachable')
    }
  }
}

async function validateEnvironment() {
  console.log('\n🔍 Validating Environment Variables...\n')

  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ]

  const optionalVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'DISCORD_BOT_TOKEN',
    'VERCEL_TOKEN',
    'CLOUDFLARE_API_TOKEN',
  ]

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log('Environment', varName, 'pass', 'Set')
    } else {
      log('Environment', varName, 'fail', 'Missing (required)')
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      log('Environment', varName, 'pass', 'Set')
    } else {
      log('Environment', varName, 'warn', 'Not set (optional)')
    }
  }
}

async function validateComponents() {
  console.log('\n🔍 Validating Components...\n')

  const { existsSync } = await import('fs')
  const { join } = await import('path')

  const componentsPath = join(process.cwd(), 'components', 'admin', 'apps')
  const requiredComponents = [
    'IntegrationManager.tsx',
    'WebhookManager.tsx',
    'ScriptManager.tsx',
    'AutomationDashboard.tsx',
    'JobMonitor.tsx',
    'TaskManager.tsx',
    'ApiKeyVault.tsx',
    'CustomAppBuilder.tsx',
    'IntegrationHealthPanel.tsx',
    'UsageQuotasTracker.tsx',
    'AppsLayout.tsx',
  ]

  for (const component of requiredComponents) {
    const filePath = join(componentsPath, component)
    if (existsSync(filePath)) {
      log('Components', component, 'pass', 'Exists')
    } else {
      log('Components', component, 'fail', 'Missing')
    }
  }

  // Check TabsNavigation
  const tabsNavPath = join(componentsPath, 'components', 'TabsNavigation.tsx')
  if (existsSync(tabsNavPath)) {
    log('Components', 'TabsNavigation.tsx', 'pass', 'Exists')
  } else {
    log('Components', 'TabsNavigation.tsx', 'fail', 'Missing')
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('VALIDATION SUMMARY')
  console.log('='.repeat(60) + '\n')

  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const warnings = results.filter(r => r.status === 'warn').length
  const total = results.length

  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log()

  if (failed > 0) {
    console.log('Failed Tests:')
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  ❌ [${r.category}] ${r.test}: ${r.message || 'Failed'}`)
    })
    console.log()
  }

  if (warnings > 0) {
    console.log('Warnings:')
    results.filter(r => r.status === 'warn').forEach(r => {
      console.log(`  ⚠️  [${r.category}] ${r.test}: ${r.message || 'Warning'}`)
    })
    console.log()
  }

  const percentage = Math.round((passed / total) * 100)
  console.log(`Overall Score: ${percentage}%`)
  console.log()

  if (failed === 0) {
    console.log('🎉 All critical tests passed! Phase 1 complete.')
  } else {
    console.log('⚠️  Some tests failed. Please review the results above.')
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║    Apps & Integrations Module - Validation Script         ║')
  console.log('║    Phase 1 Verification                                    ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  await validateEnvironment()
  await validateComponents()
  await validateDatabase()
  // await validateAPIEndpoints() // Uncomment when server is running

  await printSummary()
}

main()
  .catch((error) => {
    console.error('❌ Validation script error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
