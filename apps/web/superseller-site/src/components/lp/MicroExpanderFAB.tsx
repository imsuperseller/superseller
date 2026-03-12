"use client";

import * as React from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MicroExpanderFABProps {
  href: string;
  text: string;
  icon: React.ReactNode;
  className?: string;
  isRTL?: boolean;
  onClick?: () => void;
}

/**
 * MicroExpander FAB — expands from a circular icon to a pill-shaped button
 * containing text on hover. Based on NotebookLM design component library.
 */
export function MicroExpanderFAB({
  href,
  text,
  icon,
  className,
  isRTL = false,
  onClick,
}: MicroExpanderFABProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const containerVariants: Variants = {
    initial: { width: "56px" },
    hover: { width: "auto" },
  };

  const textVariants: Variants = {
    initial: { opacity: 0, x: isRTL ? 10 : -10 },
    hover: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.12, duration: 0.25, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: isRTL ? 5 : -5,
      transition: { duration: 0.1, ease: "linear" },
    },
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 z-50 flex h-14 items-center overflow-hidden rounded-full shadow-2xl",
        "font-semibold text-sm text-white cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2",
        isRTL ? "right-6" : "left-6",
        className
      )}
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      variants={containerVariants}
      transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={text}
      onClick={onClick}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-green-500 hover:bg-green-600 transition-colors">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.span
            variants={textVariants}
            initial="initial"
            animate="hover"
            exit="exit"
            className={cn(
              "bg-green-500 whitespace-nowrap",
              isRTL ? "pl-5 pr-1" : "pr-5 pl-1"
            )}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
