import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { CONSTITUTION_22_LANGUAGES, t } from '@/utils/languages'
import { SihTeamModal } from '@/components/SihTeamModal'

export function Navbar() {
  const location = useLocation()
  const [fontSize, setFontSize] = useState('normal')
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)

  const {
    user,
    isAuthenticated,
    logout,
    pendingVerificationCount,
    theme,
    toggleTheme,
    switchDemoRole,
    currentLanguage,
    setLanguage,
  } = useAppStore()

  const lang = currentLanguage || 'mr'
  const currentRole = user?.role || 'officer'

  const allNavItems = [
    {
      label: t('dashboardTab', lang),
      path: '/dashboard',
      icon: 'dashboard',
      roles: ['admin', 'verifier', 'officer'],
    },
    {
      label: t('citizenTab', lang),
      path: '/citizen',
      icon: 'account_balance',
      roles: ['civilian', 'admin'],
    },
    {
      label: t('uploadTab', lang),
      path: '/upload',
      icon: 'cloud_upload',
      roles: ['admin', 'officer'],
    },
    {
      label: t('queueTab', lang),
      path: '/verification',
      icon: 'fact_check',
      badge: pendingVerificationCount,
      roles: ['admin', 'verifier'],
    },
    {
      label: t('gisTab', lang),
      path: '/records',
      icon: 'map',
      roles: ['admin', 'verifier', 'officer', 'civilian'],
    },
  ]

  // If unauthenticated: ONLY Explore tab is shown!
  // If authenticated: Role-specific operational tabs are shown!
  const navItems = isAuthenticated
    ? allNavItems.filter((item) => item.roles.includes(currentRole))
    : [
        {
          label: t('exploreTab', lang),
          path: '/',
          icon: 'explore',
        },
      ]

  return (
    <>
      {/* 1. Official Government Accessibility & 22 Constitutional Languages Bar */}
      <div className="bg-[#0A1E3F] text-slate-200 text-[11px] py-1.5 px-4 flex justify-between items-center border-b border-amber-500/40">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-amber-400">{t('headerGovIndia', lang)}</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline font-semibold text-slate-200">{t('headerDept', lang)}</span>
          <button
            onClick={() => setIsTeamModalOpen(true)}
            type="button"
            className="hidden md:inline-flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40 font-bold transition-all cursor-pointer shadow-xs"
          >
            <span>💡</span>
            <span>SIH 2026 · Team Code.IT</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* Accessibility controls */}
          <div className="flex items-center gap-1 bg-[#142B52] px-2 py-0.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 mr-1 hidden md:inline">Accessibility:</span>
            <button onClick={() => setFontSize('small')} className={`px-1 rounded ${fontSize === 'small' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-300'}`}>A-</button>
            <button onClick={() => setFontSize('normal')} className={`px-1 rounded ${fontSize === 'normal' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-300'}`}>A</button>
            <button onClick={() => setFontSize('large')} className={`px-1 rounded ${fontSize === 'large' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-300'}`}>A+</button>
          </div>

          {/* 22 Constitutional Languages Selector Dropdown */}
          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
            <span className="text-amber-400 hidden lg:inline">📜 संविधान २२ भाषा:</span>
            <select
              value={currentLanguage || 'mr'}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#142B52] text-amber-300 text-[11px] font-bold border border-amber-500/50 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              {CONSTITUTION_22_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#0F2C59] text-white">
                  {l.icon} {l.nameNative} ({l.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Official Government NIC Banner */}
      <header className="bg-gradient-to-r from-[#0F2C59] via-[#163A72] to-[#0F2C59] text-white shadow-md border-b-4 border-amber-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex justify-between items-center">
          {/* National Emblem & Title Branding */}
          <div className="flex items-center gap-4">
            {/* Ashoka Emblem representation */}
            <div className="flex flex-col items-center justify-center border-r border-amber-500/30 pr-4">
              <div className="w-9 h-12 bg-amber-400/10 border border-amber-400/40 rounded flex flex-col items-center justify-center p-1 text-center">
                <span className="text-[16px] leading-none">🏛️</span>
                <span className="text-[7px] text-amber-300 font-bold uppercase mt-0.5">सत्यमेव जयते</span>
              </div>
            </div>

            <Link to={currentRole === 'civilian' ? '/citizen' : '/dashboard'} className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold tracking-wide text-xs sm:text-sm uppercase">
                  {t('headerDept', lang)}
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-400/40 font-mono">
                  NIC STANDARDS
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight flex items-center gap-2">
                <span>{t('headerTitle', lang)}</span>
              </h1>
              <span className="text-[11px] text-slate-300 hidden sm:block">
                Digital India Land Records Modernization Programme (DILRMP) Gateway
              </span>
            </Link>
          </div>

          {/* Controls & User Profile Badge */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Role Switcher for Hackathon Demo */}
                <div className="hidden lg:flex items-center gap-1 bg-[#0A1E3F] p-1 rounded border border-slate-600 text-xs">
                  <span className="px-1.5 text-[10px] font-semibold text-amber-400 uppercase">{t('roleTag', lang)}</span>
                  {(['officer', 'verifier', 'admin', 'civilian']).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchDemoRole(r)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize transition-all ${
                        currentRole === r
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {r === 'officer'
                        ? t('roleOfficer', lang)
                        : r === 'verifier'
                        ? t('roleVerifier', lang)
                        : r === 'admin'
                        ? t('roleAdmin', lang)
                        : t('roleCivilian', lang)}
                    </button>
                  ))}
                </div>

                {/* Profile Badge */}
                <div className="flex items-center gap-2.5 bg-[#1A3D73] px-3 py-1.5 rounded-lg border border-slate-600">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-sm">
                    {user?.displayName ? user.displayName.charAt(0) : 'के'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight">
                      {user?.displayName || 'के. एस. पाटील'}
                    </span>
                    <span className="text-[10px] text-amber-300 font-semibold">
                      {user?.district || 'पुणे'} महसूल विभाग
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-2 text-slate-300 hover:text-amber-400 transition-colors"
                    title="बाहेर पडा (Logout)"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>{t('officerLoginBtn', lang)}</span>
              </Link>
            )}
          </div>
        </div>

        {/* 3. Official Government Sub-Navigation Tabs Bar */}
        {isAuthenticated && (
          <div className="bg-[#0A1E3F] border-t border-slate-700/60 px-4 hidden md:block">
            <div className="max-w-7xl mx-auto flex space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const isAllowed = item.roles.includes(currentRole)
                if (!isAllowed) return null

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'text-slate-200 hover:bg-[#142B52] hover:text-amber-300 border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge > 0 && item.path === '/verification' && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-extrabold animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 h-14 bg-[#0F2C59] border-t-2 border-amber-500 shadow-lg">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const isAllowed = item.roles.includes(currentRole)
            if (!isAllowed) return null

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold rounded-md'
                    : 'text-slate-200 hover:text-amber-300'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="text-[10px]">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </nav>
      )}

      {/* Smart India Hackathon 2026 Team Details Modal */}
      <SihTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </>
  )
}

