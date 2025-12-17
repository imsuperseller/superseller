'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface TooltipProps {
    content: string;
    children?: React.ReactNode;
    className?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, className, side = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
        <div
            className={cn("relative inline-flex items-center", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || <Info className="w-4 h-4 text-slate-400 hover:text-rensto-blue transition-colors cursor-help" />}

            {isVisible && content && (
                <div className={cn(
                    "absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl whitespace-nowrap min-w-[200px] text-center pointer-events-none animate-in fade-in zoom-in-95 duration-200",
                    side === 'top' && "bottom-full left-1/2 -translate-x-1/2 mb-2",
                    side === 'bottom' && "top-full left-1/2 -translate-x-1/2 mt-2",
                    side === 'left' && "right-full top-1/2 -translate-y-1/2 mr-2",
                    side === 'right' && "left-full top-1/2 -translate-y-1/2 ml-2"
                )}>
                    {content}
                    <div className={cn(
                        "absolute w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45",
                        side === 'top' && "bottom-[-5px] left-1/2 -translate-x-1/2 border-l-0 border-t-0 border-r border-b", /* Arrow points down */
                        side === 'top' && "border-t-0 border-l-0 border-slate-700 bg-slate-900", // Fix rotation logic
                        /* Simplified arrow for safety */
                    )} />
                </div>
            )}
        </div>
    );
}
