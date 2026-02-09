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
│   ├── admin/                  # Admin panel (protected)
│   │   ├── layout.tsx          # Admin shell with sidebar
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── layouts/            # Layout management
│   │   │   ├── page.tsx        # Layouts list
│   │   │   ├── new/page.tsx    # Create layout
│   │   │   └── [layoutId]/page.tsx  # Edit layout
│   │   ├── templates/          # Template management
│   │   │   ├── page.tsx        # Templates list
│   │   │   ├── new/page.tsx    # Create template
│   │   │   └── [templateId]/page.tsx  # Edit template
│   │   ├── categories/         # Category management
│   │   │   └── page.tsx        # Categories list
│   │   └── vouchers/           # Voucher management
│   │       ├── page.tsx        # Vouchers list with stats
│   │       └── new/page.tsx    # Create voucher
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
│   │   │   ├── loading.tsx     # Loading state
│   │   │   └── preview/        # Preview and order confirmation
│   │   │       ├── page.tsx    # Preview page (Server Component)
│   │   │       └── loading.tsx # Loading state
│   │   └── new/
│   │       └── page.tsx        # New project / project selector
│   ├── profile/                # User profile management
│   │   ├── page.tsx            # Profile page (Server Component)
│   │   ├── profile-client.tsx  # Profile form (Client Component)
│   │   └── loading.tsx         # Loading state
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main landing page (Server Component)
│   └── globals.css             # Global styles
├── components/
│   ├── admin/                  # Admin UI components
│   │   ├── admin-sidebar.tsx   # Admin navigation sidebar
│   │   ├── layouts/            # Layout admin components
│   │   │   ├── layout-list.tsx # Layouts table
│   │   │   ├── layout-form.tsx # Create/edit form
│   │   │   └── zone-editor.tsx # Visual zone editor canvas
│   │   ├── templates/          # Template admin components
│   │   │   ├── template-list.tsx  # Templates grid
│   │   │   ├── template-form.tsx  # Create/edit form
│   │   │   └── page-builder.tsx   # Page ordering/layout assignment
│   │   ├── categories/
│   │   │   └── category-list.tsx  # Inline category editor
│   │   └── vouchers/           # Voucher admin components
│   │       ├── voucher-list.tsx   # Vouchers table with status
│   │       └── voucher-form.tsx   # Create/edit voucher form
│   ├── auth-modal.tsx          # Authentication modal (Client)
│   ├── header.tsx              # Navigation header (Client)
│   ├── hero.tsx                # Hero section (Client)
│   ├── user-menu.tsx           # User dropdown menu (Client)
│   └── editor/                 # Photobook editor components
│       ├── layout.tsx          # Main editor layout with DnD context
│       ├── top-bar.tsx         # Top navigation bar
│       ├── sidebar.tsx         # Left sidebar (tabs: Photos, Layouts)
│       ├── canvas.tsx          # Main canvas area with zone rendering
│       ├── toolbar.tsx         # Right toolbar panel
│       ├── bottom-bar.tsx      # Page navigation bar
│       ├── elements/           # Canvas element components
│       │   └── zone-container.tsx  # Resizable layout zone container with photo rendering
│       ├── modals/             # Modal components
│       │   ├── project-selector.tsx # Project selection modal
│       │   └── template-browser.tsx # Template browser modal
│       ├── preview/            # Preview and order components
│       │   ├── preview-content.tsx  # Main preview/order page
│       │   └── success-modal.tsx    # Order confirmation modal
│       ├── ui/                 # Reusable UI components
│       │   └── delete-button.tsx   # Reusable delete button
│       └── panels/
│           ├── photos-panel.tsx  # Photo upload and library panel
│           └── layouts-panel.tsx # Layout selection panel (fetches from DB)
├── lib/
│   ├── auth-actions.ts         # Server actions for authentication
│   ├── editor-actions.ts       # Server actions for projects/pages/elements/zones
│   ├── layout-actions.ts       # Server actions for layouts (public)
│   ├── template-actions.ts     # Server actions for templates (public)
│   ├── admin-actions.ts        # Server actions for admin CRUD operations
│   ├── voucher-actions.ts      # Server actions for voucher validation and redemption
│   ├── photo-upload-actions.ts # Server actions for photo uploads
│   ├── load-project-photos.ts  # Load and refresh signed URLs for photos
│   ├── config.ts               # Feature flags & configuration
│   ├── validation.ts           # Input validation utilities
│   ├── contexts/
│   │   └── editor-context.tsx  # Editor state management (React Context + Reducer)
│   ├── email/
│   │   ├── send-waitlist-welcome.ts      # Waitlist welcome email sender
│   │   └── send-order-confirmation.ts    # Order confirmation email sender
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── middleware.ts       # Session refresh logic
├── types/
│   ├── auth.ts                 # TypeScript auth type definitions
│   ├── waitlist.ts             # Waitlist type definitions
│   ├── editor.ts               # Editor type definitions (Project, Page, PageZone, Element, Layout)
│   ├── template.ts             # Template system type definitions
│   └── voucher.ts              # Voucher type definitions
├── sql/
│   ├── setup.sql               # Complete consolidated database schema (includes templates)
│   ├── storage-setup.md        # Storage bucket setup guide
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
│   ├── order-confirmation.html # Order confirmation email template
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

## Database Schema & Relationships

### Overview

KEEPERS uses Supabase (PostgreSQL) with Row Level Security (RLS) for all data access. The schema follows a clear hierarchy: **Users → Projects → Pages → Zones → Elements**. Each level enforces ownership and access control through RLS policies.

### Core Principles

1. **Zone-Based Architecture**: Elements are directly related to zones (not pages), providing cleaner relationships
2. **Cascade Deletes**: Foreign keys with `ON DELETE CASCADE` ensure data integrity
3. **Row Level Security**: All tables protected with RLS policies checking user ownership
4. **Unified Zones**: Single `zones` table serves both layout templates and page zones

### Table Hierarchy

```
auth.users (Supabase managed)
    ↓
profiles (user details + delivery info)
    ↓
projects (photobooks)
    ↓
pages (spreads in a project)
    ↓
zones (photo/text containers on pages)
    ↓
elements (photos/text within zones)
```

### Tables & Relationships

#### 1. **profiles** (`public.profiles`)
Extended user information linked to Supabase Auth.

**Schema:**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  address TEXT,
  postal_code VARCHAR(20),
  phone_number VARCHAR(30),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- **1:1** with `auth.users` (Supabase Auth)
- **1:N** with `projects` (a user can have many projects)

**Key Points:**
- Auto-created via trigger when user signs up
- Includes delivery information for photobook orders
- `is_admin` flag for admin panel access

