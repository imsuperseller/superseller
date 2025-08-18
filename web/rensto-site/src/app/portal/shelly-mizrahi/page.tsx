'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RenstoLogo } from '@/components/ui/rensto-logo';
import { RenstoProgress } from '@/components/ui/rensto-progress';
import { RenstoStatusIndicator } from '@/components/ui/rensto-status';
import { gsap } from 'gsap';
import { 
  Activity, 
  Bot, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Database, 
  DollarSign, 
  Lightbulb, 
  Play, 
  Settings, 
  StopCircle, 
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  FileText,
  HelpCircle,
  Bell,
  Mail,
  Phone,
  Sparkles,
  Target,
  Rocket,
  Star,
  Heart,
  Upload,
  Download,
  FileSpreadsheet,
  Shield,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

// ReactBits-inspired components
const GradientText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h1 className={`text-4xl font-bold bg-gradient-to-r from-rensto-red via-rensto-orange to-rensto-blue bg-clip-text text-transparent animate-rensto-shimmer ${className}`}>
    {children}
  </h1>
);

const ShinyText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <span className="relative z-10">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-rensto-shimmer" />
  </div>
);

const GlassCard = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <Card 
    variant="renstoNeon" 
    className={`backdrop-blur-sm bg-rensto-bg-card/50 border border-rensto-text-muted/20 hover:shadow-rensto-glow-primary transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </Card>
);

const GradientButton = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <Button 
    variant="renstoPrimary" 
    className={`bg-gradient-to-r from-rensto-red to-rensto-orange hover:from-rensto-orange hover:to-rensto-red transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </Button>
);

