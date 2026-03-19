# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `pnpm dev` (or `pnpm dev:clean` to clear `.next` cache first)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Start production**: `pnpm start`

Package manager is **pnpm**.

## Tech Stack

Next.js 16 (App Router) with React 19, TypeScript (strict), Tailwind CSS 4, Supabase (PostgreSQL + Auth + Storage), Resend for email, @dnd-kit for drag-and-drop.

## Architecture

### What the app does

Keepers is a photobook editor. Users redeem vouchers, create projects, arrange photos on pages using a spread-based canvas, and place orders. Admins manage layouts, templates, categories, and vouchers.

### Routing (`app/`)

- `/editor/[projectId]` — main photobook editor
- `/order/[projectId]` — order flow
- `/preview/[projectId]` — project preview
- `/admin/*` — admin dashboard (layouts, templates, categories, vouchers, orders)
- `/auth/callback` — OAuth callback, `/auth/confirm` — email confirmation
- `/coming-soon` — landing page when `NEXT_PUBLIC_COMING_SOON_MODE=true`

### State management

The editor uses **React Context + useReducer** in `lib/contexts/editor-context.tsx`. This is the central state for projects, pages, zones, elements, photos, selections, and drag state. All editor mutations go through dispatch actions.

Key concept — **spread view**: pages are displayed as spreads (front cover, inner left/right pairs, back cover). Helper functions `getItemPages`, `getTotalViewItems`, and `getItemIndexForPage` map between page indices and spread items.

### Server actions

All data mutations use Next.js server actions (`"use server"`). Key files:

- `lib/editor-actions.ts` — project/page/element CRUD
- `lib/zone-operations.ts` — zone CRUD (unified zones table)
- `lib/admin-actions.ts` — admin operations (layouts, templates, categories, vouchers)
- `lib/auth-actions.ts` — signup, signin, signout, profile
- `lib/photo-upload-actions.ts` — photo uploads to Supabase Storage
- `lib/voucher-actions.ts` — voucher redemption

Actions call `revalidatePath()` after mutations for cache invalidation.

### Database (Supabase PostgreSQL)

Schema defined in `sql/setup.sql`. Reset with `sql/reset.sql`, seed with `sql/seed.sql`.

Key tables: `profiles`, `projects`, `pages`, `zones`, `elements`, `layouts`, `templates`, `template_categories`, `vouchers`, `waitlist`.

**Zones are unified** — a single `zones` table serves both layout zones (`layout_id`) and page zones (`page_id`). A zone has exactly one of these foreign keys set.

Elements belong to zones and hold photo or text content with position/size relative to their parent zone.

RLS is enabled on user-scoped tables. Admin operations use `is_admin()` checks.

### Supabase client creation

- Browser: `lib/supabase/client.ts` → `createBrowserClient()`
- Server (actions, RSC): `lib/supabase/server.ts` → `createClient()`
- Middleware: `lib/supabase/middleware.ts` → `updateSession()` (refreshes auth cookies)

### Types

All TypeScript interfaces live in `types/` — `editor.ts`, `template.ts`, `voucher.ts`, `auth.ts`, `waitlist.ts`.

### Path alias

`@/*` maps to the project root (configured in `tsconfig.json`).

## Environment Variables

See `.env.local.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `UNSUBSCRIBE_TOKEN_SECRET`. Feature flag: `NEXT_PUBLIC_COMING_SOON_MODE`.
