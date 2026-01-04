# KEEPERS

A minimal, elegant landing page for a custom photobook service.

![KEEPERS Landing Page](mockup/mockup.jpeg)

## Features

- Clean, minimal design
- Responsive layout
- Serif typography
- **Full authentication system** (Supabase Auth)
  - Email/password signup and login
  - Google OAuth integration
  - User profile management
  - Automatic session refresh
- **Coming Soon Page** with waitlist
  - Email collection with validation
  - Supabase database integration
  - Social media links (Instagram, TikTok)
  - Smooth scroll between sections
  - Success confirmation page
- Toggleable landing/coming-soon modes
- Environment-based configuration

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Supabase** - Authentication & Database

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database schemas in Supabase SQL Editor:
   - `sql/schema-supabase.sql` (auth profiles table)
   - `sql/waitlist-schema.sql` (waitlist table)
3. Get your project URL and anon key from Supabase Dashboard → Settings → API

### 3. Configure Environment

Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
keepers/
├── app/                      # Next.js app directory
│   ├── api/auth/             # Authentication API routes
│   ├── coming-soon/          # Coming soon page route
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page (Server Component)
├── components/               # React components
│   ├── auth-modal.tsx        # Login/Signup modal
│   ├── auth-user-menu.tsx    # User dropdown menu
│   ├── coming-soon-hero.tsx  # Coming soon hero section
│   ├── header.tsx            # Navigation header
│   ├── landing-hero.tsx      # Landing page hero
│   ├── social-links.tsx      # Social media icons
│   └── waitlist-form.tsx     # Email waitlist form
├── lib/                      # Business logic & utilities
│   ├── auth-actions.ts       # Auth server actions
│   ├── waitlist-actions.ts   # Waitlist server actions
│   ├── supabase/             # Supabase clients
│   └── validation.ts         # Input validation
├── types/                    # TypeScript definitions
│   ├── auth.ts               # Auth types
│   └── waitlist.ts           # Waitlist types
├── sql/                      # Database schemas
│   ├── schema-supabase.sql   # Auth & profiles
│   └── waitlist-schema.sql   # Waitlist table
├── middleware.ts             # Session refresh & redirects
├── mockup/                   # Design mockup
├── public/                   # Static assets
└── CLAUDE.md                 # Detailed documentation
```

## Coming Soon Mode

Toggle between full landing page and "coming soon" page with waitlist using environment variables.

### What Changes

- **`NEXT_PUBLIC_COMING_SOON_MODE=true`**: Redirects `/` to `/coming-soon` page
  - Shows waitlist form for email collection
  - Displays social media links
  - Simple centered header

- **`NEXT_PUBLIC_COMING_SOON_MODE=false`** (or unset): Shows full landing page
  - "Start Your Book" CTA button
  - Full navigation with search and login

### Quick Start

1. Copy `.env.local.example` to `.env.local`
2. Set `NEXT_PUBLIC_COMING_SOON_MODE=true`
3. **Important**: Delete `.next` folder and restart dev server
   ```bash
   rm -rf .next && pnpm dev
   ```

### Vercel Deployment

Add environment variables in Vercel Dashboard:

**Authentication (Required):**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_SITE_URL` - Your production URL (e.g., `https://keepers.com`)

**Coming Soon Mode (Optional):**
- `NEXT_PUBLIC_COMING_SOON_MODE` - Set to `true` to enable

See [CLAUDE.md](CLAUDE.md) for detailed documentation.

## Authentication

KEEPERS uses Supabase Auth with:
- Email/password authentication
- Google OAuth support
- Automatic session management
- Row Level Security for data protection

See [sql/README.md](sql/README.md) for database setup instructions.

## License

Private project.
