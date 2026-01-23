# KEEPERS - Custom Photobook Platform

> **Project**: KEEPERS - Custom Photobook Landing Page & Editor
> **Last Updated**: January 2026

---

## Project Overview

KEEPERS is a custom photobook platform featuring a minimal landing page and a full-featured photobook editor. The design focuses on simplicity with a clean hero section and an intuitive drag-and-drop editor for creating personalized photobooks.

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
| **Supabase** | 2.89.0 | Authentication, Database & Storage |
| **@supabase/ssr** | 0.8.0 | Supabase SSR utilities |
| **@dnd-kit/core** | 6.3.1 | Drag and drop functionality |
| **@dnd-kit/sortable** | 10.0.0 | Sortable drag and drop |
| **@dnd-kit/utilities** | 3.2.2 | DnD utilities |
| **Resend** | 6.6.0 | Email service |

---

## Project Structure

```
keepers/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts    # OAuth & email verification callback handler
│   ├── auth/
│   │   └── confirm/
│   │       ├── page.tsx        # Email verification confirmation page
│   │       └── loading.tsx     # Loading state for verification
│   ├── editor/
│   │   ├── [projectId]/
│   │   │   ├── page.tsx        # Project editor page (Server Component)
│   │   │   └── loading.tsx     # Loading state
│   │   └── new/
│   │       └── page.tsx        # New project / project selector
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main landing page (Server Component)
│   └── globals.css             # Global styles
├── components/
│   ├── auth-modal.tsx          # Authentication modal (Client)
│   ├── header.tsx              # Navigation header (Client)
│   ├── hero.tsx                # Hero section (Client)
│   ├── user-menu.tsx           # User dropdown menu (Client)
│   └── editor/                 # Photobook editor components
│       ├── editor-layout.tsx   # Main editor layout with DnD context
│       ├── editor-top-bar.tsx  # Top navigation bar
│       ├── editor-sidebar.tsx  # Left sidebar (tabs: Photos, Layouts)
│       ├── editor-canvas.tsx   # Main canvas area
│       ├── editor-toolbar.tsx  # Right toolbar panel
│       ├── editor-bottom-bar.tsx # Page navigation bar
│       ├── photo-element.tsx   # Draggable/resizable photo on canvas
│       ├── delete-button.tsx   # Reusable delete button component
│       ├── project-selector-modal.tsx # Project selection modal
│       └── panels/
│           ├── photos-panel.tsx  # Photo upload and library panel
│           └── layouts-panel.tsx # Layout selection panel
├── lib/
│   ├── auth-actions.ts         # Server actions for authentication
│   ├── editor-actions.ts       # Server actions for projects/pages/elements
│   ├── photo-upload-actions.ts # Server actions for photo uploads
│   ├── load-project-photos.ts  # Load and refresh signed URLs for photos
│   ├── config.ts               # Feature flags & configuration
│   ├── validation.ts           # Input validation utilities
│   ├── contexts/
│   │   └── editor-context.tsx  # Editor state management (React Context + Reducer)
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── middleware.ts       # Session refresh logic
├── types/
│   ├── auth.ts                 # TypeScript auth type definitions
│   ├── waitlist.ts             # Waitlist type definitions
│   └── editor.ts               # Editor type definitions (Project, Page, Element, Layout)
├── sql/
│   ├── schema-supabase.sql     # Auth/profiles database schema
│   ├── waitlist-schema.sql     # Waitlist table schema
│   ├── editor-schema.sql       # Editor tables schema (projects, pages, elements)
│   ├── create-storage-bucket.sql # Storage bucket creation SQL
│   ├── storage-setup.md        # Storage setup guide
│   └── README.md               # Database setup instructions
├── scripts/
│   └── test-db-setup.ts        # Database setup verification script
├── mockup/
│   └── mockup.jpeg             # Design mockup
├── email_templates/            # Email HTML templates
│   ├── confirm-signup.html     # Email verification template
│   ├── magic-link.html         # Magic link login template
│   ├── reset-password.html     # Password reset template
│   ├── change-email.html       # Email change confirmation template
│   ├── waitlist-welcome.html   # Waitlist welcome email template
│   └── README.md               # Email template documentation
├── docs/                       # Documentation
│   ├── resend-smtp-setup.md    # Resend SMTP configuration guide
│   ├── email-templates.md      # Email template customization guide
│   ├── SETUP-CHECKLIST.md      # Quick setup checklist
│   └── README.md               # Documentation hub
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
  - **Email verification flow** - Shows "Check Your Email" message when confirmation required
  - Automatic detection of email confirmation status
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
- **Full-featured photobook editor**
  - Drag-and-drop photo placement
  - Multiple page layouts (Blank, Single, Double, Triple, Grid 4, Grid 6)
  - Photo upload with Supabase Storage
  - Project management (create, save, delete)
  - Real-time element positioning and resizing

---

## Authentication System

### Overview

KEEPERS uses **Supabase Auth** for user authentication and session management. The system supports:
- Email/password authentication with **email verification**
- Google OAuth (configurable)
- Automatic session refresh via middleware
- Secure row-level data access
- Custom email templates with unified branding (teal theme)

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
- [components/auth-modal.tsx](components/auth-modal.tsx) - Authentication UI with email verification flow
- [components/user-menu.tsx](components/user-menu.tsx) - User dropdown menu
- [lib/supabase/client.ts](lib/supabase/client.ts) - Browser Supabase client
- [app/auth/confirm/page.tsx](app/auth/confirm/page.tsx) - Email verification confirmation page

**Email Templates:**
- [email_templates/](email_templates/) - Standalone HTML email templates
- [lib/email/send-waitlist-welcome.ts](lib/email/send-waitlist-welcome.ts) - Waitlist email sender (reads from template)

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
- **Email Verification:** Optional email confirmation for new signups

### Email Verification Flow

When email confirmation is enabled in Supabase:

1. **User Registration:**
   - User fills out signup form
   - Server creates account in Supabase
   - Returns `needsEmailConfirmation: true` if verification required

2. **Verification Pending:**
   - Auth modal shows "Check Your Email" message
   - User receives branded verification email (teal theme)
   - Email contains verification link

3. **Email Confirmation:**
   - User clicks link in email
   - Redirected to `/api/auth/callback` (handles OAuth & email verification)
   - Then redirected to `/auth/confirm` for verification processing

4. **Verification Success:**
   - Shows "Email Verified!" success page
   - Auto-redirects to home page after 3 seconds
   - User can now sign in

**Key Files:**
- [lib/auth-actions.ts](lib/auth-actions.ts):33 - Email confirmation detection logic
- [components/auth-modal.tsx](components/auth-modal.tsx):71 - Verification pending UI
- [app/api/auth/callback/route.ts](app/api/auth/callback/route.ts):28 - Callback handler with type detection
- [app/auth/confirm/page.tsx](app/auth/confirm/page.tsx) - Verification confirmation page

---

## Email Templates

KEEPERS includes a complete set of branded email templates with a unified teal theme.

### Template System

All email templates share consistent branding:
- **Teal background** (#2F6F73)
- **Coral accent** (#FF6F61) for buttons
- **White text** (#FDFDFD) for high contrast
- **Serif typography** (Georgia/Cambria) for elegance
- **Rounded buttons** (32px border-radius)
- **Centered layout** with consistent spacing

### Available Templates

| Template | File | Use Case |
|----------|------|----------|
| **Email Verification** | [confirm-signup.html](email_templates/confirm-signup.html) | Sent after user registration |
| **Magic Link** | [magic-link.html](email_templates/magic-link.html) | Passwordless login |
| **Password Reset** | [reset-password.html](email_templates/reset-password.html) | Forgot password flow |
| **Email Change** | [change-email.html](email_templates/change-email.html) | Confirm new email address |
| **Waitlist Welcome** | [waitlist-welcome.html](email_templates/waitlist-welcome.html) | Waitlist signup (auto-sent via Resend) |

### Supabase Email Setup

1. **Configure Resend SMTP** (recommended for production):
   - See [docs/resend-smtp-setup.md](docs/resend-smtp-setup.md) for full guide
   - See [docs/SETUP-CHECKLIST.md](docs/SETUP-CHECKLIST.md) for quick setup
   - Eliminates Supabase rate limits (4 emails/hour → 3,000/month)

2. **Apply Email Templates:**
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Copy HTML from [email_templates/](email_templates/) folder
   - Paste into corresponding Supabase template
   - Save

3. **Enable Email Confirmation:**
   - Supabase Dashboard → Authentication → Settings
   - Toggle ON "Enable email confirmations"
   - Users will now receive verification emails

### Waitlist Email Integration

The waitlist welcome email is **automatically sent** when users sign up on the `/coming-soon` page:

- **Template File:** [email_templates/waitlist-welcome.html](email_templates/waitlist-welcome.html)
- **Sender Code:** [lib/email/send-waitlist-welcome.ts](lib/email/send-waitlist-welcome.ts)
- **How it works:** Code reads HTML template, replaces `{{EMAIL}}` and `{{UNSUBSCRIBE_URL}}` variables, sends via Resend API
- **To customize:** Edit the HTML file directly, restart server

### Template Customization

All templates use inline styles (required for email clients). To modify:

1. **Edit HTML directly:** Open any `.html` file in [email_templates/](email_templates/)
2. **Update inline styles:** Change colors, fonts, spacing as needed
3. **For Supabase templates:** Copy updated HTML and paste into Supabase
4. **For waitlist template:** Just restart your server

See [email_templates/README.md](email_templates/README.md) for detailed customization guide.

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
- **TikTok**: https://www.tiktok.com/@keepers_id

Links open in new tabs with `target="_blank"` and `rel="noopener noreferrer"`.

---

## Photobook Editor

### Overview

KEEPERS includes a full-featured photobook editor that allows authenticated users to create, edit, and manage custom photobooks. The editor features drag-and-drop photo placement, multiple layout options, and real-time saving.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Editor Page (/editor/[projectId])                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  EditorProvider (React Context)                           │  │
│  │  - State: project, pages, elements, uploadedPhotos        │  │
│  │  - Actions: addElement, updateElement, deleteElement      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DndContext (@dnd-kit)                                    │  │
│  │  - Drag photos from sidebar to canvas                     │  │
│  │  - Handles drag start/end events                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌─────────┬────────────────────────────┬──────────────────┐   │
│  │ Sidebar │         Canvas             │     Toolbar      │   │
│  │ (Photos)│   (Page with Elements)     │   (Properties)   │   │
│  │ (Layout)│                            │                  │   │
│  └─────────┴────────────────────────────┴──────────────────┘   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Bottom Bar (Page Navigation)                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Routes

| Route | Description |
|-------|-------------|
| `/editor/new` | Project selector - create new or open existing project |
| `/editor/[projectId]` | Edit a specific project |

### Data Model

**Projects** (`public.projects`)
- `id` (UUID) - Primary key
- `user_id` (UUID) - Owner (references auth.users)
- `title` (VARCHAR) - Project name
- `cover_photo_url` (TEXT) - Cover image URL
- `status` (VARCHAR) - draft, completed, archived
- `last_edited_at` (TIMESTAMPTZ) - Last modification time
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Pages** (`public.pages`)
- `id` (UUID) - Primary key
- `project_id` (UUID) - Parent project
- `page_number` (INT) - Order in project
- `layout_id` (VARCHAR) - Layout template ID
- `title` (VARCHAR) - Optional page title
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Elements** (`public.elements`)
- `id` (UUID) - Primary key
- `page_id` (UUID) - Parent page
- `type` (VARCHAR) - 'photo' or 'text'
- `photo_url` (TEXT) - Signed URL for display
- `photo_storage_path` (TEXT) - Storage path for regenerating URLs
- `position_x`, `position_y` (FLOAT) - Position as percentage (0-100)
- `width`, `height` (FLOAT) - Size as percentage (0-100)
- `rotation` (FLOAT) - Rotation in degrees
- `z_index` (INT) - Layer order
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Pre-defined Layouts

| Layout ID | Name | Description |
|-----------|------|-------------|
| `blank` | Blank | Empty page with no photo zones |
| `single` | Single | One large photo centered |
| `double` | Double | Two photos side by side |
| `triple` | Triple | One large photo with two smaller ones |
| `grid-4` | Grid 4 | 2x2 grid of equal photos |
| `grid-6` | Grid 6 | 2x3 grid of equal photos |

Layouts are defined in [types/editor.ts](types/editor.ts) with zone positions as percentages.

### Photo Storage

Photos are stored in Supabase Storage in a private bucket called `project-photos`.

**Storage Structure:**
```
project-photos/
└── {user_id}/
    └── {project_id}/
        ├── 1234567890-abc123.jpg
        ├── 1234567891-def456.png
        └── ...
