import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LogoutButton from './LogoutButton'
import { getSession } from '../services/auth'
import { User } from '../types/user'

export default function Header() {
  const [session, setSession] = useState<User | null>(null)

  useEffect(() => {
    getSession()
      .then((user) => setSession(user))
      .catch(() => setSession(null))
  }, [])

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="font-bold text-xl text-navy-900">MedInfo</span>
        </Link>

        {session ? (
          <LogoutButton />
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-navy-600 hover:text-navy-700 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-200 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
