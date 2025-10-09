# Supabase PostgreSQL Setup with SQLTools in VS Code

A complete guide to connecting your Supabase database to VS Code's SQLTools extension.

---

## Prerequisites

- VS Code installed
- Supabase project created
- Database connection details from Supabase

---

## Step 1: Install SQLTools Extension

1. Open VS Code
2. Go to Extensions (⌘+Shift+X on Mac, Ctrl+Shift+X on Windows)
3. Search for **"SQLTools"**
4. Install **"SQLTools" by Matheus Teixeira**
5. Search for **"SQLTools PostgreSQL/Cockroach Driver"**
6. Install the PostgreSQL driver extension

---

## Step 2: Get Supabase Connection Details

### Option A: Via Supabase Dashboard

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **Settings** (gear icon) → **Database**
4. Under **Connection info**, find:
   - **Host**: `db.[your-project-ref].supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432` (direct) or `6543` (pooler)
   - **User**: `postgres`
   - **Password**: Your database password

### Option B: Via Connection String

In **Database Settings**, copy the **Connection string** (URI format):
```
postgresql://postgres.[your-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## Step 3: Configure SQLTools Connection

### Method 1: Using Connection String (Recommended)

1. In VS Code, open Command Palette (⌘+Shift+P / Ctrl+Shift+P)
2. Type and select: **SQLTools: Add New Connection**
3. Select **PostgreSQL**
4. Choose **Connection String** mode
5. Paste your Supabase connection string
6. Name your connection (e.g., "Who Said What - Supabase")
7. Click **Save Connection**

### Method 2: Manual Configuration

1. Open Command Palette → **SQLTools: Add New Connection**
2. Select **PostgreSQL**
3. Fill in the details:

```
Connection Name: Who Said What - Supabase
Database: postgres
Username: postgres
Password: [your-database-password]
Server: aws-0-eu-west-1.pooler.supabase.com
Port: 6543
```

**Important Settings:**
- ✅ Use **Connection Pooler** (port 6543) for better performance
- ✅ Check **Connect on Startup** if you want auto-connection
- ✅ For SSL: Most Supabase connections work without explicit SSL config

---

## Step 4: Test Connection

1. Open SQLTools sidebar (database icon in activity bar)
2. Find your connection
3. Click the **plug icon** to connect
4. If successful, you'll see database schemas and tables

---

## Step 5: Configuration File (Optional)

SQLTools creates a `.vscode/settings.json` file. Here's an example:

```json
{
  "sqltools.connections": [
    {
      "previewLimit": 50,
      "server": "aws-0-eu-west-1.pooler.supabase.com",
      "port": 6543,
      "driver": "PostgreSQL",
      "name": "Who Said What - Supabase",
      "database": "postgres",
      "username": "postgres",
      "password": "your-password-here"
    }
  ]
}
```

**Security Note:** Add `.vscode/settings.json` to `.gitignore` to avoid committing credentials!

---

## Step 6: Using Environment Variables (More Secure)

### Option A: Use SQLTools with .env

1. Install **"DotENV" extension** in VS Code
2. Add to your `.env` file:
```bash
SUPABASE_DB_HOST=aws-0-eu-west-1.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-password-here
```

3. Reference in `.vscode/settings.json`:
```json
{
  "sqltools.connections": [
    {
      "previewLimit": 50,
      "server": "${env:SUPABASE_DB_HOST}",
      "port": "${env:SUPABASE_DB_PORT}",
      "driver": "PostgreSQL",
      "name": "Who Said What - Supabase",
      "database": "${env:SUPABASE_DB_NAME}",
      "username": "${env:SUPABASE_DB_USER}",
      "password": "${env:SUPABASE_DB_PASSWORD}"
    }
  ]
}
```

### Option B: Use Connection String from .env

In `.env`:
```bash
DATABASE_URL=postgresql://postgres:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

In `.vscode/settings.json`:
```json
{
  "sqltools.connections": [
    {
      "previewLimit": 50,
      "driver": "PostgreSQL",
      "name": "Who Said What - Supabase",
      "connectionString": "${env:DATABASE_URL}"
    }
  ]
}
```

