import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signupPatient, signupDoctor } from '../services/auth'

const SignUpForm = () => {
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '')
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirm_password') ?? '')
    const phnNumber = String(formData.get('phnNumber') ?? '')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    // Validate role is selected
    if (!role) {
      setError('Please select a role')
      setIsSubmitting(false)
      return
    }

    try {
      if (role === 'patient') {
        await signupPatient(name, email, phnNumber, password)
        navigate('/login')
      } else if (role === 'doctor') {
        const speciality = String(formData.get('speciality') ?? '')
        const username = name.toLowerCase().replace(/\s+/g, '_')
        await signupDoctor(name, email, phnNumber, speciality, username, password)
        navigate('/login')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-2">Full Name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Enter your full name"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-2">Email Address</label>
        <input
          name="email"
          type="email"
          required
          placeholder="Enter your email"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-2">Phone Number</label>
        <input
          name="phnNumber"
          type="tel"
          required
          placeholder="Enter your phone number"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-3">I am a...</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="role"
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
              name="role"
              value="doctor"
              checked={role === 'doctor'}
              onChange={(event) => setRole(event.target.value)}
              className="w-4 h-4 text-navy-600"
            />
            <span className="ml-2 text-slate-700">Doctor</span>
          </label>
        </div>
      </div>

      {role === 'doctor' ? (
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-2">Speciality</label>
          <input
            type="text"
            name="speciality"
            required
            placeholder="Enter your speciality"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition"
          />
        </div>
      ) : null}

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

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-2">Confirm Password</label>
        <input
          name="confirm_password"
          type="password"
          required
          placeholder="Confirm your password"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-navy-600 text-white py-2 rounded-lg hover:bg-navy-700 transition-colors font-medium mt-6 disabled:opacity-70"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>    </form>
  )
}

export default SignUpForm