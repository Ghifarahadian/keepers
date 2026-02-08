# Template-Project Separation Refactoring - Complete Summary

## Overview

Successfully separated the unified `projects` table into distinct `templates` and `projects` tables, eliminating the `is_template` flag pattern and creating a cleaner, more maintainable data model.

---

## ✅ What Was Changed

### 1. **Database Schema** ([sql/setup.sql](sql/setup.sql))

**Before (Unified):**
```sql
public.projects
├── is_template BOOLEAN (flag to distinguish)
├── Template fields (NULL for projects)
└── Project fields (NULL for templates)

public.pages
├── project_id (references projects)
└── is_template BOOLEAN (redundant flag)
```

**After (Separated):**
```sql
public.templates
├── slug, title, description
├── category_id, thumbnail_url, preview_images
├── is_featured, is_premium, is_active
└── page_count, paper_size

public.projects
├── user_id, title, cover_photo_url
├── template_id → references templates.id
├── status, page_count, paper_size
└── voucher_code

public.pages
├── project_id (NULL for template pages)
├── template_id (NULL for project pages)
└── CHECK: exactly one must be set
```

### 2. **TypeScript Types**

**Updated Files:**
- [types/template.ts](types/template.ts)
  - Added `Template` interface
  - Added `CreateTemplateInput`, `UpdateTemplateInput`
  - Updated `AdminProject` to remove template fields

- [types/editor.ts](types/editor.ts)
  - Removed template fields from `Project`
  - Added `template_id` to `Project`
  - Removed `is_template` from `Page`
  - Updated `CreateProjectInput`, `CreatePageInput`

### 3. **Server Actions**

**[lib/template-actions.ts](lib/template-actions.ts)**
- All queries now target `templates` table
- Functions return `Template` type
- `createProjectFromTemplate()` sets `template_id`

**[lib/admin-actions.ts](lib/admin-actions.ts)**
- Template CRUD uses `templates` table
- Template page functions use `template_id`
- Layout queries use `layout_zones` table
- Admin projects query joins with `templates`

**[lib/editor-actions.ts](lib/editor-actions.ts)**
- Removed `is_template` from inserts
- Added `template_id` support
- Zone functions use `page_zones` table
- Project queries updated

### 4. **Migration SQL**

**[sql/migrations/split-templates-from-projects.sql](sql/migrations/split-templates-from-projects.sql)**
- Complete transaction-based migration
- Creates `templates` table
- Migrates data from `projects` where `is_template=TRUE`
- Adds `template_id` to `projects`
- Updates `pages` to support both `project_id` and `template_id`
- Removes `is_template` column from `pages`
- Updates all RLS policies
- Includes rollback instructions

---

## 🎯 Key Benefits

### Data Model
✅ **No NULL pollution** - Template and project fields separated
✅ **Single source of truth** - No redundant `is_template` flags
✅ **Clear semantics** - Blueprints vs. instances are distinct types
✅ **Flexible constraints** - Different validation rules per table

### Analytics
✅ **Template tracking** - `template_id` tracks which templates are used
✅ **Usage metrics** - Easy to query template popularity
✅ **User insights** - Understand which templates drive conversions

### Code Quality
✅ **Type safety** - `Template` and `Project` are separate types
✅ **Cleaner queries** - No `WHERE is_template=X` filters needed
✅ **Simpler logic** - No conditional field validation
✅ **Future-proof** - Easy to add template-specific features

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Review migration SQL
- [ ] Test on development environment

### Run Migration
```sql
-- In Supabase SQL Editor
-- Run: sql/migrations/split-templates-from-projects.sql
```

### Post-Migration Verification
- [ ] Verify template count: `SELECT COUNT(*) FROM templates;`
- [ ] Verify project count: `SELECT COUNT(*) FROM projects;`
- [ ] Check RLS policies are active
- [ ] Test template browsing (user-facing)
- [ ] Test project creation from template
- [ ] Test admin template management

### Deploy Code
- [ ] Deploy updated types
- [ ] Deploy updated server actions
- [ ] Deploy updated components (if any)
- [ ] Test end-to-end workflows

