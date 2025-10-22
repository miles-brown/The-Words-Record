#!/usr/bin/env node

/**
 * Vercel Build Diagnostic Script
 *
 * This script helps diagnose why Vercel build cache might be skipped
 * Run with: node scripts/vercel-build-debug.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Vercel Build Cache Diagnostic Tool\n');
console.log('=' .repeat(60));

// Check 1: Package Manager Consistency
console.log('\n📦 Checking Package Manager...');
const hasPackageLock = fs.existsSync(path.join(process.cwd(), 'package-lock.json'));
const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
const hasPnpmLock = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));

const lockFiles = [
  { name: 'package-lock.json', exists: hasPackageLock },
  { name: 'yarn.lock', exists: hasYarnLock },
  { name: 'pnpm-lock.yaml', exists: hasPnpmLock }
].filter(f => f.exists);

if (lockFiles.length > 1) {
  console.log('❌ PROBLEM: Multiple lock files detected!');
  console.log('   This can cause cache to be skipped.');
  console.log('   Found:', lockFiles.map(f => f.name).join(', '));
  console.log('\n   FIX: Remove all lock files except one and commit:');
  lockFiles.forEach(f => {
    if (f.name !== 'package-lock.json') {
      console.log(`   git rm ${f.name}`);
    }
  });
} else if (lockFiles.length === 1) {
  console.log(`✅ Single lock file detected: ${lockFiles[0].name}`);
  console.log('   Package manager: ' + (hasPackageLock ? 'npm' : hasYarnLock ? 'yarn' : 'pnpm'));
} else {
  console.log('❌ No lock file found! This will cause issues.');
  console.log('   Run: npm install (or yarn/pnpm) to generate a lock file');
}

// Check 2: vercel.json Configuration
console.log('\n⚙️  Checking vercel.json...');
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
if (fs.existsSync(vercelJsonPath)) {
  const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

  console.log('✅ vercel.json exists');

  if (vercelJson.build && vercelJson.build.env && vercelJson.build.env.ENABLE_BUILD_CACHE) {
    console.log('✅ ENABLE_BUILD_CACHE is set:', vercelJson.build.env.ENABLE_BUILD_CACHE);
  } else {
    console.log('⚠️  ENABLE_BUILD_CACHE not set in build.env');
  }

  if (vercelJson.outputDirectory) {
    console.log('✅ outputDirectory specified:', vercelJson.outputDirectory);
  } else {
    console.log('ℹ️  outputDirectory not specified (will use default)');
  }

  if (vercelJson.installCommand) {
    console.log('✅ installCommand:', vercelJson.installCommand);
  }

  if (vercelJson.buildCommand) {
    console.log('✅ buildCommand:', vercelJson.buildCommand);
  }
} else {
  console.log('⚠️  No vercel.json found');
  console.log('   Consider creating one for better cache control');
}

// Check 3: Next.js Configuration
console.log('\n⚙️  Checking next.config.js...');
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.js exists');

  try {
    const nextConfig = require(nextConfigPath);

    if (nextConfig.swcMinify !== false) {
      console.log('✅ swcMinify enabled (faster builds)');
    } else {
      console.log('⚠️  swcMinify disabled (consider enabling)');
    }

    if (nextConfig.productionBrowserSourceMaps === false) {
      console.log('✅ Source maps disabled (faster builds)');
    } else {
      console.log('ℹ️  Source maps enabled (slower builds)');
    }

    if (nextConfig.experimental && nextConfig.experimental.optimizePackageImports) {
      console.log('✅ Package import optimization enabled');
    }
  } catch (e) {
    console.log('⚠️  Could not analyze next.config.js');
  }
} else {
  console.log('⚠️  No next.config.js found');
}

// Check 4: Git Status
console.log('\n📝 Checking Git Status...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    const uncommittedFiles = gitStatus.trim().split('\n').length;
    console.log(`⚠️  ${uncommittedFiles} uncommitted file(s)`);
    console.log('   Uncommitted lock files can cause cache issues');

    if (gitStatus.includes('package-lock.json') || gitStatus.includes('yarn.lock') || gitStatus.includes('pnpm-lock.yaml')) {
      console.log('❌ Lock file has uncommitted changes!');
      console.log('   This can cause cache to be skipped on deployment');
      console.log('\n   FIX: Commit your lock file:');
      console.log('   git add package-lock.json');
      console.log('   git commit -m "chore: update lock file"');
    }
  } else {
    console.log('✅ Working directory clean');
  }
} catch (e) {
  console.log('ℹ️  Not a git repository or git not available');
}

// Check 5: Build Output Directory
console.log('\n📁 Checking Build Output...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('✅ .next directory exists');

  const cacheDir = path.join(nextDir, 'cache');
  if (fs.existsSync(cacheDir)) {
    console.log('✅ .next/cache directory exists');

    try {
      const stats = fs.statSync(cacheDir);
      console.log(`   Last modified: ${stats.mtime.toISOString()}`);
    } catch (e) {
      // Ignore
    }
  } else {
    console.log('ℹ️  .next/cache directory does not exist (will be created on build)');
  }
} else {
  console.log('ℹ️  .next directory does not exist (no local build yet)');
  console.log('   Run: npm run build');
}

// Check 6: Environment Variables (if available)
console.log('\n🔐 Checking Environment Variables...');
const envVars = [
  'VERCEL',
  'VERCEL_ENV',
  'VERCEL_FORCE_NO_BUILD_CACHE',
  'CI',
  'NODE_ENV'
];

envVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}:`, process.env[varName]);
  }
});

if (process.env.VERCEL_FORCE_NO_BUILD_CACHE === '1') {
  console.log('\n❌ WARNING: VERCEL_FORCE_NO_BUILD_CACHE is set to 1');
  console.log('   This will SKIP the build cache!');
  console.log('   Remove this environment variable to enable caching');
}

// Check 7: Package.json Scripts
console.log('\n📜 Checking package.json Scripts...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (packageJson.scripts) {
    const relevantScripts = ['build', 'vercel-build', 'postinstall'];
    relevantScripts.forEach(script => {
      if (packageJson.scripts[script]) {
        console.log(`✅ ${script}:`, packageJson.scripts[script]);
      } else {
        console.log(`ℹ️  ${script}: not defined`);
      }
    });

    // Check for duplicate Prisma generation
    if (packageJson.scripts.postinstall && packageJson.scripts.postinstall.includes('prisma generate')) {
      if (packageJson.scripts.build && packageJson.scripts.build.includes('prisma generate')) {
        console.log('\n⚠️  WARNING: Prisma generate appears in both postinstall and build');
        console.log('   This causes duplicate generation (slower builds)');
        console.log('\n   RECOMMENDED:');
        console.log('   - postinstall: "prisma generate"');
        console.log('   - build: "next build" (no prisma generate)');
        console.log('   - vercel-build: "prisma generate && next build"');
      }
    }
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Summary & Recommendations:\n');

const recommendations = [];

if (lockFiles.length > 1) {
  recommendations.push('❌ CRITICAL: Remove extra lock files');
}

if (!hasPackageLock && !hasYarnLock && !hasPnpmLock) {
  recommendations.push('❌ CRITICAL: Generate a lock file');
}

if (!fs.existsSync(vercelJsonPath)) {
  recommendations.push('⚠️  Create vercel.json with ENABLE_BUILD_CACHE');
}

if (process.env.VERCEL_FORCE_NO_BUILD_CACHE === '1') {
  recommendations.push('❌ CRITICAL: Remove VERCEL_FORCE_NO_BUILD_CACHE');
}

if (recommendations.length === 0) {
  console.log('✅ No critical issues found!');
  console.log('\nIf cache is still being skipped:');
  console.log('1. Check Vercel dashboard for manual redeploy settings');
  console.log('2. Verify you\'re deploying from git (not CLI with --force)');
  console.log('3. Check if this is the first deployment to a branch');
  console.log('4. Contact Vercel support with build logs');
} else {
  recommendations.forEach(rec => console.log(rec));
}

console.log('\n💡 For more details, see BUILD_OPTIMIZATION.md');
console.log('');
