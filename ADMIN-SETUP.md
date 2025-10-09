# Admin CMS Setup Guide

## Current Status ✅

The foundation of the Admin CMS has been implemented with:

### Completed Features
- ✅ **Authentication System** - JWT-based auth with role support (simplified version)
- ✅ **Harvard Referencing** - Automatic citation generation for all sources
- ✅ **RBAC Middleware** - Role-based access control with granular permissions
- ✅ **Admin Dashboard** - Stats overview and recent activity
- ✅ **Dynamic Sitemap** - SEO-optimized sitemap generation
- ✅ **Enhanced robots.txt** - Comprehensive crawler rules
- ✅ **Audit Logging** - Basic audit trail (console logging for now)

### User Roles Defined
- `ADMIN` - Full system access
- `DE` - Data Editor (content CRUD)
- `DBO` - Database Operator (exports, imports, backups)
- `CM` - Content Manager (approval workflows)
- `CI` - Content Intern (draft creation only)
- `BOT` - Bot/Harvester (automated content)
- `QA` - Quality Assurance (review & flag)
- `AI_CUR`, `AI_ED`, `AI_VAL`, `AI_CITE` - AI-specific roles

## Quick Start

### 1. Access Admin Interface

```bash
# Development
http://localhost:3002/admin

# Production
https://thewordsrecord.com/admin

# Default credentials (development only)
Username: admin
Password: admin123
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Authentication
JWT_SECRET=your-secure-random-string-at-least-32-chars
JWT_REFRESH_SECRET=another-secure-random-string
ENCRYPTION_KEY=yet-another-secure-random-string

# Admin Credentials (production)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$YourBcryptHashHere

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://thewordsrecord.com
```

### 3. Generate Password Hash

```javascript
// Run this to generate a secure password hash
const bcrypt = require('bcryptjs')
const password = 'your-secure-password'
bcrypt.hash(password, 10).then(hash => console.log(hash))
```

## Next Steps - Phase 2 Implementation

### 1. Database Migration (Priority: HIGH)

The enhanced Prisma schema (`prisma/schema-enhanced.prisma`) needs to be migrated:

```bash
# Copy enhanced schema
cp prisma/schema-enhanced.prisma prisma/schema.prisma

# Generate migration
npx prisma migrate dev --name add-user-management

# Seed initial admin user
npx tsx prisma/seed-admin.ts
```

### 2. Install Additional Dependencies

```bash
# Core dependencies for enhanced features
npm install speakeasy qrcode @types/speakeasy @types/qrcode

# UI Components
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query zustand
npm install recharts react-hot-toast

# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link

# Utilities
npm install axios date-fns
```

### 3. Build Admin Pages (Priority: HIGH)

Create these pages in `/pages/admin/`:

#### Cases Management
- `/admin/cases/index.tsx` - List all cases with filters
- `/admin/cases/new.tsx` - Create new case form
- `/admin/cases/[slug]/edit.tsx` - Edit existing case

#### People Management
- `/admin/people/index.tsx` - People directory
- `/admin/people/new.tsx` - Add new person
- `/admin/people/[slug]/edit.tsx` - Edit person profile

#### Organizations Management
- `/admin/organizations/index.tsx` - Organizations list
- `/admin/organizations/new.tsx` - Add organization
- `/admin/organizations/[slug]/edit.tsx` - Edit organization

### 4. Implement Harvester System (Priority: MEDIUM)

Create automated content collection:

```typescript
// scripts/harvester.ts
import { archiveWithWayback } from '@/lib/harvard-reference'

// Harvest configuration
const harvestJobs = {
  enrichPeople: async () => {
    // Enrich person profiles from Wikipedia, LinkedIn
  },
  discoverStatements: async () => {
    // Monitor news sources for new statements
  },
  archiveSources: async () => {
    // Archive all sources with Wayback Machine
  }
}

// Schedule with cron or Vercel Cron
```

### 5. API Routes Needed

Create these API endpoints:

```
/api/admin/users - User management CRUD
/api/admin/content/approve - Approval workflow
/api/admin/harvest/run - Manual harvester trigger
/api/admin/export - Data export
/api/admin/import - Data import
/api/sources/archive - Wayback Machine archiving
/api/sources/verify - Source verification
```

## Harvard Reference Implementation

All sources now support Harvard citations:

```typescript
import { generateFullCitation, generateInTextCitation } from '@/lib/harvard-reference'

// Example usage
const citation = generateFullCitation({
  authors: ['Smith, John', 'Doe, Jane'],
  year: 2024,
  title: 'Statement on Recent Events',
  publication: 'The Times',
  url: 'https://example.com/article',
  accessDate: new Date()
})
// Output: Smith, J. and Doe, J. (2024) 'Statement on Recent Events', The Times. Available at: https://example.com/article [Accessed 1 January 2024].

const inText = generateInTextCitation({...})
// Output: (Smith and Doe, 2024)
```

## Security Best Practices

1. **Never commit sensitive data**
   - Use environment variables for all secrets
   - Add `.env` to `.gitignore`

2. **Enable MFA for admin users** (after dependencies installed)
   ```typescript
   import { generateMfaSecret, verifyMfaToken } from '@/lib/auth-enhanced'
   ```

3. **Regular security audits**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Monitor failed login attempts**
   - Check audit logs for suspicious activity
   - Implement IP-based rate limiting

5. **Backup regularly**
   - Database backups every 6 hours
   - Store backups in separate location

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Generate secure JWT secrets
- [ ] Create production admin account
- [ ] Run database migrations
- [ ] Test all CRUD operations
- [ ] Verify Harvard citations work
- [ ] Check sitemap generation
- [ ] Test robots.txt accessibility
- [ ] Enable HTTPS only
- [ ] Set up monitoring (Sentry)
- [ ] Configure backup automation
- [ ] Test harvester scripts
- [ ] Document API endpoints
- [ ] Train content managers

## Support & Documentation

- **Admin Guide**: `/docs/admin-guide.md` (to be created)
- **API Documentation**: `/docs/api.md` (to be created)
- **Troubleshooting**: Check `/logs/` directory
- **Issues**: Report at https://github.com/miles-brown/Who-Said-What/issues

## Current Limitations

1. **Temporary Implementation**
   - User management uses hardcoded admin user
   - Audit logs only go to console
   - No MFA support yet (dependencies not installed)

2. **Missing Features**
   - Content approval workflow
   - Automated harvesters
   - Export/Import functionality
   - Multi-user support

3. **Next Priority**
   - Migrate database schema
   - Build CRUD pages for Cases/People/Orgs
   - Implement Wayback Machine archiving
   - Add real user management

---

*Last Updated: October 2024*
*Version: 1.0.0-alpha*