---

## Step 7: Running Queries

### Execute a Query

1. Create a new `.sql` file or use SQLTools scratchpad
2. Write your query:
```sql
SELECT * FROM "Person" LIMIT 10;
```
3. Press **⌘+E ⌘+E** (Mac) or **Ctrl+E Ctrl+E** (Windows)
4. Or right-click → **Run on Active Connection**

### Browse Tables

1. In SQLTools sidebar, expand your connection
2. Navigate: **postgres → public → Tables**
3. Right-click any table → **Show Table Records**

---

## Common Issues & Solutions

### Issue 1: Connection Timeout

**Problem**: "Connection timeout" error

**Solutions**:
- ✅ Use **pooler port 6543** instead of direct port 5432
- ✅ Check firewall/VPN settings
- ✅ Verify Supabase project is not paused

### Issue 2: SSL Certificate Error

**Problem**: SSL/TLS verification fails

**Solution**: Add SSL config to connection:
```json
{
  "pgOptions": {
    "ssl": {
      "rejectUnauthorized": false
    }
  }
}
```

### Issue 3: Authentication Failed

**Problem**: "password authentication failed"

**Solutions**:
- ✅ Reset database password in Supabase dashboard
- ✅ Ensure you're using the **database password**, not your Supabase account password
- ✅ Check for special characters that need URL encoding

### Issue 4: Can't See Tables

**Problem**: Connected but no tables visible

**Solutions**:
- ✅ Ensure you're looking in the **public** schema
- ✅ Run: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
- ✅ Check if tables exist: Run Prisma migrations first

---

## Pro Tips

### 1. **Use Connection Pooler for Better Performance**
Always use port **6543** (pooler) instead of 5432 (direct) for serverless apps.

### 2. **Save Frequently Used Queries**
Create `.sql` files in a `/queries` folder for reusable queries.

### 3. **Use SQLTools Bookmarks**
Bookmark important queries for quick access.

### 4. **Format Queries**
Install **"SQL Formatter"** extension for auto-formatting.

### 5. **Multiple Connections**
You can have separate connections for:
- Production (Supabase)
- Development (local PostgreSQL)
- Staging

---

## Useful Queries for Who Said What

### Check All Tables
```sql
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_catalog.pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Count Records in Each Table
```sql
SELECT
  'Case' as table_name, COUNT(*) as count FROM "Case"
UNION ALL
SELECT 'Person', COUNT(*) FROM "Person"
UNION ALL
SELECT 'Organization', COUNT(*) FROM "Organization"
UNION ALL
SELECT 'Statement', COUNT(*) FROM "Statement"
UNION ALL
SELECT 'Source', COUNT(*) FROM "Source"
ORDER BY count DESC;
```

### Check Recent Cases
```sql
SELECT
  id,
  slug,
  title,
  status,
  "createdAt"
FROM "Case"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Find Duplicate Indexes (from our recent fix)
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## Alternative: pgAdmin

If you prefer a GUI tool:

1. Download [pgAdmin](https://www.pgadmin.org/)
2. Create new server
3. Use same Supabase connection details
4. More features but heavier than SQLTools

---

## Next Steps

After setup:
1. ✅ Run test queries to verify connection
2. ✅ Bookmark this guide
3. ✅ Add connection to `.gitignore` exclusions
4. ✅ Document any custom queries in `/queries` folder
5. ✅ Consider setting up separate dev/prod connections

---

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] `.vscode/settings.json` is in `.gitignore`
- [ ] Using environment variables for credentials
- [ ] Database password is strong and unique
- [ ] Not committing connection strings to Git
- [ ] Using connection pooler (port 6543)

---

## Resources

- [Supabase Docs - Database](https://supabase.com/docs/guides/database)
- [SQLTools Documentation](https://vscode-sqltools.mteixeira.dev/)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

---

**Last Updated**: October 9, 2025
**Project**: Who Said What
**Database**: Supabase PostgreSQL
