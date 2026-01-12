'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                // Clear any client-side storage if needed
                localStorage.removeItem('rensto_user');
            } catch (error) {
                console.error('Logout failed', error);
            } finally {
                // Always redirect to home
                router.push('/');
                router.refresh();
            }
        };

        performLogout();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0D14] text-white">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Logging out...</p>
            </div>
        </div>
    );
}
