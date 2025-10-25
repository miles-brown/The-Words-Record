import { testConnection } from '../lib/claude-api'

async function main() {
  console.log('Testing Claude API connection...')
  console.log('')

  const result = await testConnection()

  if (result) {
    console.log('✅ Claude API connection successful!')
    console.log('Your ANTHROPIC_API_KEY is valid and working.')
    console.log('')
    console.log('You can now use:')
    console.log('  - Auto-promotion: node scripts/auto-promote-statements.js')
    console.log('  - AI enrichment: npx ts-node scripts/research-and-enrich-case.ts --help')
    console.log('  - Admin UI: Click "✨ AI Enrich" button in case editor')
    process.exit(0)
  } else {
    console.log('❌ Claude API connection failed.')
    console.log('Please check your ANTHROPIC_API_KEY in .env')
    process.exit(1)
  }
}

main()
