import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-ring",
        superseller: "border-superseller-bg-secondary bg-superseller-bg-card text-superseller-text-primary placeholder:text-superseller-text-secondary focus-visible:ring-superseller-red focus-visible:border-superseller-red",
        supersellerNeon: "border-superseller-cyan bg-superseller-bg-card text-superseller-cyan placeholder:text-superseller-text-secondary focus-visible:ring-superseller-cyan focus-visible:border-superseller-cyan shadow-superseller-glow-accent",
        supersellerGlow: "border-superseller-blue bg-superseller-bg-card text-superseller-text-primary placeholder:text-superseller-text-secondary focus-visible:ring-superseller-blue focus-visible:border-superseller-blue shadow-superseller-glow-secondary",
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
