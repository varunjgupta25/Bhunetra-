import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export function AuthForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAppStore()

  const roleParam = searchParams.get('role')
  const initialRole = roleParam === 'civilian' ? 'civilian' : 'officer'
  const redirectParam = searchParams.get('redirect')

  const [selectedRole, setSelectedRole] = useState(initialRole)
  const [email, setEmail] = useState(
    initialRole === 'civilian' ? 'citizen.sharma@gmail.com' : 'officer@dolr.gov.in'
  )
  const [password, setPassword] = useState('••••••••')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Sync state if query param changes
  useEffect(() => {
    if (roleParam === 'civilian') {
      setSelectedRole('civilian')
      setEmail('citizen.sharma@gmail.com')
    } else if (roleParam === 'officer') {
      setSelectedRole('officer')
      setEmail('officer@dolr.gov.in')
    }
  }, [roleParam])

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId)
    setErrorMessage('')
    if (roleId === 'officer') {
      setEmail('officer@dolr.gov.in')
    } else {
      setEmail('citizen.sharma@gmail.com')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      await login({ email, password, role: selectedRole })
      if (redirectParam) {
        navigate(redirectParam)
      } else if (selectedRole === 'civilian') {
        navigate('/citizen')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const isOfficer = selectedRole === 'officer'

  return (
    <main className="w-full max-w-lg bg-surface-container-lowest border border-[#D0E8F5] rounded-[24px] login-shadow p-6 sm:p-8 relative z-10 my-auto shadow-2xl bg-white dark:bg-slate-900">
      {/* Branding Header */}
      <header className="flex flex-col items-center mb-6 text-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0F2C59] to-[#1E4885] flex items-center justify-center text-amber-400 shadow-md border border-amber-400/40">
            <span className="text-xl">🏛️</span>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-[#0F2C59] dark:text-white tracking-tight flex items-center gap-2">
              BHUNETRA
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                SIH26018
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              National Land Records Modernization Gateway
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {isOfficer ? 'Government Revenue Officer Login' : 'Citizen Portal Login (नागरिक)'}
        </div>
      </header>

      {/* STRICT 2-WAY ROLE SELECTOR: OFFICER OR CITIZEN ONLY */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex gap-2 mb-6 border border-slate-200 dark:border-slate-700">
        <button
          className={`flex-1 py-3 px-3 text-center rounded-xl transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer ${
            isOfficer
              ? 'bg-[#0F2C59] text-white shadow-lg border border-amber-400/40 scale-[1.02]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          type="button"
          onClick={() => handleRoleChange('officer')}
        >
          <span className="text-base">🏛️</span>
          <span>Revenue Officer</span>
        </button>

        <button
          className={`flex-1 py-3 px-3 text-center rounded-xl transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer ${
            !isOfficer
              ? 'bg-amber-500 text-slate-950 shadow-lg border border-amber-300 scale-[1.02]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          type="button"
          onClick={() => handleRoleChange('civilian')}
        >
          <span className="text-base">👤</span>
          <span>Citizen (नागरिक)</span>
        </button>
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
            {isOfficer ? 'Government Official Email (शासकीय ईमेल आयडी)' : 'Citizen Email / Mobile (नागरिक ईमेल)'}
          </label>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
              data-icon="mail"
            >
              {isOfficer ? 'badge' : 'person'}
            </span>
            <input
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium"
              id="email"
              placeholder={isOfficer ? 'officer@dolr.gov.in' : 'citizen.sharma@gmail.com'}
              required
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="password">
              Password (पासवर्ड)
            </label>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium cursor-pointer hover:underline">
              Forgot?
            </span>
          </div>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
              data-icon="lock"
            >
              lock
            </span>
            <input
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium"
              id="password"
              placeholder="••••••••"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          className={`mt-3 w-full font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm ${
            isOfficer
              ? 'bg-[#0F2C59] hover:bg-[#163A72] text-white border border-amber-400/40 hover:shadow-lg'
              : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black shadow-lg hover:shadow-xl'
          }`}
          type="submit"
          disabled={isLoading}
        >
          <span>
            {isOfficer ? 'Login as Revenue Officer (शासकीय प्रवेश)' : 'Enter Citizen Portal (नागरिक प्रवेश)'}
          </span>
          <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">
            arrow_forward
          </span>
        </button>
      </form>

      {/* Security Note */}
      <footer className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-3.5">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <span className="material-symbols-outlined text-[14px] text-emerald-500" data-icon="verified_user">
            verified_user
          </span>
          Strict RBAC Isolation · Officer &amp; Citizen Access Enforced
        </p>
      </footer>
    </main>
  )
}
