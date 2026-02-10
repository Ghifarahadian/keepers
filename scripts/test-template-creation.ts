/**
 * Test template creation with zone copying
 * Run with: npx tsx scripts/test-template-creation.ts
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTemplateCreation() {
  console.log("🧪 Testing template creation with zone copying...\n")

  // Step 1: Get the single-full layout
  console.log("1️⃣ Fetching 'single-full' layout...")
  const { data: layout, error: layoutError } = await supabase
    .from("layouts")
    .select(`
      *,
      zones!zones_layout_id_fkey (*)
    `)
    .eq("slug", "single-full")
    .single()

  if (layoutError) {
    console.error("❌ Error fetching layout:", layoutError)
    return
  }

  if (!layout) {
    console.error("❌ Layout 'single-full' not found!")
    return
  }

  console.log("✓ Layout found:")
  console.log(`   Name: ${layout.name}`)
  console.log(`   ID: ${layout.id}`)
  console.log(`   Zones: ${layout.zones?.length || 0}`)
  if (layout.zones) {
    console.log("   Zone details:", JSON.stringify(layout.zones, null, 2))
  }
  console.log("")

  // Step 2: Get admin user (first admin in profiles)
  console.log("2️⃣ Finding admin user...")
  const { data: admin, error: adminError } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_admin", true)
    .limit(1)
    .single()

  if (adminError || !admin) {
    console.error("❌ No admin user found!")
    return
  }

  console.log(`✓ Admin found: ${admin.first_name} ${admin.last_name} (${admin.id})`)
  console.log("")

  // Step 3: Create a test template project
  console.log("3️⃣ Creating test template project...")
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: admin.id,
      title: "[TEST] Zone Copy Test",
      page_count: 2,
      paper_size: "A4",
      status: "draft",
    })
    .select()
    .single()

  if (projectError) {
    console.error("❌ Error creating project:", projectError)
    return
  }

  console.log(`✓ Project created: ${project.id}`)
  console.log("")

  // Step 4: Create a page with the layout
  console.log("4️⃣ Creating page...")
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .insert({
      project_id: project.id,
      page_number: 1,
      title: "Test Page",
    })
    .select()
    .single()

  if (pageError) {
    console.error("❌ Error creating page:", pageError)
    return
  }

  console.log(`✓ Page created: ${page.id}`)
  console.log("")

  // Step 5: Copy zones from layout to page
  console.log("5️⃣ Copying zones from layout to page...")

  if (!layout.zones || layout.zones.length === 0) {
    console.error("❌ No zones to copy!")
    return
  }

  const zonesToCopy = layout.zones.map((zone: any) => ({
    page_id: page.id,
    zone_index: zone.zone_index,
    zone_type: zone.zone_type || "photo",
    position_x: zone.position_x,
    position_y: zone.position_y,
    width: zone.width,
    height: zone.height,
  }))

  console.log("   Zones to insert:", JSON.stringify(zonesToCopy, null, 2))

  const { data: copiedZones, error: zoneError } = await supabase
    .from("zones")
    .insert(zonesToCopy)
    .select()

  if (zoneError) {
    console.error("❌ Error copying zones:", zoneError)
    return
  }

  console.log(`✓ Successfully copied ${copiedZones.length} zones!`)
  console.log("")

  // Step 6: Verify zones were created
  console.log("6️⃣ Verifying zones...")
  const { data: verifyZones, error: verifyError } = await supabase
    .from("zones")
    .select("*")
    .eq("page_id", page.id)
    .order("zone_index")

  if (verifyError) {
    console.error("❌ Error verifying zones:", verifyError)
    return
  }

  console.log(`✓ Found ${verifyZones.length} zones for the page:`)
  verifyZones.forEach((zone: any) => {
    console.log(`   Zone ${zone.zone_index}: ${zone.zone_type} at (${zone.position_x}, ${zone.position_y})`)
  })
  console.log("")

  // Cleanup
  console.log("🧹 Cleaning up test data...")
  await supabase.from("projects").delete().eq("id", project.id)
  console.log("✓ Cleanup complete")
}

testTemplateCreation()
  .then(() => {
    console.log("\n✅ Test complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  })
