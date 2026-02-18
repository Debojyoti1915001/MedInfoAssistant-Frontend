import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, logout } from '../services/auth'
import { User } from '../types/user'

const LogoutButton = () => {
  const [session, setSession] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getSession().then((user) => {
      setSession(user)
    })
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex items-center gap-4">
      {session && <span className="text-slate-600">{session.name}</span>}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
      >
        Logout
      </button>
    </div>
  )
}

export default LogoutButton
