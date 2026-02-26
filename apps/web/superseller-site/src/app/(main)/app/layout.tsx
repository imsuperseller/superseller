'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ClientNavigation } from '@/components/navigation/ClientNavigation';

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="superseller-animate-glow rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-superseller-bg-primary text-superseller-text-primary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-superseller-bg-primary">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold bg-gradient-to-r from-superseller-cyan to-superseller-blue bg-clip-text text-transparent">SuperSeller AI</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <ClientNavigation />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Placeholder for future mobile menu) */}
        <header className="md:hidden h-16 border-b border-white/10 flex items-center px-4 justify-between bg-superseller-bg-primary">
          <span className="font-bold text-white">SuperSeller AI</span>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
