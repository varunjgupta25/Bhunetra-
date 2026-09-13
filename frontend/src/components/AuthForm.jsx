import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export function AuthForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, loginWithGoogle } = useAppStore()

  const roleParam = searchParams.get('role')
  const initialRole = roleParam === 'civilian' ? 'civilian' : 'officer'
  const redirectParam = searchParams.get('redirect')

  const [selectedRole, setSelectedRole] = useState(initialRole)
  const [email, setEmail] = useState('officer@dolr.gov.in')
  const [password, setPassword] = useState('••••••••')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      await loginWithGoogle()
      if (redirectParam) {
        navigate(redirectParam)
      } else {
        navigate('/citizen')
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Google Sign-In failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Sync state if query param changes
  useEffect(() => {
    if (roleParam === 'civilian') {
      setSelectedRole('civilian')
    } else if (roleParam === 'officer') {
      setSelectedRole('officer')
    }
  }, [roleParam])

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId)
    setErrorMessage('')
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

      {/* Conditional Login Area */}
      {isOfficer ? (
        /* OFFICER: Email & Password Form */
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-0.5 text-blue-600 dark:text-blue-400">admin_panel_settings</span>
            <span>
              Authorized access for revenue officials, collectors, and verification officers (@dolr.gov.in, @nic.in).
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
              Government Official Email (शासकीय ईमेल आयडी)
            </label>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
                data-icon="mail"
              >
                badge
              </span>
              <input
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium"
                id="email"
                placeholder="officer@dolr.gov.in"
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
            className="mt-2 w-full font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm bg-[#0F2C59] hover:bg-[#163A72] text-white border border-amber-400/40 hover:shadow-lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating Officer...</span>
              </span>
            ) : (
              <>
                <span>Login as Revenue Officer (शासकीय प्रवेश)</span>
                <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* CITIZEN: Google Sign-In Only */
        <div className="flex flex-col gap-5">
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 rounded-2xl p-4 text-left">
            <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-1">
              <span>👤</span>
              <span>Citizen Land Access Portal (नागरिक भूमी सेवा)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Citizens authenticate securely with a Google Account. No manual password creation or government email required.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                <span className="text-emerald-500">✓</span>
                <span>View 7/12 (सातबारा)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                <span className="text-emerald-500">✓</span>
                <span>Track Mutations (फेरफार)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                <span className="text-emerald-500">✓</span>
                <span>Download Land Extracts</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                <span className="text-emerald-500">✓</span>
                <span>1-Click Verification</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-amber-500 rounded-full animate-spin"></span>
                <span>Signing in with Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="tracking-wide">Sign in with Google (गूगल सह सुरू करा)</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            One-click OAuth authentication · No credentials stored locally
          </p>
        </div>
      )}

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
