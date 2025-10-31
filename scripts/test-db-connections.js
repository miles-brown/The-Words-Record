#!/usr/bin/env node

/**
 * Test Database Connections
 * This script verifies both the pooled and direct database connections
 */

const { PrismaClient } = require('@prisma/client');

async function testConnections() {
  console.log('🔍 Testing Database Connections...\n');

  // Test 1: Direct Connection (for migrations/development)
  console.log('1️⃣  Testing DIRECT_URL (Direct Connection)...');
  console.log(`   Host: ${process.env.DIRECT_URL?.split('@')[1]?.split('/')[0] || 'Not configured'}`);

  const directPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL
      }
    }
  });

  try {
    const directResult = await directPrisma.$queryRaw`SELECT NOW() as current_time, current_database() as database`;
    console.log('   ✅ Direct connection successful!');
    console.log(`   Database: ${directResult[0].database}`);
    console.log(`   Server time: ${directResult[0].current_time}\n`);
  } catch (error) {
    console.log('   ❌ Direct connection failed!');
    console.log(`   Error: ${error.message}\n`);
  } finally {
    await directPrisma.$disconnect();
  }

  // Test 2: Pooled Connection (for production)
  console.log('2️⃣  Testing DATABASE_URL (Pooled Connection via PgBouncer)...');
  console.log(`   Host: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Not configured'}`);

  const pooledPrisma = new PrismaClient();

  try {
    const pooledResult = await pooledPrisma.$queryRaw`SELECT NOW() as current_time, current_database() as database`;
    console.log('   ✅ Pooled connection successful!');
    console.log(`   Database: ${pooledResult[0].database}`);
    console.log(`   Server time: ${pooledResult[0].current_time}\n`);
  } catch (error) {
    console.log('   ❌ Pooled connection failed!');
    console.log(`   Error: ${error.message}\n`);
  } finally {
    await pooledPrisma.$disconnect();
  }

  // Test 3: Quick data check
  console.log('3️⃣  Quick Data Check...');
  const prisma = new PrismaClient();

  try {
    const userCount = await prisma.user.count();
    const caseCount = await prisma.case.count();
    const settingsCount = await prisma.settings.count();

    console.log(`   Users: ${userCount}`);
    console.log(`   Cases: ${caseCount}`);
    console.log(`   Settings: ${settingsCount}\n`);
  } catch (error) {
    console.log(`   Error checking data: ${error.message}\n`);
  } finally {
    await prisma.$disconnect();
  }

  console.log('✨ Connection tests complete!\n');
  console.log('📝 Connection Usage Guide:');
  console.log('   • Development (migrations, Prisma Studio): Uses DIRECT_URL');
  console.log('   • Production (runtime, API routes): Uses DATABASE_URL');
  console.log('   • VS Code extensions: Configure with DIRECT_URL values\n');
}

// Run the tests
testConnections().catch(console.error);