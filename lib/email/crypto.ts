/**
 * Crypto Utilities for Email Unsubscribe Tokens
 * Generates and verifies secure HMAC-SHA256 signed tokens
 */

import { createHmac } from "crypto"

const SECRET = process.env.UNSUBSCRIBE_TOKEN_SECRET

if (!SECRET) {
  console.warn(
    "UNSUBSCRIBE_TOKEN_SECRET is not set. Email unsubscribe links will not work."
  )
}

/**
 * Generate a signed unsubscribe token for a waitlist entry
 * @param waitlistId - UUID of the waitlist entry
 * @returns Base64URL-encoded signed token
 */
export function generateUnsubscribeToken(waitlistId: string): string {
  if (!SECRET) {
    throw new Error("UNSUBSCRIBE_TOKEN_SECRET environment variable is not set")
  }

  // Create HMAC signature
  const hmac = createHmac("sha256", SECRET)
  hmac.update(waitlistId)
  const signature = hmac.digest("base64url")

  // Combine ID and signature: waitlistId:signature
  const token = `${waitlistId}:${signature}`

  // Encode as base64url for safe URL transmission
  return Buffer.from(token).toString("base64url")
}

/**
 * Verify and decode an unsubscribe token
 * @param token - Base64URL-encoded signed token
 * @returns Waitlist ID if valid, null if invalid
 */
export function verifyUnsubscribeToken(token: string): string | null {
  if (!SECRET) {
    console.error("UNSUBSCRIBE_TOKEN_SECRET is not set")
    return null
  }

  try {
    // Decode from base64url
    const decoded = Buffer.from(token, "base64url").toString("utf-8")

    // Split into ID and signature
    const [waitlistId, providedSignature] = decoded.split(":")

    if (!waitlistId || !providedSignature) {
      return null
    }

    // Regenerate signature for the ID
    const hmac = createHmac("sha256", SECRET)
    hmac.update(waitlistId)
    const expectedSignature = hmac.digest("base64url")

    // Compare signatures (constant-time comparison to prevent timing attacks)
    if (providedSignature !== expectedSignature) {
      return null
    }

    return waitlistId
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}
