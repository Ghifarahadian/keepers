# Memorybook - Technical Documentation

> **Project**: Pixory Website Clone - Custom Photobook Landing Page
> **Generated**: v0.app AI-powered UI builder
> **Last Updated**: January 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Component Structure](#component-structure)
5. [Styling System](#styling-system)
6. [Configuration](#configuration)
7. [Development Guide](#development-guide)
8. [Deployment](#deployment)
9. [File Structure Reference](#file-structure-reference)

---

## Project Overview

### What is Memorybook?

Memorybook is a modern e-commerce landing page for a custom photobook creation service. The website showcases premium photobook products with a focus on quality, luxury, and customer satisfaction.

**Brand Identity:**
- **Name**: memorybook
- **Tagline**: "Your moments, forever kept"
- **Value Proposition**: Custom keepsakes with premium quality, fast shipping, and customer satisfaction guarantee

### Key Features

- **Responsive Landing Page** - Mobile-first design with tablet and desktop breakpoints
- **Product Showcase** - Featured photobooks, magazines, and albums with pricing
- **Social Proof** - Customer testimonials, ratings, and user-generated content gallery
- **Theme Support** - Light and dark mode switching
- **Modern UI/UX** - Smooth animations, hover effects, and interactive elements
- **SEO Optimized** - Proper metadata and semantic HTML structure
- **Analytics Integration** - Vercel Analytics for traffic tracking

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.10 | React meta-framework for SSR/SSG |
| **React** | 19.2.0 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |

### Styling & UI

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.1.9 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Accessible component library |
| **Radix UI** | Multiple | Headless UI primitives (25+ packages) |
| **Lucide React** | 0.454.0 | Icon library |
| **next-themes** | 0.4.6 | Theme switching |

### Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **react-hook-form** | 7.60.0 | Form state management |
| **zod** | 3.25.76 | Schema validation |
| **date-fns** | 4.1.0 | Date manipulation |
| **sonner** | 1.7.4 | Toast notifications |
| **embla-carousel-react** | 8.5.1 | Carousel functionality |
| **recharts** | 2.15.4 | Data visualization |
| **Vercel Analytics** | 1.3.1 | Website analytics |

---

## Project Architecture

### Next.js App Router Structure

The project uses Next.js 16's **App Router** pattern (not Pages Router):

```
app/
├── layout.tsx       # Root layout, metadata, providers
├── page.tsx         # Main landing page
└── globals.css      # Global styles and CSS variables
```

### Component Architecture

Components follow a **modular, single-responsibility** pattern:

```
components/
├── Landing Page Sections
│   ├── header.tsx           # Navigation
│   ├── hero.tsx             # Hero section
│   ├── features.tsx         # Feature highlights
│   ├── product-showcase.tsx # Product grid
│   ├── about.tsx            # Mission/values
│   ├── testimonials.tsx     # Customer reviews
│   ├── social.tsx           # Social proof gallery
│   └── footer.tsx           # Footer navigation
├── Providers
│   └── theme-provider.tsx   # Theme context
└── ui/                      # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    └── badge.tsx
```

### Data Flow

1. **Server Components** (default) - Rendered on server, no client-side JS
2. **Client Components** (with "use client") - Interactive components with hooks
3. **No external API** - Static content embedded in components
4. **Future-ready** - Easy to integrate CMS or backend API

---

## Component Structure

### Layout Component (`app/layout.tsx`)

**Purpose**: Root layout that wraps the entire application

**Key Responsibilities**:
- Define metadata (title, description, viewport)
- Load fonts (Geist, Geist Mono)
- Inject global CSS
- Wrap app in ThemeProvider
- Include Vercel Analytics

**Code Location**: [app/layout.tsx](app/layout.tsx)

```typescript
export const metadata: Metadata = {
  title: "memorybook - Your moments, forever kept",
  description: "Create beautiful custom photobooks..."
}
```

---

### Page Component (`app/page.tsx`)

**Purpose**: Main landing page that composes all sections

**Structure**:
```tsx
<Header />
<Hero />
<Features />
<ProductShowcase />
<About />
<Testimonials />
<Social />
<Footer />
```

**Code Location**: [app/page.tsx](app/page.tsx)

---

### Header Component (`components/header.tsx`)

**Purpose**: Sticky navigation with mobile menu

**Features**:
- Logo and brand name
- Desktop navigation (Products, About, Reviews, Contact)
- Authentication buttons (Sign In)
- Primary CTA (Create Book)
- Mobile hamburger menu with overlay

**Key Elements**:
- `sticky top-0` - Stays at top on scroll
- `z-50` - Above other content
- Mobile menu toggle state
- Responsive breakpoints (`md:` prefix)

**Code Location**: [components/header.tsx](components/header.tsx)

---

### Hero Component (`components/hero.tsx`)

**Purpose**: Main value proposition and CTAs

**Content**:
- Badge: "Black Friday Sale - 25% Off All Photobooks"
- Headline: "Your moments, forever kept"
- Subheading: Product description
- Two CTAs: "Shop Photobooks" + "Shop Magazines"
- Trust signals: Fast Shipping, 30-Day Guarantee, 4.8/5 Stars

**Design**:
- Gradient background: `from-blue-50 to-white`
- Large typography: `text-4xl md:text-6xl`
- Button variants: primary + outline

**Code Location**: [components/hero.tsx](components/hero.tsx)

---

### Features Component (`components/features.tsx`)

**Purpose**: Highlight product benefits

**Three Features**:
1. **Printed to Perfection** - Sharp photos, luxurious paper
2. **Crafted to Last** - Premium hardcover, lay-flat binding
3. **Luxury in Every Detail** - Gift packaging

**Layout**:
- 3-column grid on desktop (`grid-cols-1 md:grid-cols-3`)
- Icon + heading + description pattern
- Uses Lucide icons (Printer, Shield, Gift)

**Code Location**: [components/features.tsx](components/features.tsx)

---

### Product Showcase Component (`components/product-showcase.tsx`)

**Purpose**: Display featured products with pricing

**Products**:
1. Classic Photobook - $29.99
2. Premium Magazine - $39.99
3. Luxury Album - $49.99

**Features**:
- Card-based layout
- Product images from `/public`
- "Create Now" CTAs
- Hover effects: `hover:scale-105 transition-transform`

**Code Location**: [components/product-showcase.tsx](components/product-showcase.tsx)

---

### About Component (`components/about.tsx`)

**Purpose**: Company mission and social proof

**Content**:
- Mission statement about preserving memories
- Statistics: 1M+ customers, 3,500+ trees planted, 4.8/5 Trustpilot
- Feature image
- "Learn More" button

**Layout**:
- Two-column grid: text + image
- Responsive stacking on mobile

**Code Location**: [components/about.tsx](components/about.tsx)

---

### Testimonials Component (`components/testimonials.tsx`)

**Purpose**: Display customer reviews

**Content**:
- 6 customer testimonials
- Each with: name, 5-star rating, review text
- Real customer quotes emphasizing quality

**Layout**:
- 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Card-based design
- Star rating visualization

**Code Location**: [components/testimonials.tsx](components/testimonials.tsx)

---

### Social Component (`components/social.tsx`)

**Purpose**: User-generated content gallery and social links

**Content**:
- 8-image grid of customer photobooks
- Social media links (Instagram, Facebook, TikTok, Pinterest)
- "Created by you, loved by us" messaging

**Layout**:
- 4-column grid on desktop
- Responsive grid: `grid-cols-2 md:grid-cols-4`
- Hover effects on images

**Code Location**: [components/social.tsx](components/social.tsx)

---

### Footer Component (`components/footer.tsx`)

**Purpose**: Site-wide navigation footer

**Sections**:
1. **Shop** - Photobooks, Magazines, Albums, Gift Cards
2. **Support** - Help, Shipping, Returns, Contact
3. **Company** - About, Sustainability, Ambassadors, Careers
4. **Social** - Social media links
5. **Copyright** - © 2025 memorybook

**Code Location**: [components/footer.tsx](components/footer.tsx)

---

### UI Components (`components/ui/`)

#### Button Component

**Variants**:
- `default` - Solid blue background
- `outline` - Border only
- `ghost` - Transparent with hover
- `link` - Text link style

**Sizes**:
- `default` - Standard padding
- `sm` - Small
- `lg` - Large
- `icon` - Square icon button

**Code Location**: [components/ui/button.tsx](components/ui/button.tsx)

#### Card Component

**Sub-components**:
- `Card` - Container
- `CardHeader` - Top section
- `CardTitle` - Heading
- `CardDescription` - Subheading
- `CardContent` - Main content
- `CardFooter` - Bottom actions

**Code Location**: [components/ui/card.tsx](components/ui/card.tsx)

#### Badge Component

**Variants**:
- `default` - Solid background
- `secondary` - Muted background
- `outline` - Border only
- `destructive` - Red/warning

**Code Location**: [components/ui/badge.tsx](components/ui/badge.tsx)

---

## Styling System

### Tailwind CSS Configuration

**Version**: 4.1.9 with PostCSS integration

**Theme Configuration** (`components.json`):
```json
{
  "style": "new-york",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

### Color System (OKLCH Color Space)

The project uses **OKLCH** color space for better perceptual uniformity:

**Light Mode Colors**:
```css
--background: oklch(1 0 0);           /* White */
--foreground: oklch(0.15 0 0);        /* Near black */
--primary: oklch(0.35 0.08 264);      /* Deep blue */
--secondary: oklch(0.96 0.01 286);    /* Light blue-gray */
--muted: oklch(0.96 0.01 286);        /* Muted gray */
--accent: oklch(0.96 0.01 286);       /* Accent gray */
```

**Dark Mode Colors**:
```css
--background: oklch(0.15 0 0);        /* Dark gray */
--foreground: oklch(0.98 0 0);        /* Near white */
--primary: oklch(0.7 0.19 262);       /* Bright blue */
/* Other colors adjusted for dark theme */
```

**Why OKLCH?**
- Perceptually uniform (consistent brightness)
- Better color interpolation
- Supports P3 wide gamut
- Future-proof color system

### Typography

**Font Families**:
- **Primary**: Geist (modern sans-serif)
- **Monospace**: Geist Mono

**Font Configuration** ([app/layout.tsx](app/layout.tsx)):
```typescript
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
```

**Usage in CSS**:
```css
body {
  font-family: var(--font-geist-sans), var(--font-geist-mono);
}
```

### Responsive Design

**Breakpoints**:
- **Mobile**: Default (< 768px)
- **Tablet**: `md:` prefix (≥ 768px)
- **Desktop**: `lg:` prefix (≥ 1024px)

**Pattern Example**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

### Animation & Transitions

**Hover Effects**:
```tsx
className="hover:scale-105 transition-transform duration-300"
```

**Opacity Transitions**:
```tsx
className="hover:opacity-80 transition-opacity"
```

**Custom Animations** (tw-animate-css plugin):
- Configured in PostCSS
- Enables Tailwind animation utilities

---

## Configuration

### TypeScript Configuration (`tsconfig.json`)

**Compiler Options**:
```json
{
  "compilerOptions": {
    "lib": ["ES6", "DOM", "ESNext"],
    "target": "ES6",
    "module": "ESNext",
    "jsx": "preserve",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Key Features**:
- Strict mode enabled (type safety)
- Path aliases (`@/components`, `@/lib`)
- ES6 target for modern browsers
- JSX preserved (Next.js transforms)

**Code Location**: [tsconfig.json](tsconfig.json)

---

### Next.js Configuration (`next.config.mjs`)

```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true  // Skip TS errors during build
  },
  images: {
    unoptimized: true        // Allow static export
  }
}
```

**Important Notes**:
- `ignoreBuildErrors` - Should be removed for production
- `unoptimized: true` - Disables Next.js image optimization (for static hosting)

**Code Location**: [next.config.mjs](next.config.mjs)

---

### PostCSS Configuration (`postcss.config.mjs`)

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    "tw-animate-css": {}
  }
}
```

**Plugins**:
- `@tailwindcss/postcss` - Processes Tailwind CSS
- `tw-animate-css` - Adds animation utilities

**Code Location**: [postcss.config.mjs](postcss.config.mjs)

---

### shadcn/ui Configuration (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Key Settings**:
- Style: `new-york` (design variant)
- RSC: `true` (React Server Components)
- CSS Variables: `true` (theme customization)

**Code Location**: [components.json](components.json)

---

### Package Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "next dev",           // Development server (port 3000)
    "build": "next build",       // Production build
    "start": "next start",       // Production server
    "lint": "next lint"          // ESLint checking
  }
}
```

**Usage**:
```bash
pnpm dev      # Start development
pnpm build    # Build for production
pnpm start    # Run production server
pnpm lint     # Check code quality
```

---

## Development Guide

### Prerequisites

- **Node.js**: 18.x or higher
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Git**: Version control
- **Editor**: VS Code recommended (with ESLint, Prettier)

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd kenangan
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Open browser**:
   ```
   http://localhost:3000
   ```

### Project Structure

```
kenangan/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── header.tsx
│   ├── hero.tsx
│   ├── features.tsx
│   ├── product-showcase.tsx
│   ├── about.tsx
│   ├── testimonials.tsx
│   ├── social.tsx
│   ├── footer.tsx
│   ├── theme-provider.tsx
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── badge.tsx
├── lib/
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
│   ├── *.jpg                # Product images
│   ├── *.png                # Logos and icons
│   └── placeholder.svg      # Placeholder image
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── next.config.mjs          # Next.js config
├── components.json          # shadcn/ui config
├── postcss.config.mjs       # PostCSS config
└── README.md                # Project readme
```

### Adding New Components

#### Using shadcn/ui CLI

```bash
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add input
```

This will:
1. Download component from shadcn/ui registry
2. Place it in `components/ui/`
3. Configure with project theme

#### Creating Custom Components

1. **Create component file**:
   ```bash
   touch components/my-component.tsx
   ```

2. **Basic structure**:
   ```tsx
   import { Button } from "@/components/ui/button"

   export function MyComponent() {
     return (
       <div className="container mx-auto">
         <h2 className="text-2xl font-bold">My Component</h2>
         <Button>Click Me</Button>
       </div>
     )
   }
   ```

3. **Import in page**:
   ```tsx
   import { MyComponent } from "@/components/my-component"

   export default function Page() {
     return (
       <>
         <MyComponent />
       </>
     )
   }
   ```

### Styling Guidelines

#### Use Tailwind Utility Classes

```tsx
// Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// Avoid (custom CSS)
<div style={{ display: 'flex', padding: '16px' }}>
```

#### Responsive Design Pattern

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>
```

#### Use CSS Variables for Theme Colors

```tsx
// Good
<div className="bg-primary text-primary-foreground">

// Avoid hardcoded colors
<div className="bg-blue-600 text-white">
```

#### Component Variants with CVA

```tsx
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3"
      }
    }
  }
)
```

### Working with Images

Images are stored in the `public/` directory:

```tsx
import Image from "next/image"

<Image
  src="/photobook-1.jpg"
  alt="Classic Photobook"
  width={400}
  height={400}
  className="rounded-lg"
/>
```

**Note**: `unoptimized: true` in `next.config.mjs` means images are not optimized. For production, remove this and configure image optimization.

### Theme Switching

The project uses `next-themes` for dark mode:

```tsx
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  )
}
```

### TypeScript Best Practices

1. **Use proper types**:
   ```tsx
   interface ProductProps {
     title: string
     price: number
     image: string
   }

   export function Product({ title, price, image }: ProductProps) {
     // Component code
   }
   ```

2. **Avoid `any` type**:
   ```tsx
   // Bad
   const data: any = fetchData()

   // Good
   interface DataType {
     id: number
     name: string
   }
   const data: DataType = fetchData()
   ```

### Linting & Code Quality

Run ESLint:
```bash
pnpm lint
```

Auto-fix issues:
```bash
pnpm lint --fix
```

### Building for Production

1. **Create production build**:
   ```bash
   pnpm build
   ```

2. **Test production build locally**:
   ```bash
   pnpm start
   ```

3. **Check build output**:
   - Build artifacts in `.next/` directory
   - Static assets optimized
   - Bundle size displayed in terminal

---

## Deployment

### Vercel Deployment (Recommended)

This project is configured for Vercel deployment:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update project"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Vercel auto-detects Next.js
   - Deploy automatically

3. **Auto-sync with v0.app**:
   - Changes in v0.app sync to GitHub
   - Vercel redeploys automatically

### Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_ANALYTICS_ID=your_vercel_analytics_id
```

