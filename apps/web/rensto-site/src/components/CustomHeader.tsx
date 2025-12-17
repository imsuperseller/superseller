'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function CustomHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(11, 15, 25, 0.9)' }}>
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/custom" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/rensto-logo.png"
                            alt="Rensto Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold text-white">Rensto</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--rensto-text-secondary)' }}>
                    <Link href="/custom#process" className="hover:text-white transition-colors">The Process</Link>
                    <Link href="/custom#pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/custom#terminal" className="hover:opacity-80 transition-colors font-bold" style={{ color: 'var(--rensto-blue)' }}>Try Live Demo</Link>
                </nav>
            </div>
        </header>
    );
}
