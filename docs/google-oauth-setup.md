# Google OAuth Setup Guide

This guide will help you enable Google sign-in for KEEPERS.

---

## Step 1: Get Google OAuth Credentials

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create a New Project (or select existing)
1. Click the project dropdown at the top
2. Click "NEW PROJECT"
3. Name it: **KEEPERS**
4. Click "CREATE"

### 1.3 Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

### 1.4 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have Google Workspace)
3. Click "CREATE"

**Fill in the form:**
- **App name**: KEEPERS
- **User support email**: Your email
- **App logo**: (Optional) Upload KEEPERS logo
- **Application home page**: `https://keepers.com` (or your domain)
- **Authorized domains**: Add your domain (e.g., `keepers.com`, `vercel.app`)
- **Developer contact email**: Your email

4. Click "SAVE AND CONTINUE"
5. Skip "Scopes" (click "SAVE AND CONTINUE")
6. Skip "Test users" (click "SAVE AND CONTINUE")
7. Click "BACK TO DASHBOARD"

### 1.5 Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click "CREATE CREDENTIALS" → **OAuth client ID**
3. Select **Application type**: Web application
4. Name: **KEEPERS Web Client**

**Authorized JavaScript origins:**
```
http://localhost:3000
https://keepers.com
https://keepers-nonprod.vercel.app
https://your-project.supabase.co
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://keepers.com/auth/callback
https://keepers-nonprod.vercel.app/auth/callback
https://your-project.supabase.co/auth/v1/callback
```

5. Click "CREATE"
6. **Copy the Client ID and Client Secret** - you'll need these!

---

## Step 2: Configure Supabase

### 2.1 Open Supabase Dashboard
Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/auth/providers

### 2.2 Enable Google Provider
1. Find "Google" in the provider list
2. Toggle it **ON**
3. Paste your **Client ID** from Google Cloud Console
4. Paste your **Client Secret** from Google Cloud Console
5. Click "SAVE"

### 2.3 Get Supabase Callback URL
You should see a callback URL like:
```
https://your-project.supabase.co/auth/v1/callback
```

**Important**: Make sure this URL is added to your Google OAuth redirect URIs (from Step 1.5 above)

---

## Step 3: Update Environment Variables

Your app already has the correct environment variables. Just verify they exist in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**For production (Vercel):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure `NEXT_PUBLIC_SITE_URL` is set to your production domain
3. Redeploy

---

## Step 4: Test Google Sign-In

### Local Testing
1. Start your dev server: `pnpm dev`
2. Open http://localhost:3000
3. Click "Login" or "Sign Up"
4. Click "Continue with Google"
5. Select your Google account
6. You should be redirected back and logged in!

### Production Testing
1. Deploy to Vercel
2. Visit your production URL
3. Test Google sign-in
4. Verify user is created in Supabase Dashboard → Authentication → Users

---

## How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS "CONTINUE WITH GOOGLE"                       │
│    components/auth-modal.tsx → handleGoogleSignIn()         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. REDIRECT TO GOOGLE                                       │
│    lib/auth-actions.ts → signInWithGoogle()                 │
│    Redirects to: https://accounts.google.com/o/oauth2/...   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. USER AUTHORIZES ON GOOGLE                                │
│    - Selects Google account                                 │
│    - Approves permission request                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GOOGLE REDIRECTS TO SUPABASE                             │
│    https://your-project.supabase.co/auth/v1/callback        │
│    - Google sends authorization code                        │
│    - Supabase exchanges code for Google tokens              │
│    - Supabase gets user info from Google                    │
│    - Supabase creates/updates user in database              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. SUPABASE REDIRECTS TO YOUR APP                           │
│    https://keepers.com/auth/callback?code=...               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. YOUR CALLBACK ROUTE                                      │
│    app/auth/callback/route.ts                               │
│    - Exchanges code for session                             │
│    - Sets cookies with access_token + refresh_token         │
│    - Redirects to home page                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. USER IS LOGGED IN                                        │
│    - Session stored in cookies                              │
│    - User can access protected features                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: The redirect URI in your request doesn't match Google OAuth settings

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Make sure ALL these URIs are listed under "Authorized redirect URIs":
   ```
   http://localhost:3000/auth/callback
   https://your-project.supabase.co/auth/v1/callback
   https://keepers-nonprod.vercel.app/auth/callback
   https://keepers.com/auth/callback
   ```

### Error: "400 Bad Request" from Google
**Cause**: OAuth consent screen not configured

**Fix**:
1. Go to Google Cloud Console → OAuth consent screen
2. Complete the configuration (see Step 1.4)
3. Make sure app is "Published" (not in testing mode)

### User can sign in but profile not created
**Cause**: Profile trigger might not be working for OAuth users

**Fix**:
1. Check Supabase → Database → Functions
2. Make sure `handle_new_user` trigger exists
3. If not, run the SQL from `sql/schema-supabase.sql`

### Google sign-in works locally but not in production
**Cause**: Missing environment variables or wrong redirect URL

**Fix**:
1. Verify `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
2. Make sure production URL is in Google OAuth redirect URIs
3. Redeploy after changing environment variables

---

## User Data Handling

### What data is collected from Google?

When a user signs in with Google, Supabase receives:
- **Email address** (stored in `auth.users.email`)
- **Full name** (stored in `auth.users.raw_user_meta_data`)
- **Profile picture URL** (stored in `auth.users.raw_user_meta_data.avatar_url`)
- **Google ID** (stored in `auth.users.raw_user_meta_data.sub`)

### Profile Creation

The `handle_new_user` trigger (from `sql/schema-supabase.sql`) automatically creates a profile:

```sql
-- Triggered on user creation (email OR Google)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**For Google users:**
- `first_name` and `last_name` are parsed from Google's `full_name`
- If Google doesn't provide names, they default to empty strings
- Users can update their profile later in settings

---

## Security Notes

### What Google Verifies
- User owns the Google account
- Email is verified by Google (no need for email confirmation)
- User authorized your app to access their info

### What You Store
- Minimal user data (email, name)
- Google tokens are managed by Supabase (never exposed to your app)
- User can revoke access at: https://myaccount.google.com/permissions

### Best Practices
- ✅ Only request necessary scopes (email, profile)
- ✅ Use HTTPS in production
- ✅ Keep Client Secret secure (never commit to git)
- ✅ Regularly rotate Client Secret if compromised

---

## Quick Reference

### Google Cloud Console
- **Console**: https://console.cloud.google.com/
- **Credentials**: APIs & Services → Credentials
- **OAuth Consent**: APIs & Services → OAuth consent screen

### Supabase Dashboard
- **Providers**: Authentication → Providers
- **Users**: Authentication → Users

### Code Files
- **Auth Modal**: `components/auth-modal.tsx` (Google button)
- **Sign-in Action**: `lib/auth-actions.ts` (signInWithGoogle)
- **Callback Route**: `app/auth/callback/route.ts` (handles redirect)

---

**Last Updated**: January 2026
**Status**: Google OAuth ready to configure