---

#### 2. **projects** (`public.projects`)
User photobook projects with configuration.

**Schema:**
```sql
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Project',
  cover_photo_url TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, processed, shipped, completed
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  page_count INT CHECK (page_count IN (30, 40)),
  paper_size VARCHAR(10) CHECK (paper_size IN ('A4', 'A5', 'PDF Only')),
  voucher_code VARCHAR(50),
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- **N:1** with `profiles` (many projects belong to one user)
- **1:N** with `pages` (a project has many pages)
- **N:1** with `templates` (optional, for template-based projects)
- **1:1** with `vouchers` (optional, via voucher_code)

**Key Points:**
- Users can only access their own projects (RLS enforced)
- `last_edited_at` auto-updates on page/zone/element changes
- Product configuration: page_count (30/40) and paper_size (A4/A5/PDF)

---

#### 3. **pages** (`public.pages`)
Individual pages within a project (part of spreads).

**Schema:**
```sql
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, page_number)
);
```

**Relationships:**
- **N:1** with `projects` (many pages belong to one project)
- **1:N** with `zones` (a page has many zones)

**Key Points:**
- Pages ONLY belong to projects (no template relationship)
- Pages are created in pairs (spreads: left + right)
- Page numbers are unique within a project
- Users can only access pages from their own projects (RLS enforced)

---

#### 4. **layouts** (`public.layouts`)
Reusable layout templates defining zone configurations.

**Schema:**
```sql
CREATE TABLE public.layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  thumbnail_url TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- **1:N** with `zones` (layout template zones)

**Key Points:**
- System layouts (blank, single, double, triple, grid-4, grid-6) cannot be deleted
- Admins can create custom layouts
- All users can view active layouts

---

#### 5. **zones** (`public.zones`)
**UNIFIED TABLE**: Serves both layout templates (layout_id) and page instances (page_id).

**Schema:**
```sql
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id UUID REFERENCES public.layouts(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  zone_index INT NOT NULL,
  zone_type VARCHAR(10) NOT NULL DEFAULT 'photo' CHECK (zone_type IN ('photo', 'text')),
  position_x FLOAT NOT NULL,  -- Percentage (0-100)
  position_y FLOAT NOT NULL,  -- Percentage (0-100)
  width FLOAT NOT NULL,       -- Percentage (0-100)
  height FLOAT NOT NULL,      -- Percentage (0-100)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (layout_id IS NOT NULL AND page_id IS NULL) OR
    (page_id IS NOT NULL AND layout_id IS NULL)
  ),
  UNIQUE(layout_id, zone_index),
  UNIQUE(page_id, zone_index)
);
```

**Relationships:**
- **N:1** with `layouts` (layout zones belong to a layout)
- **N:1** with `pages` (page zones belong to a page)
- **1:1** with `elements` (a zone has at most one element)

**Key Points:**
- **Layout zones** (`layout_id` set): Template definitions for reuse
- **Page zones** (`page_id` set): Actual zones on user pages (copied from layouts)
- Users can customize zone positions/sizes after applying a layout
- Positions are percentages (0-100) for responsive rendering
- Deleting a zone cascades to delete its element (1:1 relationship)

---

#### 6. **elements** (`public.elements`)
**ONE-TO-ONE WITH ZONES**: Photos or text within a zone.