Add environment variables in Vercel dashboard for production.

### Static Export (Alternative)

To export as static HTML:

1. **Update `next.config.mjs`**:
   ```javascript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true
     }
   }
   ```

2. **Build**:
   ```bash
   pnpm build
   ```

3. **Deploy `out/` directory** to any static host (Netlify, GitHub Pages, etc.)

---

## File Structure Reference

### Complete Directory Tree

```
kenangan/
├── .git/                           # Git version control
├── .next/                          # Next.js build output (ignored)
├── node_modules/                   # Dependencies (ignored)
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                 # Root layout, metadata, fonts
│   ├── page.tsx                   # Main landing page
│   ├── globals.css                # Global styles + CSS variables
│   └── favicon.ico                # Site favicon
│
├── components/                    # React components
│   ├── Landing Page Sections:
│   │   ├── header.tsx             # Sticky navigation + mobile menu
│   │   ├── hero.tsx               # Hero section with CTAs
│   │   ├── features.tsx           # 3-column feature highlights
│   │   ├── product-showcase.tsx   # Product grid with pricing
│   │   ├── about.tsx              # Mission + statistics
│   │   ├── testimonials.tsx       # Customer reviews (6 items)
│   │   ├── social.tsx             # UGC gallery + social links
│   │   └── footer.tsx             # Multi-column footer
│   │
│   ├── Providers:
│   │   └── theme-provider.tsx     # Theme context wrapper
│   │
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx             # Button (variants + sizes)
│       ├── card.tsx               # Card + sub-components
│       └── badge.tsx              # Badge component
│
├── lib/
│   └── utils.ts                   # Utility: cn() for className merging
│
├── public/                        # Static assets
│   ├── photobook-1.jpg            # Product image
│   ├── photobook-2.jpg
│   ├── photobook-3.jpg
│   ├── album-1.jpg
│   ├── album-2.jpg
│   ├── logo.png                   # Brand logo
│   ├── icon-*.png                 # App icons (multiple sizes)
│   ├── favicon-*.png              # Favicons
│   ├── social-*.jpg               # UGC gallery images (8 total)
│   └── placeholder.svg            # Placeholder image
│
├── Configuration Files:
│   ├── package.json               # Dependencies + scripts
│   ├── pnpm-lock.yaml             # Dependency lock file
│   ├── tsconfig.json              # TypeScript configuration
│   ├── next.config.mjs            # Next.js configuration
│   ├── components.json            # shadcn/ui configuration
│   ├── postcss.config.mjs         # PostCSS + Tailwind
│   ├── .gitignore                 # Git ignore rules
│   ├── .eslintrc.json             # ESLint configuration
│   └── README.md                  # Project documentation
│
└── styles/
    └── globals.css                # Duplicate global styles (unused?)
```

