import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import LandingPage from '@/pages/Landing'
import CitizenPortalPage from '@/pages/CitizenPortal'
import DashboardPage from '@/pages/Dashboard'
import UploadPage from '@/pages/Upload'
import VerificationPage from '@/pages/Verification'
import RecordsPage from '@/pages/Records'
import LoginPage from '@/pages/Login'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAppStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const currentRole = user?.role || 'civilian'
  if (!allowedRoles.includes(currentRole)) {
    const defaultHome = currentRole === 'civilian' ? '/citizen' : '/dashboard'
    return <Navigate to={defaultHome} replace />
  }

  return children
}

function HomeRedirect() {
  const { user, isAuthenticated } = useAppStore()
  if (!isAuthenticated) return <LandingPage />
  if (user?.role === 'civilian') return <Navigate to="/citizen" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [theme])

  return (
    <BrowserRouter>
      <div className="bg-[#F4F6F9] text-slate-900 min-h-screen flex flex-col font-body-md pb-20 md:pb-0">
        {/* Top & Mobile Bottom Navigation Bar */}
        <Navbar />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/explore" element={<LandingPage />} />
            <Route path="/citizen" element={<CitizenPortalPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['officer', 'verifier', 'admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={['officer', 'admin']}>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification"
              element={
                <ProtectedRoute allowedRoles={['verifier', 'admin']}>
                  <VerificationPage />
                </ProtectedRoute>
              }
            />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Official NIC Government Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  )
}
