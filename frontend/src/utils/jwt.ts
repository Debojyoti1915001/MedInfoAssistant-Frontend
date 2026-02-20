export type JwtPayload = {
  id: number
  email: string
  role: 'doctor' | 'user'
  exp: number
  iat: number
  name?: string
  username?: string
  phnNumber?: string
  speciality?: string
  accuracy?: number
  createdAt?: string
}

type CookieUser = {
  id?: number
  name?: string
  email?: string
  phnNumber?: string
  speciality?: string
  username?: string
  accuracy?: number
  token?: string
  createdAt?: string
  role?: 'doctor' | 'patient'
}

// Decode JWT token and extract payload
export function decodeToken(token: string): JwtPayload | null {
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

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [cookieName, value] = cookie.trim().split('=')
    if (cookieName === name) {
      return value
    }
  }
  return null
}

// Set token in cookie
export function setTokenCookie(token: string, expiryDays: number = 7): void {
  const expiryDate = new Date()
  expiryDate.setTime(expiryDate.getTime() + expiryDays * 24 * 60 * 60 * 1000)
  const expires = `expires=${expiryDate.toUTCString()}`
  document.cookie = `token=${token};${expires};path=/`
}

// Set complete user payload in cookie
export function setUserCookie(user: CookieUser, expiryDays: number = 7): void {
  const expiryDate = new Date()
  expiryDate.setTime(expiryDate.getTime() + expiryDays * 24 * 60 * 60 * 1000)
  const expires = `expires=${expiryDate.toUTCString()}`
  const encodedUser = encodeURIComponent(JSON.stringify(user))
  document.cookie = `user=${encodedUser};${expires};path=/`
}

// Get token from cookie
export function getTokenFromCookie(): string | null {
  return getCookie('token')
}

// Get complete user payload from cookie
export function getUserFromCookie(): CookieUser | null {
  const rawUser = getCookie('user')
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(decodeURIComponent(rawUser)) as CookieUser
  } catch {
    return null
  }
}

// Remove token from cookie
export function removeTokenCookie(): void {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0'
}

// Remove user cookie
export function removeUserCookie(): void {
  document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0'
}
