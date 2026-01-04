"use server"

import { createClient } from "@supabase/supabase-js"
import { validateEmail } from "@/lib/validation"
import { headers } from "next/headers"
import { sendWaitlistWelcomeEmail } from "@/lib/email/send-waitlist-welcome"
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

    // First, try to insert as new user
    let { data, error } = await supabase
      .from("waitlist")
      .insert({
        email: normalizedEmail,
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single()

    // 5. Handle duplicate email (re-subscription case)
    if (error && error.code === "23505") {
      // Check if user was previously unsubscribed
      const { data: existingUser } = await supabase
        .from("waitlist")
        .select("id, unsubscribed")
        .eq("email", normalizedEmail)
        .single()

      if (existingUser && existingUser.unsubscribed) {
        // Re-subscribe: update unsubscribed status
        const { data: updatedData, error: updateError } = await supabase
          .from("waitlist")
          .update({
            unsubscribed: false,
            unsubscribed_at: null,
            ip_address: ip,
            user_agent: userAgent,
          })
          .eq("email", normalizedEmail)
          .select()
          .single()

        if (updateError) {
          console.error("Re-subscription error:", updateError)
          return { error: "Something went wrong. Please try again." }
        }

        // Use updated data for response
        data = updatedData
        error = null
      } else {
        // User is already subscribed (not unsubscribed)
        return { error: "This email is already on our waitlist!" }
      }
    } else if (error) {
      // Other errors
      console.error("Waitlist signup error:", error)
      return { error: "Something went wrong. Please try again." }
    }

    // Ensure data exists
    if (!data) {
      return { error: "Something went wrong. Please try again." }
    }

    // 6. Send welcome email (non-blocking)
    try {
      await sendWaitlistWelcomeEmail({
        email: normalizedEmail,
        waitlistId: data.id,
      })
    } catch (emailError) {
      // Log error but don't fail the request
      console.error("Failed to send welcome email:", {
        email: normalizedEmail,
        error: emailError instanceof Error ? emailError.message : "Unknown error",
      })
      // DO NOT return error to user - they successfully joined waitlist
    }

    // 7. Return success
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
