import { useEffect, useMemo, useRef, useState } from 'react'
import { getSession } from '../services/auth'
import {
  getPatientPrescriptions,
  submitPrescription,
  downloadPrescriptionFile,
  updatePrescriptionSeenStatus,
} from '../services/prescription'
import { Prescription, PrescriptionItem } from '../types/prescription'
import { User } from '../types/user'
import { useToast } from '../context/ToastContext'

const AI_REASON_PREFIX = 'AI Reason:'
const DOCTOR_REASON_PREFIX = 'Doctor Reason:'

interface ParsedRemark {
  aiReason: string
  doctorReason: string
  raw: string
}

const getRemarkItems = (prescription: Prescription): PrescriptionItem[] => {
  return (prescription.items || []).filter((item) => (item.docReason || '').trim().length > 0)
}

const parseDocReason = (docReason: string): ParsedRemark => {
  const raw = (docReason || '').trim()
  if (!raw) {
    return {
      aiReason: '',
      doctorReason: '',
      raw: '',
    }
  }

  const aiPrefixLower = AI_REASON_PREFIX.toLowerCase()
  const doctorPrefixLower = DOCTOR_REASON_PREFIX.toLowerCase()
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  let aiReason = ''
  const doctorReasonLines: string[] = []

  for (const line of lines) {
    const lower = line.toLowerCase()
    if (lower.startsWith(aiPrefixLower)) {
      const value = line.slice(AI_REASON_PREFIX.length).trim()
      if (value) {
        aiReason = value
      }
      continue
    }

    if (lower.startsWith(doctorPrefixLower)) {
      const value = line.slice(DOCTOR_REASON_PREFIX.length).trim()
      if (value) {
        doctorReasonLines.push(value)
      }
      continue
    }

    doctorReasonLines.push(line)
  }

  return {
    aiReason,
    doctorReason: doctorReasonLines.join('\n').trim(),
    raw,
  }
}

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [selectedRemarksPrescription, setSelectedRemarksPrescription] = useState<Prescription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [symptoms, setSymptoms] = useState('')
  const [doctorUsername, setDoctorUsername] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showError, showSuccess } = useToast()
  const displayName = user?.name || user?.username || user?.email?.split('@')[0] || 'User'
  const userDetails = [
    { label: 'ID', value: user?.id },
    { label: 'Name', value: user?.name },
    { label: 'Email', value: user?.email },
    { label: 'Username', value: user?.username },
    { label: 'Phone', value: user?.phnNumber },
    { label: 'Role', value: user?.role },
    { label: 'Speciality', value: user?.speciality },
    {
      label: 'Accuracy',
      value: typeof user?.accuracy === 'number' ? `${user.accuracy}%` : undefined,
    },
    {
      label: 'Created At',
      value: user?.createdAt ? new Date(user.createdAt).toLocaleString() : undefined,
    },
  ].filter((item) => item.value !== undefined && item.value !== null && String(item.value).trim() !== '')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession()
        if (session) {
          setUser(session)
          const patientPrescriptions = await getPatientPrescriptions(session.id)
          setPrescriptions(patientPrescriptions)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploadError('')
    setUploadSuccess(false)

    if (!user) {
      setUploadError('User not authenticated')
      showError('User not authenticated')
      return
    }

    const fileInput = fileInputRef.current
    if (!fileInput?.files?.[0]) {
      setUploadError('Please select a file')
      showError('Please select a file')
      return
    }

    if (!doctorUsername.trim()) {
      setUploadError('Please enter a doctor username')
      showError('Please enter a doctor username')
      return
    }

    const file = fileInput.files[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
    const maxSize = 10 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only jpg, png, gif, webp, bmp, and svg files are allowed')
      showError('Only jpg, png, gif, webp, bmp, and svg files are allowed')
      return
    }

    if (file.size > maxSize) {
      setUploadError('File size must be less than 10 MB')
      showError('File size must be less than 10 MB')
      return
    }

    if (!symptoms.trim()) {
      setUploadError('Please describe your symptoms')
      showError('Please describe your symptoms')
      return
    }

    setIsUploading(true)

    try {
      const newPrescription = await submitPrescription(file, symptoms, user.id, doctorUsername)
      setPrescriptions((current) => [{ ...newPrescription, items: [] }, ...current])
      setSymptoms('')
      setDoctorUsername('')
      if (fileInput) {
        fileInput.value = ''
      }
      setUploadSuccess(true)
      showSuccess('Prescription uploaded successfully')
      setIsUploadModalOpen(false)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload prescription'
      setUploadError(message)
      showError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const activePrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const hasDoctorRemarks = getRemarkItems(prescription).length > 0
      if (!hasDoctorRemarks) {
        return true
      }

      return !Boolean(prescription.seenByPatient)
    })
  }, [prescriptions])

  const recentPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const hasDoctorRemarks = getRemarkItems(prescription).length > 0
      return hasDoctorRemarks && Boolean(prescription.seenByPatient)
    })
  }, [prescriptions])

  const selectedRemarksItems = useMemo(() => {
    if (!selectedRemarksPrescription) {
      return []
    }

    return getRemarkItems(selectedRemarksPrescription)
  }, [selectedRemarksPrescription])

  const handleViewRemarks = async (prescription: Prescription) => {
    const remarkItems = getRemarkItems(prescription)
    if (remarkItems.length === 0) {
      showError('Doctor remarks are not available yet for this prescription')
      return
    }

    setSelectedRemarksPrescription(prescription)

    if (prescription.seenByPatient) {
      return
    }

    try {
      await updatePrescriptionSeenStatus(prescription.id, true)
      setPrescriptions((currentPrescriptions) =>
        currentPrescriptions.map((currentPrescription) =>
          currentPrescription.id === prescription.id
            ? { ...currentPrescription, seenByPatient: true }
            : currentPrescription,
        ),
      )
      setSelectedRemarksPrescription((currentSelected) =>
        currentSelected && currentSelected.id === prescription.id
          ? { ...currentSelected, seenByPatient: true }
          : currentSelected,
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update seen status for this prescription'
      showError(message)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6 animate-page-in">
      <div className="animate-rise">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Welcome, {displayName}!</h1>
        <p className="text-slate-600">Manage your health and connect with doctors</p>
        <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4 animate-rise animate-stagger-1">
          <h2 className="text-lg font-semibold text-navy-900 mb-3">User Details</h2>
          {userDetails.length === 0 ? (
            <p className="text-slate-500 text-sm">No profile details available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {userDetails.map((detail) => (
                <div key={detail.label} className="bg-slate-50 rounded-md p-3">
                  <p className="text-slate-500">{detail.label}</p>
                  <p
                    className={`text-navy-900 font-medium ${
                      detail.label === 'Email' ? 'break-all' : ''
                    }`}
                  >
                    {String(detail.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow animate-rise animate-stagger-2 animate-hover-lift">
          <div className="text-3xl font-bold text-navy-600">{activePrescriptions.length}</div>
          <p className="text-slate-600 text-sm mt-2">Active Prescriptions</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow animate-rise animate-stagger-3 animate-hover-lift">
          <div className="text-3xl font-bold text-green-600">{recentPrescriptions.length}</div>
          <p className="text-slate-600 text-sm mt-2">Recent Prescriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 animate-rise animate-stagger-2 animate-hover-lift">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Upload Prescription</h2>
          <p className="text-slate-600 mb-4">
            Open the upload form in a modal to submit a new prescription.
          </p>
          <button
            type="button"
            onClick={() => {
              setUploadError('')
              setUploadSuccess(false)
              setIsUploadModalOpen(true)
            }}
            className="w-full bg-navy-600 text-white py-2 rounded-lg hover:bg-navy-700 transition-colors font-medium animate-press"
          >
            Open Upload Form
          </button>

          {uploadSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
              Prescription uploaded successfully.
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 animate-rise animate-stagger-3 animate-hover-lift">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              View Medical Records
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              View Prescriptions
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              Find a Doctor
            </button>
          </div>
        </div>
      </div>

      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg p-6 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy-900">Upload Prescription</h2>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
                aria-label="Close upload modal"
              >
                x
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Doctor Username</label>
                <input
                  type="text"
                  value={doctorUsername}
                  onChange={(e) => setDoctorUsername(e.target.value)}
                  placeholder="Enter doctor's username"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Select File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Allowed: jpg, png, gif, webp, bmp, svg (Max 10 MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-2">Symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-navy-600 text-white py-2 rounded-lg hover:bg-navy-700 transition-colors font-medium disabled:opacity-70 animate-press"
              >
                {isUploading ? 'Uploading...' : 'Upload Prescription'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-6 animate-rise animate-stagger-3">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Active Prescriptions</h2>
        {activePrescriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No active prescriptions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Symptoms</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Doctor ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Remarks</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activePrescriptions.map((prescription) => {
                  const hasDoctorRemarks = getRemarkItems(prescription).length > 0
                  return (
                    <tr key={prescription.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700">{prescription.id}</td>
                      <td className="py-3 px-4 text-slate-700 text-sm max-w-xs truncate">
                        {prescription.symptoms}
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-sm">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-sm">{prescription.docId}</td>
                      <td className="py-3 px-4 text-sm">
                        {hasDoctorRemarks ? (
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                            New remarks
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                            Awaiting doctor
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => downloadPrescriptionFile(prescription.link, `prescription-${prescription.id}`)}
                          className="px-3 py-1 bg-navy-600 text-white rounded text-sm hover:bg-navy-700 transition-colors"
                        >
                          View File
                        </button>
                        <button
                          onClick={() => handleViewRemarks(prescription)}
                          disabled={!hasDoctorRemarks}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View Remarks
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 animate-rise animate-stagger-3">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Recent Prescriptions</h2>
        {recentPrescriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No recent prescriptions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Symptoms</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Doctor ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700">{prescription.id}</td>
                    <td className="py-3 px-4 text-slate-700 text-sm max-w-xs truncate">
                      {prescription.symptoms}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-sm">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-sm">{prescription.docId}</td>
                    <td className="py-3 px-4 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => downloadPrescriptionFile(prescription.link, `prescription-${prescription.id}`)}
                        className="px-3 py-1 bg-navy-600 text-white rounded text-sm hover:bg-navy-700 transition-colors"
                      >
                        View File
                      </button>
                      <button
                        onClick={() => handleViewRemarks(prescription)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        View Remarks
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRemarksPrescription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setSelectedRemarksPrescription(null)}
        >
          <div
            className="w-full max-w-3xl bg-white border border-slate-200 rounded-lg p-6 max-h-[90vh] overflow-y-auto animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy-900">
                Doctor Remarks for Prescription #{selectedRemarksPrescription.id}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedRemarksPrescription(null)}
                className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
                aria-label="Close remarks modal"
              >
                x
              </button>
            </div>

            <div className="space-y-4">
              {selectedRemarksItems.map((item) => {
                const parsedRemark = parseDocReason(item.docReason || '')
                return (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-navy-900">{item.name}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase">
                        {item.type}
                      </span>
                    </div>

                    {parsedRemark.aiReason && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-500 font-semibold">AI Reason</p>
                        <p className="text-sm text-slate-700">{parsedRemark.aiReason}</p>
                      </div>
                    )}

                    {parsedRemark.doctorReason && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-500 font-semibold">Doctor Reason</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{parsedRemark.doctorReason}</p>
                      </div>
                    )}

                    {!parsedRemark.aiReason && !parsedRemark.doctorReason && (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{parsedRemark.raw}</p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRemarksPrescription(null)}
                className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
