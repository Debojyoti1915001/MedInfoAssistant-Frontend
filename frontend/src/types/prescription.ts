export interface PrescriptionItem {
  id: number
  name: string
  type: string
  aiReasons: string
  docReason: string
  presId: number
}

export interface Prescription {
  id: number
  createdAt: string
  symptoms: string
  link: string
  userId: number
  docId: number
  seenByPatient?: boolean
  items?: PrescriptionItem[]
}
