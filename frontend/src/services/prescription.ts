import { Prescription, PrescriptionItem } from '../types/prescription'

const API_URL = 'https://medinfoassistant-backend.onrender.com'

interface PrescriptionWithItemsResponse {
  prescription: Prescription
  items?: PrescriptionItem[]
}

interface UpdatePrescriptionSeenStatusResponse extends Prescription {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

const normalizePrescription = (value: unknown, fallbackItems?: PrescriptionItem[]): Prescription | null => {
  if (!isRecord(value)) {
    return null
  }

  const id = toNumber(value.id)
  const userId = toNumber(value.userId)
  const docId = toNumber(value.docId)
  if (id === null || userId === null || docId === null) {
    return null
  }

  const createdAt = typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString()
  const symptoms = typeof value.symptoms === 'string' ? value.symptoms : ''
  const link = typeof value.link === 'string' ? value.link : ''

  const itemsFromValue = Array.isArray(value.items) ? (value.items as PrescriptionItem[]) : []
  const normalizedItems = fallbackItems || itemsFromValue

  return {
    id,
    createdAt,
    symptoms,
    link,
    userId,
    docId,
    seenByPatient: Boolean(value.seenByPatient),
    items: normalizedItems,
  }
}

const normalizePrescriptionEntry = (entry: unknown): Prescription | null => {
  if (!isRecord(entry)) {
    return null
  }

  if ('prescription' in entry) {
    const nestedItems = Array.isArray(entry.items) ? (entry.items as PrescriptionItem[]) : []
    return normalizePrescription(entry.prescription, nestedItems)
  }

  return normalizePrescription(entry)
}

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

  const payload = (await response.json()) as unknown
  const createdPrescription = normalizePrescriptionEntry(payload)
  if (!createdPrescription) {
    throw new Error('Invalid prescription response from server')
  }

  return {
    ...createdPrescription,
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

  const data = (await response.json()) as unknown
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .map((entry) => normalizePrescriptionEntry(entry as PrescriptionWithItemsResponse | Prescription))
    .filter((entry): entry is Prescription => entry !== null)
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

  const data = (await response.json()) as unknown
  const normalized = normalizePrescriptionEntry(data as UpdatePrescriptionSeenStatusResponse)
  if (!normalized) {
    throw new Error('Invalid seen status response from server')
  }

  return normalized
}

export const downloadPrescriptionFile = (fileUrl: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
