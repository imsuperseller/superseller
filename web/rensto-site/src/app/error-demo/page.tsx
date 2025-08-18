import React from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card-enhanced';
import { Input } from '@/components/ui/input-enhanced';

export default function ErrorDemo() {
  return (
    <div className="min-h-screen bg-rensto-bg-primary flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Error Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-rensto-red to-rensto-orange rounded-full flex items-center justify-center shadow-rensto-glow-primary rensto-animate-pulse">
            <span className="text-white text-4xl font-bold">!</span>
          </div>
          <h1 className="text-4xl font-bold text-rensto-text-primary">
            Connection Temporarily Unavailable
          </h1>
          <p className="text-xl text-rensto-text-secondary max-w-2xl mx-auto">
            The Ortal dashboard is currently offline, but we've created a beautiful demonstration 
            of our enhanced Rensto design system using shadcn/ui components.
          </p>
        </div>

        {/* Error Details */}
        <Card variant="renstoNeon" className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-rensto-cyan">🔧 Technical Details</CardTitle>
            <CardDescription className="text-center">
              Error ERR_NGROK_3200 - The endpoint is offline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-rensto-bg-secondary p-4 rounded-lg border border-rensto-cyan/20">
              <p className="text-rensto-text-secondary text-sm">
                <strong>Error Code:</strong> ERR_NGROK_3200<br/>
                <strong>Status:</strong> Endpoint offline<br/>
                <strong>Service:</strong> Ngrok tunnel<br/>
                <strong>Dashboard:</strong> Ortal's Facebook Leads
              </p>
            </div>
            <p className="text-rensto-text-secondary text-center">
              This is a demonstration of our enhanced shadcn/ui components with Rensto branding.
            </p>
          </CardContent>
        </Card>

        {/* Design System Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Button Showcase */}
          <Card variant="rensto">
            <CardHeader>
              <CardTitle>🎨 Enhanced Buttons</CardTitle>
              <CardDescription>Rensto-branded button variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="renstoPrimary">Primary</Button>
                <Button variant="renstoSecondary">Secondary</Button>
                <Button variant="renstoNeon">Neon</Button>
                <Button variant="renstoGhost">Ghost</Button>
              </div>
              <p className="text-sm text-rensto-text-secondary">
                Hover effects, glow animations, and scale transitions
              </p>
            </CardContent>
          </Card>

          {/* Input Showcase */}
          <Card variant="renstoGradient">
            <CardHeader>
              <CardTitle>📝 Enhanced Inputs</CardTitle>
              <CardDescription>Rensto-styled form inputs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input variant="rensto" placeholder="Standard Rensto input..." />
              <Input variant="renstoNeon" placeholder="Neon input with glow..." />
              <Input variant="renstoGlow" placeholder="Glow input effect..." />
              <p className="text-sm text-rensto-text-secondary">
                Focus states, glow effects, and brand color integration
              </p>
            </CardContent>
          </Card>

          {/* Card Variants */}
          <Card variant="renstoGlow">
            <CardHeader>
              <CardTitle>🃏 Card Variants</CardTitle>
              <CardDescription>Different card styling options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-rensto-bg-secondary rounded border border-rensto-blue/20">
                <span className="text-rensto-blue text-sm">renstoGlow - Pulsing animation</span>
              </div>
              <div className="p-3 bg-rensto-bg-secondary rounded border border-rensto-cyan/20">
                <span className="text-rensto-cyan text-sm">renstoNeon - Cyan glow effect</span>
              </div>
              <div className="p-3 bg-gradient-to-r from-rensto-bg-card to-rensto-bg-secondary rounded border border-rensto-red/20">
                <span className="text-rensto-red text-sm">renstoGradient - Gradient background</span>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card variant="renstoNeon">
            <CardHeader>
              <CardTitle>⚡ Key Features</CardTitle>
              <CardDescription>Enhanced design system capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-rensto-text-secondary">TypeScript support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-rensto-text-secondary">Accessibility built-in</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-rensto-text-secondary">Responsive design</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-rensto-text-secondary">Animation effects</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-rensto-text-secondary">Brand consistency</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button variant="renstoPrimary" size="lg">
            🚀 View Dashboard Demo
          </Button>
          <Button variant="renstoSecondary" size="lg">
            🎨 Design System Showcase
          </Button>
          <Button variant="renstoNeon" size="lg">
            📚 Documentation
          </Button>
        </div>

        {/* Status Info */}
        <Card variant="renstoGradient" className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full rensto-animate-pulse"></div>
              <span className="text-rensto-text-primary font-medium">
                🎯 This page demonstrates our enhanced shadcn/ui + Rensto design system
              </span>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-rensto-text-secondary">
                Components: Button, Card, Input, Table with Rensto branding<br/>
                Features: Glow effects, animations, hover states, and brand consistency
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-rensto-text-secondary">
            Built with ❤️ using shadcn/ui + Rensto design system
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-rensto-text-secondary">
            <span>🎨 Enhanced Components</span>
            <span>•</span>
            <span>⚡ Performance Optimized</span>
            <span>•</span>
            <span>🔧 TypeScript Ready</span>
          </div>
        </div>

      </div>
    </div>
  );
}
