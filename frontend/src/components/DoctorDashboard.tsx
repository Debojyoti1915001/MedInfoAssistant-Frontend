import { useEffect, useState } from 'react'
import { getSession } from '../services/auth'
import {
  getDoctorPrescriptions,
  getPrescriptionDetails,
  updateItemReason,
  Prescription,
  PrescriptionItem,
} from '../services/doctor_prescription'
import PrescriptionApprovalModal from './PrescriptionApprovalModal'
import { User } from '../types/user'

interface PrescriptionWithItems extends Prescription {
  items?: PrescriptionItem[]
  aiAnalysis?: any
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithItems | null>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession()
        if (session) {
          setUser(session)
          const doctorPrescriptions = await getDoctorPrescriptions(session.id)
          setPrescriptions(doctorPrescriptions)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleViewPrescription = async (prescription: PrescriptionWithItems) => {
    setIsDetailsLoading(true)
    try {
      const details = await getPrescriptionDetails(prescription.id)
      setSelectedPrescription({
        ...prescription,
        items: details.items || [],
        aiAnalysis: details.aiAnalysis,
      })
    } catch (error) {
      console.error('Error fetching prescription details:', error)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const handleApprovePrescription = async (itemsWithReasons: PrescriptionItem[]) => {
    if (!selectedPrescription) return

    try {
      // Update all items with doctor's reasons
      for (const item of itemsWithReasons) {
        await updateItemReason(item.id, item.docReason)
      }

      // Update prescription status
      setPrescriptions((current) =>
        current.map((p) =>
          p.id === selectedPrescription.id ? { ...p, status: 'approved', items: itemsWithReasons } : p,
        ),
      )
    } catch (error) {
      throw error
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'pending')
  const approvedPrescriptions = prescriptions.filter((p) => p.status === 'approved')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Welcome, Dr. {user?.name}!</h1>
        <p className="text-slate-600">Review and manage prescription approvals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-yellow-600">{pendingPrescriptions.length}</div>
          <p className="text-slate-600 text-sm mt-2">Pending Reviews</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-600">{approvedPrescriptions.length}</div>
          <p className="text-slate-600 text-sm mt-2">Approved</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Pending Prescriptions</h2>
        {pendingPrescriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No pending prescriptions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Symptoms</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Patient ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700 font-medium">{prescription.id}</td>
                    <td className="py-3 px-4 text-slate-700 text-sm max-w-xs truncate">{prescription.symptoms}</td>
                    <td className="py-3 px-4 text-slate-700 text-sm">{prescription.userId}</td>
                    <td className="py-3 px-4 text-slate-700 text-sm">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewPrescription(prescription)}
                        disabled={isDetailsLoading}
                        className="px-3 py-1 bg-navy-600 text-white rounded text-sm hover:bg-navy-700 transition-colors disabled:opacity-70"
                      >
                        {isDetailsLoading ? 'Loading...' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {approvedPrescriptions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Approved Prescriptions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Symptoms</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Patient ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-700 font-medium">{prescription.id}</td>
                    <td className="py-3 px-4 text-slate-700 text-sm max-w-xs truncate">{prescription.symptoms}</td>
                    <td className="py-3 px-4 text-slate-700 text-sm">{prescription.userId}</td>
                    <td className="py-3 px-4 text-slate-700 text-sm">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPrescription && (
        <PrescriptionApprovalModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onApprove={handleApprovePrescription}
        />
      )}
    </div>
  )
}
