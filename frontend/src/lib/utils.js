import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS class names safely using clsx and tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formats confidence decimal score to percentage string (e.g. 0.98 -> "98%", 0.76 -> "76%")
 * @param {number} score 
 * @returns {string}
 */
export function formatConfidence(score) {
  if (score === null || score === undefined) return 'N/A'
  const val = score > 1 ? score : score * 100
  const rounded = Math.round(val * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`
}

/**
 * Returns confidence tier classification and badge styling
 * Categories:
 * 90-100% -> High
 * 70-89%  -> Medium
 * Below 70% -> Low
 * @param {number} score 
 */
export function getConfidenceTier(score) {
  const normalized = score > 1 ? score / 100 : score

  if (normalized >= 0.9) {
    return {
      tier: 'high',
      bgClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      dotClass: 'bg-emerald-500',
    }
  }

  if (normalized >= 0.7) {
    return {
      tier: 'medium',
      bgClass: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      dotClass: 'bg-amber-500',
    }
  }

  return {
    tier: 'low',
    bgClass: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    dotClass: 'bg-rose-500',
  }
}
