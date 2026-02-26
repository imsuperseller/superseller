'use client';

import React from 'react';
import { AlertTriangle, Eye, X } from 'lucide-react';

interface ImpersonationBannerProps {
    clientName: string;
    clientEmail: string;
    onExit: () => void;
}

/**
 * Banner shown at top of dashboard when admin is viewing as client
 */
export function ImpersonationBanner({ clientName, clientEmail, onExit }: ImpersonationBannerProps) {
    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
            style={{
                background: 'linear-gradient(90deg, #f47920 0%, #f47920 100%)',
                boxShadow: '0 2px 10px rgba(244, 121, 32, 0.3)'
            }}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white">
                    <Eye className="w-5 h-5" />
                    <span className="font-bold">ADMIN VIEW</span>
                </div>
                <div className="h-4 w-px bg-white/30" />
                <div className="text-white/90 text-sm">
                    Viewing as: <strong>{clientName || clientEmail}</strong>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Actions are logged</span>
                </div>
                <button
                    onClick={onExit}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-medium"
                >
                    <X className="w-4 h-4" />
                    Exit View
                </button>
            </div>
        </div>
    );
}

/**
 * Hook to detect if currently impersonating
 */
export function useImpersonation() {
    const [isImpersonating, setIsImpersonating] = React.useState(false);
    const [clientInfo, setClientInfo] = React.useState<{ name: string; email: string } | null>(null);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('impersonating') === 'true') {
                setIsImpersonating(true);
                // In production, fetch client info from API
                setClientInfo({
                    name: 'Client', // Would come from entitlements API
                    email: params.get('token') || 'unknown',
                });
            }
        }
    }, []);

    const exitImpersonation = () => {
        // Redirect back to admin
        window.location.href = '/admin';
    };

    return { isImpersonating, clientInfo, exitImpersonation };
}
