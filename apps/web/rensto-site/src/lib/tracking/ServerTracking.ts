/**
 * Server-side tracking utility for Rensto.
 * This can be used in API routes or server actions to dispatch events to GA4/GTM.
 */

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const API_SECRET = process.env.GA_API_SECRET || '';

export async function trackServerEvent(eventName: string, params: any = {}, clientId: string = 'server_side_client') {
    if (!API_SECRET) {
        console.warn('GA_API_SECRET is not set. Server-side tracking skipped.');
        return;
    }

    try {
        const response = await fetch(
            `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    client_id: clientId,
                    events: [
                        {
                            name: eventName,
                            params: {
                                ...params,
                                engagement_time_msec: '100',
                                session_id: 'server_session',
                            },
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server-side tracking failed:', errorText);
        }
    } catch (error) {
        console.error('Error in server-side tracking:', error);
    }
}
