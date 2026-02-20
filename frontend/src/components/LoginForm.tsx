import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, loginDoctor } from '../services/auth'
import { useToast } from '../context/ToastContext'

const LoginForm = () => {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [role, setRole] = useState('patient')
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      let user
      if (role === 'doctor') {
        user = await loginDoctor(email, password)
      } else {
        user = await login(email, password)
      }
      
      // Route based on user role (extracted from JWT token)
      if (user.role === 'doctor') {
        showSuccess('Login successful')
        navigate('/dashboard/doctor')
      } else {
        showSuccess('Login successful')
        navigate('/dashboard')
      }
    } catch {
      setError('Invalid credentials')
      showError('Invalid credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-3">I am a...</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="login_role"
              value="patient"
              checked={role === 'patient'}
              onChange={(event) => setRole(event.target.value)}
              className="w-4 h-4 text-navy-600"
            />
            <span className="ml-2 text-slate-700">Patient</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="login_role"
              value="doctor"
              checked={role === 'doctor'}
              onChange={(event) => setRole(event.target.value)}
              className="w-4 h-4 text-navy-600"
            />
            <span className="ml-2 text-slate-700">Doctor</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-2">Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-2">Password</label>
        <input
          name="password"
          type="password"
          required
          placeholder="Enter your password"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-navy-600 text-white py-2 rounded-lg hover:bg-navy-700 transition-colors font-medium mt-6 disabled:opacity-70"
      >
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  )
}

export default LoginForm
