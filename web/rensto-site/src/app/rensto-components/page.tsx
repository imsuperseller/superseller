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
} from 'lucide-react';

export default function RenstoComponentsPage() {
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
              <h1 className="text-xl font-bold text-rensto-text">Rensto Components</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="renstoPrimary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Components
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Rensto Logo Section */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Zap className="w-5 h-5 text-rensto-cyan" />
                Rensto Logo Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-4">
                  <div className="w-6 h-6 relative">
                <Image
                  src="/Rensto Logo.png"
                  alt="Rensto Logo"
                  width={24}
                  height={24}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>
                  <p className="text-sm text-rensto-text">Small Neon Glow</p>
                </div>
                <div className="text-center space-y-4">
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
                  <p className="text-sm text-rensto-text">Medium Gradient Shimmer</p>
                </div>
                <div className="text-center space-y-4">
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
                  <p className="text-sm text-rensto-text">Large Cyberpunk Pulse</p>
                </div>
                <div className="text-center space-y-4">
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
                  <p className="text-sm text-rensto-text">XL with Tagline</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Button Variants Section */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Star className="w-5 h-5 text-rensto-cyan" />
                Button Variants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Primary Buttons</h4>
                  <div className="space-y-2">
                    <Button variant="renstoPrimary" size="sm">Small Primary</Button>
                    <Button variant="renstoPrimary">Default Primary</Button>
                    <Button variant="renstoPrimary" size="lg">Large Primary</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Secondary Buttons</h4>
                  <div className="space-y-2">
                    <Button variant="renstoSecondary" size="sm">Small Secondary</Button>
                    <Button variant="renstoSecondary">Default Secondary</Button>
                    <Button variant="renstoSecondary" size="lg">Large Secondary</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Special Variants</h4>
                  <div className="space-y-2">
                    <Button variant="renstoNeon" size="sm">Neon Glow</Button>
                    <Button variant="renstoGhost">Ghost Style</Button>
                    <Button variant="renstoBrand" size="lg">Brand Style</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Variants Section */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Heart className="w-5 h-5 text-rensto-cyan" />
                Card Variants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="rensto" className="rensto-card">
                  <CardContent className="p-4">
                    <p className="text-rensto-text">Standard Rensto Card</p>
                  </CardContent>
                </Card>
                <Card variant="renstoNeon" className="rensto-card-neon">
                  <CardContent className="p-4">
                    <p className="text-rensto-text">Neon Glow Card</p>
                  </CardContent>
                </Card>
                <Card variant="renstoGradient" className="rensto-card-gradient">
                  <CardContent className="p-4">
                    <p className="text-rensto-text">Gradient Card</p>
                  </CardContent>
                </Card>
                <Card variant="renstoGlow" className="rensto-card-glow">
                  <CardContent className="p-4">
                    <p className="text-rensto-text">Glow Effect Card</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Badge Variants Section */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Eye className="w-5 h-5 text-rensto-cyan" />
                Badge Variants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Status Badges</h4>
                  <div className="space-y-2">
                    <Badge variant="renstoSuccess">Success</Badge>
                    <Badge variant="renstoWarning">Warning</Badge>
                    <Badge variant="renstoError">Error</Badge>
                    <Badge variant="renstoInfo">Info</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Style Badges</h4>
                  <div className="space-y-2">
                    <Badge variant="renstoNeon">Neon Glow</Badge>
                    <Badge variant="renstoPrimary">Primary</Badge>
                    <Badge variant="renstoSecondary">Secondary</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress and Status Section */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Settings className="w-5 h-5 text-rensto-cyan" />
                Progress & Status Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-rensto-text">Progress Bars</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-rensto-text/70 mb-2">Standard Progress</p>
                      <RenstoProgress value={progressValue} />
                    </div>
                    <div>
                      <p className="text-sm text-rensto-text/70 mb-2">Neon Progress</p>
                      <RenstoProgress value={progressValue} variant="neon" />
                    </div>
                    <div>
                      <p className="text-sm text-rensto-text/70 mb-2">Gradient Progress</p>
                      <RenstoProgress value={progressValue} variant="gradient" />
                    </div>
                    <Button onClick={handleProgressChange} variant="renstoSecondary" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Random Progress
                    </Button>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-semibold text-rensto-text">Status Indicators</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <RenstoStatusIndicator status="online" size="sm" />
                      <span className="text-rensto-text">Online Status</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <RenstoStatusIndicator status="offline" size="md" />
                      <span className="text-rensto-text">Offline Status</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <RenstoStatusIndicator status="error" size="lg" glow={true} />
                      <span className="text-rensto-text">Error Status (Glow)</span>
                    </div>
                    <Button onClick={handleStatusChange} variant="renstoSecondary" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Cycle Status
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Demo Section */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Play className="w-5 h-5 text-rensto-cyan" />
                Interactive Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Current Progress: {progressValue}%</h4>
                  <RenstoProgress value={progressValue} variant="neon" />
                  <div className="flex gap-2">
                    <Button onClick={() => setProgressValue(Math.max(0, progressValue - 10))} variant="renstoSecondary" size="sm">
                      <Pause className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => setProgressValue(Math.min(100, progressValue + 10))} variant="renstoPrimary" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Current Status: {statusType}</h4>
                  <RenstoStatusIndicator status={statusType} size="lg" glow={true} />
                  <p className="text-sm text-rensto-text/70">
                    Click the button to cycle through different status types
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
