import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export function AuthForm() {
  const navigate = useNavigate()
  const { login } = useAppStore()

  const [email, setEmail] = useState('officer@dolr.gov.in')
  const [password, setPassword] = useState('••••••••')
  const [selectedRole, setSelectedRole] = useState('officer')
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId)
    if (roleId === 'officer') {
      setEmail('officer@dolr.gov.in')
    } else if (roleId === 'verifier') {
      setEmail('verifier@dolr.gov.in')
    } else if (roleId === 'admin') {
      setEmail('admin@dolr.gov.in')
    } else {
      setEmail('citizen.sharma@gmail.com')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login({ email, password, role: selectedRole })
      if (selectedRole === 'civilian') {
        navigate('/citizen')
      } else if (selectedRole === 'verifier') {
        navigate('/verification')
      } else {
        navigate('/dashboard')
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabels = {
    officer: 'Revenue Officer',
    verifier: 'Field Verifier',
    admin: 'Admin',
    civilian: 'Citizen Portal',
  }

  return (
    <main className="w-full max-w-lg bg-surface-container-lowest border border-[#D0E8F5] rounded-[20px] login-shadow p-card-padding relative z-10 my-auto">
      {/* Branding Header */}
      <header className="flex flex-col items-center mb-8 text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[28px]" data-icon="layers">
              layers
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            BHUNETRA
          </h1>
          <span className="font-mono-code text-mono-code bg-surface-container text-secondary px-2 py-1 rounded-full border border-secondary-fixed">
            SIH26018
          </span>
        </div>
        <p className="font-body-md text-body-md text-secondary">
          Intelligent Land Record Digitization &amp; Validation Portal
        </p>
        <p className="font-label-sm text-label-sm text-primary-container mt-1 uppercase tracking-wider">
          Department of Land Resources (DoLR)
        </p>
      </header>

      {/* Role Selector */}
      <div className="bg-surface-container-low p-1 rounded-xl flex flex-wrap gap-1 mb-6 border border-surface-variant">
        <button
          className={`flex-1 font-label-sm text-xs py-2 px-2 text-center rounded-lg transition-all whitespace-nowrap ${
            selectedRole === 'officer'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          type="button"
          onClick={() => handleRoleChange('officer')}
        >
          Revenue Officer
        </button>
        <button
          className={`flex-1 font-label-sm text-xs py-2 px-2 text-center rounded-lg transition-all whitespace-nowrap ${
            selectedRole === 'verifier'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          type="button"
          onClick={() => handleRoleChange('verifier')}
        >
          Field Verifier
        </button>
        <button
          className={`flex-1 font-label-sm text-xs py-2 px-2 text-center rounded-lg transition-all ${
            selectedRole === 'admin'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          type="button"
          onClick={() => handleRoleChange('admin')}
        >
          Admin
        </button>
        <button
          className={`flex-1 font-label-sm text-xs py-2 px-2 text-center rounded-lg transition-all whitespace-nowrap ${
            selectedRole === 'civilian'
              ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          type="button"
          onClick={() => handleRoleChange('civilian')}
        >
          🏛️ Citizen (नागरिक)
        </button>
      </div>

      {/* Login Form */}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface mb-1.5" htmlFor="email">
            Government Email ID
          </label>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary-container"
              data-icon="mail"
            >
              mail
            </span>
            <input
              className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-[#B8D8EE] rounded-lg font-body-md text-body-md text-on-surface placeholder:text-tertiary-container placeholder:font-medium focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-shadow"
              id="email"
              placeholder="officer@dolr.gov.in"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="password">
              Password
            </label>
            <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary-container"
              data-icon="lock"
            >
              lock
            </span>
            <input
              className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-[#B8D8EE] rounded-lg font-body-md text-body-md text-on-surface placeholder:text-tertiary-container placeholder:font-medium focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-shadow"
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
          className="mt-2 w-full bg-primary-container text-on-primary font-body-md text-body-md font-semibold py-3 px-4 rounded-full shadow-md hover:bg-[#2DA090] transition-colors flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          Access {roleLabels[selectedRole]} Portal
          <span
            className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
            data-icon="arrow_forward"
          >
            arrow_forward
          </span>
        </button>
      </form>

      {/* Footer Security Note */}
      <footer className="mt-8 text-center border-t border-[#E8F4FD] pt-4">
        <p className="font-mono-code text-[12px] text-tertiary flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]" data-icon="shield_lock">
            shield_lock
          </span>
          Secured with Firebase Auth RBAC · TLS 1.3
        </p>
      </footer>
    </main>
  )
}
