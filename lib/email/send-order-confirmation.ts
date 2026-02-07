/**
 * Email Sending Utility for Order Confirmation Emails
 * Sends branded confirmation emails using Resend when voucher is redeemed
 */

import { Resend } from "resend"
import { readFileSync } from "fs"
import { join } from "path"

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Load HTML template from file (cached at module load)
let htmlTemplate: string | null = null

function loadHtmlTemplate(): string {
  if (!htmlTemplate) {
    const templatePath = join(process.cwd(), "email_templates", "order-confirmation.html")
    htmlTemplate = readFileSync(templatePath, "utf-8")
  }
  return htmlTemplate
}

export interface SendOrderConfirmationParams {
  email: string
  customerName: string
  projectTitle: string
  pageCount: number
  voucherCode: string
  address: string
  postalCode: string
  phoneNumber: string
}

export interface EmailSendResult {
  success: boolean
  error?: string
  messageId?: string
}

/**
 * Send order confirmation email after successful voucher redemption
 * @param params - Order and customer details
 * @returns Result object with success status and optional error message
 */
export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams
): Promise<EmailSendResult> {
  const {
    email,
    customerName,
    projectTitle,
    pageCount,
    voucherCode,
    address,
    postalCode,
    phoneNumber,
  } = params

  try {
    // 1. Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error("RESEND_FROM_EMAIL environment variable is not set")
    }

    // 2. Format order date
    const orderDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // 3. Load HTML template and replace variables
    const htmlTemplate = loadHtmlTemplate()
    const htmlContent = htmlTemplate
      .replace(/\{\{CUSTOMER_NAME\}\}/g, customerName)
      .replace(/\{\{PROJECT_TITLE\}\}/g, projectTitle)
      .replace(/\{\{PAGE_COUNT\}\}/g, pageCount.toString())
      .replace(/\{\{ORDER_DATE\}\}/g, orderDate)
      .replace(/\{\{VOUCHER_CODE\}\}/g, voucherCode)
      .replace(/\{\{ADDRESS\}\}/g, address || "Not provided")
      .replace(/\{\{POSTAL_CODE\}\}/g, postalCode || "Not provided")
      .replace(/\{\{PHONE_NUMBER\}\}/g, phoneNumber || "Not provided")
      .replace(/\{\{EMAIL\}\}/g, email)

    // 4. Generate plain text version
    const textContent = `
KEEPERS - Order Confirmed!

Thank you for your order, ${customerName}!

Your custom photobook "${projectTitle}" is now being prepared.

ORDER DETAILS:
- Photobook Title: ${projectTitle}
- Number of Pages: ${pageCount}
- Order Date: ${orderDate}
- Voucher Code: ${voucherCode}

DELIVERY ADDRESS:
${customerName}
${address || "Not provided"}
${postalCode || "Not provided"}
${phoneNumber || "Not provided"}
${email}

WHAT'S NEXT?
• Your photobook will be carefully crafted and printed
• Processing time: up to 2 weeks
• You'll receive tracking information once shipped
• We'll notify you of any updates

Questions about your order? Contact us at hello@keepers.id

---
For the moments worth more than a scroll.
© 2026 KEEPERS. All rights reserved.
    `.trim()

    // 5. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: `Order Confirmed - ${projectTitle} | KEEPERS`,
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

    // 6. Return success
    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    // Log error for debugging
    console.error("Failed to send order confirmation email:", {
      email,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
