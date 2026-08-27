import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import LandingPage from '@/pages/Landing'
import DashboardPage from '@/pages/Dashboard'
import UploadPage from '@/pages/Upload'
import VerificationPage from '@/pages/Verification'
import RecordsPage from '@/pages/Records'
import LoginPage from '@/pages/Login'

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
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/verification" element={<VerificationPage />} />
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
