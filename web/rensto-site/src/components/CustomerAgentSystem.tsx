'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input-enhanced';
import { } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Phone, 
  Bot, 
  Settings, 
  Plus, 
  CheckCircle, 
  Clock,
  DollarSign,
  Zap,
  Users,
  FileText,
  Database,
  TrendingUp,
  Activity,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX
} from 'lucide-react';

interface SuggestedAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  status: 'inactive' | 'pending' | 'active' | 'custom';
  features: string[];
  estimatedROI: string;
  setupTime: string;
  dependencies: string[];
}

interface Conversation {
  id: string;
  type: 'chat' | 'voice';
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  completedAt?: Date;
  agents: string[];
}

export default function CustomerAgentSystem() {
  const [activeTab, setActiveTab] = useState<'agents' | 'chat' | 'voice' | 'progress'>('agents');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [suggestedAgents, setSuggestedAgents] = useState<SuggestedAgent[]>([]);
  const [activeAgents, setActiveAgents] = useState<SuggestedAgent[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);

  useEffect(() => {
    // Load suggested agents
    // Load active agents (already paid for and deployed)
    setActiveAgents([
      {
        id: 'shelly-excel',
        name: 'Excel Family Profile Processor',
        description: 'Automated Excel processing for family insurance profiles with Hebrew text support',
        category: 'Insurance',
        price: 250,
        status: 'active',
        features: ['Excel file processing', 'Hebrew text support', 'Data validation', 'Family profile combination', 'Automated output generation'],
        estimatedROI: '85% efficiency improvement',
        setupTime: '1-2 weeks',
        dependencies: ['Excel files', 'Output templates']
      }
    ]);

    // Load suggested agents (available for purchase)
    setSuggestedAgents([
      {
        id: '1',
        name: 'AI Content Generator',
        description: 'Automated content creation for blogs, social media, and marketing materials',
        category: 'Content Marketing',
        price: 299,
        status: 'inactive',
        features: ['Blog post generation', 'Social media content', 'SEO optimization', 'Brand voice consistency'],
        estimatedROI: '40% increase in content output',
        setupTime: '2-3 days',
        dependencies: ['OpenAI API', 'Content calendar']
      },
      {
        id: '2',
        name: 'Customer Support Bot',
        description: '24/7 automated customer support with intelligent response handling',
        category: 'Customer Service',
        price: 199,
        status: 'inactive',
        features: ['FAQ handling', 'Ticket routing', 'Multi-language support', 'Escalation management'],
        estimatedROI: '60% reduction in support tickets',
        setupTime: '1-2 days',
        dependencies: ['Knowledge base', 'Support system']
      },
      {
        id: '3',
        name: 'Data Analysis Agent',
        description: 'Automated data processing, analysis, and reporting for business insights',
        category: 'Analytics',
        price: 399,
        status: 'inactive',
        features: ['Data visualization', 'Trend analysis', 'Automated reporting', 'Alert system'],
        estimatedROI: '50% faster insights delivery',
        setupTime: '3-4 days',
        dependencies: ['Data sources', 'Analytics tools']
      },
      {
        id: '4',
        name: 'Email Marketing Automation',
        description: 'Intelligent email campaigns with personalization and A/B testing',
        category: 'Marketing',
        price: 249,
        status: 'inactive',
        features: ['Segmentation', 'Personalization', 'A/B testing', 'Performance tracking'],
        estimatedROI: '35% increase in email engagement',
        setupTime: '2-3 days',
        dependencies: ['Email service', 'Customer database']
      },
      {
        id: '5',
        name: 'Social Media Manager',
        description: 'Automated social media posting, engagement, and analytics',
        category: 'Social Media',
        price: 179,
        status: 'inactive',
        features: ['Scheduled posting', 'Engagement monitoring', 'Hashtag optimization', 'Performance analytics'],
        estimatedROI: '45% increase in social engagement',
        setupTime: '1-2 days',
        dependencies: ['Social media accounts', 'Content calendar']
      },
      {
        id: '6',
        name: 'Custom Workflow Agent',
        description: 'Fully customized automation agent tailored to your specific business needs',
        category: 'Custom',
        price: 599,
        status: 'inactive',
        features: ['Custom development', 'Integration support', 'Dedicated support', 'Performance optimization'],
        estimatedROI: 'Variable based on requirements',
        setupTime: '5-10 days',
        dependencies: ['Business requirements', 'System specifications']
      }
    ]);

    // Load project milestones
    setMilestones([
      {
        id: '1',
        title: 'Project Discovery & Requirements',
        description: 'Initial consultation and requirements gathering',
        status: 'completed',
        dueDate: new Date('2024-01-10'),
        completedAt: new Date('2024-01-12'),
        agents: []
      },
      {
        id: '2',
        title: 'Agent Selection & Configuration',
        description: 'Choose and configure automation agents',
        status: 'completed',
        dueDate: new Date('2024-01-20'),
        completedAt: new Date('2024-01-15'),
        agents: ['Excel Family Profile Processor']
      },
      {
        id: '3',
        title: 'Integration & Testing',
        description: 'Integrate agents with existing systems and test functionality',
        status: 'pending',
        dueDate: new Date('2024-01-25'),
        agents: []
      },
      {
        id: '4',
        title: 'Training & Optimization',
        description: 'Train agents and optimize performance',
        status: 'pending',
        dueDate: new Date('2024-01-30'),
        agents: []
      },
      {
        id: '5',
        title: 'Deployment & Monitoring',
        description: 'Deploy agents and set up monitoring',
        status: 'pending',
        dueDate: new Date('2024-02-05'),
        agents: []
      }
    ]);

    // Load conversations
    setConversations([
      {
        id: '1',
        type: 'chat',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant. I can help you choose and configure automation agents for your business. What would you like to know?',
            timestamp: new Date('2024-01-15T10:00:00')
          },
          {
            id: '2',
            role: 'user',
            content: 'I need help with content marketing automation',
            timestamp: new Date('2024-01-15T10:01:00')
          },
          {
            id: '3',
            role: 'assistant',
            content: 'Great! I can recommend the AI Content Generator agent. It can create blog posts, social media content, and marketing materials automatically. Would you like me to show you the details?',
            timestamp: new Date('2024-01-15T10:01:30')
          }
        ],
        status: 'active',
        createdAt: new Date('2024-01-15T10:00:00'),
        updatedAt: new Date('2024-01-15T10:01:30')
      }
    ]);

    setCurrentConversation(conversations[0]);
  }, []);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !currentConversation) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatMessage,
      timestamp: new Date()
    };

    // Add user message
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: new Date()
    };

    setCurrentConversation(updatedConversation);
    setChatMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: generateAIResponse(chatMessage),
        timestamp: new Date()
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiResponse],
        updatedAt: new Date()
      };

      setCurrentConversation(finalConversation);
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id ? finalConversation : conv
        )
      );
    }, 1000);
  };

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('content') || lowerMessage.includes('blog') || lowerMessage.includes('social')) {
      return 'I recommend the AI Content Generator agent for your content marketing needs. It can create blog posts, social media content, and marketing materials automatically. The agent costs $299/month and typically provides a 40% increase in content output. Would you like me to activate it for you?';
    }
    
    if (lowerMessage.includes('support') || lowerMessage.includes('customer') || lowerMessage.includes('help')) {
      return 'The Customer Support Bot would be perfect for your needs! It provides 24/7 automated support, handles FAQs, routes tickets, and supports multiple languages. It costs $199/month and typically reduces support tickets by 60%. Should I set this up for you?';
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('analytics') || lowerMessage.includes('report')) {
      return 'The Data Analysis Agent can help you with automated data processing, analysis, and reporting. It provides data visualization, trend analysis, and automated reporting. It costs $399/month and delivers insights 50% faster. Would you like to learn more?';
    }
    
    if (lowerMessage.includes('email') || lowerMessage.includes('marketing')) {
      return 'The Email Marketing Automation agent is ideal for intelligent email campaigns. It includes segmentation, personalization, A/B testing, and performance tracking. It costs $249/month and typically increases email engagement by 35%. Should I configure this for you?';
    }
    
    if (lowerMessage.includes('custom') || lowerMessage.includes('specific') || lowerMessage.includes('unique')) {
      return 'For custom requirements, I recommend the Custom Workflow Agent. It\'s fully tailored to your specific business needs with custom development, integration support, and dedicated assistance. It costs $599/month and takes 5-10 days to set up. Would you like to discuss your specific requirements?';
    }
    
    return 'I can help you with various automation agents including content generation, customer support, data analysis, email marketing, social media management, and custom workflows. What specific area would you like to automate?';
  };

  const handleActivateAgent = (agentId: string) => {
    setSuggestedAgents(prev => 
      prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'pending' as const }
          : agent
      )
    );
  };

  const handleCustomAgent = () => {
    // Start custom agent conversation
    const customMessage = "I'd like to create a custom automation agent. Can you help me understand my options and requirements?";
    setChatMessage(customMessage);
    handleSendMessage();
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Start voice recognition
      setIsListening(true);
      // Simulate voice processing
      setTimeout(() => {
        setIsListening(false);
        setChatMessage('I would like to activate the AI Content Generator agent');
      }, 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 style={{ color: 'var(--rensto-blue)' }}';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Activity className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agent System</h1>
          <p className="text-gray-600 mt-2">Choose, configure, and manage your automation agents</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Agent
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'agents' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('agents')}
          className="flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          Suggested Agents
        </Button>
        <Button
          variant={activeTab === 'chat' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('chat')}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          AI Chat
        </Button>
        <Button
          variant={activeTab === 'voice' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('voice')}
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          Voice Assistant
        </Button>
        <Button
          variant={activeTab === 'progress' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('progress')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Project Progress
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          {/* Active Agents (Already Paid For) */}
          {activeAgents.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Active Agents</h2>
                <p className="text-gray-600">Agents you've purchased and are currently deployed</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAgents.map((agent) => (
                  <Card key={agent.id} className="border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-green-900">{agent.name}</CardTitle>
                          <p className="text-sm text-green-700 mt-1">{agent.category}</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-green-800">{agent.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">Price:</span>
                          <span className="font-semibold text-green-900">${agent.price} (Paid)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">ROI:</span>
                          <span className="text-green-600">{agent.estimatedROI}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-800">Features:</p>
                        <div className="space-y-1">
                          {agent.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-green-700">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {feature}
                            </div>
                          ))}
                          {agent.features.length > 3 && (
                            <div className="text-xs text-green-600">
                              +{agent.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-100">
                          Manage Agent
                        </Button>
                        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                          View Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Agents (Available for Purchase) */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Agents</h2>
              <p className="text-gray-600">Choose from our pre-built automation agents</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{agent.category}</p>
                    </div>
                    <Badge 
                      variant={agent.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{agent.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-semibold">${agent.price}/month</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">ROI:</span>
                      <span className="text-green-600">{agent.estimatedROI}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Setup:</span>
                      <span>{agent.setupTime}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Features:</p>
                    <div className="space-y-1">
                      {agent.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                      {agent.features.length > 3 && (
                        <div className="text-xs style={{ color: 'var(--rensto-blue)' }}">
                          +{agent.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {agent.status === 'inactive' && (
                      <Button 
                        onClick={() => handleActivateAgent(agent.id)}
                        className="flex-1"
                      >
                        Activate Agent
                      </Button>
                    )}
                    {agent.status === 'pending' && (
                      <Button variant="outline" className="flex-1" disabled>
                        Configuring...
                      </Button>
                    )}
                    {agent.status === 'active' && (
                      <Button variant="outline" className="flex-1">
                        Manage
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Agent CTA */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Need Something Custom?</h3>
                  <p className="text-gray-600 mt-2">
                    Can't find the right agent? Let me create a custom automation solution tailored to your specific business needs.
                  </p>
                </div>
                <Button onClick={handleCustomAgent} className="bg-purple-600 hover:bg-purple-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Custom Agent Conversation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI Assistant Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {currentConversation?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setChatMessage('Show me the AI Content Generator details')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content Agent
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setChatMessage('I need customer support automation')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Support Bot
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setChatMessage('Show me data analysis options')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Data Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setChatMessage('I want to create a custom agent')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Custom Agent
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-2 rounded border cursor-pointer hover:bg-gray-50"
                    onClick={() => setCurrentConversation(conv)}
                  >
                    <p className="text-sm font-medium">
                      {conv.type === 'chat' ? 'Chat' : 'Voice'} Conversation
                    </p>
                    <p className="text-xs text-gray-500">
                      {conv.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'voice' && (
        <div className="text-center space-y-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  {isVoiceActive ? (
                    <Volume2 className="h-12 w-12 style={{ color: 'var(--rensto-blue)' }}" />
                  ) : (
                    <VolumeX className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isVoiceActive ? 'Voice Assistant Active' : 'Voice Assistant'}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {isVoiceActive 
                      ? 'Speak clearly to interact with your AI assistant'
                      : 'Click the button below to start voice interaction'
                    }
                  </p>
                </div>

                <Button
                  onClick={toggleVoice}
                  size="lg"
                  className={`w-20 h-20 rounded-full ${
                    isVoiceActive ? 'style={{ backgroundColor: 'var(--rensto-bg-primary)' }} hover:style={{ backgroundColor: 'var(--rensto-bg-primary)' }}' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isListening ? (
                    <div className="rensto-animate-pulse">
                      <Mic className="h-8 w-8" />
                    </div>
                  ) : isVoiceActive ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>

                {isListening && (
                  <div className="text-sm text-gray-500">
                    Listening... Speak now
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 style={{ color: 'var(--rensto-blue)' }} mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Voice Commands</h4>
                <p className="text-sm text-gray-600">
                  "Activate content agent"<br/>
                  "Show me support options"<br/>
                  "Create custom workflow"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Natural Language</h4>
                <p className="text-sm text-gray-600">
                  Ask questions naturally<br/>
                  Describe your needs<br/>
                  Get instant responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Real-time Processing</h4>
                <p className="text-sm text-gray-600">
                  Instant voice recognition<br/>
                  Live conversation<br/>
                  Seamless interaction
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                         <Card>
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-gray-600">Project Progress</p>
                     <p className="text-2xl font-bold">60%</p>
                   </div>
                   <TrendingUp className="h-8 w-8 text-green-600" />
                 </div>
               </CardContent>
             </Card>

                         <Card>
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-gray-600">Active Agents</p>
                     <p className="text-2xl font-bold">3</p>
                   </div>
                   <Bot className="h-8 w-8 style={{ color: 'var(--rensto-blue)' }}" />
                 </div>
               </CardContent>
             </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Days Remaining</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

                         <Card>
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-gray-600">Investment</p>
                     <p className="text-2xl font-bold">$1,497</p>
                   </div>
                   <DollarSign className="h-8 w-8 text-green-600" />
                 </div>
               </CardContent>
             </Card>
          </div>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Project Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(milestone.status)}`}>
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        {milestone.agents.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {milestone.agents.map((agent, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Due: {milestone.dueDate.toLocaleDateString()}
                      </p>
                      {milestone.completedAt && (
                        <p className="text-xs text-green-600">
                          Completed: {milestone.completedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
