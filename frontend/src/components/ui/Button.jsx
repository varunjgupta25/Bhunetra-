import React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-md shadow-emerald-950/20 font-medium",
      emerald:
        "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] shadow-lg shadow-emerald-900/30",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98] border border-slate-700",
      outline:
        "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/80 hover:text-white",
      ghost:
        "hover:bg-slate-800/60 text-slate-300 hover:text-white",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-950/20",
    }

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-lg px-8 text-base",
      icon: "h-9 w-9 p-0",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
