import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { SplitText, Typewriter, FadeInText } from 'react-bits';
import { MagneticCursor, CustomCursor, CursorFollower } from 'react-bits';
import { GlassCard, GradientCard, HoverCard } from 'react-bits';
import { GradientButton, RippleButton, IconButton } from 'react-bits';
import { SkeletonLoader, Spinner, ProgressBar } from 'react-bits';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Rensto Brand Variants
        renstoSuccess: "bg-green-500/20 text-green-400 border border-green-400/30",
        renstoWarning: "bg-orange-500/20 text-orange-400 border border-orange-400/30",
        renstoError: "style={{ backgroundColor: 'var(--rensto-bg-primary)' }}/20 style={{ color: 'var(--rensto-red)' }} border border-red-400/30",
        renstoInfo: "bg-cyan-500/20 style={{ color: 'var(--rensto-cyan)' }} border border-cyan-400/30",
        renstoNeon: "bg-cyan-500/20 style={{ color: 'var(--rensto-cyan)' }} border border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]",
        renstoPrimary: "style={{ backgroundColor: 'var(--rensto-bg-primary)' }}/20 style={{ color: 'var(--rensto-red)' }} border border-red-400/30",
        renstoSecondary: "bg-blue-500/20 style={{ color: 'var(--rensto-blue)' }} border border-blue-400/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
