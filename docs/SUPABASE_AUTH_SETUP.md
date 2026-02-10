# Supabase Auth Setup Guide

This guide will help you set up Supabase Auth for secure admin access to your e-commerce dashboard.

## ✅ What's Included (Free Forever)

Supabase Auth free tier includes:
- ✅ **Unlimited users**
- ✅ **Email/password authentication**
- ✅ **Magic links (passwordless)**
- ✅ **Social login** (Google, GitHub, etc.)
- ✅ **Row Level Security (RLS)**
- ✅ **JWT tokens** with automatic refresh
- ✅ **Session management**

---

## Step 1: Enable Auth in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click **"Authentication"** in the left sidebar
3. Click **"Providers"**
4. Enable **"Email"** provider
5. Turn OFF **"Confirm email"** (for easier testing, turn ON for production)
6. Click **"Save"

---

## Step 2: Run SQL Setup

1. Go to **"SQL Editor"** in Supabase
2. Copy the contents of `supabase/auth-setup.sql`
3. Paste and click **"Run"**

This creates:
- `admin_users` table to track who has admin access
- Updated RLS policies that check for admin status
- Functions to manage admin users

---

## Step 3: Create Admin User

### Option A: Via Supabase Dashboard (Easiest)

1. Go to **"Authentication"** → **"Users"**
2. Click **"Add user"**
3. Enter email: `admin@zulfiqarpc.com`
4. Enter password: (create a strong password)
5. Click **"Create user"**
6. Copy the user's **UUID** (long string like: `550e8400-e29b-41d4-a716-446655440000`)

7. Go to **"SQL Editor"** and run:
```sql
INSERT INTO public.admin_users (id, email, role)
VALUES ('PASTE-UUID-HERE', 'admin@zulfiqarpc.com', 'super_admin');
```

### Option B: Via the App (After Deploy)

1. Deploy your app
2. Go to `/admin/login`
3. Click **"Sign up"** (you'll need to add a signup form temporarily)
4. After signup, manually add the user to admin_users table via SQL

---

## Step 4: Deploy Updated Code

1. Commit all changes:
```bash
git add -A
git commit -m "feat: Implement Supabase Auth for admin access"
git push
```

2. Deploy to Vercel (if not auto-deployed)

---

## Step 5: Access Admin Panel

1. Go to `https://your-site.vercel.app/admin/login`
2. Enter email: `admin@zulfiqarpc.com`
3. Enter password: (the one you created)
4. You're in! 🎉

---

## Security Features

Your new auth system includes:

### 🔐 **Supabase Auth Benefits**
- **JWT tokens** - Secure, stateless authentication
- **Automatic session refresh** - No manual token management
- **Password hashing** - bcrypt (industry standard)
- **Rate limiting** - Built-in protection against brute force
- **Audit logs** - Track all auth events in Supabase dashboard

### 🛡️ **Admin Verification**
- User must exist in `admin_users` table
- Role-based access control (admin/super_admin)
- Row Level Security policies on all tables

### ⚡ **Session Management**
- Sessions persist across page refreshes
- Automatic logout when token expires
- Secure cookie handling

---

## Managing Admin Users

### Add New Admin
```sql
-- First, have them sign up via the app
-- Then run:
INSERT INTO public.admin_users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'newadmin@example.com';
```

### Remove Admin Access
```sql
DELETE FROM public.admin_users WHERE email = 'admin@example.com';
```

### List All Admins
```sql
SELECT au.email, au.role, au.created_at
FROM public.admin_users au
ORDER BY au.created_at DESC;
```

---

## Troubleshooting

### "You do not have admin privileges"
- User is authenticated but not in `admin_users` table
- Run the SQL to add them

### "Invalid email or password"
- Wrong credentials
- User doesn't exist in auth.users
- Check Supabase Dashboard → Authentication → Users

### Can't access protected routes
- Session expired (auto-logout after ~1 week)
- User removed from admin_users table

### "Supabase not configured" error
- Missing environment variables in Vercel
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Next Steps

### For Production
1. **Enable email confirmation** in Supabase Auth settings
2. **Set up SMTP** for transactional emails
3. **Add password reset flow**
4. **Enable 2FA** (coming soon to Supabase)

### Add More Admins
Simply repeat Step 3 for each new admin user.

---

## Migration from Old Auth

Your old custom auth system is now deprecated. All existing admin functionality works with Supabase Auth.

The old `VITE_ADMIN_PASSWORD_HASH` environment variable is no longer needed and can be removed from Vercel.

---

## Questions?

- **Docs:** https://supabase.com/docs/guides/auth
- **Dashboard:** Check your Supabase project
- **Status:** https://status.supabase.com/

**You're now using enterprise-grade authentication for FREE!** 🚀
