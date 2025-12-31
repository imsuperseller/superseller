'use client';

import React, { useEffect } from 'react';

interface ElevenLabsWidgetProps {
    agentId?: string;
}

export function ElevenLabsWidget({ agentId }: ElevenLabsWidgetProps) {
    const finalAgentId = agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_5201kayk2ackec98x8205fwgb9h0';

    useEffect(() => {
        if (!finalAgentId || finalAgentId.length < 10) return;

        // Use a flag to avoid multiple initializations
        let isMounted = true;

        if (!document.getElementById('elevenlabs-widget-script')) {
            const script = document.createElement('script');
            script.id = 'elevenlabs-widget-script';
            script.src = 'https://elevenlabs.io/convai-widget/index.js';
            script.async = true;
            script.type = 'text/javascript';
            document.head.appendChild(script);
        }

        return () => {
            isMounted = false;
        };
    }, [finalAgentId]);

    if (!finalAgentId || finalAgentId.length < 10) return null;

    return (
        <elevenlabs-convai agent-id={finalAgentId}></elevenlabs-convai>
    );
}

// Add custom element type to JSX namespace for TypeScript
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'agent-id': string }, HTMLElement>;
        }
    }
}