export default function ShellyPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
  // GSAP refs
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )
    .fromTo(
      logoRef.current,
      { scale: 0.8, opacity: 0, rotation: -10 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' },
      '-=0.4'
    )
    .fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(
      tabsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.2'
    );

    // Subtle floating animation for logo
    gsap.to(logoRef.current, {
      y: -5,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleProcessFiles = async () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('✅ Family profiles processed successfully!');
    }, 3000);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rensto-bg-primary via-rensto-bg-secondary to-rensto-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <RenstoLogo size="lg" variant="neon" animate="glow" />
          <RenstoProgress value={75} variant="rensto" fillAnimate="pulse" />
          <p className="text-rensto-text/70">Loading your Insurance portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-rensto-bg-primary via-rensto-bg-secondary to-rensto-bg-primary">
      {/* Header */}
      <div className="border-b border-rensto-border/20 backdrop-blur-sm bg-rensto-card/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div ref={logoRef} className="flex items-center space-x-4">
              <RenstoLogo size="md" variant="gradient" animate="shimmer" />
              <div>
                <GradientText className="text-2xl">Insurance Portal</GradientText>
                <ShinyText className="text-sm text-rensto-text/70">Shelly Mizrahi - Insurance Consulting</ShinyText>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <RenstoStatusIndicator status="online" size="sm" />
              <Badge variant="renstoSuccess" className="rensto-badge">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div ref={titleRef} className="text-center mb-8">
          <GradientText className="text-5xl mb-4">Welcome Back, Shelly!</GradientText>
          <ShinyText className="text-xl text-rensto-text/70">
            Your Excel Family Profile Processor is ready to work
          </ShinyText>
        </div>

        {/* Tabs */}
        <div ref={tabsRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-rensto-card/50 backdrop-blur-sm border border-rensto-border/20">
              <TabsTrigger value="dashboard" className="rensto-tab">
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="processor" className="rensto-tab">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Processor
              </TabsTrigger>
              <TabsTrigger value="profiles" className="rensto-tab">
                <Users className="w-4 h-4 mr-2" />
                Profiles
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rensto-tab">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="billing" className="rensto-tab">
                <DollarSign className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="support" className="rensto-tab">
                <HelpCircle className="w-4 h-4 mr-2" />
                Support
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rensto-text/70">Profiles Processed</p>
                        <p className="text-2xl font-bold text-rensto-text">247</p>
                      </div>
                      <Users className="w-8 h-8 text-rensto-cyan" />
                    </div>
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rensto-text/70">Time Saved</p>
                        <p className="text-2xl font-bold text-rensto-text">156h</p>
                      </div>
                      <Clock className="w-8 h-8 text-rensto-green" />
                    </div>
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rensto-text/70">Files Uploaded</p>
                        <p className="text-2xl font-bold text-rensto-text">1,235</p>
                      </div>
                      <FileSpreadsheet className="w-8 h-8 text-rensto-orange" />
                    </div>
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rensto-text/70">Revenue Impact</p>
                        <p className="text-2xl font-bold text-rensto-text">$8.2k</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-rensto-red" />
                    </div>
                  </CardContent>
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <CardHeader>
                    <CardTitle className="text-rensto-text">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { action: 'Family profile processed', time: '5 min ago', status: 'success' },
                      { action: 'Excel files uploaded', time: '12 min ago', status: 'success' },
                      { action: 'Insurance quote generated', time: '1 hour ago', status: 'success' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-rensto-green" />
                        <div className="flex-1">
                          <p className="text-rensto-text">{item.action}</p>
                          <p className="text-sm text-rensto-text/70">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardHeader>
                    <CardTitle className="text-rensto-text">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <GradientButton className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Excel Files
                    </GradientButton>
                    <Button variant="renstoSecondary" className="w-full">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Process Profiles
                    </Button>
                    <Button variant="renstoGhost" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Processor
                    </Button>
                  </CardContent>
                </GlassCard>
              </div>
            </TabsContent>

            {/* Processor Tab */}
            <TabsContent value="processor" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <CardHeader>
                    <CardTitle className="text-rensto-text">Excel File Upload</CardTitle>
                    <CardDescription className="text-rensto-text/70">
                      Upload individual family member Excel files for processing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-rensto-border/30 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-rensto-text/50 mx-auto mb-4" />
                      <p className="text-rensto-text/70 mb-2">Drop Excel files here or click to browse</p>
                      <input
                        type="file"
                        multiple
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="renstoPrimary" className="cursor-pointer">
                          Choose Files
                        </Button>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-rensto-text font-medium">Uploaded Files:</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-rensto-card/30 rounded">
                            <div className="flex items-center space-x-2">
                              <FileSpreadsheet className="w-4 h-4 text-rensto-cyan" />
                              <span className="text-rensto-text text-sm">{file.name}</span>
                            </div>
                            <Button
                              variant="renstoGhost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <GradientButton 
                      className="w-full" 
                      onClick={handleProcessFiles}
                      disabled={uploadedFiles.length === 0 || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Process Family Profiles
                        </>
                      )}
                    </GradientButton>
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardHeader>
                    <CardTitle className="text-rensto-text">Processor Status</CardTitle>
                    <CardDescription className="text-rensto-text/70">
                      Monitor your Excel Family Profile Processor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-rensto-text">Processor Status</span>
                      <RenstoStatusIndicator status="online" size="sm" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-rensto-text/70">Uptime</span>
                        <span className="text-rensto-text">99.9%</span>
                      </div>
                      <RenstoProgress value={99.9} variant="rensto" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-rensto-text/70">Processing Speed</span>
                        <span className="text-rensto-text">2.3s per file</span>
                      </div>
                      <RenstoProgress value={85} variant="rensto" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-rensto-text/70">Accuracy Rate</span>
                        <span className="text-rensto-text">98.7%</span>
                      </div>
                      <RenstoProgress value={98.7} variant="rensto" />
                    </div>

                    <div className="pt-4 border-t border-rensto-border/20">
                      <Button variant="renstoSecondary" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Processor
                      </Button>
                    </div>
                  </CardContent>
                </GlassCard>
              </div>
            </TabsContent>

            {/* Other tabs with similar structure */}
            <TabsContent value="profiles" className="space-y-6">
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-rensto-text">Family Profiles</CardTitle>
                  <CardDescription className="text-rensto-text/70">
                    View and manage processed family insurance profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-rensto-text/70">Family profiles management coming soon...</p>
                </CardContent>
              </GlassCard>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-rensto-text">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-rensto-text/70">Analytics dashboard coming soon...</p>
                </CardContent>
              </GlassCard>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-rensto-text">Billing & Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-rensto-text/70">Billing information coming soon...</p>
                </CardContent>
              </GlassCard>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-rensto-text">Support & Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-rensto-text/70">Support resources coming soon...</p>
                </CardContent>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