**Schema:**
```sql
CREATE TABLE public.elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL UNIQUE REFERENCES public.zones(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('photo', 'text')),

  -- Photo fields
  photo_url TEXT,
  photo_storage_path TEXT,

  -- Text fields
  text_content TEXT,
  font_family VARCHAR(100),
  font_size INT,
  font_color VARCHAR(20),
  font_weight VARCHAR(20) DEFAULT 'normal',
  font_style VARCHAR(20) DEFAULT 'normal',
  text_align VARCHAR(20) DEFAULT 'left',
  text_decoration VARCHAR(20) DEFAULT 'none',

  -- Position/size RELATIVE TO ZONE (for cropping/zooming)
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  rotation FLOAT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- **1:1** with `zones` (one zone has exactly one element)

**Key Points:**
- Elements are **directly related to zones** via `zone_id` (NOT to pages)
- **UNIQUE constraint on zone_id** enforces 1:1 relationship
- One zone = one element maximum (no layering, no z_index)
- Position/size are relative to the zone (for panning/zooming within zone)
- Deleting a zone automatically deletes its element (cascade)
- Users can only access elements from their own project zones (RLS enforced via zones → pages → projects chain)

---

#### 7. **templates** (`public.templates`)
Pre-designed photobook templates for users to start from.

**Schema:**
```sql
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  preview_images JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  page_count INT CHECK (page_count IN (30, 40)),
  paper_size VARCHAR(10) CHECK (paper_size IN ('A4', 'A5', 'PDF Only')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- **N:1** with `template_categories`
- **1:N** with `projects` (optional reference)

**Key Points:**
- Templates provide preset configurations for projects
- Admins can create/manage templates
- All users can view active templates

---

#### 8. **vouchers** (`public.vouchers`)
Pre-generated voucher codes for photobook redemption.

**Schema:**
```sql
CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'not_redeemed',
  -- Status: not_redeemed, being_redeemed, fully_redeemed
  page_count INT CHECK (page_count IN (30, 40)),
  paper_size VARCHAR(10) CHECK (paper_size IN ('A4', 'A5', 'PDF Only')),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  redeemed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- **1:1** with `projects` (optional, voucher can be linked to a project)
- **N:1** with `profiles` (optional, user who redeemed)

**Key Points:**
- Three-state lifecycle: not_redeemed → being_redeemed → fully_redeemed
- Admins create vouchers with product configuration
- Users validate and apply vouchers during project creation
- Voucher reverts to `not_redeemed` if draft project is deleted

---

#### 9. **waitlist** (`public.waitlist`)
Email waitlist for "Coming Soon" mode.

**Schema:**
```sql
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  unsubscribed BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Points:**
- No RLS (safe for public submissions)
- Unique email constraint prevents duplicates
- IP and user agent tracking for spam prevention

---

### Entity Relationship Diagram

```
┌─────────────┐
│ auth.users  │ (Supabase managed)
└──────┬──────┘
       │
       │ 1:1
       ↓
┌─────────────┐
│  profiles   │ (user details + is_admin)
└──────┬──────┘
       │
       │ 1:N
       ↓
┌─────────────┐      N:1        ┌──────────────┐
│  projects   │◄─────────────────│  templates   │
└──────┬──────┘                  └──────────────┘
       │
       │ 1:N
       ↓
┌─────────────┐
│    pages    │ (spreads in project)
└──────┬──────┘
       │
       │ 1:N
       ↓
┌─────────────┐      N:1        ┌──────────────┐
│    zones    │◄─────────────────│   layouts    │
│  (unified)  │                  │  (templates) │
└──────┬──────┘                  └──────────────┘
       │
       │ 1:N
       ↓
┌─────────────┐
│  elements   │ (photos/text in zones)
└─────────────┘

Additional:
┌──────────────┐      N:1        ┌──────────────────────┐
│  templates   │◄─────────────────│ template_categories  │
└──────────────┘                  └──────────────────────┘

┌──────────────┐      1:1        ┌─────────────┐
│  vouchers    │◄─────────────────│  projects   │
└──────────────┘                  └─────────────┘
```

### Access Control (RLS Policies)

**profiles**:
- Users can view/update their own profile
- Auto-created on signup

**projects**:
- Users can CRUD their own projects
- Filtering: `user_id = auth.uid()`

**pages**:
- Users can CRUD pages from their own projects
- Filtering: `EXISTS (projects WHERE user_id = auth.uid())`

**zones**:
- Layout zones: Anyone can view active layouts (admins can manage)
- Page zones: Users can manage zones on their own project pages
- Filtering: `EXISTS (pages → projects WHERE user_id = auth.uid())`

**elements**:
- Users can CRUD elements in zones on their own project pages
- Filtering: `EXISTS (zones → pages → projects WHERE user_id = auth.uid())`

**layouts/templates/categories**:
- All users can view active entries
- Only admins can create/update/delete

**vouchers**:
- All authenticated users can view and redeem vouchers
- Only admins can create/delete vouchers

### Storage Buckets

**project-photos** (private):
- User uploads: `{user_id}/{project_id}/{filename}`
- RLS policies enforce user_id folder access
- Max file size: 10MB
- Signed URLs (1-year expiry)

**template-assets** (public):
- Admin uploads: template thumbnails and previews
- Public read access
- Admin-only write access

### Triggers

1. **on_auth_user_created**: Auto-creates profile when user signs up
2. **on_profile_updated**: Updates `updated_at` timestamp
3. **on_page_modified**: Updates project's `last_edited_at` when pages change
4. **on_element_modified**: Updates project's `last_edited_at` when elements change (via zones → pages → projects chain)
5. **on_zone_updated**: Updates `updated_at` timestamp

### Important Design Decisions

1. **One-to-One: Elements ↔ Zones**:
   - **UNIQUE constraint on `zone_id`** enforces strict 1:1 relationship
   - One zone can have at most one element (photo or text)
   - Simplifies state management: no z_index, no layering
   - Clear semantics: zone = container, element = content

2. **Elements → Zones (NOT Pages)**:
   - Elements have direct FK to zones (`zone_id`), not to pages
   - Cleaner relationships: element position is relative to its zone
   - Cascade deletes work correctly: delete zone → deletes element

3. **Pages → Projects ONLY**:
   - Pages do NOT have `template_id` relationship
   - Templates define configurations, not page instances
   - Simpler data model: pages always belong to projects

4. **Unified Zones Table**:
   - Single table for layout template zones and page zones
   - CHECK constraint ensures exactly one of `layout_id` or `page_id` is set
   - Reduces duplication and simplifies queries

5. **Percentage-Based Positioning**:
   - All positions/sizes stored as percentages (0-100)
   - Responsive rendering across different screen sizes
   - Element positions relative to zone (for cropping/panning)

### Complete Schema Reference

See [sql/setup.sql](sql/setup.sql) for the complete schema with all constraints, indexes, and RLS policies.

For database reset (non-production): [sql/reset.sql](sql/reset.sql)

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
  - Session management with automatic refresh
  - Row Level Security (RLS) for data protection
- **User profile management**
  - Personal information (first name, last name)
  - Delivery information (address, postal code, phone number)
  - Profile page at `/profile` for editing details
- **Full-featured photobook editor**
  - Drag-and-drop photo placement
  - Customizable layout zones (resizable and repositionable)
  - Multiple page layouts (Blank, Single, Double, Triple, Grid 4, Grid 6)
  - Photo upload with Supabase Storage
  - Project management (create, save, delete)
  - Real-time element positioning and resizing
  - Product configuration (page count: 30/40, paper size: A4/A5)
- **Template system**
  - Pre-designed templates (vacation, wedding, baby, etc.)
  - Template browser with category filtering
  - Create projects from templates with preset pages/layouts
- **Voucher & order management system**
  - Pre-generated voucher codes with product configuration
  - Three-state voucher lifecycle (not_redeemed, being_redeemed, fully_redeemed)
  - Voucher validation during project creation
  - Preview and order confirmation page
  - Automatic order confirmation emails
  - Admin voucher management dashboard
- **Admin panel** (`/admin`)
  - Visual zone editor for creating layouts
  - Template management with page builder
  - Category management
  - Voucher code generation and tracking
- Toggleable "Coming Soon" mode
- Environment-based configuration
- Server-side rendering with Next.js App Router

---

## Authentication System

### Overview

KEEPERS uses **Supabase Auth** for user authentication and session management. The system supports:
- Email/password authentication with **email verification**
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
- `public.profiles` - Extended user information (first_name, last_name, address, postal_code, phone_number, is_admin)
  - Automatically created via trigger on user signup
  - Protected by Row Level Security (RLS)
  - Includes delivery information for orders

See [sql/setup.sql](sql/setup.sql) for complete schema.

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
   - Copy contents of [sql/setup.sql](sql/setup.sql)
   - Execute the SQL to create all tables, triggers, and RLS policies

3. **Configure Environment Variables:**
   ```env
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Optional: Disable Email Confirmation (Development):**
   - Supabase Dashboard → Authentication → Settings
   - Toggle OFF "Enable email confirmations"
   - Allows instant login without email verification
   - **Not recommended for production**

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
| **Order Confirmation** | [order-confirmation.html](email_templates/order-confirmation.html) | Order confirmation after voucher redemption (auto-sent) |

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

### Order Confirmation Email Integration

The order confirmation email is **automatically sent** when users successfully redeem a voucher:

- **Template File:** [email_templates/order-confirmation.html](email_templates/order-confirmation.html)
- **Sender Code:** [lib/email/send-order-confirmation.ts](lib/email/send-order-confirmation.ts)
- **Trigger:** Called by `redeemVoucher()` in [lib/voucher-actions.ts](lib/voucher-actions.ts)
- **How it works:** Code reads HTML template, replaces variables (`{{CUSTOMER_NAME}}`, `{{PROJECT_TITLE}}`, `{{PAGE_COUNT}}`, `{{ORDER_DATE}}`, `{{VOUCHER_CODE}}`, `{{ADDRESS}}`, `{{POSTAL_CODE}}`, `{{PHONE_NUMBER}}`, `{{EMAIL}}`), sends via Resend API
- **Template Variables:**
  - Customer information from user profile
  - Project details (title, page count)
  - Order details (voucher code, order date)
  - Delivery information (address, postal code, phone number)
- **To customize:** Edit the HTML file directly, restart server
- **Error Handling:** Email failures are logged but don't prevent voucher redemption

### Template Customization

All templates use inline styles (required for email clients). To modify:

1. **Edit HTML directly:** Open any `.html` file in [email_templates/](email_templates/)
2. **Update inline styles:** Change colors, fonts, spacing as needed
3. **For Supabase templates:** Copy updated HTML and paste into Supabase
4. **For auto-sent templates** (waitlist, order confirmation): Just restart your server

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
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Optional
```env
NEXT_PUBLIC_COMING_SOON_MODE=false
```

**Notes:**
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are required for sending emails (waitlist welcome, order confirmation)
- See [docs/resend-smtp-setup.md](docs/resend-smtp-setup.md) for Resend setup instructions

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

- Email Validation: Client + server side
- Duplicate Prevention: UNIQUE constraint + friendly error messages
- Success State: Replaces form with thank you message
- Smooth Scrolling: Hero -> Waitlist sections
- Social Links: Sticky footer with Instagram & TikTok
- Back to Top: Arrow on success page
- Spam Prevention: IP & user agent tracking

### Database Setup

Run [sql/setup.sql](sql/setup.sql) in Supabase SQL Editor (includes waitlist table).

### Middleware Redirect

When `NEXT_PUBLIC_COMING_SOON_MODE=true`, [middleware.ts](middleware.ts) redirects `/` -> `/coming-soon`:

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

KEEPERS includes a full-featured photobook editor that allows authenticated users to create, edit, and manage custom photobooks. The editor features drag-and-drop photo placement, customizable layout zones, and real-time saving.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Editor Page (/editor/[projectId])                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  EditorProvider (React Context)                           │  │
│  │  - State: project, pages, zones, elements, uploadedPhotos │  │
│  │  - Actions: addElement, updateElement, updateZone, etc.   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DndContext (@dnd-kit)                                    │  │
│  │  - Drag photos from sidebar to zones                      │  │
│  │  - Handles drag start/end events                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌─────────┬────────────────────────────┬──────────────────┐   │
│  │ Sidebar │         Canvas             │     Toolbar      │   │
│  │ (Photos)│   (Page with Zones)        │   (Properties)   │   │
│  │ (Layout)│   └── ZoneContainers       │                  │   │
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
- `page_count` (INT) - Number of pages (30 or 40)
- `paper_size` (VARCHAR) - Paper size (A4, A5, or PDF Only)
- `voucher_code` (VARCHAR) - Associated voucher code (nullable)
- `last_edited_at` (TIMESTAMPTZ) - Last modification time
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Pages** (`public.pages`)
- `id` (UUID) - Primary key
- `project_id` (UUID) - Parent project
- `page_number` (INT) - Order in project
- `layout_id` (VARCHAR) - Layout template ID
- `title` (VARCHAR) - Optional page title
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Page Zones** (`public.page_zones`)
- `id` (UUID) - Primary key
- `page_id` (UUID) - Parent page
- `zone_index` (INT) - Order/index of zone on page
- `position_x`, `position_y` (FLOAT) - Position as percentage (0-100)
- `width`, `height` (FLOAT) - Size as percentage (0-100)
- `created_at`, `updated_at` (TIMESTAMPTZ)
- UNIQUE constraint on `(page_id, zone_index)`

**Elements** (`public.elements`)
- `id` (UUID) - Primary key
- `zone_id` (UUID) - Parent zone (UNIQUE - 1:1 relationship)
- `type` (VARCHAR) - 'photo' or 'text'
- `photo_url` (TEXT) - Signed URL for display
- `photo_storage_path` (TEXT) - Storage path for regenerating URLs
- `position_x`, `position_y` (FLOAT) - Position as percentage (0-100) relative to zone
- `width`, `height` (FLOAT) - Size as percentage (0-100) relative to zone
- `rotation` (FLOAT) - Rotation in degrees
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Zone-Based Layout System

The editor uses a flexible zone-based layout system where:

1. **Layout Templates** define initial zone positions (Blank, Single, Double, Triple, Grid 4, Grid 6)
2. **Page Zones** are created from templates when a page is added
3. **Zones are customizable** - users can resize and reposition both empty and occupied zones
4. **Photos drop into zones** - each zone can hold one photo element
5. **Zone changes persist** to database for reload
6. **Photos render inline** - ZoneContainer handles both zone layout and photo display

**Key Benefits:**
- Users can customize layouts beyond fixed templates
- Zone positions saved per-page in database
- Zones auto-initialize from layout template
- Supports drag-to-move and resize handles for all zones (empty or occupied)
- Empty zones can be selected and manipulated before adding photos

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

**Type Definitions:**
- `UpdateElementInput` supports `| null` for clearing fields (photo_url, photo_storage_path, text_content, etc.)
- `UpdateElementInput` includes `zone_index?: number | null` for zone assignment

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
- `createProject(input?)` - Create new project with first page and zones
- `getProject(projectId)` - Fetch project with pages, zones, and elements
- `updateProject(projectId, updates)` - Update project metadata
- `deleteProject(projectId)` - Delete project and all related data
- `getUserProjects()` - List all projects for current user

**Page Actions**:
- `createPage(input)` - Add page to project (initializes zones from layout)
- `updatePage(pageId, updates)` - Update page (reinitializes zones if layout changes)
- `deletePage(pageId, projectId)` - Remove page
- `reorderPages(projectId, pageIds)` - Reorder pages

**Zone Actions**:
- `initializeZonesFromLayout(pageId, layoutId)` - Create zones from template
- `createZone(input)` - Add single zone to page
- `updateZone(zoneId, updates)` - Update zone position/size
- `deleteZone(zoneId)` - Remove zone

**Element Actions**:
- `createElement(input)` - Add element to page
- `updateElement(elementId, updates)` - Update element position/properties
- `deleteElement(elementId)` - Remove element
- `batchUpdateElements(updates)` - Update multiple elements
- `batchDeleteElements(elementIds)` - Delete multiple elements

**Photo Actions** ([lib/photo-upload-actions.ts](lib/photo-upload-actions.ts)):
- `uploadPhoto(file, projectId)` - Upload single photo
- `uploadMultiplePhotos(files, projectId)` - Upload multiple photos
- `deletePhoto(path)` - Delete photo from storage (validates path ownership)
- `deleteMultiplePhotos(paths)` - Delete multiple photos (validates path ownership)
- `getPhotoUrl(path)` - Get signed URL for photo (validates path ownership)
- `listProjectPhotos(projectId)` - List all photos in project

**Note:** All server actions include authentication checks and throw `"Unauthorized"` if the user is not authenticated.

### Editor State Management

The editor uses React Context with useReducer for state management ([lib/contexts/editor-context.tsx](lib/contexts/editor-context.tsx)).

**State:**
```typescript
interface EditorState {
  project: Project
  pages: Page[]
  currentPageId: string
  zones: Record<string, PageZone[]>      // Keyed by pageId
  elements: Record<string, Element[]>    // Keyed by pageId
  uploadedPhotos: UploadedPhoto[]
  selectedElementId: string | null
  selectedZoneId: string | null          // For selecting empty zones
  isSaving: boolean
  lastSaved: string | null
  error: string | null
  isDraggingZone: boolean                // True while dragging/resizing a zone
}
```

**Available Actions:**
- `SET_PROJECT`, `SET_PAGES`, `SET_CURRENT_PAGE`
- `UPDATE_PROJECT_TITLE`, `ADD_PAGE`, `DELETE_PAGE`, `REORDER_PAGES`
- `UPDATE_PAGE_LAYOUT`, `SET_ELEMENTS`, `ADD_ELEMENT`
- `UPDATE_ELEMENT` (payload: `{ pageId, elementId, updates }`)
- `DELETE_ELEMENT` (payload: `{ pageId, elementId }`)
- `SELECT_ELEMENT`, `SELECT_ZONE`
- `SET_ZONES`, `UPDATE_ZONE` (payload: `{ pageId, zoneId, updates }`)
- `DELETE_ZONE` (payload: `{ pageId, zoneId }`)
- `SET_DRAGGING_ZONE`
- `ADD_UPLOADED_PHOTO`, `REMOVE_UPLOADED_PHOTO`
- `SET_SAVING`, `SET_LAST_SAVED`, `SET_ERROR`

**Context Methods:**
- `selectZone(zoneId)` - Select an empty zone for resizing/repositioning
- `updateZonePosition(zoneId, updates)` - Persist zone changes to server
- `setDraggingZone(isDragging)` - Track zone drag state

### Editor Components

| Component | File | Description |
|-----------|------|-------------|
| EditorLayout | [components/editor/layout.tsx](components/editor/layout.tsx) | Main layout with DnD context |
| EditorTopBar | [components/editor/top-bar.tsx](components/editor/top-bar.tsx) | Project title, save status, navigation |
| EditorSidebar | [components/editor/sidebar.tsx](components/editor/sidebar.tsx) | Tabbed sidebar (Photos, Layouts) |
| EditorCanvas | [components/editor/canvas.tsx](components/editor/canvas.tsx) | Main editing canvas with zone rendering |
| EditorToolbar | [components/editor/toolbar.tsx](components/editor/toolbar.tsx) | Right panel for element properties |
| EditorBottomBar | [components/editor/bottom-bar.tsx](components/editor/bottom-bar.tsx) | Page thumbnails navigation |
| ZoneContainer | [components/editor/elements/zone-container.tsx](components/editor/elements/zone-container.tsx) | Resizable layout zone with photo rendering and drop target |
| PhotosPanel | [components/editor/panels/photos-panel.tsx](components/editor/panels/photos-panel.tsx) | Photo upload and library |
| LayoutsPanel | [components/editor/panels/layouts-panel.tsx](components/editor/panels/layouts-panel.tsx) | Layout template selection |
| ProjectSelectorModal | [components/editor/modals/project-selector.tsx](components/editor/modals/project-selector.tsx) | Create/open project modal |
| DeleteButton | [components/editor/ui/delete-button.tsx](components/editor/ui/delete-button.tsx) | Reusable delete button |

### Component Hierarchy

```
EditorLayout (DnD Context)
├── EditorTopBar
├── EditorSidebar
│   └── PhotosPanel / LayoutsPanel (tabbed)
├── EditorCanvas
│   └── ZoneContainer (multiple, one per zone, renders photo inline if occupied)
├── EditorToolbar
└── EditorBottomBar (Page thumbnails)
```

### Database Setup

Run [sql/setup.sql](sql/setup.sql) in Supabase SQL Editor to create:
- `public.profiles` table with RLS
- `public.waitlist` table
- `public.projects` table with RLS
- `public.pages` table with RLS
- `public.page_zones` table with RLS
- `public.elements` table with RLS
- Triggers for `updated_at` and `last_edited_at`
- Storage bucket policies

Then set up storage bucket following [sql/storage-setup.md](sql/storage-setup.md):
1. Create `project-photos` bucket (private)
2. Storage policies are included in setup.sql

Verify setup with:
```bash
npx tsx scripts/test-db-setup.ts
```

### Security

- **Row Level Security (RLS):** All tables protected
  - Users can only access their own projects
  - Pages inherit access from project ownership
  - Zones inherit access from page -> project ownership
  - Elements inherit access from page -> project ownership
- **Storage Policies:** Users can only upload/view/delete photos in their own folder
- **Server-Side Auth:** All server actions verify user authentication before any operation
- **Path Validation:** Photo URL generation and deletion verify path ownership (`user.id/` prefix)

### Performance Optimizations

The editor reducer uses O(1) page-indexed lookups for element and zone updates:

- `UPDATE_ELEMENT`, `DELETE_ELEMENT`, `UPDATE_ZONE`, `DELETE_ZONE` actions include `pageId` in payload
- Direct page lookup instead of iterating all pages
- Helper functions `findElementPageId()` and `findZonePageId()` in context for callers that don't have pageId

---

## Template System

### Overview

KEEPERS includes a database-backed template system that allows users to create projects from pre-designed templates. Admins can create and manage layouts, templates, and categories through a dedicated admin UI.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  User Flow                                                       │
├─────────────────────────────────────────────────────────────────┤
│  1. User clicks "Start Your Book"                                │
│  2. Project Selector shows: "Blank Project" or "Use Template"   │
│  3. Template Browser displays categories and templates           │
│  4. User selects template → Project created with preset pages   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Admin Flow (/admin)                                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Admin creates layouts with visual zone editor               │
│  2. Admin creates templates, assigns layouts to pages           │
│  3. Admin manages categories for template organization          │
│  4. Templates become available to users in Template Browser     │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema

**Layouts** (`public.layouts`)
- `id` (UUID) - Primary key
- `slug` (VARCHAR) - Unique identifier (e.g., 'single', 'grid-4')
- `name` (VARCHAR) - Display name
- `description` (TEXT) - Layout description
- `icon` (VARCHAR) - Lucide icon name
- `thumbnail_url` (TEXT) - Preview image
- `is_system` (BOOLEAN) - System layouts can't be deleted
- `is_active` (BOOLEAN) - Visibility to users
- `sort_order` (INT) - Display order

**Zones** (`public.zones`) - **Unified table for both layout and page zones**
- `id` (UUID) - Primary key
- `layout_id` (UUID) - Parent layout (NULL for page zones)
- `page_id` (UUID) - Parent page (NULL for layout zones)
- `zone_index` (INT) - Zone order
- `zone_type` (VARCHAR) - 'photo' or 'text'
- `position_x`, `position_y` (FLOAT) - Position as percentage (0-100)
- `width`, `height` (FLOAT) - Size as percentage (0-100)
- **CHECK constraint:** Exactly one of `layout_id` or `page_id` must be set

**Note:** Zones serve dual purposes - as layout templates (layout_id set) and as page instances (page_id set). When a user applies a layout to a page, zones are copied from layout zones to page zones.

**Template Categories** (`public.template_categories`)
- `id` (UUID) - Primary key
- `slug` (VARCHAR) - Unique identifier
- `name` (VARCHAR) - Display name
- `description` (TEXT) - Category description
- `icon` (VARCHAR) - Lucide icon name
- `sort_order` (INT) - Display order
- `is_active` (BOOLEAN) - Visibility

**Templates** (`public.templates`)
- `id` (UUID) - Primary key
- `slug` (VARCHAR) - Unique identifier
- `title` (VARCHAR) - Template name
- `description` (TEXT) - Template description
- `category_id` (UUID) - Parent category
- `project_id` (UUID UNIQUE) - **1-1 mapping to projects table** - the template project blueprint
- `thumbnail_url` (TEXT) - Preview image
- `preview_images` (JSONB) - Additional preview images
- `is_featured` (BOOLEAN) - Show in featured section
- `is_premium` (BOOLEAN) - Future: paid templates
- `is_active` (BOOLEAN) - Visibility

**Important:** Templates no longer have `page_count` or `paper_size` fields. These belong to projects only. Each template references exactly one "template project" that contains pages and zones. When a user creates a project from a template, the entire template project (including pages and zones) is copied, creating a completely independent new project with no ongoing relationship to the template.

### Server Actions

**Layout Actions** ([lib/layout-actions.ts](lib/layout-actions.ts)):
- `getLayouts()` - Get all active layouts (for editor)
- `getLayoutBySlug(slug)` - Get single layout
- `getLayoutsDB()` - Get all layouts as DB records (for admin)

**Template Actions** ([lib/template-actions.ts](lib/template-actions.ts)):
- `getTemplateCategories()` - Get all active categories
- `getTemplates(categorySlug?)` - Get templates with optional filter
- `getFeaturedTemplates()` - Get featured templates
- `getTemplate(templateId)` - Get full template with pages
- `createProjectFromTemplate(templateId, title?)` - Create project from template

**Admin Actions** ([lib/admin-actions.ts](lib/admin-actions.ts)):
- `isAdmin()` - Check if current user is admin
- `getAdminProfile()` - Get admin profile
- `createLayout(input)` / `updateLayout(id, input)` / `deleteLayout(id)`
- `createTemplate(input)` / `updateTemplate(id, input)` / `deleteTemplate(id)`
- `createCategory(input)` / `updateCategory(id, input)` / `deleteCategory(id)`
- `addTemplatePage()` / `updateTemplatePage()` / `deleteTemplatePage()`

### Pre-seeded Data

**System Layouts** (migrated from static TypeScript):
- `blank` - Empty page with no zones
- `single` - One large centered photo
- `double` - Two photos side by side
- `triple` - One large + two smaller photos
- `grid-4` - 2x2 grid
- `grid-6` - 2x3 grid

**Default Categories**:
- Vacation, Wedding, Baby & Family, Birthday, Graduation, Portfolio, General

### Storage

**Bucket**: `template-assets` (public)
- Stores template thumbnails and preview images
- Admin-only upload access
- Public read access

---

## Key Design Decisions

### Overview

This section documents the core architectural decisions made for the KEEPERS photobook system. These decisions prioritize **simplicity**, **user freedom**, and **data independence** over normalization and template synchronization.

### 1. Templates and Projects: 1-1 Mapping with Copy-on-Create

**Decision:** Each template has exactly one associated "template project" (via `project_id` UNIQUE constraint). When a user creates a project from a template, **the entire template project is copied** (including all pages and zones) into a new, independent user project.

**Why:**
- **User Freedom:** Users can fully customize their project without affecting the template or other users
- **No Template Lock-in:** Projects remain functional even if the template is deleted or modified
- **Simple Mental Model:** Templates are boilerplates - use once, no ongoing relationship
- **Data Independence:** Each project is self-contained with all its data

**Tradeoffs:**
- ✅ Complete user control and customization freedom
- ✅ No cascade failures if templates change
- ✅ Simple to implement and reason about
- ❌ Data duplication - 1,000 users = 1,000 copies of zones
- ❌ Template updates don't benefit existing projects
- ❌ More storage usage

**Implementation:**
- Templates table has `project_id UUID UNIQUE` field
- Projects table has NO `template_id` field (templates reference projects, not vice versa)
- `createProjectFromTemplate()` deep-copies project → pages → zones → elements
- Templates do NOT have `page_count` or `paper_size` (these belong to projects)

### 2. Layouts and Pages: Copy-on-Apply

**Decision:** When a user applies a layout to a page, **zones are copied** from layout zones to page zones. The copied zones have NO ongoing relationship to the layout.

**Why:**
- **Consistency with Templates:** Same "boilerplate" pattern as templates
- **User Customization:** Users can resize/reposition zones after applying layout
- **No Layout Lock-in:** Page zones persist even if layout is deleted

**Tradeoffs:**
- ✅ Users can customize zones freely
- ✅ Simple mental model - layouts are blueprints
- ❌ Layout updates don't affect existing pages
- ❌ Zone data duplication

**Implementation:**
- Layouts have zones (via `zones` table with `layout_id` set)
- Pages have zones (via `zones` table with `page_id` set)
- When layout is applied, zones are copied and `page_id` is set

### 3. Unified Zones Table (Layout + Page)

**Decision:** Use a single `zones` table with a CHECK constraint ensuring exactly one of `layout_id` OR `page_id` is set, rather than separate `layout_zones` and `page_zones` tables.

**Why:**
- **Schema Simplicity:** One table instead of two with identical structure
- **Shared Structure:** Both layout and page zones have identical fields (position, size, zone_type)
- **Unified Element References:** Elements reference `zone_id` without needing to know if it's a layout or page zone

**Tradeoffs:**
- ✅ Less schema duplication
- ✅ Simpler foreign key relationships
- ✅ One source of truth for zone structure
- ❌ Mixed concerns in one table (templates vs instances)
- ❌ Nullable FKs require CHECK constraint discipline
- ❌ Queries need WHERE clause filtering by layout_id or page_id

**Implementation:**
```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY,
  layout_id UUID REFERENCES layouts(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  zone_index INT NOT NULL,
  zone_type VARCHAR(10) DEFAULT 'photo',
  position_x FLOAT, position_y FLOAT, width FLOAT, height FLOAT,
  CHECK (
    (layout_id IS NOT NULL AND page_id IS NULL) OR
    (page_id IS NOT NULL AND layout_id IS NULL)
  ),
  UNIQUE(layout_id, zone_index),
  UNIQUE(page_id, zone_index)
);
```

### 4. Elements and Zones: 1-1 Mapping

**Decision:** Each zone can have AT MOST one element (enforced via `UNIQUE(zone_id)` constraint on elements table).

**Why:**
- **Simple Layout Model:** Each photo zone gets one photo
- **No Layering Complexity:** No z-index calculations or layer management
- **Clear User Model:** One rectangle = one photo

**Tradeoffs:**
- ✅ Extremely simple to implement and understand
- ✅ No layering/z-index bugs
- ✅ Clear 1-1 relationship in UI
- ❌ Can't layer multiple photos/text in one zone
- ❌ Advanced layouts require multiple zones

**Implementation:**
```sql
CREATE TABLE elements (
  id UUID PRIMARY KEY,
  zone_id UUID NOT NULL UNIQUE REFERENCES zones(id), -- 1-1 constraint
  type VARCHAR(10) CHECK (type IN ('photo', 'text')),
  -- ... other fields (position, size, rotation)
);
```

### 5. Projects and Pages: ONLY Relationship

**Decision:** Pages ONLY belong to projects. Pages do NOT have a `template_id` field. Templates are referenced only through the template → project relationship.

**Why:**
- **Clear Ownership:** Every page belongs to exactly one project
- **Simple Queries:** No need to check "is this a template page or project page?"
- **Consistency:** Templates ARE projects (via 1-1 mapping)

**Implementation:**
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  -- NO template_id field
  UNIQUE(project_id, page_number)
);
```

### Summary: Boilerplate Philosophy

The overarching philosophy is: **Templates and layouts are boilerplates - one-time copy, no ongoing relationship.**

This prioritizes:
- User freedom to customize
- Data independence
- Simple mental models
- Implementation simplicity

Over:
- Storage efficiency
- Template synchronization
- Schema normalization

**When to Reconsider:**
- If template updates need to propagate to existing projects → Consider reference-based system
- If storage costs become prohibitive → Consider shared zone definitions
- If users complain about customization limits → Current design already maximizes this

---

## Admin UI

### Overview

The admin panel at `/admin` provides a UI for managing layouts, templates, and categories. Access is restricted to users with `is_admin = true` in their profile.

### Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with stats and quick actions |
| `/admin/layouts` | List all layouts |
| `/admin/layouts/new` | Create new layout with zone editor |
| `/admin/layouts/[id]` | Edit existing layout |
| `/admin/templates` | List all templates |
| `/admin/templates/new` | Create new template with page builder |
| `/admin/templates/[id]` | Edit existing template |
| `/admin/categories` | Manage template categories |
| `/admin/vouchers` | List all vouchers with status stats |
| `/admin/vouchers/new` | Create new voucher codes |

### Key Components

| Component | Description |
|-----------|-------------|
| `AdminSidebar` | Navigation sidebar with links to all sections |
| `ZoneEditor` | Visual canvas for creating/editing layout zones |
| `PageBuilder` | Drag-drop interface for ordering template pages |
| `LayoutList` | Table view of layouts with actions |
| `TemplateList` | Grid view of templates with thumbnails |
| `CategoryList` | Inline editable category table |
| `VoucherList` | Table view of vouchers with status indicators |
| `VoucherForm` | Create voucher form with product configuration |

### Zone Editor Features

- **Visual canvas** representing a page (8.5:11 aspect ratio)
- **Click and drag** to draw new zones
- **Select zones** to move or resize
- **Resize handles** on selected zones
- **Percentage-based** positioning (0-100)
- **Form inputs** for precise value editing

### Setting Up Admin Access

1. Run the SQL migration in Supabase (includes `is_admin` column)
2. Find your user ID in Supabase Dashboard → Authentication → Users
3. Run SQL: `UPDATE profiles SET is_admin = true WHERE id = 'your-user-id'`
4. Access `/admin` while logged in

### Security

- **Route Protection**: Admin layout checks `getAdminProfile()` and redirects non-admins
- **RLS Policies**: All admin tables have policies checking `profiles.is_admin`
- **Server Actions**: All admin actions call `isAdmin()` before operations

---

## Voucher System

### Overview

KEEPERS includes a complete voucher system for managing photobook orders. Vouchers are pre-generated codes that allow customers to redeem physical photobooks with specific configurations (page count and paper size).

### Voucher States

Vouchers have three states that track their lifecycle:

| Status | Description | User Action |
|--------|-------------|-------------|
| `not_redeemed` | Voucher is available and unused | Can be validated and applied to projects |
| `being_redeemed` | Voucher is linked to a draft project | Project is in progress, not yet confirmed |
| `fully_redeemed` | Voucher has been used for a completed order | Cannot be reused |

### Workflow

**1. Voucher Creation (Admin):**
- Admin creates vouchers at `/admin/vouchers/new`
- Each voucher has a unique code (auto-generated or custom)
- Voucher specifies product configuration:
  - Page count: 30 or 40 pages
  - Paper size: A4, A5, or PDF Only

**2. Project Creation with Voucher (User):**
- User creates a new project at `/editor/new`
- User can optionally enter a voucher code
- System validates voucher:
  - Checks if voucher exists and is `not_redeemed`
  - Verifies voucher has valid product configuration
- If valid:
  - Project is created with voucher's page count and paper size
  - Voucher status changes to `being_redeemed`
  - Voucher is linked to project via `voucher_code` field

**3. Draft Project Deletion:**
- If user deletes a draft project with an applied voucher
- Voucher is reverted to `not_redeemed` status
- Voucher becomes available for reuse
- Uses `revertVoucher()` server action

**4. Order Confirmation (User):**
- User finishes editing their photobook
- User navigates to `/editor/[projectId]/preview`
- Preview page shows:
  - Project preview (placeholder)
  - Delivery information (from user profile)
  - Order details (page count, paper size)
  - Voucher code (pre-filled if applied during creation)
- User confirms order by clicking "Confirm Order"
- System processes redemption:
  - Validates voucher matches project configuration
  - Changes voucher status to `fully_redeemed`
  - Updates project status to `completed`
  - Sends order confirmation email
- Success modal shows confirmation message
- User is redirected to home page after 5 seconds

### Database Schema

**Vouchers** (`public.vouchers`)
- `id` (UUID) - Primary key
- `code` (VARCHAR) - Unique voucher code (uppercase)
- `status` (VARCHAR) - Voucher state: `not_redeemed`, `being_redeemed`, `fully_redeemed`
- `page_count` (INT) - Number of pages (30 or 40)
- `paper_size` (VARCHAR) - Paper size (A4, A5, or PDF Only)
- `project_id` (UUID) - Linked project (nullable)
- `redeemed_by` (UUID) - User who redeemed (nullable)
- `redeemed_at` (TIMESTAMPTZ) - Redemption timestamp (nullable)
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### Server Actions

**Voucher Actions** ([lib/voucher-actions.ts](lib/voucher-actions.ts)):
- `validateVoucherCode(code)` - Validate voucher and return configuration
- `applyVoucherToProject(voucherCode, projectId)` - Apply voucher during project creation (sets status to `being_redeemed`)
- `redeemVoucher(voucherCode, projectId)` - Redeem voucher and complete order (sets status to `fully_redeemed`)
- `revertVoucher(voucherCode)` - Revert voucher when draft project is deleted (sets status back to `not_redeemed`)

**Admin Actions** ([lib/admin-actions.ts](lib/admin-actions.ts)):
- `createVoucher(input)` - Create new voucher with code and configuration
- `getVouchers()` - Get all vouchers for admin dashboard
- `deleteVoucher(id)` - Delete voucher (only if `not_redeemed`)

### Routes

| Route | Description |
|-------|-------------|
| `/editor/new` | Project creation with optional voucher validation |
| `/editor/[projectId]/preview` | Preview and order confirmation page |
| `/admin/vouchers` | Admin voucher management dashboard |
| `/admin/vouchers/new` | Create new voucher |

### Components

| Component | Description |
|-----------|-------------|
| `PreviewContent` | Main preview/order page with delivery info and voucher redemption form |
| `SuccessModal` | Order confirmation modal with auto-redirect |
| `VoucherList` | Admin table of all vouchers with status filtering |
| `VoucherForm` | Admin form for creating vouchers |

### Email Integration

When a voucher is successfully redeemed:
- Order confirmation email is sent to the user
- Email includes:
  - Customer name and delivery address
  - Project title and page count
  - Voucher code
  - Order date
  - Next steps and processing time (up to 2 weeks)
- Template: [email_templates/order-confirmation.html](email_templates/order-confirmation.html)
- Sender: [lib/email/send-order-confirmation.ts](lib/email/send-order-confirmation.ts)

### Security

- **Voucher codes normalized:** Uppercase and trimmed before validation
- **Unique constraint:** Database ensures no duplicate voucher codes
- **RLS policies:** Users can only redeem vouchers for their own projects
- **Validation checks:**
  - Voucher must exist and be available
  - Voucher configuration must match project (page count and paper size)
  - Project must belong to authenticated user
- **Admin-only creation:** Only admins can create/delete vouchers

---

## User Profile & Delivery Information

### Overview

KEEPERS includes a user profile page at `/profile` where users can manage their personal information and delivery details required for photobook orders.

### Profile Fields

**Required Fields:**
- `first_name` (VARCHAR) - First name
- `last_name` (VARCHAR) - Last name
- `email` (VARCHAR) - Email address (read-only, managed by Supabase Auth)

**Optional Delivery Fields:**
- `address` (TEXT) - Full delivery address
- `postal_code` (VARCHAR) - Postal/ZIP code
- `phone_number` (VARCHAR) - Contact phone number

### Routes

| Route | Description |
|-------|-------------|
| `/profile` | User profile management page |

### Components

| Component | File | Description |
|-----------|------|-------------|
| ProfilePage | [app/profile/page.tsx](app/profile/page.tsx) | Server component that fetches user data |
| ProfileClient | [app/profile/profile-client.tsx](app/profile/profile-client.tsx) | Client component with editable form |

### Server Actions

**Profile Actions** ([lib/auth-actions.ts](lib/auth-actions.ts)):
- `getUserProfile()` - Fetch current user profile with all fields
- `updateProfile(data)` - Update profile information (validates required fields)

### Database Schema

**Profiles** (`public.profiles`)
- `id` (UUID) - Primary key, references auth.users
- `first_name` (VARCHAR) - Required
- `last_name` (VARCHAR) - Required
- `email` (VARCHAR) - Synced from auth.users
- `address` (TEXT) - Nullable
- `postal_code` (VARCHAR) - Nullable
- `phone_number` (VARCHAR) - Nullable
- `is_admin` (BOOLEAN) - Admin access flag
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Integration with Orders

The profile information is used during the order confirmation process:

1. **Preview Page** ([app/editor/[projectId]/preview/page.tsx](app/editor/[projectId]/preview/page.tsx)):
   - Displays user's delivery information
   - Shows link to update profile if information is incomplete
   - Validates required fields before order confirmation

2. **Order Confirmation Email**:
   - Includes delivery address from profile
   - Shows customer name, postal code, and phone number
   - Email is sent to user's email address

### User Experience

- **Profile Link:** Accessible from user menu in header (Profile option)
- **Update from Preview:** "Update your information" link on preview page
- **Auto-save:** Changes saved immediately on form submission
- **Success Feedback:** Green success message appears for 3 seconds after save
- **Error Handling:** Red error messages for validation failures
- **Back Navigation:** Back button returns to previous page

### Security

- **Authentication Required:** Profile page redirects unauthenticated users to home
- **RLS Policies:** Users can only view/edit their own profile
- **Server-side Validation:** All updates validated on server before saving
- **Email Protection:** Email field is read-only (managed by Supabase Auth)

---

**Project Version**: 9.0.0 (Voucher System & Order Management)
**Framework**: Next.js 16.0.10 + React 19.2.0 + Supabase 2.89.0
