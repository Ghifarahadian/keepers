# KEEPERS - Minimal Landing Page

> **Project**: KEEPERS - Custom Photobook Landing Page
> **Last Updated**: January 2026

---

## Project Overview

KEEPERS is a minimal, elegant landing page for a custom photobook service. The design focuses on simplicity with a clean hero section and minimal navigation.

**Brand Identity:**
- **Name**: KEEPERS
- **Tagline**: "Your Story, Well Kept"
- **Value Proposition**: "For the moments worth more than a scroll"

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.10 | React meta-framework for SSR/SSG |
| **React** | 19.2.0 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.1.9 | Utility-first CSS framework |
| **Lucide React** | 0.454.0 | Icon library |
| **Supabase** | 2.89.0 | Authentication & Database |
| **@supabase/ssr** | 0.8.0 | Supabase SSR utilities |

---

## Project Structure

```
keepers/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts    # OAuth callback handler
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main landing page (Server Component)
│   └── globals.css             # Global styles
├── components/
│   ├── auth-modal.tsx          # Authentication modal (Client)
│   ├── header.tsx              # Navigation header (Client)
│   ├── hero.tsx                # Hero section (Client)
│   └── user-menu.tsx           # User dropdown menu (Client)
├── lib/
│   ├── auth-actions.ts         # Server actions for authentication
│   ├── config.ts               # Feature flags & configuration
│   ├── validation.ts           # Input validation utilities
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── middleware.ts       # Session refresh logic
├── types/
│   └── auth.ts                 # TypeScript auth type definitions
├── sql/
│   ├── schema-supabase.sql     # Supabase database schema
│   └── README.md               # Database setup instructions
├── mockup/
│   └── mockup.jpeg             # Design mockup
├── public/                     # Static assets
├── middleware.ts               # Next.js middleware for session refresh
├── .env.local.example          # Environment variables example
├── package.json
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

---

## Components

### Header ([components/header.tsx](components/header.tsx))
- **Type**: Client Component
- Fixed navigation bar with conditional variants
- **Default Mode**: KEEPERS logo on left, search icon, login/signup button or user menu
- **Coming Soon Mode**: Centered KEEPERS logo only
- Clean cream background (#f5f3ef)
- Props: `variant?: 'default' | 'coming-soon'`, `user?: { firstName: string } | null`

### Auth Modal ([components/auth-modal.tsx](components/auth-modal.tsx))
- **Type**: Client Component
- Full-featured authentication modal with:
  - Login and signup forms
  - Email/password authentication
  - Google OAuth integration
  - Form validation
  - Error handling
- Props: `isOpen: boolean`, `onClose: () => void`

### User Menu ([components/user-menu.tsx](components/user-menu.tsx))
- **Type**: Client Component
- Dropdown menu for authenticated users
- Options: Profile, Settings, Logout
- Props: `firstName: string`

### Hero ([components/hero.tsx](components/hero.tsx))
- **Type**: Client Component
- Full-screen centered layout
- Large serif headline: "Your Story, Well Kept."
- Subheading with value proposition
- **Default Mode**: Coral CTA button "Start Your Book" with arrow icon, scroll indicator
- **Coming Soon Mode**: Large "Coming Soon" text, no scroll indicator
- Props: `mode?: 'default' | 'coming-soon'`

### Page ([app/page.tsx](app/page.tsx))
- **Type**: Server Component
- Fetches user profile server-side via `getUserProfile()`
- Minimal composition of Header + Hero
- Cream background throughout
- Reads `config.comingSoonMode` to determine which variant to display

### Config ([lib/config.ts](lib/config.ts))
- Central configuration system
- Reads environment variables
- Exports `comingSoonMode` flag based on `NEXT_PUBLIC_COMING_SOON_MODE`

---

## Styling

- **Background**: `#f5f3ef` (cream/beige)
- **Button Color**: `#d4786c` (coral)
- **Typography**: Serif font family
- **Icons**: Lucide React (Search, Menu, ArrowRight, ChevronUp)

---

## Development

### Setup
```bash
pnpm install
pnpm dev
```

### Build
```bash
pnpm build
pnpm start
```

### Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm lint` - Run ESLint

---

## Configuration Files

- **package.json** - Minimal dependencies (Next.js, React, Tailwind, Lucide)
- **tsconfig.json** - TypeScript configuration
- **next.config.mjs** - Next.js settings
- **postcss.config.mjs** - PostCSS with Tailwind plugin
- **app/globals.css** - Minimal global styles with Tailwind