### Key File Purposes

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, metadata, font loading, theme provider |
| `app/page.tsx` | Main landing page composition |
| `app/globals.css` | CSS variables, theme colors, Tailwind base |
| `components/header.tsx` | Navigation header with mobile menu |
| `components/hero.tsx` | Hero section with primary CTAs |
| `components/features.tsx` | Product benefit highlights |
| `components/product-showcase.tsx` | Featured products grid |
| `components/about.tsx` | Company mission + social proof |
| `components/testimonials.tsx` | Customer reviews |
| `components/social.tsx` | UGC gallery + social links |
| `components/footer.tsx` | Site footer navigation |
| `components/ui/button.tsx` | Reusable button component |
| `components/ui/card.tsx` | Card container component |
| `components/ui/badge.tsx` | Badge/pill component |
| `lib/utils.ts` | `cn()` helper for className merging |
| `package.json` | Project dependencies and scripts |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.mjs` | Next.js build configuration |
| `components.json` | shadcn/ui CLI configuration |
| `postcss.config.mjs` | PostCSS plugins (Tailwind) |

---

## Appendix

### Useful Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# shadcn/ui
npx shadcn@latest add [component]     # Add UI component
npx shadcn@latest add dialog          # Example: Add dialog
npx shadcn@latest diff [component]    # Check component updates

# Git
git status            # Check status
git add .             # Stage all changes
git commit -m "msg"   # Commit changes
git push              # Push to remote
```

