import { useEffect, useRef, useState } from 'react'
import { getSession } from '../services/auth'
import { getPatientPrescriptions, submitPrescription, downloadPrescriptionFile } from '../services/prescription'
import { Prescription } from '../types/prescription'
import { User } from '../types/user'

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [symptoms, setSymptoms] = useState('')
  const [doctorUsername, setDoctorUsername] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      return
    }

    const fileInput = fileInputRef.current
    if (!fileInput?.files?.[0]) {
      setUploadError('Please select a file')
      return
    }

    if (!doctorUsername.trim()) {
      setUploadError('Please enter a doctor username')
      return
    }

    const file = fileInput.files[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
    const maxSize = 10 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only jpg, png, gif, webp, bmp, and svg files are allowed')
      return
    }

    if (file.size > maxSize) {
      setUploadError('File size must be less than 10 MB')
      return
    }

    if (!symptoms.trim()) {
      setUploadError('Please describe your symptoms')
      return
    }

    setIsUploading(true)

    try {
      const newPrescription = await submitPrescription(file, symptoms, user.id, doctorUsername)
      setPrescriptions([newPrescription, ...prescriptions])
      setSymptoms('')
      setDoctorUsername('')
      if (fileInput) fileInput.value = ''
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload prescription')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-slate-600">Manage your health and connect with doctors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-navy-600">{prescriptions.length}</div>
          <p className="text-slate-600 text-sm mt-2">Active Prescriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Upload Prescription</h2>
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

            {uploadSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                Prescription uploaded successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-navy-600 text-white py-2 rounded-lg hover:bg-navy-700 transition-colors font-medium disabled:opacity-70"
            >
              {isUploading ? 'Uploading...' : 'Upload Prescription'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              📋 View Medical Records
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              💊 View Prescriptions
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-navy-900 font-medium">
              🔍 Find a Doctor
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Recent Prescriptions</h2>
        {prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No prescriptions yet</p>
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
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700">{prescription.id}</td>
                    <td className="py-3 px-4 text-slate-700 text-sm max-w-xs truncate">
                      {prescription.symptoms}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-sm">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-sm">{prescription.docId}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => downloadPrescriptionFile(prescription.link, `prescription-${prescription.id}`)}
                        className="px-3 py-1 bg-navy-600 text-white rounded text-sm hover:bg-navy-700 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
