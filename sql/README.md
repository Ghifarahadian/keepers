# KEEPERS Database Schema

## Initial Setup

Run this SQL in your Supabase project to set up the database:

1. Go to [SQL Editor](https://app.supabase.com/project/xgugkzyfbaqsisevzgqv/sql/new)
2. Copy the contents of `schema-supabase.sql`
3. Paste and click **RUN**

## What This Creates

- `public.profiles` table for storing user first/last names
- Row Level Security (RLS) policies to protect user data
- Automatic trigger to create profile on user signup
- Indexes for performance

## Schema Overview

```
auth.users (managed by Supabase)
└── id (UUID)

public.profiles (custom)
├── id (UUID) → references auth.users.id
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## Security

This schema includes Row Level Security (RLS) policies that ensure:
- Users can only view their own profile
- Users can only update their own profile
- Profiles are automatically created when users sign up

**Important:** Do not disable RLS on the profiles table in production.