### Dependencies Summary

**Total Dependencies**: 40+

**Key Packages**:
- Next.js ecosystem: `next`, `react`, `react-dom`
- TypeScript: `typescript`, `@types/*`
- Radix UI: 25+ headless component packages
- Tailwind: `tailwindcss`, `@tailwindcss/postcss`
- Forms: `react-hook-form`, `zod`, `@hookform/resolvers`
- Utilities: `clsx`, `tailwind-merge`, `class-variance-authority`
- Icons: `lucide-react`
- Theme: `next-themes`
- Analytics: `@vercel/analytics`

### Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **ES6+ Required**: No IE11 support

### Performance Considerations

- **Server Components**: Most components render on server (faster initial load)
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Disabled (`unoptimized: true`) - should be enabled for production
- **Font Loading**: Optimized with `next/font`
- **CSS**: Tailwind JIT (Just-In-Time) compilation

### Security Notes

- **TypeScript Strict Mode**: Enabled for type safety
- **ESLint**: Configured for code quality
- **No Sensitive Data**: All content is public
- **Environment Variables**: Use `.env.local` for secrets

### Future Improvements

1. **Enable TypeScript Build Checks**: Remove `ignoreBuildErrors: true`
2. **Image Optimization**: Enable Next.js image optimization
3. **CMS Integration**: Connect to headless CMS for dynamic content
4. **E-commerce Backend**: Integrate Stripe/Shopify for payments
5. **Form Handling**: Add contact form with validation
6. **SEO**: Add more metadata, Open Graph tags, structured data
7. **Performance**: Lazy load images, optimize bundle size
8. **Accessibility**: WCAG 2.1 AA compliance audit

---

## Support & Resources

### Documentation Links

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **React**: [react.dev](https://react.dev)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)
- **Radix UI**: [radix-ui.com](https://radix-ui.com)
- **TypeScript**: [typescriptlang.org/docs](https://typescriptlang.org/docs)

### Community

- **Next.js Discord**: [discord.gg/nextjs](https://discord.gg/nextjs)
- **Vercel Community**: [github.com/vercel/next.js/discussions](https://github.com/vercel/next.js/discussions)

### Contact

For questions about this project, refer to the original v0.app chat or deployment settings in Vercel.

---

**Documentation Generated**: January 2026
**Project Version**: 1.0.0
**Framework**: Next.js 16.0.10 + React 19.2.0
