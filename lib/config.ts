// Centralized configuration for feature flags
export const config = {
  // Coming Soon Mode - set to 'true' to enable coming soon page
  comingSoonMode: process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true',
} as const

// Type for config
export type AppConfig = typeof config
