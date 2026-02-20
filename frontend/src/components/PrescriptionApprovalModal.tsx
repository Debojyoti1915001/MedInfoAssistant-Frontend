import { useState } from 'react'

interface Item {
  id: number
  name: string
  type: string
  aiReasons: string
  docReason: string
  presId: number
}

interface PrescriptionApprovalModalProps {
  prescription: {
    id: number
    symptoms: string
    link: string
    items?: Item[]
    aiAnalysis?: any
  }
  onClose: () => void
  onApprove: (itemsWithReasons: Item[]) => Promise<void>
}

export default function PrescriptionApprovalModal({
  prescription,
  onClose,
  onApprove,
}: PrescriptionApprovalModalProps) {
  const [items, setItems] = useState<Item[]>(prescription.items || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleReasonChange = (itemId: number, newReason: string) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, docReason: newReason } : item)))
  }

  const handleApprove = async () => {
    setError('')

    // Check if all items have reasons
    const itemsWithoutReasons = items.filter((item) => !item.docReason.trim())
    if (itemsWithoutReasons.length > 0) {
      setError(`Please provide reasons for: ${itemsWithoutReasons.map((i) => i.name).join(', ')}`)
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

  const parseAIReasons = (aiReasonsStr: string) => {
    try {
      return JSON.parse(aiReasonsStr)
    } catch {
      return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-navy-900">Review & Approve Prescription</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Prescription Image */}
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-3">Prescription Image</h3>
            <div className="bg-slate-100 rounded-lg overflow-hidden">
              <img src={prescription.link} alt="Prescription" className="w-full max-h-96 object-contain" />
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Patient Symptoms</h3>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{prescription.symptoms}</p>
          </div>

          {/* Items to Approve */}
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Medicines & Tests</h3>
            <div className="space-y-4">
              {items.map((item) => {
                const aiReasons = parseAIReasons(item.aiReasons)
                return (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-navy-700">{item.name}</h4>
                        <span className="text-sm text-slate-500">
                          {item.type === 'med' ? '💊 Medicine' : '🔬 Test'}
                        </span>
                      </div>
                    </div>

                    {/* AI Reasons */}
                    {aiReasons && (
                      <div className="bg-blue-50 p-3 rounded text-sm space-y-1">
                        <p className="font-semibold text-blue-900">AI Reasons:</p>
                        <p className="text-blue-800">{aiReasons.reason1}</p>
                        <p className="text-blue-800">{aiReasons.reason2}</p>
                        <p className="text-blue-800">{aiReasons.reason3}</p>
                      </div>
                    )}

                    {/* Doctor's Reason Input */}
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
                  </div>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          {/* Actions */}
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
