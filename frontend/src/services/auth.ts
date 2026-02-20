import { User } from '../types/user'
import {
  decodeToken,
  setTokenCookie,
  setUserCookie,
  getTokenFromCookie,
  getUserFromCookie,
  removeTokenCookie,
  removeUserCookie,
} from '../utils/jwt'

// const API_URL = 'http://localhost:8080'
const API_URL = 'https://medinfoassistant-backend.onrender.com'

// Patient signup
export const signupPatient = async (
  name: string,
  email: string,
  phnNumber: string,
  password: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, phnNumber, password }),
  })
  console.log('Signup response status:', response.status)
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Signup failed')
  }

  const data = (await response.json()) as User
  return data
}

// Doctor signup
export const signupDoctor = async (
  name: string,
  email: string,
  phnNumber: string,
  speciality: string,
  username: string,
  password: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/doctors/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, phnNumber, speciality, username, password }),
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Doctor signup failed')
  }

  const data = (await response.json()) as User
  return data
}

// Patient login
export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/login`, {
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

  const data = (await response.json()) as User
  
  // Extract role from JWT token
  if (data.token) {
    const decoded = decodeToken(data.token)
    if (decoded) {
      data.role = decoded.role === 'user' ? 'patient' : (decoded.role as any)
    }
    // Store token in cookie
    setTokenCookie(data.token)
    // Store full login response in cookie for profile/session usage
    setUserCookie(data)
  }

  return data
}

// Doctor login
export const loginDoctor = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/doctors/login`, {
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

  const data = (await response.json()) as User
  
  // Extract role from JWT token
  if (data.token) {
    const decoded = decodeToken(data.token)
    console.log('Decoded token:', decoded)
    if (decoded) {
      data.role = decoded.role === 'user' ? 'patient' : (decoded.role as 'doctor' | 'patient')
    }
    // Store token in cookie
    setTokenCookie(data.token)
    // Store full login response in cookie for profile/session usage
    setUserCookie(data)
  }

  return data
}

export const getSession = async (): Promise<User | null> => {
  const token = getTokenFromCookie()
  
  if (!token) {
    return null
  }

  // Decode token to get user data
  const decoded = decodeToken(token)
  if (!decoded) {
    removeTokenCookie()
    return null
  }

  // Check if token is expired
  if (decoded.exp * 1000 < Date.now()) {
    removeTokenCookie()
    removeUserCookie()
    return null
  }

  const cookieUser = getUserFromCookie()

  return {
    id: cookieUser?.id ?? decoded.id,
    name: cookieUser?.name ?? decoded.name,
    email: cookieUser?.email ?? decoded.email,
    phnNumber: cookieUser?.phnNumber ?? decoded.phnNumber,
    speciality: cookieUser?.speciality ?? decoded.speciality,
    username: cookieUser?.username ?? decoded.username,
    accuracy: cookieUser?.accuracy ?? decoded.accuracy,
    createdAt: cookieUser?.createdAt ?? decoded.createdAt,
    token: token,
    role:
      (cookieUser?.role as User['role']) ??
      (decoded.role === 'user' ? 'patient' : (decoded.role as any)),
  } as User
}

export const logout = async (): Promise<void> => {
  removeTokenCookie()
  removeUserCookie()
}
