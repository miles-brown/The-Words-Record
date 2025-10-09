# Who-Said-What: Auth & Access Control System

This directory contains the Supabase migrations and documentation for implementing a comprehensive role-based access control (RBAC) system.

## 🎯 Overview

The system implements **least-privilege access control** with:
- **Human admins** with full access
- **Service accounts** for automation with limited, scoped permissions
- **Public read access** for your website visitors
- **Audit logging** for accountability

---

## 📋 Table of Contents

1. [Roles & Permissions](#roles--permissions)
2. [Setup Instructions](#setup-instructions)
3. [Service Account Management](#service-account-management)
4. [Security Best Practices](#security-best-practices)
5. [Troubleshooting](#troubleshooting)

---

## 🔐 Roles & Permissions

### Human Roles

| Role | Access Level | Use Case |
|------|-------------|----------|
| `admin` | Full access (read/write/delete all) | Your personal account |
| `editor` | Read/write content, no user management | Trusted human editors |
| `viewer` | Read-only | Default for new users |

### Service Account Roles

| Role | Access Level | Use Case |
|------|-------------|----------|
| `automation_codex` | INSERT/UPDATE on Person, Organization, Affiliation, Source | Codex data scraper |
| `automation_vscode_script_runner` | Limited writes | Local development scripts |
| `automation_cloud_tasks` | Scheduled task writes | Cloud Functions / cron jobs |
| `ci` | Full CRUD for testing | GitHub Actions CI/CD |
| `ingest` | INSERT/UPDATE on specific tables | Data ingestion pipelines |
| `bot_readonly` | Read-only | AI agents, monitoring tools |

### Public Access

- **Anonymous users** can `SELECT` from all content tables (for your public website)
- No write access without authentication

---

## 🚀 Setup Instructions

### Step 1: Run Migrations

Run migrations in order:

```bash
# If using Supabase CLI
supabase db push

# Or run each migration manually in Supabase Dashboard > SQL Editor
```

Migrations:
1. `001_create_profiles_and_service_accounts.sql` - Core tables
2. `002_custom_access_token_hook.sql` - JWT claims
3. `003_rls_policies_content_tables.sql` - RLS policies
4. `004_setup_initial_admin.sql` - Helper functions

### Step 2: Configure Custom Access Token Hook

**IMPORTANT**: After running migration 002, you must enable the hook in Supabase:

#### Option A: Via Dashboard
1. Go to **Database → Webhooks** (or **Database → Hooks**)
2. Create new "Custom Access Token Hook"
3. Set function: `public.custom_access_token_hook`
4. Enable the hook

#### Option B: Via SQL (if available)
```sql
-- Check if hooks are supported in your Supabase version
INSERT INTO supabase_functions.hooks (hook_table_id, hook_name, function_name)
VALUES (1, 'custom_access_token', 'public.custom_access_token_hook');
```

### Step 3: Create Your Admin Account

1. **Sign up** via your Supabase Auth UI (email/password, OAuth, etc.)

2. **Find your user ID**:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

3. **Promote yourself to admin**:
```sql
-- Using the helper function
SELECT public.promote_user_to_admin('your-email@example.com');

-- OR directly insert
INSERT INTO public.profiles (user_id, user_role, email)
VALUES ('YOUR_USER_ID_HERE'::uuid, 'admin', 'your-email@example.com')
ON CONFLICT (user_id)
DO UPDATE SET user_role = 'admin';
```

4. **Sign out and sign back in** to get the new JWT with `user_role` claim

5. **Verify your role**:
```sql
SELECT * FROM public.list_users_with_roles();
```

---

## 🤖 Service Account Management

### Creating Service Accounts

Use the helper function:

```sql
-- Example: Codex data scraper
SELECT public.create_service_account(
  'Codex Scraper',                          -- name
  'Automated data ingestion from Codex',    -- description
  'data_scraper',                           -- service_type
  'automation_codex',                       -- user_role
  ARRAY['Person', 'Organization', 'Affiliation', 'Source'],  -- allowed_tables
  ARRAY['SELECT', 'INSERT', 'UPDATE']       -- allowed_operations
);

-- Example: CI/CD pipeline
SELECT public.create_service_account(
  'GitHub Actions CI',
  'Continuous integration testing',
  'ci_pipeline',
  'ci',
  ARRAY['Person', 'Organization', 'Statement', 'Case'],
  ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']
);

-- Example: Read-only monitoring bot
SELECT public.create_service_account(
  'Monitoring Bot',
  'Application health monitoring',
  'monitoring',
  'bot_readonly',
  ARRAY[]::TEXT[],  -- Empty = all tables (read-only)
  ARRAY['SELECT']
);
```

### Using Service Accounts

#### Option 1: Via Supabase Auth (Recommended)

1. Create an auth user for the service account:
```sql
-- This must be done via Supabase Auth API or Dashboard
-- Create a user with email like: service+codex@yourapp.com
```

2. Link service account to auth user:
```sql
UPDATE public.service_accounts
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'service+codex@yourapp.com')
WHERE name = 'Codex Scraper';
```

3. Get JWT token via Supabase client:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign in with service account credentials
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'service+codex@yourapp.com',
  password: process.env.SERVICE_ACCOUNT_PASSWORD
})

// Use the JWT from data.session.access_token
```

#### Option 2: API Keys (For external systems)

Generate an API key for the service account:

```typescript
// In your server-side code:
import crypto from 'crypto'

const apiKey = crypto.randomBytes(32).toString('hex')
const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
const apiKeyPrefix = apiKey.substring(0, 8)

// Store in database
await supabase
  .from('service_accounts')
  .update({
    api_key_hash: apiKeyHash,
    api_key_prefix: apiKeyPrefix
  })
  .eq('name', 'Codex Scraper')

// Save the full apiKey securely - you can't retrieve it later!
console.log('API Key:', apiKey)
```

Validate API key:
```typescript
async function validateApiKey(providedKey: string) {
  const providedHash = crypto.createHash('sha256').update(providedKey).digest('hex')

  const { data } = await supabase
    .from('service_accounts')
    .select('*')
    .eq('api_key_hash', providedHash)
    .eq('is_active', true)
    .single()

  return data
}
```

### Viewing Service Accounts

```sql
-- List all service accounts
SELECT
  id,
  name,
  service_type,
  user_role,
  is_active,
  allowed_tables,
  allowed_operations,
  created_at,
  last_used_at
FROM public.service_accounts
ORDER BY created_at DESC;

-- View audit logs
SELECT
  sa.name as service_account_name,
  sal.operation,
  sal.table_name,
  sal.success,
  sal.error_message,
  sal.created_at
FROM public.service_account_audit_log sal
JOIN public.service_accounts sa ON sal.service_account_id = sa.id
ORDER BY sal.created_at DESC
LIMIT 100;
```

### Revoking Service Accounts

```sql
-- Disable a service account
UPDATE public.service_accounts
SET is_active = false
WHERE name = 'Codex Scraper';

-- Delete a service account (also deletes audit logs via CASCADE)
DELETE FROM public.service_accounts
WHERE name = 'Old Service Account';
```

---

## 🔒 Security Best Practices

### For Human Admins

1. ✅ **Use your own account** during development
2. ✅ **Store credentials** in a password manager
3. ✅ **Enable MFA** on your Supabase account
4. ❌ **Never share** your admin credentials
5. ❌ **Never commit** your `service_role` key to git

### For Service Accounts

1. ✅ **Create separate accounts** for each automation (Codex, CI, Cloud Functions, etc.)
2. ✅ **Grant minimum permissions** needed (least privilege)
3. ✅ **Store credentials** in secure vaults:
   - GitHub Actions: GitHub Secrets
   - Cloud Functions: Cloud Secret Manager
   - Local dev: `.env.local` (gitignored)
4. ✅ **Rotate credentials** regularly
5. ✅ **Monitor audit logs** for suspicious activity
6. ❌ **Never embed credentials** in client-side code
7. ❌ **Never share service_role key** with external services (including AI agents)

### For AI Agents (ChatGPT, Claude, etc.)

**DO:**
- Create a dedicated service account with `bot_readonly` role
- Have the AI call your backend API (which uses your DB credentials)
- Use temporary, scoped tokens

**DON'T:**
- Give AI agents your personal admin credentials
- Share your `service_role` key
- Allow AI direct database access

---

## 🛠️ Troubleshooting

### "Permission denied" when querying tables

**Cause**: RLS policies are blocking your query

**Solutions**:
1. Check your role:
```sql
SELECT public.current_user_role();
```

2. If it returns `viewer` but you should be `admin`:
   - Sign out and sign back in (to refresh JWT)
   - Verify your role in database:
   ```sql
   SELECT * FROM public.profiles WHERE user_id = auth.uid();
   ```

3. If you're using service_role key, RLS is bypassed (be careful!)

### Custom token hook not working

**Symptoms**: JWT doesn't contain `user_role` claim

**Solutions**:
1. Verify hook is enabled in Supabase Dashboard → Database → Hooks
2. Check function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'custom_access_token_hook';
```

3. Test the function manually:
```sql
SELECT public.custom_access_token_hook('{"user_id": "YOUR_USER_ID", "claims": {}}'::jsonb);
```

4. If hook isn't available, manually add claim via Edge Function (alternative approach)

### Service account can't write to table

**Cause**: Service account role not allowed in RLS policy

**Solutions**:
1. Check current policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'Person';
```

2. Verify service account role is in the policy's `has_any_role()` check:
```sql
-- Example: Allow automation_codex to write to Person table
CREATE POLICY "Automation can update persons"
  ON "Person"
  FOR UPDATE
  TO authenticated
  USING (
    public.has_any_role(ARRAY['admin', 'editor', 'ingest', 'automation_codex'])
  );
```

3. If using API keys, ensure you're setting the JWT correctly

### Audit logs not recording

**Cause**: Application isn't calling audit log function

**Solution**: Add audit logging to your application code:

```typescript
async function logServiceAccountAction(
  serviceAccountId: string,
  operation: string,
  tableName: string,
  recordId: string,
  success: boolean,
  errorMessage?: string
) {
  await supabase.from('service_account_audit_log').insert({
    service_account_id: serviceAccountId,
    operation,
    table_name: tableName,
    record_id: recordId,
    success,
    error_message: errorMessage
  })
}

// Usage
try {
  await supabase.from('Person').insert(personData)
  await logServiceAccountAction(SA_ID, 'INSERT', 'Person', personData.id, true)
} catch (error) {
  await logServiceAccountAction(SA_ID, 'INSERT', 'Person', null, false, error.message)
}
```

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## 🤝 Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Supabase logs: Dashboard → Logs → PostgreSQL Logs
3. Check audit logs for service accounts
4. Verify JWT claims: https://jwt.io/

---

## 🔄 Next Steps

After setup:
1. ✅ Test public read access (anonymous user can SELECT)
2. ✅ Test admin write access (you can INSERT/UPDATE/DELETE)
3. ✅ Create service account for Codex
4. ✅ Test service account permissions
5. ✅ Monitor audit logs
6. ✅ Document your deployment process

---

## 📝 Example: Full Flow

### Creating and Using a Codex Service Account

```typescript
// 1. Admin creates service account (via SQL or admin UI)
// SELECT public.create_service_account('Codex Scraper', ...)

// 2. Create Supabase Auth user for service account
const { data: authUser } = await supabaseAdmin.auth.admin.createUser({
  email: 'service+codex@yourapp.com',
  password: generateSecurePassword(),
  email_confirm: true
})

// 3. Link to service account
await supabaseAdmin
  .from('service_accounts')
  .update({ auth_user_id: authUser.user.id })
  .eq('name', 'Codex Scraper')

// 4. Add to profiles table with automation_codex role
await supabaseAdmin
  .from('profiles')
  .insert({
    user_id: authUser.user.id,
    user_role: 'automation_codex',
    email: 'service+codex@yourapp.com'
  })

// 5. Sign in and use in your Codex scraper
const { data: session } = await supabase.auth.signInWithPassword({
  email: 'service+codex@yourapp.com',
  password: process.env.CODEX_SERVICE_PASSWORD
})

// 6. Now this client has automation_codex permissions
const { data: person } = await supabase
  .from('Person')
  .insert({ name: 'New Person', ... })
// ✅ Works! (automation_codex can INSERT Person)

const { data: tag } = await supabase
  .from('Tag')
  .insert({ name: 'New Tag', ... })
// ❌ Fails! (automation_codex not allowed to write to Tag)
```

---

**Questions?** Review the migrations and RLS policies in the `migrations/` directory for full details.
