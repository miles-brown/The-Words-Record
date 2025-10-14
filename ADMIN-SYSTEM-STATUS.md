# Admin System - Current Status & Setup

## Date: October 13, 2025

---

## 🎯 Current Status

### ✅ What EXISTS:

1. **Admin UI Pages**
   - `/admin/login` - Login page with nice UI
   - `/admin/index.tsx` - Dashboard (requires auth)
   - `/admin/*` - Various admin pages (protected)

2. **Admin Layout**
   - `components/admin/AdminLayout.tsx`
   - Navigation menu with: Dashboard, People, Statements, Organizations, Drafts

3. **Database Models**
   - `User` table with roles (ADMIN, DE, DBO, CM, etc.)
   - `Session` table for authentication
   - `ApiKey` table for API authentication
   - `AuditLog` table for tracking actions
   - `UserToken` table for password reset, etc.

4. **Partial Auth System**
   - `/api/auth/me` - Check current user
   - `/api/auth/logout` - Logout endpoint

### ❌ What's MISSING:

1. **Critical:**
   - `/api/auth/login` endpoint - **DOESN'T EXIST!**
   - No users in database (count: 0)
   - No way to create first admin user

2. **Auth Flow:**
   - Registration endpoint
   - Password hashing utilities
   - Session management

---

## 🔧 What Needs to Be Built

### Priority 1: Basic Login (Required to Access Admin)

1. **Create `/pages/api/auth/login.ts`**
   - Accept username/password
   - Verify against database
   - Create session
   - Return success/failure

2. **Create First Admin User**
   - Script to create admin with hashed password
   - Or registration endpoint

3. **Session Management**
   - Create sessions on login
   - Verify sessions for protected routes

### Priority 2: User Management

1. **Create User Registration**
   - Admin can create new users
   - Set roles and permissions

2. **Password Management**
   - Password reset flow
   - Email verification (optional)

---

## 🚀 Two Approaches

### Option A: Quick & Simple (Recommended for Now)

**Get admin working with minimal auth:**

1. Create simple login API endpoint
2. Create one admin user via script
3. Basic session management
4. **Time:** ~30 minutes
5. **Result:** You can log in and start using admin

**Then later add:**
- Full user management
- MFA
- Password reset
- Email verification

### Option B: Complete Auth System

**Build full enterprise-grade auth:**

1. Complete login/registration system
2. Password reset flow
3. Email verification
4. MFA support
5. Session management with rotation
6. API key management
7. **Time:** ~3-4 hours
8. **Result:** Production-ready auth

---

## 📝 Recommendation

**For your immediate needs:**

### Do Option A First

**Why?**
- You want to start creating cases NOW
- Admin UI is already built
- You just need basic login to access it
- Can enhance auth later

**Steps:**
1. I'll create a simple login API (5 min)
2. Create your first admin user (2 min)
3. Test login (2 min)
4. You're in! Start using admin

**Then:**
- Build Cases infrastructure (your main goal)
- Enhance auth system later when needed

---

## 🔐 Simple Login Implementation

### 1. Create Login API

**File:** `pages/api/auth/login.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: generateToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set cookie
    res.setHeader(
      'Set-Cookie',
      `session=${session.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}

function generateToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}
```

### 2. Create Admin User Script

**File:** `create-admin-user.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Creating Admin User...\n');

  const username = await question(rl, 'Username: ');
  const email = await question(rl, 'Email: ');
  const password = await question(rl, 'Password: ');

  rl.close();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('\n✅ Admin user created!');
  console.log(`Username: ${username}`);
  console.log(`Email: ${email}`);
  console.log(`\nYou can now login at: /admin/login`);
}

function question(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## ⚡ Quick Start Commands

```bash
# Install bcrypt if needed
npm install bcryptjs

# Create login API
# (I'll create this file for you)

# Create your admin user
node create-admin-user.js

# Start dev server
npm run dev

# Open browser
http://localhost:3000/admin/login
```

---

## 🎯 Decision Time

### What would you like to do?

**Option 1: Setup Simple Login NOW** ⚡
- I'll create the login API
- Create admin user script
- You'll be logged in within 10 minutes
- **Then** we build Cases infrastructure

**Option 2: Skip Admin for Now** 🚀
- Focus on building Cases frontend first
- Setup admin later when you need it
- Cases can be created via scripts initially

**Option 3: Build Complete Auth System** 🏗️
- Full auth with all features
- Takes longer but production-ready
- Then build Cases

---

## 💡 My Recommendation

**Do Option 1** - Get simple login working in 10 minutes, then focus on building Cases infrastructure which is your main goal.

The admin UI is beautiful and ready - you just need the login to work!

**What would you like to do?**
