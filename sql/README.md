# KEEPERS Database Schema

## Quick Start (Fresh Setup)

To set up the entire database from scratch, run **one file**:

1. Go to [Supabase SQL Editor](https://app.supabase.com/project/_/sql/new)
2. Copy the contents of [`setup.sql`](setup.sql)
3. Paste and click **RUN**

That's it! This creates all tables, indexes, triggers, RLS policies, and the storage bucket.

## What Gets Created

| Table | Description |
|-------|-------------|
| `public.profiles` | User first/last names (linked to auth.users) |
| `public.waitlist` | Email signups for coming soon page |
| `public.projects` | Photobook projects |
| `public.pages` | Pages within projects |
| `public.page_zones` | Customizable layout zones per page |
| `public.elements` | Photos and text on pages |
| `storage.project-photos` | Private bucket for uploaded photos |

## Schema Overview

```
auth.users (managed by Supabase)
└── id (UUID)
    │
    ├── public.profiles
    │   ├── id (UUID) → references auth.users.id
    │   ├── first_name, last_name
    │   └── created_at, updated_at
    │
    └── public.projects
        ├── id, user_id, title, status
        ├── cover_photo_url, last_edited_at
        └── created_at, updated_at
            │
            └── public.pages
                ├── id, project_id, page_number
                ├── layout_id, title
                └── created_at, updated_at
                    │
                    ├── public.page_zones
                    │   ├── id, page_id, zone_index
                    │   ├── position_x, position_y
                    │   ├── width, height
                    │   └── created_at, updated_at
                    │
                    └── public.elements
                        ├── id, page_id, type, zone_index
                        ├── photo_url, photo_storage_path
                        ├── text_content, font_*
                        ├── position_x, position_y
                        ├── width, height, rotation, z_index
                        └── created_at, updated_at

public.waitlist (standalone)
├── id, email
├── ip_address, user_agent
├── unsubscribed, unsubscribed_at
└── created_at, updated_at

storage.buckets.project-photos (private)
└── {user_id}/{project_id}/{filename}
```

## Individual Files

If you need to run migrations separately or understand what each file does:

| File | Purpose |
|------|---------|
| [`setup.sql`](setup.sql) | **Complete setup** - run this for fresh installs |
| [`schema-supabase.sql`](schema-supabase.sql) | Profiles table only |
| [`waitlist-schema.sql`](waitlist-schema.sql) | Waitlist table only |
| [`editor-schema.sql`](editor-schema.sql) | Projects, pages, elements tables |
| [`add-page-zones-table.sql`](add-page-zones-table.sql) | Page zones table migration |
| [`add-zone-index-migration.sql`](add-zone-index-migration.sql) | Add zone_index to elements |
| [`initialize-zones-from-layouts.sql`](initialize-zones-from-layouts.sql) | Populate zones for existing pages |
| [`create-storage-bucket.sql`](create-storage-bucket.sql) | Storage bucket and policies |
| [`storage-setup.md`](storage-setup.md) | Manual storage setup guide |

## Security

All tables use Row Level Security (RLS):

- **profiles**: Users can only access their own profile
- **waitlist**: RLS disabled (public signups allowed)
- **projects**: Users can only access their own projects
- **pages**: Inherited from project ownership
- **page_zones**: Inherited from page → project ownership
- **elements**: Inherited from page → project ownership
- **storage**: Users can only upload/view/delete in their own folder

## Triggers

Automatic behaviors:

- `handle_updated_at()` - Updates `updated_at` on any table change
- `handle_new_user()` - Creates profile when user signs up
- `update_project_last_edited()` - Updates project timestamp when pages change
- `update_project_last_edited_from_element()` - Updates project timestamp when elements change

## Re-running Setup

The `setup.sql` file is idempotent (safe to run multiple times):

- Uses `CREATE TABLE IF NOT EXISTS`
- Uses `DROP POLICY IF EXISTS` before creating policies
- Uses `DROP TRIGGER IF EXISTS` before creating triggers
- Uses `ON CONFLICT DO NOTHING` for storage bucket
