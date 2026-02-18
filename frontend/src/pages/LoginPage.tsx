import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-navy-900 mb-2">Welcome Back</h2>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-slate-600">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="text-navy-600 hover:text-navy-700 font-medium">
              Sign Up
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
