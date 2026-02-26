'use client';

import React, { useEffect, useState } from 'react';
import { SuperSeller AILogo } from '@/components/ui/superseller-logo';
import { SuperSeller AICard } from '@/components/ui/superseller-card';
import { SuperSeller AIButton } from '@/components/ui/superseller-button';
// Disable GSAP during SSR to avoid build issues
const isClient = typeof window !== 'undefined';

interface CustomerConfig {
  name: string;
  company: string;
  industry: string;
  language: {
    customerApp: string;
    agentInterface: string;
    rtlSupport: boolean;
    locale: string;
  };
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  agents: Array<any>;
}

export default function CustomerPortal({ params }: { params: { slug: string } }) {
  const customerId = params.slug;
  const [config, setConfig] = useState<CustomerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/customers/${customerId}/config`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer configuration');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [customerId]);

  useEffect(() => {
    if (!config || !isClient) return;

    // Load GSAP dynamically only on client
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        // GSAP Animations
        const tl = gsap.timeline();

        // Animate header
        tl.from('.portal-header', {
          duration: 1,
          y: -50,
          opacity: 0,
          ease: 'power3.out'
        });

        // Animate tabs
        tl.from('.portal-tabs .tab-item', {
          duration: 0.6,
          y: 30,
          opacity: 0,
          stagger: 0.1,
          ease: 'power2.out'
        }, '-=0.5');

        // Animate content cards
        tl.from('.portal-content .content-card', {
          duration: 0.8,
          y: 50,
          opacity: 0,
          stagger: 0.15,
          ease: 'power3.out'
        }, '-=0.3');

        // Scroll animations
        gsap.utils.toArray('.content-card').forEach((card: any) => {
          gsap.fromTo(card, 
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });
      });
    });
  }, [config]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-300 mx-auto mb-4"></div>
          <p className="text-xl">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <SuperSeller AICard className="max-w-md mx-auto text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Portal Error</h2>
          <p className="text-gray-300 mb-6">{error || 'Failed to load customer configuration'}</p>
          <SuperSeller AIButton onClick={() => window.location.reload()}>
            Try Again
          </SuperSeller AIButton>
        </SuperSeller AICard>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SuperSeller AICard className="content-card">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">Business Overview</h3>
                <p className="text-gray-300">Monitor your key performance indicators and business metrics</p>
              </div>
            </SuperSeller AICard>
            
            <SuperSeller AICard className="content-card">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-white mb-2">Active Agents</h3>
                <p className="text-gray-300">View and manage your automation agents</p>
              </div>
            </SuperSeller AICard>
            
            <SuperSeller AICard className="content-card">
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-white mb-2">Performance</h3>
                <p className="text-gray-300">Track automation efficiency and ROI</p>
              </div>
            </SuperSeller AICard>
          </div>
        );

      case 'tasks':
        return (
          <SuperSeller AICard className="content-card">
            <h3 className="text-2xl font-bold text-white mb-6">Task Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="text-white font-semibold">Content Generation</h4>
                  <p className="text-gray-300 text-sm">Automated blog post creation</p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="text-white font-semibold">Social Media</h4>
                  <p className="text-gray-300 text-sm">Automated posting schedule</p>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Pending</span>
              </div>
            </div>
          </SuperSeller AICard>
        );

      case 'agents':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SuperSeller AICard className="content-card">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">Content Agent</h3>
                <p className="text-gray-300 mb-4">Automated content creation and management</p>
                <SuperSeller AIButton variant="outline" size="sm">
                  Configure
                </SuperSeller AIButton>
              </div>
            </SuperSeller AICard>
            
            <SuperSeller AICard className="content-card">
              <div className="text-center">
                <div className="text-4xl mb-4">🎙️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Podcast Agent</h3>
                <p className="text-gray-300 mb-4">Automated podcast production and distribution</p>
                <SuperSeller AIButton variant="outline" size="sm">
                  Configure
                </SuperSeller AIButton>
              </div>
            </SuperSeller AICard>
          </div>
        );

      default:
        return (
          <SuperSeller AICard className="content-card">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-gray-300">This feature is under development</p>
            </div>
          </SuperSeller AICard>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ${config.language.rtlSupport ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="portal-header bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SuperSeller AILogo className="h-8 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-white">{config.name}</h1>
                <p className="text-cyan-300">{config.company}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                Portal Active
              </span>
              <SuperSeller AIButton variant="outline" size="sm">
                Settings
              </SuperSeller AIButton>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="portal-tabs bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {config.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-item flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white border-b-2 border-cyan-300'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="portal-content container mx-auto px-4 py-8">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400">
            <p>Powered by SuperSeller AI Business Automation Platform</p>
            <p className="text-sm mt-2">© 2025 {config.company}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
