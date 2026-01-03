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

---

## Project Structure

```
keepers/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main landing page
│   └── globals.css      # Global styles
├── components/
│   ├── header.tsx       # Navigation header
│   └── hero.tsx         # Hero section
├── lib/
│   └── config.ts        # Feature flags & configuration
├── mockup/
│   └── mockup.jpeg      # Design mockup
├── public/              # Static assets
├── .env.local.example   # Environment variables example
├── package.json
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

---

## Components

### Header ([components/header.tsx](components/header.tsx))
- Fixed navigation bar with conditional variants
- **Default Mode**: KEEPERS logo on left, search and menu icons on right
- **Coming Soon Mode**: Centered KEEPERS logo only
- Clean cream background (#f5f3ef)
- Props: `variant?: 'default' | 'coming-soon'`

### Hero ([components/hero.tsx](components/hero.tsx))
- Full-screen centered layout
- Large serif headline: "Your Story, Well Kept."
- Subheading with value proposition
- **Default Mode**: Coral CTA button "Start Your Book" with arrow icon, scroll indicator
- **Coming Soon Mode**: Large "Coming Soon" text, no scroll indicator
- Props: `mode?: 'default' | 'coming-soon'`

### Page ([app/page.tsx](app/page.tsx))
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
- Simple navigation
- Toggleable "Coming Soon" mode
- Environment-based configuration

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
- **[components/header.tsx](components/header.tsx)** - Accepts `variant` prop
- **[components/hero.tsx](components/hero.tsx)** - Accepts `mode` prop
- **[app/page.tsx](app/page.tsx)** - Passes props based on config
- **[.env.local.example](.env.local.example)** - Documentation for developers

---

**Project Version**: 3.0.0 (With Coming Soon Mode)
**Framework**: Next.js 16.0.10 + React 19.2.0
