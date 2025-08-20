
import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">Rensto</h1>
        <p className="text-xl mb-8">Business Automation Platform</p>
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-2">Customer Portals</h2>
            <div className="space-y-2">
                                    <a
                        href="/portal/tax4us"
                        className="block text-cyan-300 hover:text-cyan-100 transition-colors"
                      >
                        Ben Ginati Portal
                      </a>
              <a 
                href="/portal/shelly-mizrahi" 
                className="block text-cyan-300 hover:text-cyan-100 transition-colors"
              >
                Shelly Mizrahi Portal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
