/**
 * Waitlist Type Definitions
 * Type-safe interfaces for the waitlist feature
 */

export interface WaitlistFormData {
  email: string
}

export interface WaitlistResponse {
  data?: {
    id: string
    email: string
    created_at: string
  }
  error?: string
  success?: boolean
}
