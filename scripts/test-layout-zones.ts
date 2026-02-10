/**
 * Test script to verify layouts have zones in the database
 * Run with: npx tsx scripts/test-layout-zones.ts
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables!")
  console.error("   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLayoutZones() {
  console.log("🔍 Checking layouts and their zones...\n")

  // Fetch all layouts
  const { data: layouts, error: layoutsError } = await supabase
    .from("layouts")
    .select("*")
    .order("slug")

  if (layoutsError) {
    console.error("❌ Error fetching layouts:", layoutsError)
    return
  }

  if (!layouts || layouts.length === 0) {
    console.log("⚠️  No layouts found in database!")
    return
  }

  console.log(`Found ${layouts.length} layouts:\n`)

  // For each layout, fetch its zones
  for (const layout of layouts) {
    console.log(`📐 Layout: ${layout.name} (slug: ${layout.slug})`)
    console.log(`   ID: ${layout.id}`)
    console.log(`   Active: ${layout.is_active}`)
    console.log(`   System: ${layout.is_system}`)

    // Fetch zones for this layout
    const { data: zones, error: zonesError } = await supabase
      .from("zones")
      .select("*")
      .eq("layout_id", layout.id)
      .order("zone_index")

    if (zonesError) {
      console.error(`   ❌ Error fetching zones:`, zonesError)
    } else if (!zones || zones.length === 0) {
      console.log(`   ⚠️  NO ZONES FOUND for this layout!`)
    } else {
      console.log(`   ✓ ${zones.length} zones found:`)
      zones.forEach((zone) => {
        console.log(`      Zone ${zone.zone_index}: ${zone.zone_type} at (${zone.position_x}, ${zone.position_y}) size ${zone.width}x${zone.height}`)
      })
    }
    console.log("")
  }

  // Also try the query with foreign key relationship
  console.log("\n🔗 Testing foreign key relationship query...\n")

  const { data: layoutsWithZones, error: fkError } = await supabase
    .from("layouts")
    .select(`
      *,
      zones!zones_layout_id_fkey (*)
    `)
    .eq("slug", "single")
    .single()

  if (fkError) {
    console.error("❌ Foreign key query error:", fkError)
  } else {
    console.log("✓ Foreign key query successful!")
    console.log(`  Layout: ${layoutsWithZones.name}`)
    console.log(`  Zones: ${layoutsWithZones.zones?.length || 0}`)
    if (layoutsWithZones.zones) {
      console.log("  Zone details:", JSON.stringify(layoutsWithZones.zones, null, 2))
    }
  }
}

testLayoutZones()
  .then(() => {
    console.log("\n✅ Test complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  })
