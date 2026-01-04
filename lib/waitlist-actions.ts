"use server"

import { createClient } from "@supabase/supabase-js"
import { validateEmail } from "@/lib/validation"
import { headers } from "next/headers"
import type { WaitlistFormData, WaitlistResponse } from "@/types/waitlist"

/**
 * Server Action: Join Waitlist
 * Validates and stores email addresses for the waitlist
 */
export async function joinWaitlist(
  formData: WaitlistFormData
): Promise<WaitlistResponse> {
  try {
    // 1. Validate email format
    if (!validateEmail(formData.email)) {
      return { error: "Please enter a valid email address" }
    }

    // 2. Get client information for spam prevention
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") ||
               headersList.get("x-real-ip") ||
               null
    const userAgent = headersList.get("user-agent") || null

    // 3. Normalize email (lowercase and trim)
    const normalizedEmail = formData.email.toLowerCase().trim()

    // 4. Insert into database
    // Use direct Supabase client with anon key (bypasses session/cookie issues)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from("waitlist")
      .insert({
        email: normalizedEmail,
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single()

    // 5. Handle errors
    if (error) {
      // Duplicate email (unique constraint violation)
      if (error.code === "23505") {
        return { error: "This email is already on our waitlist!" }
      }

      // Log error for debugging but return generic message to user
      console.error("Waitlist signup error:", error)
      return { error: "Something went wrong. Please try again." }
    }

    // 6. Return success
    return {
      data: {
        id: data.id,
        email: data.email,
        created_at: data.created_at
      },
      success: true
    }
  } catch (error) {
    console.error("Unexpected error in joinWaitlist:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
