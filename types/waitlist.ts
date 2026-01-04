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

export interface WaitlistRecord {
  id: string
  email: string
  ip_address: string | null
  user_agent: string | null
  unsubscribed: boolean
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
}
