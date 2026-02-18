import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorDashboard from '../components/DoctorDashboard'
import PatientDashboard from '../components/PatientDashboard'
import { getSession } from '../services/auth'
import { User } from '../types/user'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getSession()
      .then((session) => {
        if (!session) {
          navigate('/login', { replace: true })
          return
        }
        setUser(session)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [navigate])

  if (isLoading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'patient' ? <PatientDashboard /> : <DoctorDashboard />}
      </main>
    </div>
  )
}
