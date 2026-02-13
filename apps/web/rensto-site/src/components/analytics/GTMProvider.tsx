'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

const GTM_ID = 'GTM-PX9WNRXW'; // Placeholder GTM ID - Replace with actual

declare global {
    interface Window {
        dataLayer: any[];
    }
}

// Defer until after mount to avoid hydration mismatch (Script/GTMPageTracker differ server vs client)
function GTMPageTracker() {
    const pathname = usePathname();
    useEffect(() => {
        if (pathname && typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
                event: 'pageview',
                page: pathname,
            });
        }
    }, [pathname]);
    return null;
}

export function GTMProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            {children}
            {mounted && (
                <>
                    <Script
                        id="gtm-script"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
                        }}
                    />
                    <GTMPageTracker />
                </>
            )}
        </>
    );
}

// Utility to push custom events
export const trackEvent = (eventName: string, eventParams?: any) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
            event: eventName,
            ...eventParams,
        });
    }
};
