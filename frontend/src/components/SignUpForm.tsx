import { FormEvent, useState } from 'react'

const SignUpForm = () => {
  const [role, setRole] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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

      <button
        type="submit"
        className="w-full bg-navy-600 text-white py-2 rounded-lg hover:bg-navy-700 transition-colors font-medium mt-6"
      >
        Create Account
      </button>
    </form>
  )
}

export default SignUpForm
