'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { RenstoProgress } from '@/components/ui/rensto-progress';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';
import {
  Zap,
  Star,
  Heart,
  Eye,
  Copy,
  Download,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Sparkles,
} from 'lucide-react';

export default function RenstoDemoPage() {
  const [progressValue, setProgressValue] = useState(75);
  const [statusType, setStatusType] = useState<'online' | 'offline' | 'error'>('online');

  const handleProgressChange = () => {
    setProgressValue(Math.floor(Math.random() * 100));
  };

  const handleStatusChange = () => {
    const statuses: Array<'online' | 'offline' | 'error'> = ['online', 'offline', 'error'];
    const currentIndex = statuses.indexOf(statusType);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setStatusType(statuses[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-rensto-bg-primary">
      {/* Header */}
      <header className="bg-rensto-card border-b border-rensto-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={32}
                  height={32}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>
              <h1 className="text-xl font-bold text-rensto-text">Rensto Demo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="renstoPrimary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Zap className="w-5 h-5 text-rensto-cyan" />
                Rensto Brand Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={64}
                  height={64}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>
                <p className="text-lg text-rensto-text">
                  Authentic Rensto brand identity with neon aesthetics, dynamic gradients, and modern interactions
                </p>
                <div className="flex justify-center gap-4">
                  <Badge variant="renstoSuccess">Brand Authentic</Badge>
                  <Badge variant="renstoNeon">Neon Aesthetics</Badge>
                  <Badge variant="renstoPrimary">Modern Design</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="rensto" className="rensto-card">
              <CardHeader>
                <CardTitle className="text-rensto-text flex items-center gap-3">
                  <Star className="w-5 h-5 text-rensto-cyan" />
                  Interactive Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-rensto-text/70 mb-2">Current Progress: {progressValue}%</p>
                  <RenstoProgress value={progressValue} variant="neon" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setProgressValue(Math.max(0, progressValue - 10))} variant="renstoSecondary" size="sm">
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => setProgressValue(Math.min(100, progressValue + 10))} variant="renstoPrimary" size="sm">
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleProgressChange} variant="renstoNeon" size="sm">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card variant="rensto" className="rensto-card">
              <CardHeader>
                <CardTitle className="text-rensto-text flex items-center gap-3">
                  <Settings className="w-5 h-5 text-rensto-cyan" />
                  Status Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-rensto-text/70 mb-2">Current Status: {statusType}</p>
                  <RenstoStatusIndicator status={statusType} size="lg" glow={true} />
                </div>
                <Button onClick={handleStatusChange} variant="renstoSecondary" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cycle Status
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Component Showcase */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Heart className="w-5 h-5 text-rensto-cyan" />
                Component Showcase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-rensto-card rounded-lg border border-rensto-border">
                    <div className="w-8 h-8 relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={32}
                  height={32}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>
                  </div>
                  <p className="text-sm text-rensto-text">Neon Glow Logo</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="p-4 bg-rensto-card rounded-lg border border-rensto-border">
                    <Button variant="renstoPrimary" className="w-full">
                      <Flame className="w-4 h-4 mr-2" />
                      Primary Button
                    </Button>
                  </div>
                  <p className="text-sm text-rensto-text">Primary Button with Icon</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="p-4 bg-rensto-card rounded-lg border border-rensto-border">
                    <RenstoProgress value={65} variant="gradient" />
                  </div>
                  <p className="text-sm text-rensto-text">Gradient Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Elements */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-rensto-cyan" />
                Brand Elements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Color Palette</h4>
                  <div className="space-y-2">
                    <div className="h-8 bg-rensto-red rounded border border-rensto-border"></div>
                    <div className="h-8 bg-rensto-orange rounded border border-rensto-border"></div>
                    <div className="h-8 bg-rensto-blue rounded border border-rensto-border"></div>
                    <div className="h-8 bg-rensto-cyan rounded border border-rensto-border"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Button Styles</h4>
                  <div className="space-y-2">
                    <Button variant="renstoPrimary" size="sm" className="w-full">Primary</Button>
                    <Button variant="renstoSecondary" size="sm" className="w-full">Secondary</Button>
                    <Button variant="renstoNeon" size="sm" className="w-full">Neon</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Badge Styles</h4>
                  <div className="space-y-2">
                    <Badge variant="renstoSuccess">Success</Badge>
                    <Badge variant="renstoWarning">Warning</Badge>
                    <Badge variant="renstoError">Error</Badge>
                    <Badge variant="renstoInfo">Info</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Status Types</h4>
                  <div className="space-y-2">
                    <RenstoStatusIndicator status="online" size="sm" />
                    <RenstoStatusIndicator status="offline" size="sm" />
                    <RenstoStatusIndicator status="error" size="sm" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}