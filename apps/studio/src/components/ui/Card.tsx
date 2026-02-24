"use client";

import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-winner-card rounded-[2rem] border border-white/5 p-6",
        hover && "hover:bg-winner-card-hover transition-colors duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
