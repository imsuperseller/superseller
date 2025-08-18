#!/usr/bin/env node

/**
 * Rensto Component Integration Script
 * 
 * This script integrates Rensto-branded components throughout the application
 * by updating all relevant files with Rensto styling and components.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_ROOT = path.join(__dirname, '../web/rensto-site');
const COMPONENTS_DIR = path.join(SITE_ROOT, 'src/components');
const PAGES_DIR = path.join(SITE_ROOT, 'src/app');
const LAYOUT_DIR = path.join(SITE_ROOT, 'src/app');

console.log('🚀 Starting Rensto Component Integration...\n');

// Files to update with Rensto components
const filesToUpdate = [
  // Main layout files
  'src/app/layout.tsx',
  'src/app/globals.css',
  
  // Page files
  'src/app/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/agents/page.tsx',
  'src/app/admin/customers/page.tsx',
  'src/app/admin/analytics/page.tsx',
  'src/app/portal/page.tsx',
  'src/app/portal/[slug]/page.tsx',
  'src/app/[org]/agents/page.tsx',
  'src/app/ortal/page.tsx',
  'src/app/rensto-components/page.tsx',
  
  // Component files
  'src/components/admin/AgentDashboard.tsx',
  'src/components/admin/CustomerDashboard.tsx',
  'src/components/admin/AnalyticsDashboard.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/table.tsx',
  'src/components/ui/alert.tsx',
  'src/components/ui/toast.tsx',
];

// Rensto component imports to add
const renstoImports = [
  "import { RenstoLogo } from '@/components/ui/rensto-logo';",
  "import { RenstoProgress } from '@/components/ui/rensto-progress';",
  "import { RenstoStatusIndicator } from '@/components/ui/rensto-status';",
];

// Rensto component variants to use
const renstoVariants = {
  card: ['rensto', 'renstoNeon', 'renstoGradient', 'renstoGlow'],
  button: ['renstoPrimary', 'renstoSecondary', 'renstoNeon', 'renstoGhost', 'renstoBrand'],
  badge: ['renstoSuccess', 'renstoWarning', 'renstoError', 'renstoInfo', 'renstoNeon', 'renstoPrimary', 'renstoSecondary'],
  progress: ['default', 'gradient', 'neon'],
  status: ['online', 'offline', 'error', 'warning', 'loading'],
};

// CSS classes to replace with Rensto equivalents
const cssReplacements = {
  // Background colors
  'bg-white': 'bg-rensto-card',
  'bg-slate-50': 'bg-rensto-background',
  'bg-slate-100': 'bg-rensto-card',
  'bg-gray-50': 'bg-rensto-background',
  'bg-gray-100': 'bg-rensto-card',
  
  // Text colors
  'text-slate-900': 'text-rensto-text',
  'text-slate-800': 'text-rensto-text',
  'text-slate-700': 'text-rensto-text/80',
  'text-slate-600': 'text-rensto-text/70',
  'text-slate-500': 'text-rensto-text/60',
  'text-gray-900': 'text-rensto-text',
  'text-gray-800': 'text-rensto-text',
  'text-gray-700': 'text-rensto-text/80',
  'text-gray-600': 'text-rensto-text/70',
  'text-gray-500': 'text-rensto-text/60',
  
  // Border colors
  'border-slate-200': 'border-rensto-border',
  'border-slate-300': 'border-rensto-border',
  'border-gray-200': 'border-rensto-border',
  'border-gray-300': 'border-rensto-border',
  
  // Button colors
  'bg-orange-600': 'bg-gradient-to-r from-rensto-red to-rensto-orange',
  'hover:bg-orange-700': 'hover:rensto-glow',
  'text-orange-600': 'text-rensto-orange',
  'hover:text-orange-700': 'hover:text-rensto-red',
  
  // Status colors
  'text-green-600': 'text-rensto-cyan',
  'text-red-600': 'text-rensto-red',
  'text-yellow-600': 'text-rensto-orange',
  'text-blue-600': 'text-rensto-blue',
  
  // Card styling
  'rounded-xl': 'rounded-xl rensto-card',
  'shadow-sm': 'shadow-sm rensto-glow',
  'hover:shadow-md': 'hover:rensto-glow',
};

// Function to update a file with Rensto components
function updateFileWithRensto(filePath) {
  const fullPath = path.join(SITE_ROOT, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;
    
    // Add Rensto imports if not present
    renstoImports.forEach(importStatement => {
      if (!content.includes(importStatement)) {
        // Find the last import statement
        const importRegex = /import.*from.*['"];?\n/g;
        const imports = content.match(importRegex);
        
        if (imports) {
          const lastImport = imports[imports.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
          content = content.slice(0, lastImportIndex) + importStatement + '\n' + content.slice(lastImportIndex);
          updated = true;
        }
      }
    });
    
    // Replace CSS classes with Rensto equivalents
    Object.entries(cssReplacements).forEach(([oldClass, newClass]) => {
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, newClass);
        updated = true;
      }
    });
    
    // Replace generic components with Rensto variants
    content = content.replace(
      /<Card\s+className="([^"]*)"/g,
      '<Card variant="renstoNeon" className="$1 rensto-card hover:rensto-glow"'
    );
    
    content = content.replace(
      /<Button\s+className="([^"]*)"/g,
      '<Button variant="renstoPrimary" className="$1 rensto-button"'
    );
    
    content = content.replace(
      /<Badge\s+className="([^"]*)"/g,
      '<Badge variant="renstoPrimary" className="$1 rensto-badge"'
    );
    
    // Add Rensto logo to headers
    content = content.replace(
      /<h1[^>]*>([^<]+)<\/h1>/g,
      '<h1 className="text-rensto-text flex items-center gap-3"><RenstoLogo size="sm" variant="neon" animate="glow" />$1</h1>'
    );
    
    // Add Rensto progress bars
    content = content.replace(
      /<div[^>]*class="[^"]*bg-[^"]*rounded-full[^"]*"[^>]*>.*?<\/div>/gs,
      '<RenstoProgress value={75} fillVariant="gradient" fillAnimate="pulse" showLabel={false} />'
    );
    
    // Add Rensto status indicators
    content = content.replace(
      /<span[^>]*class="[^"]*px-[^"]*py-[^"]*rounded-full[^"]*"[^>]*>.*?<\/span>/g,
      '<RenstoStatusIndicator status="online" size="sm" glow={true} />'
    );
    
    if (updated) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Function to create a summary report
function createIntegrationReport(updatedFiles) {
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: filesToUpdate.length,
    updatedFiles: updatedFiles.length,
    skippedFiles: filesToUpdate.length - updatedFiles.length,
    renstoComponents: {
      logo: 'RenstoLogo with neon glow effects',
      progress: 'RenstoProgress with gradient animations',
      status: 'RenstoStatusIndicator with glow effects',
      cards: 'Card variants: rensto, renstoNeon, renstoGradient, renstoGlow',
      buttons: 'Button variants: renstoPrimary, renstoSecondary, renstoNeon, renstoGhost, renstoBrand',
      badges: 'Badge variants: renstoSuccess, renstoWarning, renstoError, renstoInfo, renstoNeon, renstoPrimary, renstoSecondary',
    },
    cssVariables: {
      colors: 'Rensto brand colors (red, orange, blue, cyan)',
      backgrounds: 'Dark theme with rensto-background and rensto-card',
      borders: 'Subtle borders with rensto-border',
      text: 'High contrast text with rensto-text',
    },
    animations: {
      glow: 'rensto-glow animation for hover effects',
      pulse: 'rensto-pulse for active elements',
      shimmer: 'rensto-shimmer for loading states',
      fadeIn: 'rensto-fadeIn for page transitions',
    },
  };
  
  const reportPath = path.join(__dirname, '../data/rensto-integration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Integration Report:');
  console.log(`   Total files processed: ${report.totalFiles}`);
  console.log(`   Files updated: ${report.updatedFiles}`);
  console.log(`   Files skipped: ${report.skippedFiles}`);
  console.log(`   Report saved to: ${reportPath}`);
}

// Function to create a demo page showcasing all Rensto components
function createRenstoDemoPage() {
  const demoContent = `'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RenstoLogo } from '@/components/ui/rensto-logo';
import { RenstoProgress } from '@/components/ui/rensto-progress';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Settings, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Download,
  ExternalLink,
  Brain,
  Workflow,
  Link,
  CreditCard,
  FileText,
  Bell,
  User,
  Shield,
  Zap,
  Target,
  Rocket,
  Star,
  Heart,
  Lightning,
  Fire,
  Sparkles
} from 'lucide-react';

export default function RenstoComponentsDemo() {
  const [progressValue, setProgressValue] = useState(75);
  const [statusType, setStatusType] = useState('online');

  return (
    <div className="min-h-screen bg-rensto-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <RenstoLogo size="xl" variant="gradient" animate="shimmer" showTagline={true} />
          <h1 className="text-4xl font-bold text-rensto-text">Rensto Component Library</h1>
          <p className="text-xl text-rensto-text/70">Complete showcase of all Rensto-branded components</p>
        </div>

        {/* Logo Variations */}
        <Card variant="rensto" className="rensto-card">
          <CardHeader>
            <CardTitle className="text-rensto-text">RenstoLogo Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <RenstoLogo size="lg" variant="default" />
                <p className="text-sm text-rensto-text/70">Default</p>
              </div>
              <div className="text-center space-y-2">
                <RenstoLogo size="lg" variant="neon" animate="glow" />
                <p className="text-sm text-rensto-text/70">Neon Glow</p>
              </div>
              <div className="text-center space-y-2">
                <RenstoLogo size="lg" variant="gradient" animate="shimmer" />
                <p className="text-sm text-rensto-text/70">Gradient Shimmer</p>
              </div>
              <div className="text-center space-y-2">
                <RenstoLogo size="lg" variant="glow" animate="pulse" />
                <p className="text-sm text-rensto-text/70">Glow Pulse</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variations */}
        <Card variant="rensto" className="rensto-card">
          <CardHeader>
            <CardTitle className="text-rensto-text">Button Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Button variant="renstoPrimary" className="rensto-button">
                <Zap className="w-4 h-4 mr-2" />
                Primary
              </Button>
              <Button variant="renstoSecondary" className="rensto-button">
                <Settings className="w-4 h-4 mr-2" />
                Secondary
              </Button>
              <Button variant="renstoNeon" className="rensto-button">
                <Sparkles className="w-4 h-4 mr-2" />
                Neon
              </Button>
              <Button variant="renstoGhost" className="rensto-button">
                <User className="w-4 h-4 mr-2" />
                Ghost
              </Button>
              <Button variant="renstoBrand" className="rensto-button">
                <Rocket className="w-4 h-4 mr-2" />
                Brand
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Variations */}
        <Card variant="rensto" className="rensto-card">
          <CardHeader>
            <CardTitle className="text-rensto-text">Card Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card variant="rensto" className="rensto-card">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <Target className="w-8 h-8 text-rensto-cyan mx-auto" />
                    <h3 className="font-semibold text-rensto-text">Default</h3>
                    <p className="text-sm text-rensto-text/70">Standard Rensto card</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="renstoNeon" className="rensto-card hover:rensto-glow">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <Lightning className="w-8 h-8 text-rensto-cyan mx-auto" />
                    <h3 className="font-semibold text-rensto-text">Neon</h3>
                    <p className="text-sm text-rensto-text/70">Glowing neon effect</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="renstoGradient" className="rensto-card">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <Fire className="w-8 h-8 text-rensto-cyan mx-auto" />
                    <h3 className="font-semibold text-rensto-text">Gradient</h3>
                    <p className="text-sm text-rensto-text/70">Gradient background</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="renstoGlow" className="rensto-card">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <Star className="w-8 h-8 text-rensto-cyan mx-auto" />
                    <h3 className="font-semibold text-rensto-text">Glow</h3>
                    <p className="text-sm text-rensto-text/70">Enhanced glow effect</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Badge Variations */}
        <Card variant="rensto" className="rensto-card">
          <CardHeader>
            <CardTitle className="text-rensto-text">Badge Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Badge variant="renstoSuccess" className="rensto-badge">
                <CheckCircle className="w-3 h-3 mr-1" />
                Success
              </Badge>
              <Badge variant="renstoWarning" className="rensto-badge">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Warning
              </Badge>
              <Badge variant="renstoError" className="rensto-badge">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Error
              </Badge>
              <Badge variant="renstoInfo" className="rensto-badge">
                <Info className="w-3 h-3 mr-1" />
                Info
              </Badge>
              <Badge variant="renstoNeon" className="rensto-badge">
                <Sparkles className="w-3 h-3 mr-1" />
                Neon
              </Badge>
              <Badge variant="renstoPrimary" className="rensto-badge">
                <Target className="w-3 h-3 mr-1" />
                Primary
              </Badge>
              <Badge variant="renstoSecondary" className="rensto-badge">
                <Settings className="w-3 h-3 mr-1" />
                Secondary
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Variations */}
        <Card variant="rensto" className="rensto-card">
          <CardHeader>
            <CardTitle className="text-rensto-text">Progress Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-rensto-text/70">Default Progress</span>
                  <span className="text-sm text-rensto-text">{progressValue}%</span>
                </div>
                <RenstoProgress value={progressValue} showLabel={false} />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-rensto-text/70">Gradient Progress</span>
                  <span className="text-sm text-rensto-text">{progressValue}%</span>
                </div>
                <RenstoProgress value={progressValue} fillVariant="gradient" showLabel={false} />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-rensto-text/70">Animated Progress</span>
                  <span className="text-sm text-rensto-text">{progressValue}%</span>
                </div>
                <RenstoProgress value={progressValue} fillVariant="gradient" fillAnimate="pulse" showLabel={false} />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="renstoSecondary" 
                  size="sm" 
                  onClick={() => setProgressValue(Math.max(0, progressValue - 10))}
                  className="rensto-button"
                >
                  Decrease
                </Button>
                <Button 
                  variant="renstoPrimary" 
                  size="sm" 
                  onClick={() => setProgressValue(Math.min(100, progressValue + 10))}
                  className="rensto-button"
                >
                  Increase
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicator Variations */}
        <Card variant="rensto" className="rensto-card">
          <CardHeader>
            <CardTitle className="text-rensto-text">Status Indicator Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center space-y-2">
                <RenstoStatusIndicator status="online" size="md" glow={true} />
                <p className="text-sm text-rensto-text/70">Online</p>
              </div>
              <div className="text-center space-y-2">
                <RenstoStatusIndicator status="offline" size="md" />
                <p className="text-sm text-rensto-text/70">Offline</p>
              </div>
              <div className="text-center space-y-2">
                <RenstoStatusIndicator status="error" size="md" pulse={true} />
                <p className="text-sm text-rensto-text/70">Error</p>
              </div>
              <div className="text-center space-y-2">
                <RenstoStatusIndicator status="warning" size="md" glow={true} />
                <p className="text-sm text-rensto-text/70">Warning</p>
              </div>
              <div className="text-center space-y-2">
                <RenstoStatusIndicator status="loading" size="md" pulse={true} />
                <p className="text-sm text-rensto-text/70">Loading</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center gap-4">
              <Button 
                variant="renstoSecondary" 
                size="sm" 
                onClick={() => setStatusType('online')}
                className="rensto-button"
              >
                Online
              </Button>
              <Button 
                variant="renstoSecondary" 
                size="sm" 
                onClick={() => setStatusType('offline')}
                className="rensto-button"
              >
                Offline
              </Button>
              <Button 
                variant="renstoSecondary" 
                size="sm" 
                onClick={() => setStatusType('error')}
                className="rensto-button"
              >
                Error
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card variant="rensto" className="rensto-card">
          <CardHeader>
            <CardTitle className="text-rensto-text">Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-rensto-text">Agent Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-rensto-card/50 rounded-lg border border-rensto-border">
                    <div className="flex items-center gap-3">
                      <RenstoStatusIndicator status={statusType} size="sm" glow={true} />
                      <div>
                        <h4 className="font-medium text-rensto-text">Content Agent</h4>
                        <p className="text-sm text-rensto-text/60">WordPress automation</p>
                      </div>
                    </div>
                    <Button variant="renstoPrimary" size="sm" className="rensto-button">
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-rensto-card/50 rounded-lg border border-rensto-border">
                    <div className="flex items-center gap-3">
                      <RenstoStatusIndicator status="online" size="sm" glow={true} />
                      <div>
                        <h4 className="font-medium text-rensto-text">Social Media Agent</h4>
                        <p className="text-sm text-rensto-text/60">Facebook automation</p>
                      </div>
                    </div>
                    <Button variant="renstoSecondary" size="sm" className="rensto-button">
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-rensto-text">Performance Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-rensto-text/70">Success Rate</span>
                      <span className="text-sm text-rensto-text">94%</span>
                    </div>
                    <RenstoProgress value={94} fillVariant="gradient" showLabel={false} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-rensto-text/70">CPU Usage</span>
                      <span className="text-sm text-rensto-text">67%</span>
                    </div>
                    <RenstoProgress value={67} fillVariant="gradient" fillAnimate="pulse" showLabel={false} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-rensto-text/70">Memory Usage</span>
                      <span className="text-sm text-rensto-text">82%</span>
                    </div>
                    <RenstoProgress value={82} fillVariant="gradient" showLabel={false} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <RenstoLogo size="lg" variant="neon" animate="glow" showTagline={true} />
          <p className="text-rensto-text/70">
            Rensto Component Library - Complete integration ready for production
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="renstoSuccess" className="rensto-badge">
              <CheckCircle className="w-3 h-3 mr-1" />
              All Components Ready
            </Badge>
            <Badge variant="renstoNeon" className="rensto-badge">
              <Sparkles className="w-3 h-3 mr-1" />
              Production Ready
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}`;

  const demoPath = path.join(SITE_ROOT, 'src/app/rensto-demo/page.tsx');
  const demoDir = path.dirname(demoPath);
  
  if (!fs.existsSync(demoDir)) {
    fs.mkdirSync(demoDir, { recursive: true });
  }
  
  fs.writeFileSync(demoPath, demoContent);
  console.log(`✅ Created Rensto Demo Page: src/app/rensto-demo/page.tsx`);
}

// Main execution
async function main() {
  console.log('🔍 Processing files for Rensto integration...\n');
  
  const updatedFiles = [];
  
  for (const file of filesToUpdate) {
    const wasUpdated = updateFileWithRensto(file);
    if (wasUpdated) {
      updatedFiles.push(file);
    }
  }
  
  console.log('\n🎨 Creating Rensto Demo Page...');
  createRenstoDemoPage();
  
  console.log('\n📊 Generating Integration Report...');
  createIntegrationReport(updatedFiles);
  
  console.log('\n🎉 Rensto Component Integration Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Review the updated files for any manual adjustments');
  console.log('   2. Test the Rensto Demo Page at /rensto-demo');
  console.log('   3. Verify all components render correctly');
  console.log('   4. Check the integration report for details');
  console.log('   5. Deploy and test in production environment');
}

// Run the integration
main().catch(console.error);
