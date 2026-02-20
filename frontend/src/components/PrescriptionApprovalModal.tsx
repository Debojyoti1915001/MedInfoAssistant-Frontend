import { useMemo, useState } from 'react'

interface Item {
  id: number
  name: string
  type: string
  aiReasons: string
  docReason: string
  presId: number
}

interface ReasonOption {
  text: string
  precision: number | null
}

type ReasonSource = Record<string, unknown>

interface AIAnalysis {
  tests?: Record<string, ReasonSource>
  medicines?: Record<string, ReasonSource>
}

interface PrescriptionApprovalModalProps {
  prescription: {
    id: number
    symptoms: string
    link: string
    items?: Item[]
    aiAnalysis?: unknown
  }
  onClose: () => void
  onApprove: (itemsWithReasons: Item[]) => Promise<void>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeText = (value: string) => value.trim().toLowerCase()

const parsePrecision = (value: unknown): number | null => {
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

const sortReasonOptions = (a: ReasonOption, b: ReasonOption) => {
  const precisionA = a.precision ?? -1
  const precisionB = b.precision ?? -1

  if (precisionB !== precisionA) {
    return precisionB - precisionA
  }

  return a.text.localeCompare(b.text)
}

const extractReasonOptions = (source: ReasonSource): ReasonOption[] => {
  const extracted: Array<ReasonOption & { order: number }> = []

  for (const [key, value] of Object.entries(source)) {
    if (typeof value !== 'string' || !value.trim()) {
      continue
    }

    const match = key.match(/^(reason|description)(\d+)$/i)
    if (!match) {
      continue
    }

    const order = Number(match[2])
    const precision = parsePrecision(source[`precision${match[2]}`])
    extracted.push({
      text: value.trim(),
      precision,
      order: Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER,
    })
  }

  extracted.sort((a, b) => {
    const byPrecision = sortReasonOptions(a, b)
    if (byPrecision !== 0) {
      return byPrecision
    }

    return a.order - b.order
  })

  return extracted.map(({ order: _order, ...reason }) => reason)
}

const parseAIReasonString = (value: string): ReasonSource | null => {
  if (!value.trim()) {
    return null
  }

  try {
    const parsed = JSON.parse(value) as unknown
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

const toSection = (value: unknown): Record<string, ReasonSource> | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const section: Record<string, ReasonSource> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (isRecord(entry)) {
      section[key] = entry
    }
  }

  return Object.keys(section).length > 0 ? section : undefined
}

const parseAIAnalysis = (value: unknown): AIAnalysis | null => {
  if (!isRecord(value)) {
    return null
  }

  const tests = toSection(value.tests)
  const medicines = toSection(value.medicines)

  if (!tests && !medicines) {
    return null
  }

  return { tests, medicines }
}

const findAnalysisReasonSource = (item: Item, aiAnalysis: AIAnalysis | null): ReasonSource | null => {
  if (!aiAnalysis) {
    return null
  }

  const itemName = normalizeText(item.name)
  const itemType = item.type.toLowerCase()
  const preferredSections =
    itemType.includes('med') ? [aiAnalysis.medicines, aiAnalysis.tests] : [aiAnalysis.tests, aiAnalysis.medicines]

  for (const section of preferredSections) {
    if (!section) {
      continue
    }

    for (const [key, value] of Object.entries(section)) {
      if (normalizeText(key) === itemName) {
        return value
      }

      const valueName = value.name
      if (typeof valueName === 'string' && normalizeText(valueName) === itemName) {
        return value
      }
    }
  }

  return null
}

const mergeReasonOptions = (sources: Array<ReasonSource | null>): ReasonOption[] => {
  const deduped = new Map<string, ReasonOption>()

  for (const source of sources) {
    if (!source) {
      continue
    }

    for (const option of extractReasonOptions(source)) {
      const key = normalizeText(option.text)
      const existing = deduped.get(key)
      if (!existing) {
        deduped.set(key, option)
        continue
      }

      const existingPrecision = existing.precision ?? -1
      const incomingPrecision = option.precision ?? -1
      if (incomingPrecision > existingPrecision) {
        deduped.set(key, option)
      }
    }
  }

  return Array.from(deduped.values()).sort(sortReasonOptions)
}

const formatPrecision = (precision: number | null): string | null => {
  if (precision === null) {
    return null
  }

  const percent = precision <= 1 ? precision * 100 : precision
  const rounded = percent >= 10 ? Math.round(percent) : Math.round(percent * 10) / 10
  return `${rounded}%`
}

export default function PrescriptionApprovalModal({
  prescription,
  onClose,
  onApprove,
}: PrescriptionApprovalModalProps) {
  const [items, setItems] = useState<Item[]>(prescription.items || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const aiAnalysis = useMemo(() => parseAIAnalysis(prescription.aiAnalysis), [prescription.aiAnalysis])
  const reasonOptionsByItemId = useMemo(() => {
    const options = new Map<number, ReasonOption[]>()

    for (const item of items) {
      const parsedItemSource = parseAIReasonString(item.aiReasons || '')
      const analysisSource = findAnalysisReasonSource(item, aiAnalysis)
      options.set(item.id, mergeReasonOptions([parsedItemSource, analysisSource]))
    }

    return options
  }, [aiAnalysis, items])

  const handleReasonChange = (itemId: number, newReason: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, docReason: newReason } : item)),
    )
  }

  const handleApprove = async () => {
    setError('')

    const itemsWithoutReasons = items.filter((item) => !(item.docReason || '').trim())
    if (itemsWithoutReasons.length > 0) {
      setError(`Please provide reasons for: ${itemsWithoutReasons.map((i) => i.name).join(', ')}`)
      return
    }

    const itemsWithInvalidSelections = items.filter((item) => {
      const options = reasonOptionsByItemId.get(item.id) || []
      if (options.length === 0) {
        return false
      }

      return !options.some((option) => option.text === item.docReason)
    })

    if (itemsWithInvalidSelections.length > 0) {
      setError(`Please select an AI reason for: ${itemsWithInvalidSelections.map((i) => i.name).join(', ')}`)
      return
    }

    setIsSubmitting(true)
    try {
      await onApprove(items)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve prescription')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-navy-900">Review & Approve Prescription</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl">
            x
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-3">Prescription Image</h3>
            <div className="bg-slate-100 rounded-lg overflow-hidden">
              <img src={prescription.link} alt="Prescription" className="w-full max-h-96 object-contain" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Patient Symptoms</h3>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{prescription.symptoms}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Medicines & Tests</h3>
            <div className="space-y-4">
              {items.map((item) => {
                const reasonOptions = reasonOptionsByItemId.get(item.id) || []
                const hasReasonOptions = reasonOptions.length > 0
                return (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-navy-700">{item.name}</h4>
                        <span className="text-sm text-slate-500">{item.type === 'med' ? 'Medicine' : 'Test'}</span>
                      </div>
                    </div>

                    {hasReasonOptions ? (
                      <div className="bg-blue-50 p-3 rounded-lg text-sm space-y-2">
                        <p className="font-semibold text-blue-900">AI Suggested Reasons (Highest Precision First)</p>
                        {reasonOptions.map((option, index) => {
                          const precisionLabel = formatPrecision(option.precision)
                          return (
                            <label
                              key={`${item.id}-${index}-${option.text}`}
                              className={`flex items-start justify-between gap-3 rounded-md px-3 py-2 border cursor-pointer ${
                                item.docReason === option.text
                                  ? 'border-blue-600 bg-white'
                                  : 'border-blue-100 bg-blue-50 hover:bg-white'
                              }`}
                            >
                              <span className="flex items-start gap-2">
                                <input
                                  type="radio"
                                  name={`ai-reason-${item.id}`}
                                  value={option.text}
                                  checked={item.docReason === option.text}
                                  onChange={() => handleReasonChange(item.id, option.text)}
                                  className="mt-1"
                                />
                                <span className="text-blue-900">{option.text}</span>
                              </span>
                              {precisionLabel && (
                                <span className="text-xs font-semibold text-blue-700 whitespace-nowrap">
                                  {precisionLabel}
                                </span>
                              )}
                            </label>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                        AI reasons are unavailable for this item. Please enter your own reason below.
                      </div>
                    )}

                    {hasReasonOptions ? (
                      <div className="text-sm text-slate-700">
                        <span className="font-medium text-navy-900">Selected Reason: </span>
                        {(item.docReason || '').trim() || 'Not selected'}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-2">
                          Your Reason / Notes for {item.name}
                        </label>
                        <textarea
                          value={item.docReason}
                          onChange={(e) => handleReasonChange(item.id, e.target.value)}
                          placeholder={`Enter your professional opinion about this ${item.type === 'med' ? 'medicine' : 'test'}...`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent text-sm"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-70"
            >
              {isSubmitting ? 'Approving...' : 'Approve & Save'}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-400 transition-colors font-medium disabled:opacity-70"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
