import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { dashboardApi } from '@/api/axiosClient'

export default function DashboardPage() {
  const { user, pendingVerificationCount } = useAppStore()
  const [stats, setStats] = useState({
    totalProcessed: 1482,
    pendingReview: pendingVerificationCount || 7,
    autoApproved: 1395,
    averageConfidence: 0.894,
    byDistrict: [
      { district: 'Pune', records: '450 Records Processing', percent: 92, confidence: '88%', isWarning: false },
      { district: 'Nagpur', records: '320 Records Processing', percent: 78, confidence: '91%', isWarning: false },
      { district: 'Nashik', records: '150 Records Processing', percent: 45, confidence: '82%', isWarning: true },
      { district: 'Thane', records: '89 Records Processing', percent: 12, confidence: '79%', isWarning: true },
    ],
  })

  useEffect(() => {
    dashboardApi.getStats()
      .then((data) => {
        if (data) setStats((prev) => ({ ...prev, ...data }))
      })
      .catch(() => {})
  }, [])

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-gutter py-8">
      {/* Top Hero Strip */}
      <section className="bg-surface-container-lowest rounded-xl shadow-[0_2px_16px_rgba(45,120,180,0.08)] border border-[#D0E8F5] p-card-padding mb-8">
        <h1 className="font-headline-lg text-headline-lg text-[#0D2B40] mb-2">
          Welcome back, {user?.displayName || 'K. S. Patil'}
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          AI-assisted land record digitization monitoring
        </p>
      </section>

      {/* KPI Cards Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Card 1: Total Records Digitized */}
        <div className="bg-surface-container-lowest rounded-[20px] shadow-[0_2px_16px_rgba(45,120,180,0.08)] border border-[#D0E8F5] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              Total Records Digitized
            </span>
            <span className="material-symbols-outlined text-primary" data-icon="description">
              description
            </span>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg text-[#0D2B40]">
              {stats.totalProcessed.toLocaleString()}
            </div>
            <div className="font-body-md text-body-md text-primary mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" data-icon="arrow_upward">
                arrow_upward
              </span>
              +84 today
            </div>
          </div>
        </div>

        {/* Card 2: Average Confidence */}
        <div className="bg-surface-container-lowest rounded-[20px] shadow-[0_2px_16px_rgba(45,120,180,0.08)] border border-[#D0E8F5] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface-container-low rounded-bl-full opacity-50 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              Average Confidence
            </span>
            <span className="material-symbols-outlined text-primary-container" data-icon="analytics">
              analytics
            </span>
          </div>
          <div className="relative z-10">
            <div className="font-headline-lg text-headline-lg text-[#0D2B40]">
              {(stats.averageConfidence * 100).toFixed(1)}%
            </div>
            <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-[#E8F4FD] text-[#006b5e] font-label-sm text-label-sm border border-[#D0E8F5]">
              HIGH CONFIDENCE
            </div>
          </div>
        </div>

        {/* Card 3: Auto-Approved Records */}
        <div className="bg-surface-container-lowest rounded-[20px] shadow-[0_2px_16px_rgba(45,120,180,0.08)] border border-[#D0E8F5] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              Auto-Approved Records
            </span>
            <span className="material-symbols-outlined text-primary" data-icon="verified">
              verified
            </span>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg text-[#0D2B40]">
              {stats.autoApproved.toLocaleString()}
            </div>
            <div className="font-body-md text-body-md text-secondary mt-1">
              94.1% bypass rate
            </div>
          </div>
        </div>

        {/* Card 4: Verification Backlog */}
        <Link
          to="/verification"
          className="bg-[#FFF8E6] rounded-[20px] shadow-[0_2px_16px_rgba(45,120,180,0.08)] border border-[#FBE3B8] p-6 flex flex-col justify-between hover:border-amber-400 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-sm text-label-sm text-[#8C6B2E] uppercase tracking-wider">
              Verification Backlog
            </span>
            <span className="material-symbols-outlined text-[#8C6B2E]" data-icon="pending_actions">
              pending_actions
            </span>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg text-[#5C451D]">
              {pendingVerificationCount}
            </div>
            <div className="font-body-md text-body-md text-[#8C6B2E] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" data-icon="warning">
                warning
              </span>
              Awaiting Human Verifier
            </div>
          </div>
        </Link>
      </section>

      {/* District Panel */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary" data-icon="location_on" data-weight="fill">
            location_on
          </span>
          <h2 className="font-headline-md text-headline-md text-[#0D2B40]">
            District-Level Modernization Progress
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.byDistrict.map((item) => (
            <div
              key={item.district}
              className="bg-surface-container-lowest rounded-[20px] shadow-[0_2px_16px_rgba(45,120,180,0.08)] border border-[#D0E8F5] p-5"
            >
              <h3 className="font-body-lg text-body-lg font-bold text-[#0D2B40] mb-1">
                {item.district}
              </h3>
              <p className="font-label-sm text-label-sm text-secondary mb-4">
                {item.records}
              </p>
              <div className="w-full bg-surface-container-high rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-primary-container to-[#80C9E0] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono-code text-mono-code text-secondary">
                  {item.percent}% Complete
                </span>
                <span
                  className={`font-label-sm text-label-sm ${
                    item.isWarning ? 'text-[#8C6B2E]' : 'text-primary'
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
