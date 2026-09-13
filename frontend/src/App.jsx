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
import VerifyStatusPage from '@/pages/VerifyStatus'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAppStore()

  if (!isAuthenticated) {
    const targetRole = allowedRoles.includes('officer') ? 'officer' : 'civilian'
    return <Navigate to={`/login?role=${targetRole}`} replace />
  }

  const currentRole = user?.role || 'civilian'
  if (!allowedRoles.includes(currentRole)) {
    const defaultHome = currentRole === 'civilian' ? '/citizen' : '/dashboard'
    return <Navigate to={defaultHome} replace />
  }

  return children
}

function PublicLoginRoute() {
  const { user, isAuthenticated } = useAppStore()
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'civilian' ? '/citizen' : '/dashboard'} replace />
  }
  return <LoginPage />
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
            <Route path="/login" element={<PublicLoginRoute />} />
            <Route path="/verify/:recordId" element={<VerifyStatusPage />} />

            {/* Citizen Section (Strictly requires Citizen login) */}
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={['civilian']}>
                  <CitizenPortalPage />
                </ProtectedRoute>
              }
            />

            {/* Officer Section (Strictly requires Officer login) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <VerificationPage />
                </ProtectedRoute>
              }
            />

            {/* Shared Authenticated Records (Requires login as either Officer or Citizen) */}
            <Route
              path="/records"
              element={
                <ProtectedRoute allowedRoles={['officer', 'civilian']}>
                  <RecordsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Official NIC Government Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  )
}
