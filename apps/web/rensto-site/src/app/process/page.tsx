'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redundant page redirected to the Homepage 'Process' section 
 * as part of the strategic site consolidation.
 */
export default function ProcessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the anchors on the homepage for a unified narrative
    router.replace('/#process');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a061e] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Redirecting to Process Engine...</p>
      </div>
    </div>
  );
}
