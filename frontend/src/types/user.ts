export interface User {
  name: string
  email: string
  role: 'doctor' | 'patient'
  patient_id?: string
  doctor_id?: string
}
