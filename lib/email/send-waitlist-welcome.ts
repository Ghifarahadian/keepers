/**
 * Email Sending Utility for Waitlist Welcome Emails
 * Sends branded welcome emails using Resend
 */

import { Resend } from "resend"
import { generateUnsubscribeToken } from "./crypto"
import { getPlainTextContent } from "./templates/waitlist-welcome"
import type { EmailSendResult, SendWaitlistEmailParams } from "./types"

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

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

    // 5. Build HTML email content (inline, no React rendering needed)
    const htmlContent = buildEmailHtml(email, unsubscribeUrl)

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

/**
 * Build HTML email content
 * Pure HTML/CSS email template without React rendering
 */
function buildEmailHtml(email: string, unsubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to KEEPERS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #2F6F73; font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2F6F73;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #2F6F73;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 48px; font-weight: normal; color: #FDFDFD; letter-spacing: 0.05em;">KEEPERS</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 300; color: rgba(253, 253, 253, 0.8); font-style: italic;">Your Story, Well Kept</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom: 32px;">
              <hr style="border: none; border-top: 1px solid rgba(253, 253, 253, 0.2); margin: 0;" />
            </td>
          </tr>

          <!-- Welcome message -->
          <tr>
            <td style="padding-bottom: 24px;">
              <h2 style="margin: 0; font-size: 32px; font-weight: normal; color: #FDFDFD; text-align: center;">Welcome!</h2>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 18px; line-height: 1.6; color: #FDFDFD; text-align: center;">
                Thank you for joining the waitlist for KEEPERS. You're one of the first to be notified when we launch our custom photobook service.
              </p>
            </td>
          </tr>

          <!-- What to expect -->
          <tr>
            <td style="padding-bottom: 16px;">
              <h3 style="margin: 0; font-size: 24px; font-weight: normal; color: #FDFDFD; text-align: center;">What to Expect</h3>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 16px; line-height: 1.8; color: #FDFDFD; padding-left: 40px;">
                    <p style="margin: 0 0 8px 0;">• Exclusive early access to KEEPERS</p>
                    <p style="margin: 0 0 8px 0;">• Launch date announcement</p>
                    <p style="margin: 0 0 8px 0;">• Behind-the-scenes updates</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Stay connected -->
          <tr>
            <td style="padding-bottom: 16px;">
              <h3 style="margin: 0; font-size: 24px; font-weight: normal; color: #FDFDFD; text-align: center;">Stay Connected</h3>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 12px;">
                    <a href="https://www.instagram.com/keepers_id/" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #FF6F61; color: #FDFDFD; text-decoration: none; border-radius: 24px; font-size: 14px; font-weight: 500;">Instagram</a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="https://www.tiktok.com/@thisisarinok" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #FF6F61; color: #FDFDFD; text-decoration: none; border-radius: 24px; font-size: 14px; font-weight: 500;">TikTok</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom: 24px;">
              <hr style="border: none; border-top: 1px solid rgba(253, 253, 253, 0.2); margin: 0;" />
            </td>
          </tr>

          <!-- Tagline -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 18px; font-style: italic; color: rgba(253, 253, 253, 0.8);">For the moments worth more than a scroll.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 16px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(253, 253, 253, 0.6);">You're receiving this email because you signed up at ${email}</p>
              <a href="${unsubscribeUrl}" style="color: #FF6F61; font-size: 12px; text-decoration: underline;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
