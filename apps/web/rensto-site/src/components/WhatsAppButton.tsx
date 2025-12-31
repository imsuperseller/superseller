'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { trackEvent } from './analytics/GTMProvider';

interface WhatsAppButtonProps {
    phoneNumber?: string;
    message?: string;
}

export function WhatsAppButton({
    phoneNumber = '12144362102', // Rensto WhatsApp number
    message = "Hi Rensto, I'm interested in automating my business. I saw your website and want to learn more!"
}: WhatsAppButtonProps) {

    const handleClick = () => {
        trackEvent('whatsapp_click', {
            location: 'floating_button',
            phone: phoneNumber
        });
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 group overflow-hidden"
            aria-label="Chat on WhatsApp"
            style={{
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.2)'
            }}
        >
            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-25"></span>

            {/* Icon */}
            <MessageCircle size={32} className="relative z-10" />

            {/* Tooltip on hover (desktop) */}
            <span className="absolute right-20 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                Chat with us on WhatsApp
            </span>
        </button>
    );
}
