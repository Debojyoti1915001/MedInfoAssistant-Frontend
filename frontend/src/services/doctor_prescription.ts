const API_URL = 'https://medinfoassistant-backend.onrender.com'

export interface PrescriptionItem {
  id: number
  name: string
  type: string
  aiReasons: string
  docReason: string
  presId: number
}

export type PrescriptionStatus = 'pending' | 'approved' | 'rejected'

interface BasePrescription {
  id: number
  createdAt: string
  symptoms: string
  link: string
  userId: number
  docId: number
}

interface DoctorPrescriptionWithItemsResponse {
  prescription: BasePrescription
  items: PrescriptionItem[]
}

export interface Prescription extends BasePrescription {
  status: PrescriptionStatus
  items?: PrescriptionItem[]
}

const deriveStatus = (items: PrescriptionItem[] = []): PrescriptionStatus => {
  if (items.length === 0) {
    return 'pending'
  }

  const allReviewed = items.every((item) => (item.docReason || '').trim().length > 0)
  return allReviewed ? 'approved' : 'pending'
}

const flattenDoctorPrescription = (entry: DoctorPrescriptionWithItemsResponse): Prescription => {
  const items = entry.items || []
  return {
    ...entry.prescription,
    items,
    status: deriveStatus(items),
  }
}

const isNestedPrescription = (value: unknown): value is DoctorPrescriptionWithItemsResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'prescription' in value
}

// Get all prescriptions for a doctor with items
export const getDoctorPrescriptions = async (doctorId: number): Promise<Prescription[]> => {
  const response = await fetch(`${API_URL}/api/doctors/prescriptions-with-items?docId=${doctorId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as unknown
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((entry) => {
    if (isNestedPrescription(entry)) {
      return flattenDoctorPrescription(entry)
    }

    const directPrescription = entry as BasePrescription & { items?: PrescriptionItem[] }
    const items = directPrescription.items || []
    return {
      ...directPrescription,
      items,
      status: deriveStatus(items),
    }
  })
}

// Get prescription details with items and AI analysis
export const getPrescriptionDetails = async (prescriptionId: number): Promise<any> => {
  const response = await fetch(`${API_URL}/api/items?presId=${prescriptionId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch prescription details')
  }

  const items = (await response.json()) as PrescriptionItem[]
  return {
    items: items || [],
    aiAnalysis: null,
  }
}

// Update item with doctor's reason
export const updateItemReason = async (itemId: number, docReason: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/items/update?id=${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      docReason,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to update item reason')
  }
}
