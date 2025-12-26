'use client';

import React, { Suspense, useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const GTM_ID = 'GTM-PX9WNRXW'; // Placeholder GTM ID - Replace with actual

declare global {
    interface Window {
        dataLayer: any[];
    }
}

// Inner component that uses useSearchParams - must be wrapped in Suspense
function GTMPageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && window.dataLayer) {
            window.dataLayer.push({
                event: 'pageview',
                page: pathname,
            });
        }
    }, [pathname, searchParams]);

    return null;
}

export function GTMProvider({ children }: { children: React.ReactNode }) {
    return (
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
            <Suspense fallback={null}>
                <GTMPageTracker />
            </Suspense>
            {children}
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
