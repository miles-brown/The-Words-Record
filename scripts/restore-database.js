#!/usr/bin/env node

/**
 * Database Restore Script
 * Restores data from a JSON backup file
 *
 * Usage: node scripts/restore-database.js [backup-file]
 * Example: node scripts/restore-database.js backups/backup-2025-10-31T22-06-51.json
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreDatabase(backupFile) {
  if (!backupFile) {
    // Show available backups
    const backupDir = path.join(process.cwd(), 'backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length > 0) {
        console.log('Available backups:');
        files.forEach(f => console.log(`  - backups/${f}`));
        console.log('\nUsage: node scripts/restore-database.js backups/[filename]');
      } else {
        console.log('No backup files found in backups/');
      }
    } else {
      console.log('No backups directory found');
    }
    return;
  }

  console.log('⚠️  WARNING: This will restore data from the backup file.');
  console.log('⚠️  This operation may overwrite existing data.');
  console.log(`📁 Backup file: ${backupFile}\n`);

  // Simple confirmation
  console.log('Type "RESTORE" to continue, or anything else to cancel:');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    readline.question('> ', resolve);
  });
  readline.close();

  if (answer !== 'RESTORE') {
    console.log('❌ Restore cancelled');
    return;
  }

  try {
    console.log('\n🔵 Starting database restore...\n');

    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
    console.log(`📅 Backup created: ${backupData.timestamp}`);
    console.log(`📦 Version: ${backupData.version}\n`);

    // Restore each table
    const restoreOrder = [
      'user',
      'organization',
      'person',
      'mediaOutlet',
      'journalist',
      'topic',
      'case',
      'statement',
      'source',
      'tag',
      'settings',
      'auditLog'
    ];

    for (const table of restoreOrder) {
      if (backupData.data[table] && backupData.data[table].length > 0) {
        console.log(`📥 Restoring ${table}...`);
        try {
          // Use createMany with skipDuplicates for safety
          const result = await prisma[table].createMany({
            data: backupData.data[table],
            skipDuplicates: true,
          });
          console.log(`   ✓ Restored ${result.count} records (skipped duplicates)\n`);
        } catch (error) {
          console.log(`   ✗ Failed to restore ${table}: ${error.message}\n`);
        }
      }
    }

    console.log('✅ Restore completed!');

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get backup file from command line
const backupFile = process.argv[2];

restoreDatabase(backupFile)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));