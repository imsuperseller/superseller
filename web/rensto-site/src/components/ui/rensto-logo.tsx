import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const logoVariants = cva(
  "font-bold font-mono select-none",
  {
    variants: {
      size: {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl",
        xl: "text-6xl",
      },
      variant: {
        default: "text-white",
        neon: "style={{ color: 'var(--rensto-cyan)' }} drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]",
        gradient: "bg-gradient-to-r from-red-500 via-orange-500 to-blue-500 bg-clip-text text-transparent",
        glow: "style={{ color: 'var(--rensto-cyan)' }} drop-shadow-[0_0_20px_rgba(0,255,255,0.7)]",
      },
      animate: {
        none: "",
        pulse: "rensto-animate-pulse",
        glow: "animate-[rensto-glow_2s_ease-in-out_infinite_alternate]",
        shimmer: "animate-[rensto-shimmer_2s_infinite]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      animate: "none",
    },
  }
)

export interface RenstoLogoProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logoVariants> {
  showTagline?: boolean
}

const RenstoLogo = React.forwardRef<HTMLDivElement, RenstoLogoProps>(
  ({ className, size, variant, animate, showTagline = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center", className)}
        {...props}
      >
        <div className={cn(logoVariants({ size, variant, animate }))}>
          R
        </div>
        {showTagline && (
          <div className="text-xs style={{ color: 'var(--rensto-cyan)' }}/70 mt-1 font-mono">
            RENSTO
          </div>
        )}
      </div>
    )
  }
)
RenstoLogo.displayName = "RenstoLogo"

export { RenstoLogo, logoVariants }