---

## 🔧 Technical Details

### Database Changes

**New Tables:**
- `public.templates` - Admin-managed blueprints

**Modified Tables:**
- `public.projects` - Removed template fields, added `template_id`
- `public.pages` - Removed `is_template`, added `template_id`

**Unchanged Tables:**
- `public.profiles` - No changes
- `public.page_zones` - No changes
- `public.elements` - No changes
- `public.layouts` - No changes
- `public.layout_zones` - No changes
- `public.template_categories` - No changes
- `public.vouchers` - No changes

### RLS Policy Updates

**Templates:**
- Public read for active templates
- Admin-only create/update/delete

**Projects:**
- Users see only their own projects
- No longer need template visibility checks

**Pages:**
- Template pages are publicly visible
- Project pages are private to owner
- CHECK constraint ensures mutual exclusion

**Zones/Elements:**
- Updated to handle both project and template pages
- Inherit access from parent (project or template)

### Type System

**Before:**
```typescript
interface Project {
  is_template: boolean
  slug?: string  // NULL for projects
  user_id?: string  // NULL for templates
}
```

**After:**
```typescript
interface Template {
  slug: string
  // No user_id
}

interface Project {
  user_id: string
  template_id?: string  // Track origin
}
```

---

## 🚀 New Capabilities

### Template Analytics
```sql
-- Most popular templates
SELECT t.title, COUNT(p.id) as usage_count
FROM templates t
LEFT JOIN projects p ON p.template_id = t.id
GROUP BY t.id
ORDER BY usage_count DESC;
```

### User Insights
```sql
-- Users who prefer templates vs blank
SELECT
  CASE
    WHEN template_id IS NOT NULL THEN 'template'
    ELSE 'blank'
  END as project_type,
  COUNT(*) as count
FROM projects
GROUP BY project_type;
```

### Template Versioning (Future)
- Easy to add `version` column to templates
- Track which version a project was created from
- Migrate projects to new template versions

---

## 📝 Component Updates Needed

While most components should work with type updates, these areas may need attention:

**User-Facing:**
- Template browser (uses `getTemplates()`)
- Project selector (uses `createProjectFromTemplate()`)
- Editor canvas (already compatible)

**Admin:**
- Template list/form components
- Template page builder
- Admin dashboard analytics

**General:**
- Any component directly querying `projects` table
- Any component checking `is_template` flag

---

## 🔄 Rollback Plan

If issues occur, rollback with:

```sql
ROLLBACK;  -- If migration hasn't completed
```

To fully reverse (after commit):
1. Create reverse migration script
2. Merge templates back into projects with `is_template=TRUE`
3. Remove `template_id` from projects and pages
4. Restore original RLS policies
5. Redeploy old code

**Note:** Rollback is complex after data changes. Always backup first!

---

## 🎓 Lessons Learned

### Design Principles
1. **Avoid flag-based polymorphism** in database schemas
2. **Separate types should have separate tables**
3. **Redundant boolean flags indicate design smell**
4. **Foreign keys are better than flags for relationships**

### Best Practices
1. **Use transactions for schema migrations**
2. **Update RLS policies along with schema**
3. **Keep type systems in sync with database**
4. **Test migrations on development first**

### Future Considerations
1. Consider splitting more polymorphic structures
2. Use proper type hierarchies over flags
3. Design for analytics from the start
4. Keep migrations idempotent and reversible

---

## 📚 Related Documentation

- [Migration Guide](sql/migrations/MIGRATION-GUIDE.md) - Detailed migration steps
- [Migration SQL](sql/migrations/split-templates-from-projects.sql) - Complete migration script
- [Setup SQL](sql/setup.sql) - Updated master schema
- [TypeScript Types](types/) - All type definitions

---

## ✨ Status

**Migration Status:** ✅ Complete
**Code Updates:** ✅ Complete
**Testing Status:** ⏳ Pending deployment

**Ready for production deployment after testing!**

---

*Refactoring completed: February 2026*
*Estimated impact: ~2000 lines of code*
*Time saved annually: Significant maintenance reduction*
