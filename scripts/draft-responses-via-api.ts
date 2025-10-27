/**
 * Script to draft all response statements except Emma Watson's
 * Uses the admin API to make the updates
 */

const API_BASE = 'http://localhost:3000'

async function draftResponseStatements() {
  console.log('Fetching all response statements...\n')

  try {
    // Fetch all statements
    const response = await fetch(`${API_BASE}/api/statements?limit=1000`)
    if (!response.ok) {
      throw new Error(`Failed to fetch statements: ${response.statusText}`)
    }

    const data = await response.json()
    const allStatements = data.statements || []

    // Filter for response statements
    const responseStatements = allStatements.filter((s: any) =>
      s.statementType === 'RESPONSE'
    )

    console.log(`Found ${responseStatements.length} response statements:\n`)

    // Group by person
    const grouped = responseStatements.reduce((acc: any, stmt: any) => {
      const personName = stmt.person?.name || 'Unknown'
      if (!acc[personName]) acc[personName] = []
      acc[personName].push(stmt)
      return acc
    }, {})

    // Display what we found
    for (const [personName, statements] of Object.entries(grouped) as any) {
      const isEmmaWatson = personName.toLowerCase().includes('emma watson')
      console.log(`\n${isEmmaWatson ? '⏭️  SKIP' : '📝 WILL DRAFT'} - ${personName}:`)
      for (const stmt of statements) {
        console.log(`   - ${stmt.title}`)
        console.log(`     Status: ${stmt.status} | Slug: ${stmt.slug}`)
      }
    }

    // Count how many we'll update
    const toUpdate = responseStatements.filter((s: any) => {
      const personName = s.person?.name || 'Unknown'
      return !personName.toLowerCase().includes('emma watson') && s.status !== 'DRAFT'
    })

    console.log(`\n\nWill update ${toUpdate.length} statements to DRAFT status`)
    console.log(`Will keep Emma Watson statements published\n`)

    // Update each statement via API
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const stmt of responseStatements) {
      const personName = stmt.person?.name || 'Unknown'
      const isEmmaWatson = personName.toLowerCase().includes('emma watson')

      if (isEmmaWatson) {
        console.log(`⏭️  Skipping: ${stmt.slug} (Emma Watson)`)
        skipCount++
        continue
      }

      if (stmt.status === 'DRAFT') {
        console.log(`⏭️  Already draft: ${stmt.slug}`)
        skipCount++
        continue
      }

      try {
        const updateResponse = await fetch(`${API_BASE}/api/admin/statements/${stmt.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'DRAFT'
          })
        })

        if (updateResponse.ok) {
          console.log(`✅ Updated: ${stmt.slug}`)
          successCount++
        } else {
          console.error(`❌ Failed: ${stmt.slug} - ${updateResponse.statusText}`)
          errorCount++
        }
      } catch (error) {
        console.error(`❌ Error updating ${stmt.slug}:`, error)
        errorCount++
      }
    }

    console.log(`\n\n=== SUMMARY ===`)
    console.log(`✅ Successfully updated: ${successCount}`)
    console.log(`⏭️  Skipped: ${skipCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📊 Total response statements: ${responseStatements.length}`)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

draftResponseStatements()
