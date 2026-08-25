import React from 'react'
import { cn, formatConfidence, getConfidenceTier } from '@/lib/utils'
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react'

export function ConfidenceBadge({ score, showIcon = true, showLabel = true, className }) {
  if (score === undefined || score === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-xs text-slate-400">
        N/A
      </span>
    )
  }

  const { tier, bgClass, dotClass } = getConfidenceTier(score)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all shadow-sm",
        bgClass,
        className
      )}
      title={`Confidence Score: ${(score * 100).toFixed(1)}% (${tier.toUpperCase()})`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", dotClass)} />
      {showIcon && (
        tier === 'high' ? (
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
        ) : tier === 'medium' ? (
          <AlertTriangle className="h-3 w-3 text-amber-400" />
        ) : (
          <AlertCircle className="h-3 w-3 text-rose-400" />
        )
      )}
      <span>{formatConfidence(score)}</span>
      {showLabel && (
        <span className="text-[10px] uppercase tracking-wider opacity-75 font-normal">
          {tier}
        </span>
      )}
    </span>
  )
}
