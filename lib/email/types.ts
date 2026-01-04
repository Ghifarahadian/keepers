/**
 * Email System Type Definitions
 * Type definitions for email sending and template rendering
 */

export interface EmailSendResult {
  success: boolean
  error?: string
  messageId?: string
}

export interface WaitlistWelcomeEmailProps {
  email: string
  unsubscribeUrl: string
}

export interface SendWaitlistEmailParams {
  email: string
  waitlistId: string
}
