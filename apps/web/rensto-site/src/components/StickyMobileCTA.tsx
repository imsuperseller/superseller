'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Zap } from 'lucide-react';

export function StickyMobileCTA() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't show on administrative routes
    const isDashboardRoute = pathname?.startsWith('/ortal-dashboard');
    const isAdminRoute = pathname?.startsWith('/admin');
    const isAppRoute = pathname?.startsWith('/app');
    const isPortalRoute = pathname?.startsWith('/portal');
    const isLoginRoute = pathname === '/login';

    const isHiddenRoute = isDashboardRoute || isAdminRoute || isAppRoute || isPortalRoute || isLoginRoute;

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling 300px
            const scrolled = window.scrollY > 300;

            // Hide if near the very bottom (footer area)
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPosition = window.scrollY + windowHeight;
            const nearBottom = documentHeight - scrollPosition < 300;

            setIsVisible(scrolled && !nearBottom);
            setIsAtBottom(nearBottom);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHebrew = pathname?.startsWith('/he');

    if (!mounted || isHiddenRoute || (!isVisible && !isAtBottom)) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-[60] md:hidden transition-all duration-500 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
            dir={isHebrew ? 'rtl' : 'ltr'}
            suppressHydrationWarning
        >
            <div className="mx-4 mb-4" suppressHydrationWarning>
                <div className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_-10px_40px_-15px_rgba(30,174,247,0.3)] flex items-center justify-between gap-4" suppressHydrationWarning>
                    <div className="flex items-center gap-3" suppressHydrationWarning>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rensto-blue/20 to-rensto-cyan/20 flex items-center justify-center border border-white/5">
                            <Zap className="w-5 h-5 text-rensto-blue" />
                        </div>
                        <div className="flex flex-col" suppressHydrationWarning>
                            <span className="text-xs font-bold text-rensto-blue tracking-wider uppercase" suppressHydrationWarning>
                                {isHebrew ? 'מלאי מוגבל' : 'Limited Availability'}
                            </span>
                            <span className="text-sm font-bold text-white leading-tight" suppressHydrationWarning>
                                {isHebrew ? 'קבלו אבחון אוטומציה' : 'Get Your Automation Audit'}
                            </span>
                        </div>
                    </div>

                    <Link href="/custom" className="flex-shrink-0" suppressHydrationWarning>
                        <button className="bg-gradient-to-r from-rensto-blue to-rensto-cyan text-white text-xs font-bold px-5 py-3 rounded-xl shadow-[0_0_20px_-5px_rgba(30,174,247,0.5)] active:scale-95 transition-all flex items-center gap-2" suppressHydrationWarning>
                            <span suppressHydrationWarning>{isHebrew ? 'בואו נתחיל' : 'GET STARTED'}</span>
                            <ArrowRight className={`w-3 h-3 ${isHebrew ? 'rotate-180' : ''}`} />
                        </button>
                    </Link>
                </div>
            </div>
            {/* iOS Safe Area Bottom Spacing */}
            <div className={`h-[env(safe-area-inset-bottom)] ${isVisible ? 'bg-[#0B0F19]/80 backdrop-blur-xl' : ''}`} />
        </div>
    );
}
