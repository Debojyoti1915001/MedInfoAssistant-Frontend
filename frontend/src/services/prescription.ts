import { Prescription, PrescriptionItem } from '../types/prescription'

const API_URL = 'https://medinfoassistant-backend.onrender.com'

interface PrescriptionWithItemsResponse {
  prescription: Prescription
  items?: PrescriptionItem[]
}

interface UpdatePrescriptionSeenStatusResponse extends Prescription {}

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
  return {
    ...data.prescription,
    seenByPatient: data.prescription.seenByPatient ?? false,
    items: [],
  }
}

export const getPatientPrescriptions = async (userId: number): Promise<Prescription[]> => {
  const response = await fetch(`${API_URL}/api/prescriptions/with-items?userId=${userId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as Array<PrescriptionWithItemsResponse | Prescription>
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((entry) => {
    if (entry && typeof entry === 'object' && 'prescription' in entry) {
      return {
        ...entry.prescription,
        seenByPatient: entry.prescription.seenByPatient ?? false,
        items: entry.items || [],
      }
    }

    return {
      ...entry,
      seenByPatient: entry.seenByPatient ?? false,
      items: entry.items || [],
    }
  })
}

export const updatePrescriptionSeenStatus = async (
  prescriptionId: number,
  seenByPatient: boolean,
): Promise<UpdatePrescriptionSeenStatusResponse> => {
  const response = await fetch(`${API_URL}/api/prescriptions/seen/update?id=${prescriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ seenByPatient }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to update seen status')
  }

  const data = (await response.json()) as UpdatePrescriptionSeenStatusResponse
  return {
    ...data,
    seenByPatient: data.seenByPatient ?? false,
    items: data.items || [],
  }
}

export const downloadPrescriptionFile = (fileUrl: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
