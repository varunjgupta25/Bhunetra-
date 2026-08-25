import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export function Navbar() {
  const location = useLocation()
  const {
    user,
    isAuthenticated,
    logout,
    pendingVerificationCount,
    theme,
    toggleTheme,
    switchDemoRole,
  } = useAppStore()

  const currentRole = user?.role || 'officer'

  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: 'dashboard',
      roles: ['admin', 'verifier', 'officer'],
    },
    {
      label: 'Upload',
      path: '/upload',
      icon: 'cloud_upload',
      roles: ['admin', 'officer'],
    },
    {
      label: 'Queue',
      path: '/verification',
      icon: 'fact_check',
      badge: pendingVerificationCount,
      roles: ['admin', 'verifier'],
    },
    {
      label: 'GIS',
      path: '/records',
      icon: 'map',
      roles: ['admin', 'verifier', 'officer'],
    },
  ]

  return (
    <>
      {/* TopAppBar Semantic Shell Header */}
      <header className="bg-surface-lowest dark:bg-inverse-surface shadow-sm sticky top-0 z-50 h-[64px] border-b border-outline-variant/30 flex items-center w-full">
        <div className="flex justify-between items-center w-full px-gutter max-w-full mx-auto">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-2xl group-hover:scale-105 transition-transform" data-icon="layers">
                layers
              </span>
              <span className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary tracking-tight">
                BHUNETRA
              </span>
              <span className="font-mono-code text-xs bg-surface-container text-secondary px-2 py-0.5 rounded-full border border-secondary-fixed hidden sm:inline-block">
                SIH26018
              </span>
            </Link>
          </div>

          {/* Desktop Nav Cluster (Hidden on mobile) */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-6 items-center h-full">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const isAllowed = item.roles.includes(currentRole)
                if (!isAllowed) return null

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`h-full flex items-center font-label-sm text-label-sm px-2 transition-colors border-b-2 ${
                      isActive
                        ? 'text-primary dark:text-inverse-primary border-primary font-bold'
                        : 'text-on-surface-variant dark:text-outline-variant border-transparent hover:bg-surface-container-low dark:hover:bg-surface-container-highest'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge > 0 && item.path === '/verification' && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* User Profile & Demo Role Selector Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Role Selector Badge for Hackathon Demo */}
                <div className="hidden lg:flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-surface-variant text-xs">
                  <span className="px-1 text-[10px] font-semibold text-secondary uppercase">Role:</span>
                  {(['officer', 'verifier', 'admin']).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchDemoRole(r)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all capitalize ${
                        currentRole === r
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-low transition-colors"
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>

                {/* Profile Badge & Logout */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                    {user?.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="font-label-sm text-label-sm text-on-surface leading-tight">
                      {user?.displayName || 'K. S. Patil'}
                    </span>
                    <span className="text-[10px] text-secondary">
                      {user?.district || 'Pune'} District
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-2 text-xs text-secondary hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error-container"
                    title="Logout"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
                <Link
                  to="/login"
                  className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:bg-[#2DA090] transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BottomNavBar (Mobile Only) */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe h-16 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant shadow-[0_-2px_16px_rgba(45,120,180,0.08)] rounded-t-xl">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const isAllowed = item.roles.includes(currentRole)
            if (!isAllowed) return null

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container rounded-2xl px-4 py-1 scale-95'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] mb-0.5" data-icon={item.icon}>
                  {item.icon}
                </span>
                <span className="font-label-sm text-[11px]">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
