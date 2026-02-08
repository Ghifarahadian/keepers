# Database Migrations

This folder contains migration scripts for existing KEEPERS databases. If you're setting up a new database from scratch, use `../setup.sql` instead.

## Migration Files

### Current Migrations
- **`unify-zones-table.sql`** - **NEW (2026-02-08)** - **REQUIRED** for unified zones architecture
  - Renames `page_zones` → `zones`
  - Merges `layout_zones` → `zones` with `layout_id` field
  - Makes zones table polymorphic (belongs to page OR layout)
  - Layout zones: `layout_id` set, `page_id=NULL`
  - Page zones: `page_id` set, `layout_id=NULL`
  - **Run this AFTER merge-templates-into-projects.sql**

- **`merge-templates-into-projects.sql`** - **NEW (2026-02-08)** - **REQUIRED** for schema simplification
  - Merges `templates` → `projects` with `is_template` flag
  - Merges `template_pages` → `pages` with `is_template` flag
  - Removes `layout_id` from pages (layouts become copy-templates)
  - Migrates all existing template data
  - Updates RLS policies for template/project access
  - **Run this AFTER zone-based-refactoring.sql**

- **`zone-based-refactoring.sql`** - **REQUIRED** for zone-based architecture
  - Makes `zone_index` NOT NULL on elements table
  - Drops `template_elements` table (no longer needed)
  - Updates comments to reflect zone-relative positioning
  - **Important:** All elements must be assigned to zones before running
  - Run this after ensuring all existing elements have a zone_index value

### Foreign Key Migration
- **`migrate-to-profiles-fk.sql`** - **REQUIRED** for Orders feature
  - Changes foreign keys from `auth.users` to `profiles.id` for:
    - `projects.user_id`
    - `templates.created_by`
    - `vouchers.redeemed_by`
  - Run this migration to align with new architecture
  - Improves query performance and JOINs

### Historical Migrations (Extracted from setup.sql)
These migrations were previously inline in setup.sql and have been extracted for clarity:

- **`add-text-styling-columns.sql`** - Adds font styling columns to elements table
- **`add-admin-flag.sql`** - Adds is_admin column to profiles
- **`add-zone-type-column.sql`** - Adds zone_type to layout_zones
- **`add-voucher-lifecycle.sql`** - Enhances voucher system with lifecycle states
- **`add-pdf-only-paper-size.sql`** - Adds PDF Only as a paper size option
- **`add-project-status-stages.sql`** - Adds processed/shipped/completed statuses

## How to Run Migrations

### For Existing Databases

1. **Open Supabase Dashboard** → SQL Editor
2. **Run migrations in order** (oldest first):
   ```sql
   -- Historical migrations (if not already applied):
   -- Run add-text-styling-columns.sql
   -- Run add-admin-flag.sql
   -- Run add-zone-type-column.sql
   -- Run add-voucher-lifecycle.sql
   -- Run add-pdf-only-paper-size.sql
   -- Run add-project-status-stages.sql

   -- Required migrations (in order):
   -- Run migrate-to-profiles-fk.sql (REQUIRED for Orders feature)
   -- Run zone-based-refactoring.sql (REQUIRED for zone-based architecture)
   -- Run merge-templates-into-projects.sql (REQUIRED for schema simplification)
   -- Run unify-zones-table.sql (REQUIRED for unified zones table)
   ```

3. **Verify** the migration completed successfully by checking the output

### For New Databases

If you're setting up a brand new database:
- Run `../setup.sql` directly
- All migrations are already included in the table definitions
- No need to run individual migration files

## Migration Best Practices

- **Always backup** your database before running migrations
- **Test migrations** on a development/staging environment first
- **Run migrations** during low-traffic periods
- **Verify** data integrity after migrations complete
- Migrations are **idempotent** - safe to run multiple times

## Rollback

The foreign key migration can be rolled back if needed:

```sql
-- Rollback migrate-to-profiles-fk.sql
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_user_id_fkey,
  ADD CONSTRAINT projects_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.templates
  DROP CONSTRAINT IF EXISTS templates_created_by_fkey,
  ADD CONSTRAINT templates_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.vouchers
  DROP CONSTRAINT IF EXISTS vouchers_redeemed_by_fkey,
  ADD CONSTRAINT vouchers_redeemed_by_fkey
  FOREIGN KEY (redeemed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
```

## Questions?

See `../README.md` for database setup documentation.
