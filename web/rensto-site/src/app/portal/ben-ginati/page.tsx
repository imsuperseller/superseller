'use client';

import { useState, useEffect, useRef } from 'react';
import { useBenCustomerPortal, runBenAgent, activateBenAgent, deactivateBenAgent } from '@/hooks/useBenCustomerPortal';
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
  Heart
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

export default function BenGinatiPortal() {
  const { 
    customer, 
    agents, 
    isLoading, 
    error, 
    refreshData 
  } = useBenCustomerPortal();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [agentResults, setAgentResults] = useState<Record<string, any>>({});
  
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

  const handleRunAgent = async (agentId: string) => {
    setRunningAgent(agentId);
    try {
      const result = await runBenAgent(agentId);
      setAgentResults(prev => ({ ...prev, [agentId]: result }));
    } catch (error) {
      console.error('Error running agent:', error);
    } finally {
      setRunningAgent(null);
    }
  };

  const handleActivateAgent = async (agentId: string) => {
    try {
      await activateBenAgent(agentId);
      refreshData();
    } catch (error) {
      console.error('Error activating agent:', error);
    }
  };

  const handleDeactivateAgent = async (agentId: string) => {
    try {
      await deactivateBenAgent(agentId);
      refreshData();
    } catch (error) {
      console.error('Error deactivating agent:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rensto-bg-primary via-rensto-bg-secondary to-rensto-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <RenstoLogo size="lg" variant="neon" animate="glow" />
          <RenstoProgress value={75} variant="rensto" fillAnimate="pulse" />
          <p className="text-rensto-text/70">Loading your AI Agent portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rensto-bg-primary via-rensto-bg-secondary to-rensto-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <RenstoLogo size="lg" variant="neon" animate="glow" />
          <p className="text-rensto-red">Error loading portal: {error}</p>
          <Button onClick={refreshData} variant="renstoPrimary">
            Retry
          </Button>
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
                <GradientText className="text-2xl">AI Agent Portal</GradientText>
                <ShinyText className="text-sm text-rensto-text/70">Ben Ginati - Podcast & Social Media Automation</ShinyText>
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
          <GradientText className="text-5xl mb-4">Welcome Back, Ben!</GradientText>
          <ShinyText className="text-xl text-rensto-text/70">
            Your AI agents are ready to automate your podcast and social media workflow
          </ShinyText>
        </div>

        {/* Tabs */}
        <div ref={tabsRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-rensto-card/50 backdrop-blur-sm border border-rensto-border/20">
              <TabsTrigger value="dashboard" className="rensto-tab">
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="agents" className="rensto-tab">
                <Bot className="w-4 h-4 mr-2" />
                AI Agents
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
                        <p className="text-sm text-rensto-text/70">Active Agents</p>
                        <p className="text-2xl font-bold text-rensto-text">
                          {agents?.filter(agent => agent.status === 'active').length || 0}
                        </p>
                      </div>
                      <Bot className="w-8 h-8 text-rensto-cyan" />
                    </div>
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rensto-text/70">Tasks Completed</p>
                        <p className="text-2xl font-bold text-rensto-text">1,247</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-rensto-green" />
                    </div>
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rensto-text/70">Time Saved</p>
                        <p className="text-2xl font-bold text-rensto-text">89h</p>
                      </div>
                      <Clock className="w-8 h-8 text-rensto-orange" />
                    </div>
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rensto-text/70">Revenue Impact</p>
                        <p className="text-2xl font-bold text-rensto-text">$12.5k</p>
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
                      { action: 'Podcast episode transcribed', time: '2 min ago', status: 'success' },
                      { action: 'Social media posts generated', time: '15 min ago', status: 'success' },
                      { action: 'Content calendar updated', time: '1 hour ago', status: 'success' },
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
                      <Play className="w-4 h-4 mr-2" />
                      Run All Agents
                    </GradientButton>
                    <Button variant="renstoSecondary" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Agents
                    </Button>
                    <Button variant="renstoGhost" className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </GlassCard>
              </div>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agents?.map((agent) => (
                  <GlassCard key={agent._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-rensto-text">{agent.name}</CardTitle>
                        <RenstoStatusIndicator 
                          status={agent.status === 'active' ? 'online' : 'offline'} 
                          size="sm" 
                        />
                      </div>
                      <CardDescription className="text-rensto-text/70">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={agent.status === 'active' ? 'renstoSuccess' : 'renstoSecondary'}>
                          {agent.status}
                        </Badge>
                        <Badge variant="renstoOutline">
                          {agent.type}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-rensto-text/70">Last Run</span>
                          <span className="text-rensto-text">
                            {agent.lastRun ? new Date(agent.lastRun).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-rensto-text/70">Tasks Completed</span>
                          <span className="text-rensto-text">{agent.tasksCompleted || 0}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <GradientButton
                          size="sm"
                          onClick={() => handleRunAgent(agent._id)}
                          disabled={runningAgent === agent._id}
                        >
                          {runningAgent === agent._id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Run
                            </>
                          )}
                        </GradientButton>
                        
                        {agent.status === 'active' ? (
                          <Button
                            variant="renstoSecondary"
                            size="sm"
                            onClick={() => handleDeactivateAgent(agent._id)}
                          >
                            <StopCircle className="w-3 h-3 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="renstoSecondary"
                            size="sm"
                            onClick={() => handleActivateAgent(agent._id)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>

                      {agentResults[agent._id] && (
                        <div className="mt-4 p-3 bg-rensto-card/30 rounded border border-rensto-border/20">
                          <p className="text-sm text-rensto-text/70">Last Result:</p>
                          <p className="text-sm text-rensto-text">{JSON.stringify(agentResults[agent._id], null, 2)}</p>
                        </div>
                      )}
                    </CardContent>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            {/* Other tabs with similar structure */}
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
