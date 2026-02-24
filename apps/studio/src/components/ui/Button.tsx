"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "font-bold transition-all duration-200 inline-flex items-center justify-center gap-2",
          {
            "bg-winner-accent text-winner-primary hover:bg-white shadow-[0_30px_60px_-15px_rgba(182,227,212,0.4)] rounded-[2rem]":
              variant === "primary",
            "bg-winner-primary/20 text-winner-accent border border-winner-accent/20 hover:bg-winner-primary/30 rounded-2xl":
              variant === "secondary",
            "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 rounded-xl":
              variant === "ghost",
            "bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500/30 rounded-2xl":
              variant === "danger",
          },
          {
            "text-sm px-4 py-2": size === "sm",
            "text-base px-6 py-3": size === "md",
            "text-lg px-8 py-5": size === "lg",
          },
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
