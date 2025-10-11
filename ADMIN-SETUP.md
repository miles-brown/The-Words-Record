# Admin Console & Security Guide

## Overview

The admin console now ships with a hardened authentication layer, audited API, and UI tooling for editors, reviewers, bots, and CIs:

- **JWS-based authentication** with refresh cookies, secure headers, and audit logging for every login/logout.
- **RBAC & API key support** implemented at the middleware level. API keys inherit permissions and can create drafts for human review.
- **Prisma schema enhancements** for `User`, `Session`, `ApiKey`, `ContentDraft`, `ContentApproval`, and `HarvestJob` models.
- **Admin UI** for People, Cases, Organizations, and Draft approvals (including bot/CI workflows).
- **Audit trail** writes to the `AuditLog` table whenever protected routes are hit.

## 1. Prerequisites

- Node.js 18+
- PostgreSQL / Supabase instance (DATABASE_URL / DIRECT_URL configured)
- OpenSSL (for generating RSA keys)

## 2. Environment Variables

Update `.env.local` (development) and production environment values:

```env
# === JWT / Cookies ===
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
JWT_ALGORITHM=RS256            # defaults to RS256 when keys are present
JWT_ISSUER=who-said-what
JWT_AUDIENCE=admin-console
ADMIN_AUTH_COOKIE=wsw_admin
ADMIN_COOKIE_SECURE=true       # set false only for local HTTP

# fallback for local dev if RSA keys are omitted
JWT_SECRET=super-long-random-string

# === Admin bootstrap ===
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@thewordsrecord.com
ADMIN_PASSWORD_HASH=$2a$12$...   # bcrypt hash for production signin
ADMIN_DEV_PASSWORD=admin123      # optional plain text for local dev only

# === Database ===
DATABASE_URL=postgres://...
DIRECT_URL=postgres://...

# === Public config ===
NEXT_PUBLIC_SITE_URL=https://thewordsrecord.com
```

### Generating RSA Keys

```bash
openssl genpkey -algorithm RSA -out jwt_private.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem

# convert to .env friendly single line (macOS / Linux)
awk 'NF {sub(/\r/, ""); printf "%s", $0; next} {print ""}' jwt_private.pem
```

## 3. Install & Generate Prisma Client

```bash
npm install
npm run db:generate      # prisma generate
npm run db:push          # optional: sync schema to dev database
```

## 4. Seed the First Admin User & API Key

The new `prisma/seed-admin.ts` script provisions an `ADMIN` user and (optionally) an API key for bots:

```bash
# set either ADMIN_PASSWORD_HASH or ADMIN_SEED_PASSWORD before running
ADMIN_SEED_PASSWORD='local-dev-password' \
ADMIN_SEED_API_KEY_NAME='bot-ingest-key' \
ADMIN_SEED_API_KEY_PERMISSIONS='content:create,content:read' \
npm run db:seed-admin
```

The script outputs a `wsw_xxx.secret` composite token – store it securely. Bots should send:

```
X-API-Key: wsw_xxx
X-API-Secret: <base64 secret>
```

Permissions for API keys map directly onto the RBAC matrix in `middleware/rbac.ts` (`content:create`, `content:approve`, `harvest:manage`, etc.).

## 5. Running the Admin Console

```bash
npm run dev
# http://localhost:3000/admin
```

### Available Screens

| Screen | Path | Capability |
|--------|------|------------|
| Dashboard | `/admin` | Stats, audit highlights, quick actions |
| People | `/admin/people` | List, create, edit public figures |
| Cases | `/admin/cases` | Manage incidents, associations |
| Organizations | `/admin/organizations` | CRUD org records |
| Drafts / Approvals | `/admin/drafts` | Review bot & CI submissions |

All pages require a valid session cookie. Nested routes (e.g. `/admin/people/:id/edit`) inherit the same guard.

## 6. Approval Workflow (Bots & CIs)

