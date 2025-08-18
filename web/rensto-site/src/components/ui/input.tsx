import * as React from 'react';
import { cn } from '@/lib/utils';
import { RenstoLogo } from '@/components/ui/rensto-logo';
import { RenstoProgress } from '@/components/ui/rensto-progress';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';
import { SplitText, Typewriter, FadeInText } from 'react-bits';
import { MagneticCursor, CustomCursor, CursorFollower } from 'react-bits';
import { GlassCard, GradientCard, HoverCard } from 'react-bits';
import { GradientButton, RippleButton, IconButton } from 'react-bits';
import { SkeletonLoader, Spinner, ProgressBar } from 'react-bits';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
