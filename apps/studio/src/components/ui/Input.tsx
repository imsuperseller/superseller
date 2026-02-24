"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold text-gray-400 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5",
            "text-white placeholder:text-gray-600",
            "focus:outline-none focus:border-winner-accent/50 focus:ring-2 focus:ring-winner-accent/20",
            "transition-all duration-200",
            error && "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-rose-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
