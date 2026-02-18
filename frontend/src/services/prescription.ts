import { Prescription } from '../types/prescription'

const API_URL = 'http://localhost:8080'

export const submitPrescription = async (
  file: File,
  symptoms: string,
): Promise<Prescription> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('symptoms', symptoms)

  const response = await fetch(`${API_URL}/prescriptions/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to upload prescription')
  }

  const data = (await response.json()) as { success: boolean; prescription: Prescription }
  return data.prescription
}

export const getPatientPrescriptions = async (patientId: string): Promise<Prescription[]> => {
  const response = await fetch(`${API_URL}/prescriptions/${patientId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as { success: boolean; data: Prescription[] }
  return data.data
}

export const downloadPrescriptionFile = (filePath: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = `${API_URL}${filePath}`
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
