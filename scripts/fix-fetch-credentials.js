#!/usr/bin/env node
/**
 * Script to add 'credentials: include' to all fetch calls to /api/ endpoints
 * that are missing this critical authentication parameter
 */

const fs = require('fs');
const path = require('path');

// Files and their problematic fetch patterns
const filesToFix = [
  'pages/admin/people/index.tsx',
  'pages/admin/people/[slug].tsx',
  'pages/admin/cases/[id].tsx',
  'pages/admin/sources/index.tsx',
  'pages/admin/analytics.tsx',
  'pages/admin/organizations/index.tsx',
  'pages/admin/settings.tsx',
  'pages/admin/import.tsx',
  'pages/admin/export.tsx',
  'pages/admin/people/new.tsx',
  'pages/admin/cases/new.tsx',
  'pages/admin/sources/new.tsx',
  'pages/admin/organizations/new.tsx',
  'components/admin/QuickFixModal.tsx',
  'components/admin/ChangeHistoryModal.tsx',
  'components/admin/apps/IntegrationManager.tsx',
  'components/admin/apps/WebhookManager.tsx',
  'components/admin/apps/ScriptManager.tsx'
];

function fixFetchCalls(content) {
  // Pattern 1: fetch('/api/...') with no options at all
  content = content.replace(
    /fetch\((['"`])\/api\/[^'"`]+\1\)(?!\s*,)/g,
    (match) => {
      const url = match.slice(6, -1); // Remove 'fetch(' and ')'
      return `fetch(${url}, { credentials: 'include' })`;
    }
  );

  // Pattern 2: fetch('/api/...', { }) without credentials but with other options
  // This is more complex - we need to add credentials to existing options
  content = content.replace(
    /fetch\((['"`])\/api\/[^'"`]+\1,\s*\{([^}]*)\}\)/g,
    (match, quote, options) => {
      // Check if credentials already exists
      if (options.includes('credentials')) {
        return match; // Already has credentials, don't modify
      }

      // Extract the URL and options
      const urlMatch = match.match(/fetch\((['"`])\/api\/[^'"`]+\1/);
      if (!urlMatch) return match;

      const url = urlMatch[0].slice(6); // Remove 'fetch('
      const trimmedOptions = options.trim();

      if (trimmedOptions === '') {
        // Empty options object
        return `fetch(${url}, { credentials: 'include' })`;
      } else {
        // Has other options, add credentials at the start
        return `fetch(${url}, {\n        credentials: 'include',${options}})`;
      }
    }
  );

  return content;
}

function processFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const fixed = fixFetchCalls(content);

    if (content !== fixed) {
      fs.writeFileSync(fullPath, fixed, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`✓  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing fetch calls to include credentials...\n');

filesToFix.forEach(processFile);

console.log('\n✨ Done!');
