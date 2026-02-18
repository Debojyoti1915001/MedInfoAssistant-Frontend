import { Link } from 'react-router-dom'
import SignUpForm from '../components/SignUpForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-navy-900 mb-2">Create Account</h2>
          <p className="text-slate-600">Join us as a patient or doctor</p>
        </div>

        <SignUpForm />

        <div className="mt-6 text-center text-slate-600">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-navy-600 hover:text-navy-700 font-medium">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-slate-600 hover:text-slate-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
