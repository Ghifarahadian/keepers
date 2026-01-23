# Storage Bucket Setup Guide

The database tables are ready! Now you need to create the storage bucket for photo uploads.

## Steps to Create Storage Bucket

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com/project/decclsfwannjkqprebvi
2. Click on **Storage** in the left sidebar
3. Click **New bucket** button
4. Enter the following details:
   - **Name**: `project-photos`
   - **Public bucket**: Toggle **OFF** (keep it private)
5. Click **Create bucket**

### Option 2: SQL Editor

Alternatively, run this SQL in the Supabase SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload to their own folder
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can view own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can update own photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can delete own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

## Verify Setup

After creating the bucket, run this command to verify:

```bash
npx tsx scripts/test-db-setup.ts
```

You should see all checks pass with ✅

## Storage Structure

Photos will be organized as:
```
project-photos/
  └── {user_id}/
      └── {project_id}/
          ├── 1234567890-abc123.jpg
          ├── 1234567891-def456.png
          └── ...
```

This structure ensures:
- Each user can only access their own photos
- Photos are grouped by project for easy management
- Automatic cleanup when projects are deleted
