"use client";

import { clsx } from "clsx";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export default function Badge({ variant = "default", children, className, pulse }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full",
        {
          "bg-winner-primary/20 text-winner-accent border border-winner-accent/20":
            variant === "default",
          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20":
            variant === "success",
          "bg-amber-500/20 text-amber-400 border border-amber-500/20":
            variant === "warning",
          "bg-rose-500/20 text-rose-400 border border-rose-500/20":
            variant === "error",
          "bg-blue-500/20 text-blue-400 border border-blue-500/20":
            variant === "info",
        },
        pulse && "animate-pulse",
        className
      )}
    >
      {children}
    </span>
  );
}