---

## Key Features

- Minimal design matching mockup exactly
- Responsive layout
- Clean typography with serif fonts
- **Full authentication system with Supabase Auth**
  - Email/password signup and login
  - Google OAuth integration
  - Session management with automatic refresh
  - Row Level Security (RLS) for data protection
- User profile management (first name, last name)
- Toggleable "Coming Soon" mode
- Environment-based configuration
- Server-side rendering with Next.js App Router

---

## Authentication System

### Overview

KEEPERS uses **Supabase Auth** for user authentication and session management. The system supports:
- Email/password authentication
- Google OAuth (configurable)
- Automatic session refresh via middleware
- Secure row-level data access

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Client (Browser)                               │
├─────────────────────────────────────────────────┤
│  - auth-modal.tsx (Login/Signup UI)            │
│  - Uses: lib/auth-actions.ts (Server Actions)  │
└─────────────────────────────────────────────────┘
                    ↓ HTTP Request
┌─────────────────────────────────────────────────┐
│  Server (Next.js)                               │
├─────────────────────────────────────────────────┤
│  - auth-actions.ts (Server Actions)            │
│  - Uses: lib/supabase/server.ts                │
│  - Validates & processes auth requests         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Supabase (Database & Auth)                    │
├─────────────────────────────────────────────────┤
│  - auth.users (managed by Supabase)            │
│  - public.profiles (custom user data)          │
│  - Row Level Security policies                 │
└─────────────────────────────────────────────────┘
```

### Database Schema

**Managed by Supabase:**
- `auth.users` - Core authentication data (email, password hash, metadata)

**Custom Tables:**
- `public.profiles` - Extended user information (first_name, last_name)
  - Automatically created via trigger on user signup
  - Protected by Row Level Security (RLS)

See [sql/schema-supabase.sql](sql/schema-supabase.sql) for complete schema.

### File Organization

**Server-Side (runs on your hosting server):**
- [lib/auth-actions.ts](lib/auth-actions.ts) - Server Actions (`signUp`, `signIn`, `signOut`, `getUserProfile`)
- [lib/supabase/server.ts](lib/supabase/server.ts) - Server Supabase client (uses Next.js `cookies()`)
- [lib/supabase/middleware.ts](lib/supabase/middleware.ts) - Session refresh logic
- [middleware.ts](middleware.ts) - Next.js middleware entry point

**Client-Side (runs in browser):**
- [components/auth-modal.tsx](components/auth-modal.tsx) - Authentication UI
- [components/user-menu.tsx](components/user-menu.tsx) - User dropdown menu
- [lib/supabase/client.ts](lib/supabase/client.ts) - Browser Supabase client

**Shared:**
- [types/auth.ts](types/auth.ts) - TypeScript type definitions
- [lib/validation.ts](lib/validation.ts) - Input validation (email, password)

### Setup Instructions

1. **Create Supabase Project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema:**
   - Open Supabase SQL Editor
   - Copy contents of [sql/schema-supabase.sql](sql/schema-supabase.sql)
   - Execute the SQL to create `profiles` table and triggers

3. **Configure Environment Variables:**
   ```env
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Optional: Enable Google OAuth:**
   - Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials

5. **Optional: Disable Email Confirmation (Development):**
   - Supabase Dashboard → Authentication → Settings
   - Toggle OFF "Enable email confirmations"
   - Allows instant login without email verification

### Security Features

- **Row Level Security (RLS):** Users can only access their own profile data
- **Server-Side Validation:** All auth operations validated server-side
- **Automatic Session Refresh:** Middleware keeps sessions active
- **Secure Cookie Handling:** Different strategies for server/client/edge
- **Password Requirements:** 8+ characters, uppercase, lowercase, number

---

## Coming Soon Mode

The site supports a "coming soon" mode that can be toggled via environment variables. This is useful for deploying before launch.

### Local Development

**Enable Coming Soon Mode:**
1. Create `.env.local` file in project root
2. Add: `NEXT_PUBLIC_COMING_SOON_MODE=true`
3. Restart dev server: `pnpm dev`

**Disable Coming Soon Mode:**
1. Set `NEXT_PUBLIC_COMING_SOON_MODE=false` in `.env.local`
2. Or delete `.env.local` entirely
3. Restart dev server

