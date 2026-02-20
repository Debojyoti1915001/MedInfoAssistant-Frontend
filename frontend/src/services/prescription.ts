import { Prescription } from '../types/prescription'

const API_URL = 'https://medinfoassistant-backend.onrender.com'

export const submitPrescription = async (
  file: File,
  symptoms: string,
  userId: number,
  doctorUsername: string,
): Promise<Prescription> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('symptoms', symptoms)
  formData.append('userId', String(userId))
  formData.append('doctorUsername', doctorUsername)

  const response = await fetch(`${API_URL}/api/prescriptions/create`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to upload prescription')
  }

  const data = (await response.json()) as { prescription: Prescription; aiAnalysis: any }
  return data.prescription
}

export const getPatientPrescriptions = async (userId: number): Promise<Prescription[]> => {
  const response = await fetch(`${API_URL}/api/prescriptions?userId=${userId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as Prescription[]
  return data || []
}

export const downloadPrescriptionFile = (fileUrl: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
