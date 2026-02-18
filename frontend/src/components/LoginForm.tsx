import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'

const LoginForm = () => {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      const user = await login(email, password)
      // Route based on user role
      if (user.role === 'doctor') {
        navigate('/dashboard/doctor')
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Invalid credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
