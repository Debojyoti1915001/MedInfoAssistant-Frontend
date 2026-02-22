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
  items?: PrescriptionItem[]
  aiAnalysis?: unknown
}

export interface Prescription extends BasePrescription {
  status: PrescriptionStatus
  items?: PrescriptionItem[]
  aiAnalysis?: unknown
}

interface PrescriptionDetails {
  items: PrescriptionItem[]
  aiAnalysis: unknown | null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

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
    aiAnalysis: entry.aiAnalysis ?? null,
    status: deriveStatus(items),
  }
}

const isNestedPrescription = (value: unknown): value is DoctorPrescriptionWithItemsResponse => {
  if (!isRecord(value)) {
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

    const directPrescription = entry as BasePrescription & { items?: PrescriptionItem[]; aiAnalysis?: unknown }
    const items = directPrescription.items || []
    return {
      ...directPrescription,
      items,
      aiAnalysis: directPrescription.aiAnalysis ?? null,
      status: deriveStatus(items),
    }
  })
}

// Get prescription details with items and AI analysis
export const getPrescriptionDetails = async (prescriptionId: number): Promise<PrescriptionDetails> => {
  const response = await fetch(`${API_URL}/api/items?presId=${prescriptionId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch prescription details')
  }

  const payload = (await response.json()) as unknown

  if (Array.isArray(payload)) {
    return {
      items: payload as PrescriptionItem[],
      aiAnalysis: null,
    }
  }

  if (isRecord(payload)) {
    const itemsField = Array.isArray(payload.items) ? (payload.items as PrescriptionItem[]) : []

    return {
      items: itemsField,
      aiAnalysis: ('aiAnalysis' in payload ? payload.aiAnalysis : null) ?? null,
    }
  }

  return {
    items: [],
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

export const updateItemReasons = async (items: Array<Pick<PrescriptionItem, 'id' | 'docReason'>>): Promise<void> => {
  for (const item of items) {
    await updateItemReason(item.id, item.docReason)
  }
}
