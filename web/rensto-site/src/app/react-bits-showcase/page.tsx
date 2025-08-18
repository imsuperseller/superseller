'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { RenstoProgress } from '@/components/ui/rensto-progress';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';
import {
  Search,
  Filter,
  Code,
  Palette,
  Zap,
  Star,
  Heart,
  Eye,
  Copy,
  Download,
} from 'lucide-react';

interface ComponentDemo {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  demo: React.ReactNode;
}

export default function ReactBitsShowcase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Components', icon: Code },
    { id: 'animations', name: 'Animations', icon: Zap },
    { id: 'ui', name: 'UI Elements', icon: Palette },
    { id: 'interactive', name: 'Interactive', icon: Star },
  ];

  const componentDemos: ComponentDemo[] = [
    {
      id: 'fade-in-text',
      name: 'Fade In Text',
      description: 'Smooth text animation with fade-in effect',
      category: 'animations',
      code: `<FadeInText text="Hello World" delay={0.5} />`,
      demo: (
        <div className="p-4 bg-rensto-card rounded-lg border border-rensto-border">
          <p className="text-rensto-text animate-fade-in">Hello World</p>
        </div>
      ),
    },
    {
      id: 'typewriter',
      name: 'Typewriter Effect',
      description: 'Classic typewriter text animation',
      category: 'animations',
      code: `<Typewriter text="Typing effect..." speed={50} />`,
      demo: (
        <div className="p-4 bg-rensto-card rounded-lg border border-rensto-border">
          <p className="text-rensto-text font-mono">Typing effect...</p>
        </div>
      ),
    },
    {
      id: 'glass-card',
      name: 'Glass Card',
      description: 'Modern glassmorphism card component',
      category: 'ui',
      code: `<GlassCard className="p-6">Content</GlassCard>`,
      demo: (
        <div className="p-4 bg-gradient-to-br from-rensto-red/20 to-rensto-blue/20 rounded-lg border border-rensto-border backdrop-blur-sm">
          <p className="text-rensto-text">Glass Card Content</p>
        </div>
      ),
    },
    {
      id: 'gradient-button',
      name: 'Gradient Button',
      description: 'Beautiful gradient button with hover effects',
      category: 'ui',
      code: `<GradientButton>Click Me</GradientButton>`,
      demo: (
        <Button variant="renstoPrimary" className="bg-gradient-to-r from-rensto-red to-rensto-orange">
          Click Me
        </Button>
      ),
    },
    {
      id: 'magnetic-cursor',
      name: 'Magnetic Cursor',
      description: 'Interactive magnetic cursor effect',
      category: 'interactive',
      code: `<MagneticCursor>Hover me</MagneticCursor>`,
      demo: (
        <div className="p-4 bg-rensto-card rounded-lg border border-rensto-border hover:scale-105 transition-transform">
          <p className="text-rensto-text">Hover me</p>
        </div>
      ),
    },
    {
      id: 'skeleton-loader',
      name: 'Skeleton Loader',
      description: 'Animated skeleton loading component',
      category: 'ui',
      code: `<SkeletonLoader lines={3} />`,
      demo: (
        <div className="space-y-2">
          <div className="h-4 bg-rensto-border rounded rensto-animate-pulse"></div>
          <div className="h-4 bg-rensto-border rounded rensto-animate-pulse w-3/4"></div>
          <div className="h-4 bg-rensto-border rounded rensto-animate-pulse w-1/2"></div>
        </div>
      ),
    },
  ];

  const filteredComponents = componentDemos.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
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
              <h1 className="text-xl font-bold text-rensto-text">React Bits Showcase</h1>
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
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rensto-text/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-rensto-card border border-rensto-border rounded-lg text-rensto-text placeholder-rensto-text/50 focus:outline-none focus:ring-2 focus:ring-rensto-cyan"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "renstoPrimary" : "renstoSecondary"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Component Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map(component => (
              <Card key={component.id} className="rensto-card hover:rensto-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-rensto-text">{component.name}</CardTitle>
                    <Badge variant="renstoInfo" className="text-xs">
                      {component.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-rensto-text/70">{component.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Demo */}
                  <div className="p-4 bg-rensto-bg-secondary rounded-lg border border-rensto-border">
                    {component.demo}
                  </div>
                  
                  {/* Code */}
                  <div className="relative">
                    <pre className="text-xs bg-rensto-bg-secondary p-3 rounded-lg border border-rensto-border text-rensto-text/80 overflow-x-auto">
                      <code>{component.code}</code>
                    </pre>
                    <Button
                      variant="renstoGhost"
                      size="sm"
                      onClick={() => handleCopyCode(component.code)}
                      className="absolute top-2 right-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integration Examples */}
          <Card variant="rensto" className="rensto-card">
            <CardHeader>
              <CardTitle className="text-rensto-text flex items-center gap-3">
                <Zap className="w-5 h-5 text-rensto-cyan" />
                Rensto + React Bits Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Combined Components</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-rensto-card rounded-lg border border-rensto-border">
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
                      <p className="text-rensto-text mt-2">Rensto Logo with React Bits animations</p>
                    </div>
                    <div className="p-3 bg-rensto-card rounded-lg border border-rensto-border">
                      <RenstoProgress value={75} variant="neon" />
                      <p className="text-rensto-text mt-2">Rensto Progress with enhanced effects</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-rensto-text">Usage Examples</h4>
                  <div className="space-y-2 text-sm text-rensto-text/80">
                    <p>• Combine Rensto branding with React Bits animations</p>
                    <p>• Use React Bits for enhanced user interactions</p>
                    <p>• Leverage both libraries for maximum impact</p>
                    <p>• Maintain brand consistency across all components</p>
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