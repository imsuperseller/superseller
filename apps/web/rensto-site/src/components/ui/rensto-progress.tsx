import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        rensto: "bg-[#2d3748]",
        neon: "bg-[#2d3748] border border-cyan-400/30",
        gradient: "bg-gradient-to-r from-[#2d3748] to-[#4a5568]",
      },
      size: {
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const progressFillVariants = cva(
  "h-full transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        rensto: "bg-gradient-to-r from-red-500 to-orange-500",
        neon: "bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]",
        gradient: "bg-gradient-to-r from-red-500 via-orange-500 to-blue-500",
      },
      animate: {
        none: "",
        pulse: "rensto-animate-pulse",
        glow: "animate-[rensto-glow_2s_ease-in-out_infinite_alternate]",
        shimmer: "animate-[rensto-shimmer_2s_infinite]",
      },
    },
    defaultVariants: {
      variant: "default",
      animate: "none",
    },
  }
)

export interface RenstoProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number
  max?: number
  showLabel?: boolean
  labelPosition?: "top" | "bottom" | "inside"
  fillVariant?: VariantProps<typeof progressFillVariants>["variant"]
  fillAnimate?: VariantProps<typeof progressFillVariants>["animate"]
}

const RenstoProgress = React.forwardRef<HTMLDivElement, RenstoProgressProps>(
  ({ 
    className, 
    variant, 
    size, 
    value, 
    max = 100, 
    showLabel = false,
    labelPosition = "top",
    fillVariant,
    fillAnimate,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    return (
      <div className="w-full">
        {showLabel && labelPosition === "top" && (
          <div className="flex justify-between text-sm style={{ color: 'var(--rensto-cyan)' }} mb-2">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(progressVariants({ variant, size }), className)}
          {...props}
        >
          <div
            className={cn(
              progressFillVariants({ 
                variant: fillVariant || variant, 
                animate: fillAnimate 
              })
            )}
            style={{ width: `${percentage}%` }}
          />
          
          {showLabel && labelPosition === "inside" && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {Math.round(percentage)}%
            </div>
          )}
        </div>
        
        {showLabel && labelPosition === "bottom" && (
          <div className="flex justify-between text-sm style={{ color: 'var(--rensto-cyan)' }} mt-2">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    )
  }
)
RenstoProgress.displayName = "RenstoProgress"

export { RenstoProgress, progressVariants, progressFillVariants }
