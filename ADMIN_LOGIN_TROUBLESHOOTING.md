# Admin Login Troubleshooting Guide

## ✅ Issue Resolved!

The admin password has been reset. You should now be able to log in.

---

## 🔐 Current Admin Credentials

**Login URL:** http://localhost:3000/admin/login

**Username:** `admin`
**Password:** `admin123`

⚠️ **Important:** Please change this password after logging in!

---

## 🔍 What Was Checked

1. ✅ **Dev Server Status:** Running on port 3000
2. ✅ **Admin User Exists:** Username `admin` found in database
3. ✅ **Account Active:** User is active and not locked
4. ✅ **Password Reset:** Password has been reset to `admin123`
5. ✅ **Login Attempts:** Reset to 0
6. ✅ **Account Unlocked:** Any locks have been cleared

---

## 🛠️ Troubleshooting Steps (if still not working)

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for any errors:
```
1. Open http://localhost:3000/admin/login
2. Press F12 to open DevTools
3. Click Console tab
4. Try logging in
5. Look for red error messages
```

### 2. Check Network Tab
See what the API is returning:
```
1. Open DevTools (F12)
2. Click Network tab
3. Try logging in
4. Click on the "login" request
5. Check the Response tab
```

Common responses:
- `401 Unauthorized` = Wrong password
- `403 Forbidden` = Account locked or disabled
- `500 Internal Server Error` = Backend issue

### 3. Check Server Logs
Look at the terminal where `npm run dev` is running:
```bash
# You should see logs when attempting login
# Look for errors like:
# - Database connection errors
# - Password verification errors
# - JWT token errors
```

### 4. Verify Database Connection
```bash
npm run check-admin
```

Should show:
```
✅ Found 1 admin user(s):
  Username: admin
  Email: admin@thewordsrecord.com
  Active: ✅ Yes
  Locked: 🔓 No
```

### 5. Reset Password Again (if needed)
```bash
npm run reset-admin-password admin newpassword123
```

---

## 🔧 Helper Scripts Created

### Check Admin Status
```bash
npm run check-admin
# or
npx tsx scripts/check-admin.ts
```

Shows all admin users and their status.

### Reset Password
```bash
npm run reset-admin-password [username] [new-password]
# or
npx tsx scripts/reset-admin-password.ts admin admin123
```

### Unlock Account (if locked)
If you see "Account is locked" error:
```bash
npx tsx scripts/reset-admin-password.ts admin admin123
```
This also unlocks the account.

---

## 📋 Common Issues & Solutions

### Issue: "Invalid credentials"
**Solution:** Password might be wrong. Reset it:
```bash
npx tsx scripts/reset-admin-password.ts admin admin123
```

### Issue: "Account is locked"
**Cause:** 5 failed login attempts
**Solution:** Run the password reset script (it also unlocks)
```bash
npx tsx scripts/reset-admin-password.ts admin admin123
```

### Issue: "Account is disabled"
**Solution:** Activate the account:
```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.update({
  where: { username: 'admin' },
  data: { isActive: true }
}).then(() => console.log('✅ Account activated'));
"
```

### Issue: Page won't load / 500 error
**Possible causes:**
1. Dev server not running
2. Database connection issue
3. Missing environment variables

**Solutions:**
```bash
# Restart dev server
npm run dev

# Check .env file exists
ls -la .env

# Test database connection
npx prisma db pull
```

### Issue: Cookies not working
**Cause:** Browser blocking cookies
**Solution:**
1. Check browser settings allow cookies from localhost
2. Try in Incognito/Private mode
3. Clear browser cache and cookies

---

## 🧪 Test the Login Flow

### Manual Test:
1. Open http://localhost:3000/admin/login
2. Enter:
   - Username: `admin`
   - Password: `admin123`
3. Click "Login"
4. Should redirect to http://localhost:3000/admin

### Expected Behavior:
- ✅ Redirect to `/admin` dashboard
- ✅ Cookie `auth-token` set in browser
- ✅ Can access other admin pages
- ✅ Logout button works

---

## 🔒 Security Notes

### Change Default Password
After first login, change the password:
1. Go to `/admin/settings` or `/admin/profile`
2. Update password
3. Use a strong password (12+ characters)

### Account Lockout
- 5 failed attempts = locked for 30 minutes
- Reset immediately with: `npm run reset-admin-password`

### Session Management
- Sessions stored in database
- JWT tokens expire after 24 hours
- Logout invalidates session

---

## 📞 Still Having Issues?

If none of the above works, provide this information:

1. **Browser Console Errors:**
   - Copy exact error messages from Console tab

2. **Network Response:**
   - What does `/api/auth/login` return? (from Network tab)

3. **Server Logs:**
   - Any errors in the terminal running `npm run dev`?

4. **Database Check:**
   - Output of `npm run check-admin`

5. **Environment:**
   - Browser and version
   - Node.js version (`node -v`)
   - npm version (`npm -v`)

---

## ✅ Quick Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] Navigate to http://localhost:3000/admin/login
- [ ] Use credentials: `admin` / `admin123`
- [ ] Check browser console for errors (F12)
- [ ] Try in incognito mode
- [ ] Password reset script run successfully
- [ ] Database connection working

---

**Most likely the issue is now resolved with the password reset!**

Try logging in again with:
- Username: `admin`
- Password: `admin123`
