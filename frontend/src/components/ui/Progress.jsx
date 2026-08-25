import React from "react"
import { cn } from "@/lib/utils"

export function Progress({ value = 0, className, barClassName, ...props }) {
  const percentage = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-800",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out",
          barClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