### Production Deployment (Vercel)

**Via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add variable:
   - **Key**: `NEXT_PUBLIC_COMING_SOON_MODE`
   - **Value**: `true`
   - **Environment**: Production, Preview (as needed)
3. Redeploy

**Via Vercel CLI:**
```bash
vercel env add NEXT_PUBLIC_COMING_SOON_MODE
# Enter value: true
# Select environments: Production, Preview
vercel --prod
```

### What Changes in Coming Soon Mode

| Element | Default Mode | Coming Soon Mode |
|---------|--------------|------------------|
| **Header** | Logo left, search/menu icons right | Centered logo only |
| **Hero CTA** | "Start Your Book" button with arrow | "Coming Soon" text (large, light gray) |
| **Scroll Indicator** | Visible at bottom | Hidden |
| **Headline & Subtext** | Same | Same (unchanged) |

### Files Involved

- **[lib/config.ts](lib/config.ts)** - Reads environment variable
- **[components/header.tsx](components/header.tsx)** - Accepts `variant` and `user` props
- **[components/hero.tsx](components/hero.tsx)** - Accepts `mode` prop
- **[app/page.tsx](app/page.tsx)** - Fetches user and passes props based on config
- **[.env.local.example](.env.local.example)** - Documentation for developers

---

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Optional
```env
NEXT_PUBLIC_COMING_SOON_MODE=false
```

See [.env.local.example](.env.local.example) for complete reference.

---

## Waitlist Feature

### Overview

KEEPERS includes a fully functional waitlist system on a dedicated `/coming-soon` route. Users can submit their email to be notified when the product launches.

### Architecture

**Route**: `/coming-soon` (separate from main landing page)

**Components**:
- [components/coming-soon-hero.tsx](components/coming-soon-hero.tsx) - Hero with "Coming Soon" text and scroll arrow
- [components/waitlist-form.tsx](components/waitlist-form.tsx) - Email signup form with validation
- [components/social-links.tsx](components/social-links.tsx) - Instagram & TikTok links

**Database**: `public.waitlist` table in Supabase
- Email collection with UNIQUE constraint
- IP address and user agent tracking (spam prevention)
- **RLS is DISABLED** (safe for public submissions, no sensitive data)

### Data Flow

1. User enters email in [waitlist-form.tsx](components/waitlist-form.tsx)
2. Client-side validation using [lib/validation.ts](lib/validation.ts)
3. Form calls [lib/waitlist-actions.ts](lib/waitlist-actions.ts) server action
4. Server validates, normalizes email (lowercase + trim)
5. Inserts into `public.waitlist` table via direct Supabase client
6. Handles duplicates gracefully (Postgres error 23505)
7. Shows success message with "Back to top" arrow

### Key Features

- ✅ **Email Validation**: Client + server side
- ✅ **Duplicate Prevention**: UNIQUE constraint + friendly error messages
- ✅ **Success State**: Replaces form with thank you message
- ✅ **Smooth Scrolling**: Hero → Waitlist sections
- ✅ **Social Links**: Sticky footer with Instagram & TikTok
- ✅ **Back to Top**: Arrow on success page
- ✅ **Spam Prevention**: IP & user agent tracking

### Database Setup

Run [sql/waitlist-schema.sql](sql/waitlist-schema.sql) in Supabase SQL Editor:

```sql
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS is DISABLED for public signups
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.waitlist TO anon, authenticated;
```

### Middleware Redirect

When `NEXT_PUBLIC_COMING_SOON_MODE=true`, [middleware.ts](middleware.ts) redirects `/` → `/coming-soon`:

```typescript
if (isComingSoonMode && request.nextUrl.pathname === '/') {
  const url = request.nextUrl.clone();
  url.pathname = '/coming-soon';
  return NextResponse.redirect(url);
}
```

**Important**: Turbopack caches environment variables. After changing `.env.local`, run:
```bash
rm -rf .next && pnpm dev
```

### Social Media Links

Configured in [components/social-links.tsx](components/social-links.tsx):
- **Instagram**: https://www.instagram.com/keepers_id/
- **TikTok**: https://www.tiktok.com/@thisisarinok

Links open in new tabs with `target="_blank"` and `rel="noopener noreferrer"`.

---

**Project Version**: 5.0.0 (With Waitlist Feature)
**Framework**: Next.js 16.0.10 + React 19.2.0 + Supabase 2.89.0