```

**Key Features:**
- Private bucket with RLS policies
- Users can only access their own photos
- Signed URLs (1-year expiry) for secure access
- URLs regenerated on project load via [lib/load-project-photos.ts](lib/load-project-photos.ts)
- Max file size: 10MB
- Supported formats: JPEG, PNG, WEBP, HEIC

### Server Actions

**Project Actions** ([lib/editor-actions.ts](lib/editor-actions.ts)):
- `createProject(input?)` - Create new project with first page
- `getProject(projectId)` - Fetch project with pages and elements
- `updateProject(projectId, updates)` - Update project metadata
- `deleteProject(projectId)` - Delete project and all related data
- `getUserProjects()` - List all projects for current user

**Page Actions**:
- `createPage(input)` - Add page to project
- `updatePage(pageId, updates)` - Update page (layout, title)
- `deletePage(pageId, projectId)` - Remove page
- `reorderPages(projectId, pageIds)` - Reorder pages

**Element Actions**:
- `createElement(input)` - Add element to page
- `updateElement(elementId, updates)` - Update element position/properties
- `deleteElement(elementId)` - Remove element
- `batchUpdateElements(updates)` - Update multiple elements
- `batchDeleteElements(elementIds)` - Delete multiple elements

**Photo Actions** ([lib/photo-upload-actions.ts](lib/photo-upload-actions.ts)):
- `uploadPhoto(file, projectId)` - Upload single photo
- `uploadMultiplePhotos(files, projectId)` - Upload multiple photos
- `deletePhoto(path)` - Delete photo from storage
- `deleteMultiplePhotos(paths)` - Delete multiple photos
- `getPhotoUrl(path)` - Get signed URL for photo
- `listProjectPhotos(projectId)` - List all photos in project

### Editor State Management

The editor uses React Context with useReducer for state management ([lib/contexts/editor-context.tsx](lib/contexts/editor-context.tsx)).

**State:**
```typescript
interface EditorState {
  project: Project
  pages: Page[]
  currentPageId: string
  elements: Record<string, Element[]> // Keyed by pageId
  uploadedPhotos: UploadedPhoto[]
  selectedElementId: string | null
  isSaving: boolean
  lastSaved: string | null
  error: string | null
}
```

**Available Actions:**
- `SET_PROJECT`, `SET_PAGES`, `SET_CURRENT_PAGE`
- `UPDATE_PROJECT_TITLE`, `ADD_PAGE`, `DELETE_PAGE`, `REORDER_PAGES`
- `UPDATE_PAGE_LAYOUT`, `SET_ELEMENTS`, `ADD_ELEMENT`
- `UPDATE_ELEMENT`, `DELETE_ELEMENT`, `SELECT_ELEMENT`
- `ADD_UPLOADED_PHOTO`, `REMOVE_UPLOADED_PHOTO`
- `SET_SAVING`, `SET_LAST_SAVED`, `SET_ERROR`

### Editor Components

| Component | Description |
|-----------|-------------|
| [EditorLayout](components/editor/editor-layout.tsx) | Main layout with DnD context |
| [EditorTopBar](components/editor/editor-top-bar.tsx) | Project title, save status, navigation |
| [EditorSidebar](components/editor/editor-sidebar.tsx) | Tabbed sidebar (Photos, Layouts) |
| [EditorCanvas](components/editor/editor-canvas.tsx) | Main editing canvas with drop zone |
| [EditorToolbar](components/editor/editor-toolbar.tsx) | Right panel for element properties |
| [EditorBottomBar](components/editor/editor-bottom-bar.tsx) | Page thumbnails navigation |
| [PhotoElement](components/editor/photo-element.tsx) | Draggable/resizable photo on canvas |
| [PhotosPanel](components/editor/panels/photos-panel.tsx) | Photo upload and library |
| [LayoutsPanel](components/editor/panels/layouts-panel.tsx) | Layout template selection |
| [ProjectSelectorModal](components/editor/project-selector-modal.tsx) | Create/open project modal |

### Database Setup

Run [sql/editor-schema.sql](sql/editor-schema.sql) in Supabase SQL Editor to create:
- `public.projects` table with RLS
- `public.pages` table with RLS
- `public.elements` table with RLS
- Triggers for `updated_at` and `last_edited_at`

Then set up storage bucket following [sql/storage-setup.md](sql/storage-setup.md):
1. Create `project-photos` bucket (private)
2. Run storage policies from [sql/create-storage-bucket.sql](sql/create-storage-bucket.sql)

Verify setup with:
```bash
npx tsx scripts/test-db-setup.ts
```

### Security

- **Row Level Security (RLS):** All tables protected
  - Users can only access their own projects
  - Pages inherit access from project ownership
  - Elements inherit access from page → project ownership
- **Storage Policies:** Users can only upload/view/delete photos in their own folder
- **Server-Side Auth:** All actions verify user authentication
- **Path Validation:** Photo deletion verifies path ownership

---

**Project Version**: 6.0.0 (With Photobook Editor)
**Framework**: Next.js 16.0.10 + React 19.2.0 + Supabase 2.89.0
