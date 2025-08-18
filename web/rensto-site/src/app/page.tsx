
import React from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card-enhanced';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--rensto-bg-primary)' }}>
      {/* Header with Authentic Rensto Branding */}
      <div className="rensto-gradient-brand p-6" style={{ boxShadow: 'var(--rensto-glow-primary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={48}
                  height={48}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white rensto-animate-fadeIn">
                  Rensto
                </h1>
                <p className="style={{ color: 'var(--rensto-cyan)' }}/80 mt-1">
                  Business Automation & AI Agents
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="renstoNeon" size="sm" className="rensto-animate-glow">
                Login
              </Button>
              <Button variant="renstoPrimary" size="sm" className="rensto-animate-pulse">
                Try Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-16">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 relative">
              <Image
                src="/Rensto Logo.png"
                alt="Rensto Logo"
                width={96}
                height={96}
                className="rensto-animate-glow"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.7))' }}
              />
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-6" style={{ color: 'var(--rensto-text-primary)' }}>
            Transform Your Business
          </h2>
          <p className="text-xl mb-8" style={{ color: 'var(--rensto-text-secondary)' }}>
            AI-powered automation agents that scale your operations
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="renstoPrimary" size="lg" className="rensto-animate-glow">
              Get Started
            </Button>
            <Button variant="renstoNeon" size="lg" className="rensto-animate-glow">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="rensto" className="rensto-card hover:rensto-glow-accent transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle style={{ color: 'var(--rensto-text-primary)' }}>
                🤖 AI Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Intelligent automation agents that handle complex business processes.
              </p>
            </CardContent>
          </Card>

          <Card variant="rensto" className="rensto-card hover:rensto-glow-accent transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle style={{ color: 'var(--rensto-text-primary)' }}>
                ⚡ Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Powerful workflow automation with n8n integration.
              </p>
            </CardContent>
          </Card>

          <Card variant="rensto" className="rensto-card hover:rensto-glow-accent transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle style={{ color: 'var(--rensto-text-primary)' }}>
                📊 Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Comprehensive analytics and performance insights.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Logo Showcase */}
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardHeader>
            <CardTitle style={{ color: 'var(--rensto-text-primary)' }}>
              🎨 Design System
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={64}
                  height={64}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))' }}
                />
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
              Authentic Rensto Logo with Glow Effects
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
