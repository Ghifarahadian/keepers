/**
 * Waitlist Welcome Email Template
 * Plain text version for email fallback
 */

/**
 * Plain text version of the email (fallback for text-only email clients)
 */
export function getPlainTextContent(email: string, unsubscribeUrl: string) {
  return `
KEEPERS
Your Story, Well Kept

Welcome!

Thank you for joining the waitlist for KEEPERS. You're one of the first to be notified when we launch our custom photobook service.

What to Expect:
• Exclusive early access to KEEPERS
• Launch date announcement
• Behind-the-scenes updates

Stay Connected:
Instagram: https://www.instagram.com/keepers_id/
TikTok: https://www.tiktok.com/@keepers_id

For the moments worth more than a scroll.

---

You're receiving this email because you signed up at ${email}
Unsubscribe: ${unsubscribeUrl}
  `.trim()
}
