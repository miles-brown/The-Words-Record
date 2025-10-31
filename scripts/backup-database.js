#!/usr/bin/env node

/**
 * Manual Database Backup Script
 * Creates a JSON backup of your database data
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  console.log('🔵 Starting database backup...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  try {
    console.log('📊 Exporting data...');

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {}
    };

    // Export all important tables
    const tables = [
      'user',
      'case',
      'statement',
      'person',
      'organization',
      'topic',
      'source',
      'tag',
      'mediaOutlet',
      'journalist',
      'settings',
      'auditLog'
    ];

    for (const table of tables) {
      try {
        console.log(`  - Exporting ${table}...`);
        backup.data[table] = await prisma[table].findMany();
        console.log(`    ✓ ${backup.data[table].length} records`);
      } catch (error) {
        console.log(`    ✗ Skipped ${table}: ${error.message}`);
      }
    }

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ Backup completed successfully!');
    console.log(`📁 Location: ${backupFile}`);
    console.log(`📏 Size: ${fileSizeMB} MB`);

    // Keep only last 5 backups to save space
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-'))
      .sort()
      .reverse();

    if (files.length > 5) {
      const toDelete = files.slice(5);
      toDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️  Deleted old backup: ${file}`);
      });
    }

    return backupFile;

  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  backupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { backupDatabase };