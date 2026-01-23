/**
 * Email Sending Utility for Waitlist Welcome Emails
 * Sends branded welcome emails using Resend
 */

import { Resend } from "resend"
import { readFileSync } from "fs"
import { join } from "path"
import { generateUnsubscribeToken } from "./crypto"
import { getPlainTextContent } from "./templates/waitlist-welcome"
import type { EmailSendResult, SendWaitlistEmailParams } from "./types"

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Load HTML template from file (cached at module load)
let htmlTemplate: string | null = null

function loadHtmlTemplate(): string {
  if (!htmlTemplate) {
    const templatePath = join(process.cwd(), "email_templates", "waitlist-welcome.html")
    htmlTemplate = readFileSync(templatePath, "utf-8")
  }
  return htmlTemplate
}

/**
 * Send welcome email to a waitlist subscriber
 * @param params - Email and waitlist ID
 * @returns Result object with success status and optional error message
 */
export async function sendWaitlistWelcomeEmail(
  params: SendWaitlistEmailParams
): Promise<EmailSendResult> {
  const { email, waitlistId } = params

  try {
    // 1. Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error("RESEND_FROM_EMAIL environment variable is not set")
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("NEXT_PUBLIC_SITE_URL environment variable is not set")
    }

    // 2. Generate unsubscribe token
    const unsubscribeToken = generateUnsubscribeToken(waitlistId)

    // 3. Build unsubscribe URL
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/unsubscribe?token=${unsubscribeToken}`

    // 4. Get plain text version
    const textContent = getPlainTextContent(email, unsubscribeUrl)

    // 5. Load HTML template and replace variables
    const htmlTemplate = loadHtmlTemplate()
    const htmlContent = htmlTemplate
      .replace(/\{\{EMAIL\}\}/g, email)
      .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)

    // 6. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Welcome to KEEPERS - Your Story Awaits",
      html: htmlContent,
      text: textContent,
    })

    if (error) {
      console.error("Resend API error:", {
        error: error.message,
        email,
      })
      return {
        success: false,
        error: error.message,
      }
    }

    // 7. Return success
    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    // Log error for debugging
    console.error("Failed to send welcome email:", {
      email,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

