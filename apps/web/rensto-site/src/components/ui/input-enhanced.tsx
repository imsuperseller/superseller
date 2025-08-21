import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-ring",
        rensto: "border-rensto-bg-secondary bg-rensto-bg-card text-rensto-text-primary placeholder:text-rensto-text-secondary focus-visible:ring-rensto-red focus-visible:border-rensto-red",
        renstoNeon: "border-rensto-cyan bg-rensto-bg-card text-rensto-cyan placeholder:text-rensto-text-secondary focus-visible:ring-rensto-cyan focus-visible:border-rensto-cyan shadow-rensto-glow-accent",
        renstoGlow: "border-rensto-blue bg-rensto-bg-card text-rensto-text-primary placeholder:text-rensto-text-secondary focus-visible:ring-rensto-blue focus-visible:border-rensto-blue shadow-rensto-glow-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
