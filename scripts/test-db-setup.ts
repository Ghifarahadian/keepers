// Quick script to verify database setup
// Run with: npx tsx scripts/test-db-setup.ts

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseSetup() {
  console.log('🔍 Testing KEEPERS Editor Database Setup...\n')

  try {
    // Test 1: Check if projects table exists
    console.log('1. Testing projects table...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1)

    if (projectsError) {
      console.error('❌ Projects table error:', projectsError.message)
      return false
    }
    console.log('✅ Projects table exists\n')

    // Test 2: Check if pages table exists
    console.log('2. Testing pages table...')
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('count')
      .limit(1)

    if (pagesError) {
      console.error('❌ Pages table error:', pagesError.message)
      return false
    }
    console.log('✅ Pages table exists\n')

    // Test 3: Check if elements table exists
    console.log('3. Testing elements table...')
    const { data: elements, error: elementsError } = await supabase
      .from('elements')
      .select('count')
      .limit(1)

    if (elementsError) {
      console.error('❌ Elements table error:', elementsError.message)
      return false
    }
    console.log('✅ Elements table exists\n')

    // Test 4: Check if storage bucket exists
    console.log('4. Testing project-photos storage bucket...')

    // Try to list files in the bucket (this will work if bucket exists)
    const { data: files, error: bucketError } = await supabase
      .storage
      .from('project-photos')
      .list('', { limit: 1 })

    if (bucketError) {
      console.error('❌ project-photos bucket error:', bucketError.message)
      console.log('   Make sure you created the bucket in Supabase Dashboard')
      return false
    }

    console.log('✅ project-photos bucket exists and is accessible\n')

    console.log('🎉 All database checks passed! Your database is ready.\n')
    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

testDatabaseSetup()
