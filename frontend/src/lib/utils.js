import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Standard shadcn-style class merge utility
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format confidence score (0.0 to 1.0) into readable percentage
 */
export function formatConfidence(score) {
  if (score === undefined || score === null) return "N/A"
  return `${Math.round(score * 100)}%`
}

/**
 * Helper to get confidence tier badge styles
 */
export function getConfidenceTier(score) {
  if (score >= 0.85) {
    return {
      tier: "high",
      label: "High Confidence",
      bgClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      dotClass: "bg-emerald-500",
    }
  } else if (score >= 0.70) {
    return {
      tier: "medium",
      label: "Medium Confidence",
      bgClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      dotClass: "bg-amber-500",
    }
  } else {
    return {
      tier: "low",
      label: "Low Confidence",
      bgClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      dotClass: "bg-rose-500",
    }
  }
}

/**
 * Format file size in bytes to human readable string
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
