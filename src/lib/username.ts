// Supabase Auth requires an email-shaped identifier under the hood, so a
// username is mapped to a synthetic address on a domain nobody sends to.
const SHADOW_EMAIL_DOMAIN = 'accounts.process-hub.app'

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username.trim())
}

export function usernameToShadowEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${SHADOW_EMAIL_DOMAIN}`
}

export function shadowEmailToUsername(email: string | null | undefined): string {
  return email?.split('@')[0] ?? ''
}
