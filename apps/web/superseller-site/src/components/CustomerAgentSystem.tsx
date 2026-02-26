'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { SuperSeller AIProgress } from '@/components/ui/superseller-progress';
import { SuperSeller AIStatusIndicator } from '@/components/ui/superseller-status';
import { gsap } from 'gsap';
import { 
  Bot, 
  Play, 
  StopCircle, 
  Settings, 
  Activity,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Bell,
  RefreshCw
} from 'lucide-react';

interface Agent {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'running' | 'error';
  lastRun?: Date;
  nextRun?: Date;
  successRate: number;
  totalRuns: number;
  averageExecutionTime: number;
  cost: number;
}

interface CustomerAgentSystemProps {
  customerId: string;
  agents: Agent[];
  onAgentToggle: (agentId: string, action: 'activate' | 'deactivate') => void;
  onAgentRun: (agentId: string) => void;
}

export default function CustomerAgentSystem({ 
  customerId, 
  agents, 
  onAgentToggle, 
  onAgentRun 
}: CustomerAgentSystemProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState<{[key: string]: any}>({});
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const agentsRef = useRef<HTMLDivElement>(null);

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
      agentsRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    );

    return () => tl.kill();
  }, []);

  // Real-time monitoring simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newData: {[key: string]: any} = {};
      agents.forEach(agent => {
        if (agent.status === 'running') {
          newData[agent._id] = {
            progress: Math.random() * 100,
            currentStep: `Processing ${Math.floor(Math.random() * 100)} items`,
            memoryUsage: Math.random() * 80 + 20,
            cpuUsage: Math.random() * 60 + 20
          };
        }
      });
      setRealTimeData(newData);
    }, 2000);

    return () => clearInterval(interval);
  }, [agents]);

  const handleAgentToggle = (agentId: string, action: 'activate' | 'deactivate') => {
    onAgentToggle(agentId, action);
    
    // Add notification
    const notification = {
      id: Date.now().toString(),
      type: action === 'activate' ? 'success' : 'info' as const,
      message: `Agent ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleAgentRun = (agentId: string) => {
    onAgentRun(agentId);
    
    const notification = {
      id: Date.now().toString(),
      type: 'info' as const,
      message: 'Agent execution started',
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header with Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-superseller-cyan" />
              <div>
                <p className="text-sm text-superseller-text-secondary">Total Agents</p>
                <p className="text-2xl font-bold text-superseller-text-primary">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-superseller-blue" />
              <div>
                <p className="text-sm text-superseller-text-secondary">Active</p>
                <p className="text-2xl font-bold text-superseller-text-primary">
                  {agents.filter(a => a.status === 'active' || a.status === 'running').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-superseller-orange" />
              <div>
                <p className="text-sm text-superseller-text-secondary">Success Rate</p>
                <p className="text-2xl font-bold text-superseller-text-primary">
                  {agents.length > 0 
                    ? Math.round(agents.reduce((acc, agent) => acc + agent.successRate, 0) / agents.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-superseller-red" />
              <div>
                <p className="text-sm text-superseller-text-secondary">Total Cost</p>
                <p className="text-2xl font-bold text-superseller-text-primary">
                  ${agents.reduce((acc, agent) => acc + agent.cost, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : notification.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm">{notification.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agents Grid */}
      <div ref={agentsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <Card 
            key={agent._id}
            variant="supersellerNeon" 
            className={`backdrop-blur-sm bg-superseller-bg-card/50 border border-superseller-text-muted/20 hover:shadow-superseller-glow-primary transition-all duration-300 cursor-pointer ${
              selectedAgent === agent._id ? 'ring-2 ring-superseller-cyan' : ''
            }`}
            onClick={() => setSelectedAgent(agent._id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-superseller-cyan" />
                  <CardTitle className="text-lg text-superseller-text-primary">{agent.name}</CardTitle>
                </div>
                <Badge 
                  variant={agent.status === 'active' ? 'supersellerSuccess' : agent.status === 'running' ? 'supersellerInfo' : 'supersellerWarning'}
                  className="flex items-center space-x-1"
                >
                  {getStatusIcon(agent.status)}
                  <span className="capitalize">{agent.status}</span>
                </Badge>
              </div>
              <CardDescription className="text-superseller-text-secondary">
                {agent.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Real-time Progress for Running Agents */}
              {agent.status === 'running' && realTimeData[agent._id] && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-superseller-text-secondary">Progress</span>
                    <span className="text-superseller-text-primary">
                      {Math.round(realTimeData[agent._id].progress)}%
                    </span>
                  </div>
                  <SuperSeller AIProgress 
                    value={realTimeData[agent._id].progress} 
                    fillAnimate={true}
                    className="h-2"
                  />
                  <p className="text-xs text-superseller-text-secondary">
                    {realTimeData[agent._id].currentStep}
                  </p>
                </div>
              )}

              {/* Agent Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-superseller-text-secondary">Success Rate</p>
                  <p className="text-superseller-text-primary font-semibold">{agent.successRate}%</p>
                </div>
                <div>
                  <p className="text-superseller-text-secondary">Total Runs</p>
                  <p className="text-superseller-text-primary font-semibold">{agent.totalRuns}</p>
                </div>
                <div>
                  <p className="text-superseller-text-secondary">Avg Time</p>
                  <p className="text-superseller-text-primary font-semibold">{agent.averageExecutionTime}s</p>
                </div>
                <div>
                  <p className="text-superseller-text-secondary">Cost</p>
                  <p className="text-superseller-text-primary font-semibold">${agent.cost.toFixed(2)}</p>
                </div>
              </div>

              {/* Last Run Info */}
              {agent.lastRun && (
                <div className="text-xs text-superseller-text-secondary">
                  <p>Last run: {agent.lastRun.toLocaleString()}</p>
                  {agent.nextRun && (
                    <p>Next run: {agent.nextRun.toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {agent.status === 'inactive' ? (
                  <Button
                    variant="supersellerPrimary"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAgentToggle(agent._id, 'activate');
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Activate
                  </Button>
                ) : agent.status === 'active' ? (
                  <>
                    <Button
                      variant="supersellerPrimary"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgentRun(agent._id);
                      }}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      variant="supersellerSecondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgentToggle(agent._id, 'deactivate');
                      }}
                    >
                      <StopCircle className="w-4 h-4" />
                    </Button>
                  </>
                ) : agent.status === 'running' ? (
                  <Button
                    variant="supersellerWarning"
                    size="sm"
                    className="flex-1"
                    disabled
                  >
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Running...
                  </Button>
                ) : (
                  <Button
                    variant="supersellerDanger"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAgentToggle(agent._id, 'activate');
                    }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Fix & Activate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardHeader>
            <CardTitle className="text-superseller-text-primary">
              Agent Details: {agents.find(a => a._id === selectedAgent)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-superseller-text-primary mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-superseller-text-secondary">Success Rate</span>
                    <span className="text-superseller-text-primary">
                      {agents.find(a => a._id === selectedAgent)?.successRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-superseller-text-secondary">Total Runs</span>
                    <span className="text-superseller-text-primary">
                      {agents.find(a => a._id === selectedAgent)?.totalRuns}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-superseller-text-secondary">Avg Execution</span>
                    <span className="text-superseller-text-primary">
                      {agents.find(a => a._id === selectedAgent)?.averageExecutionTime}s
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-superseller-text-primary mb-2">Cost Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-superseller-text-secondary">Total Cost</span>
                    <span className="text-superseller-text-primary">
                      ${agents.find(a => a._id === selectedAgent)?.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-superseller-text-secondary">Cost per Run</span>
                    <span className="text-superseller-text-primary">
                      ${(agents.find(a => a._id === selectedAgent)?.cost || 0) / 
                        (agents.find(a => a._id === selectedAgent)?.totalRuns || 1)}.toFixed(2)
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-superseller-text-primary mb-2">Schedule</h4>
                <div className="space-y-2 text-sm">
                  {agents.find(a => a._id === selectedAgent)?.lastRun && (
                    <div>
                      <span className="text-superseller-text-secondary">Last Run:</span>
                      <p className="text-superseller-text-primary">
                        {agents.find(a => a._id === selectedAgent)?.lastRun?.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {agents.find(a => a._id === selectedAgent)?.nextRun && (
                    <div>
                      <span className="text-superseller-text-secondary">Next Run:</span>
                      <p className="text-superseller-text-primary">
                        {agents.find(a => a._id === selectedAgent)?.nextRun?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
