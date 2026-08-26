import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { dashboardApi } from '@/api/axiosClient'
import { t } from '@/utils/languages'

export default function DashboardPage() {
  const { user, pendingVerificationCount, setPendingVerificationCount, currentLanguage } = useAppStore()
  const lang = currentLanguage || 'mr'

  const [stats, setStats] = useState({
    totalProcessed: 1482,
    pendingReview: pendingVerificationCount || 7,
    autoApproved: 1395,
    averageConfidence: 0.894,
    byDistrict: [
      { district: 'Pune', count: 450, percent: 92, confidence: '88%', isWarning: false },
      { district: 'Nagpur', count: 320, percent: 78, confidence: '91%', isWarning: false },
      { district: 'Nashik', count: 150, percent: 45, confidence: '82%', isWarning: true },
      { district: 'Thane', count: 89, percent: 12, confidence: '79%', isWarning: true },
    ],
  })

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((data) => {
        if (!data) return
        if (data.pendingReview !== undefined) {
          setPendingVerificationCount(data.pendingReview)
        }
        
        const mappedDistricts = (data.byDistrict || []).map((d) => {
          const maxCount = 500
          const calcPercent = Math.min(Math.round((d.count / maxCount) * 100), 100)
          const confVal = (d.avgConfidence * 100).toFixed(0) + '%'
          return {
            district: d.district,
            count: d.count,
            percent: calcPercent || 50,
            confidence: confVal,
            isWarning: d.avgConfidence < 0.85,
          }
        })

        setStats({
          totalProcessed: data.totalProcessed ?? 1482,
          pendingReview: data.pendingReview ?? 7,
          autoApproved: data.autoApproved ?? 1395,
          averageConfidence: data.averageConfidence ?? 0.894,
          byDistrict: mappedDistricts.length > 0 ? mappedDistricts : stats.byDistrict,
        })
      })
      .catch(() => {
        // Fallback default state
      })
  }, [])

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-gutter py-8">
      {/* Top Hero Strip */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 mb-1">
            {t('welcome', lang)}, {user?.displayName || 'K. S. Patil'}
          </h1>
          <p className="text-sm text-slate-600">
            {t('subtitle', lang)}
          </p>
        </div>
        <Link
          to="/upload"
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>{t('ingestBtn', lang)}</span>
        </Link>
      </section>

      {/* KPI Cards Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Card 1: Total Records Digitized */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              {t('totalDigitized', lang)}
            </span>
            <span className="material-symbols-outlined text-amber-500" data-icon="description">
              description
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.totalProcessed.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
              +84 {t('today', lang)}
            </div>
          </div>
        </div>

        {/* Card 2: Average Confidence */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              {t('avgConfidence', lang)}
            </span>
            <span className="material-symbols-outlined text-blue-600" data-icon="analytics">
              analytics
            </span>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-extrabold text-slate-900">
              {(stats.averageConfidence * 100).toFixed(1)}%
            </div>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
              {t('highConfidence', lang)}
            </div>
          </div>
        </div>

        {/* Card 3: Auto-Approved Records */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              {t('autoApproved', lang)}
            </span>
            <span className="material-symbols-outlined text-emerald-600" data-icon="verified">
              verified
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.autoApproved.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.totalProcessed > 0
                ? ((stats.autoApproved / stats.totalProcessed) * 100).toFixed(1)
                : '94.1'}
              % bypass rate
            </div>
          </div>
        </div>

        {/* Card 4: Verification Backlog */}
        <Link
          to="/verification"
          className="bg-amber-50/80 rounded-2xl shadow-sm border border-amber-300 p-6 flex flex-col justify-between hover:border-amber-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-bold text-xs text-amber-800 uppercase tracking-wider">
              {t('pendingQueue', lang)}
            </span>
            <span className="material-symbols-outlined text-amber-700" data-icon="pending_actions">
              pending_actions
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-950">
              {pendingVerificationCount}
            </div>
            <div className="text-xs font-bold text-amber-800 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">warning</span>
              {t('awaitingVerifier', lang)}
            </div>
          </div>
        </Link>
      </section>

      {/* District Panel */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-[#0F2C59]" data-icon="location_on">
            location_on
          </span>
          <h2 className="font-extrabold text-xl text-slate-900">
            {t('districtModernization', lang)}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.byDistrict.map((item) => (
            <div
              key={item.district}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
            >
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {item.district}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {item.count} {t('recordsProcessing', lang)}
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-[#0F2C59] to-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-600 font-semibold">
                  {item.percent}% {t('complete', lang)}
                </span>
                <span
                  className={`font-bold ${
                    item.isWarning ? 'text-amber-700' : 'text-emerald-600'
                  }`}
                >
                  Conf: {item.confidence}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
