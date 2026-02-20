export interface User {
  id: number
  name: string
  email: string
  phnNumber?: string
  speciality?: string
  username?: string
  accuracy?: number
  token?: string
  createdAt?: string
  role?: 'doctor' | 'patient'
}
