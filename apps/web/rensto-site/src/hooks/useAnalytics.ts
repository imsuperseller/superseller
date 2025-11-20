'use client';

import { useCallback } from 'react';

type EventName =
    | 'page_view'
    | 'roi_calculator_view'
    | 'roi_calculator_interact'
    | 'roi_calculator_cta_click'
    | 'scorecard_open'
    | 'scorecard_submit'
    | 'scorecard_error'
    | 'voice_consultation_start'
    | 'voice_consultation_step_complete'
    | 'voice_consultation_complete'
    | 'consultation_cta_click';

interface EventProperties {
    [key: string]: string | number | boolean | undefined;
}

export function useAnalytics() {
    const trackEvent = useCallback((name: EventName, properties?: EventProperties) => {
        // In a real app, this would send data to GA4, PostHog, or a custom API
        // For now, we'll log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] ${name}`, properties);
        }

        // Example of how to send to an API endpoint:
        /*
        try {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, properties, timestamp: new Date().toISOString() }),
          });
        } catch (error) {
          console.error('Failed to track event', error);
        }
        */
    }, []);

    return { trackEvent };
}
