import { User } from '../types/user'

const API_URL = 'http://localhost:8080'

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error('Invalid credentials')
  }

  const data = (await response.json()) as { user: User }
  return data.user
}

export const getSession = async (): Promise<User | null> => {
  const response = await fetch(`${API_URL}/auth/session`, {
    credentials: 'include',
  })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as User | null
}

export const logout = async (): Promise<void> => {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