1. **Bots / CIs** authenticate via API key and `POST /api/admin/drafts` submitting structured JSON.
2. Drafts remain in `DRAFT` until either the creator or editor submits (`PATCH /api/admin/drafts/:id` → `SUBMITTED`).
3. **Reviewers** (roles with `content:approve`) use the UI or API to approve, reject, or request changes. Each decision logs to `ContentApproval` and `AuditLog`.
4. Approved drafts can be promoted to live content through your existing pipelines (e.g. by consuming draft data in ingestion scripts).

## 7. REST API Summary

| Endpoint | Methods | Permission | Notes |
|----------|---------|------------|-------|
| `/api/admin/dashboard` | GET | `content:read` | Metrics & recent audits |
| `/api/admin/people` | GET, POST | read/create | CRUD for people |
| `/api/admin/people/:id` | GET, PUT, DELETE | read/update/delete | ID or slug accepted |
| `/api/admin/cases` | GET, POST | read/create | Case management |
| `/api/admin/cases/:id` | GET, PUT, DELETE | read/update/delete | Includes relations |
| `/api/admin/organizations` | GET, POST | read/create | Org CRUD |
| `/api/admin/organizations/:id` | GET, PUT, DELETE | read/update/delete | |
| `/api/admin/users` | GET, POST | `user:read`, `user:create` | Manage admin accounts |
| `/api/admin/users/:id` | GET, PATCH, DELETE | `user:*` | Role & activation controls |
| `/api/admin/drafts` | GET, POST | draft workflow | Bot submissions, list |
| `/api/admin/drafts/:id` | GET, PATCH, DELETE | `content:update/approve` | Status transitions, approvals |

All handlers accept either a session bearer token (JWT cookie) or an API key pair. See `lib/api-keys.ts` for validation details.

## 8. Row Level Security (Supabase)

RLS is not automatically created; configure policies directly in Supabase or Postgres:

```sql
-- Enable RLS on sensitive tables
alter table "ContentDraft" enable row level security;
alter table "ContentApproval" enable row level security;
alter table "AuditLog" enable row level security;

-- Example policy: only service-role or admin users can read audit logs
create policy "AuditLog_admin_read"
on "AuditLog"
for select
using (
  auth.role() = 'service_role' OR
  exists (
    select 1 from "User"
    where id = current_setting('request.jwt.claims', true)::json->>'sub'
      and role = 'ADMIN'
  )
);

-- Draft creators can see their drafts; approvers can see all
create policy "Drafts_owner_read"
on "ContentDraft"
for select using (
  userId = current_setting('request.jwt.claims', true)::json->>'sub'
);

create policy "Drafts_approver_read"
on "ContentDraft"
for select using (
  (current_setting('request.jwt.claims', true)::json->>'role') in ('ADMIN','CM','QA')
);
```

> **TIP:** Supabase JWTs should include `role` and `sub` claims aligned with the `User` table so policies can reference them.

## 9. Security Checklist

- Rotate JWT keys and API secrets regularly; revoke compromised keys via `/api/admin/users` or direct `ApiKey` updates.
- Monitor the `AuditLog` table or forward entries to your SIEM.
- Enforce HTTPS (`ADMIN_COOKIE_SECURE=true`) in production; set `SameSite=None` only if the admin runs on another origin.
- Configure rate limiting and WAF rules in your hosting provider (Vercel, Cloudflare, etc.).
- Run `npm audit` and keep Prisma/Next.js versions current.

## 10. Troubleshooting

| Issue | Fix |
|-------|-----|
| `Invalid token` on API calls | Ensure JWT keys/secrets match and cookies are sent with `credentials: 'include'`. |
| Admin login succeeds but API returns 403 | Check role permissions in `middleware/rbac.ts` and user role assignment. |
| Bot request rejected | Verify API key headers (`x-api-key`, `x-api-secret`) and permissions array. |
| Prisma types missing new models | Run `npm run db:generate` (prisma generate). |

---

Need something beyond this baseline (harvest automations, data exports, etc.)? Drop tasks into the backlog and extend the API/UI following the patterns above.
