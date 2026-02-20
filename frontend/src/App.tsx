import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Preloader from './components/Preloader'
import DashboardLayout from './layouts/DashboardLayout'
import AboutPage from './pages/AboutPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function App() {
  const [isPreloading, setIsPreloading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPreloading(false), 1700)
    return () => window.clearTimeout(timer)
  }, [])

  if (isPreloading) {
    return <Preloader />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/doctor" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
