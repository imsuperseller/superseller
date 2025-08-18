import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusVariants = cva(
  "inline-flex items-center gap-2",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const indicatorVariants = cva(
  "rounded-full",
  {
    variants: {
      status: {
        online: "bg-green-500",
        offline: "bg-gray-500",
        error: "style={{ backgroundColor: 'var(--rensto-bg-primary)' }}",
        warning: "bg-orange-500",
        loading: "bg-cyan-500",
      },
      size: {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
      },
      pulse: {
        true: "rensto-animate-pulse",
        false: "",
      },
      glow: {
        true: "shadow-[0_0_10px_currentColor]",
        false: "",
      },
    },
    defaultVariants: {
      status: "offline",
      size: "md",
      pulse: false,
      glow: false,
    },
  }
)

export interface RenstoStatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
  status: "online" | "offline" | "error" | "warning" | "loading"
  label?: string
  showLabel?: boolean
  pulse?: boolean
  glow?: boolean
  indicatorSize?: VariantProps<typeof indicatorVariants>["size"]
}

const RenstoStatusIndicator = React.forwardRef<HTMLDivElement, RenstoStatusIndicatorProps>(
  ({ 
    className, 
    size, 
    status, 
    label, 
    showLabel = true,
    pulse = false,
    glow = false,
    indicatorSize,
    ...props 
  }, ref) => {
    const statusLabels = {
      online: "Online",
      offline: "Offline", 
      error: "Error",
      warning: "Warning",
      loading: "Loading",
    }
    
    const statusColors = {
      online: "text-green-400",
      offline: "text-gray-400",
      error: "style={{ color: 'var(--rensto-red)' }}", 
      warning: "text-orange-400",
      loading: "style={{ color: 'var(--rensto-cyan)' }}",
    }
    
    return (
      <div
        ref={ref}
        className={cn(statusVariants({ size }), className)}
        {...props}
      >
        <div
          className={cn(
            indicatorVariants({ 
              status, 
              size: indicatorSize || size, 
              pulse: status === "loading" || pulse,
              glow 
            })
          )}
        />
        {showLabel && (
          <span className={cn("font-medium", statusColors[status])}>
            {label || statusLabels[status]}
          </span>
        )}
      </div>
    )
  }
)
RenstoStatusIndicator.displayName = "RenstoStatusIndicator"

export { RenstoStatusIndicator, statusVariants, indicatorVariants }
