# Migration Guide: Splitting Templates from Projects

## Overview

This migration separates the unified `projects` table into two distinct tables:
- **`templates`** - Admin-managed photobook blueprints
- **`projects`** - User-created photobooks (with optional `template_id` reference)

## ✅ Completed

### 1. Database Migration SQL
- Created [split-templates-from-projects.sql](./split-templates-from-projects.sql)
- Migrates data from `projects` where `is_template=TRUE` to new `templates` table
- Adds `template_id` to `projects` for tracking template origin
- Updates `pages` table to support both `project_id` and `template_id`
- Updates all RLS policies for templates, projects, pages, zones, and elements

### 2. TypeScript Types
- **[types/template.ts](../types/template.ts)**: Added `Template` interface
- **[types/editor.ts](../types/editor.ts)**:
  - Removed template-specific fields from `Project`
  - Added `template_id` to `Project`
  - Updated `Page` to support `template_id`
  - Updated input types (`CreateProjectInput`, `CreatePageInput`)

### 3. Server Actions
- **[lib/template-actions.ts](../lib/template-actions.ts)**:
  - Updated to query `templates` table instead of `projects` with `is_template` filter
  - Functions return `Template` type instead of `Project` for template queries
  - `createProjectFromTemplate()` now sets `template_id` when creating projects

## 🔄 Still TODO

### 4. Admin Actions
File: `lib/admin-actions.ts`

**Required Changes:**
- Add CRUD functions for templates table:
  - `createTemplate(input: CreateTemplateInput)`
  - `updateTemplate(id: string, input: UpdateTemplateInput)`
  - `deleteTemplate(id: string)`
  - `getTemplates()` - admin version with all templates (not just active)
  - `getTemplate(id: string)` - admin version
- Update any functions that were working with `projects` where `is_template=TRUE`
- Add functions for managing template pages:
  - `createTemplatePage(templateId: string, input: CreatePageInput)`
  - `updateTemplatePage(pageId: string, input: UpdatePageInput)`
  - `deleteTemplatePage(pageId: string)`

### 5. Editor Actions
File: `lib/editor-actions.ts`

**Required Changes:**
- Update `getProject()` to handle new schema (no `is_template` field)
- Update `createProject()` to support `template_id` parameter
- Ensure page queries work with new `pages` table structure
- Update zone queries if needed (they should already use `page_zones` table)

### 6. Component Updates

**Components that likely need updates:**
- **Admin Components:**
  - `components/admin/templates/template-list.tsx` - Query templates table
  - `components/admin/templates/template-form.tsx` - Create/update templates
  - `components/admin/templates/page-builder.tsx` - Work with template pages

- **Editor Components:**
  - `components/editor/modals/template-browser.tsx` - Display templates
  - `components/editor/modals/project-selector.tsx` - Create from template

- **Any component using:**
  - `getTemplates()`, `getTemplate()`, `createProjectFromTemplate()`
  - These should mostly work with updated types

### 7. Update setup.sql
File: `sql/setup.sql`

**Required Changes:**
- Replace unified `projects` table definition with:
  - Separate `templates` table
  - Updated `projects` table (without template fields, with `template_id`)
- Update `pages` table to include `template_id` column
- Update all RLS policies to match migration script
- Update comments and documentation in the file

### 8. Update CLAUDE.md
File: `CLAUDE.md`

**Required Changes:**
- Update database schema documentation
- Update architecture diagrams
- Update type definitions documentation
- Update server actions documentation

## Running the Migration

### Prerequisites
1. **Backup your database** before running
2. Ensure you're on the latest version of the unified schema

### Steps

1. **Run the migration:**
   ```sql
   -- In Supabase SQL Editor
   -- Run: sql/migrations/split-templates-from-projects.sql
   ```

2. **Verify migration:**
   - Check that templates were copied: `SELECT COUNT(*) FROM templates;`
   - Check that projects no longer have template records
   - Check that RLS policies are in place

3. **Deploy code changes:**
   - Deploy updated TypeScript types
   - Deploy updated server actions
   - Deploy updated components

4. **Test thoroughly:**
   - Test creating projects from templates
   - Test admin template management
   - Test existing projects still work
   - Test RLS policies (different users can't access each other's data)

## Rollback

If something goes wrong, you can rollback the transaction:

```sql
ROLLBACK;
```

To fully reverse the migration, you would need to:
1. Merge templates back into projects with `is_template = TRUE`
2. Remove `template_id` from projects and pages
3. Restore original RLS policies

## Benefits of This Change

✅ **Cleaner data model** - No NULL pollution
✅ **Clear separation** - Blueprints vs. instances
✅ **Better analytics** - Track template usage via `template_id`
✅ **Simpler queries** - No need to filter `is_template` everywhere
✅ **Future-proof** - Easier to add template-specific features

## Questions?

If you encounter issues during migration, check:
1. Are all RLS policies correctly set?
2. Are foreign keys properly configured?
3. Are there any components still querying the old unified structure?
