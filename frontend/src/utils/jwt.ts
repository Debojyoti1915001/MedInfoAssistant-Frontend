// Decode JWT token and extract payload
export function decodeToken(token: string): { id: number; email: string; role: 'doctor' | 'user'; exp: number; iat: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode base64url
    const decoded = atob(parts[1])
    const payload = JSON.parse(decoded)
    return payload
  } catch {
    return null
  }
}

// Set token in cookie
export function setTokenCookie(token: string, expiryDays: number = 7): void {
  const expiryDate = new Date()
  expiryDate.setTime(expiryDate.getTime() + expiryDays * 24 * 60 * 60 * 1000)
  const expires = `expires=${expiryDate.toUTCString()}`
  document.cookie = `token=${token};${expires};path=/`
}

// Get token from cookie
export function getTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'token') {
      return value
    }
  }
  return null
}

// Remove token from cookie
export function removeTokenCookie(): void {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0'
}
