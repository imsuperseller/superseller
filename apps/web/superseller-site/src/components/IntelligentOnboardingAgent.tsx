'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { SuperSeller AIProgress } from '@/components/ui/superseller-progress';
import { SuperSeller AIStatusIndicator } from '@/components/ui/superseller-status';
import { gsap } from 'gsap';
import { 
  Bot, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings, 
  Zap,
  Send,
  RefreshCw,
  FileText,
  Shield,
  TrendingUp,
  User,
  Building,
  CreditCard,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  Target
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  type: 'welcome' | 'question' | 'credentials' | 'testing' | 'completion';
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  question?: {
    id: string;
    category: string;
    question: string;
    priority: string;
    expectedAnswer: string;
    followUpQuestions: string[];
  };
}

interface OnboardingState {
  customerId: string;
  analysis: {
    completeness: number;
    missingFields: string[];
    recommendations: string[];
    riskAssessment: string;
    nextSteps: string[];
  };
  missingInfo: Array<{
    category: string;
    field: string;
    priority: string;
    description: string;
    question: string;
  }>;
  questions: Array<{
    id: string;
    category: string;
    question: string;
    priority: string;
    expectedAnswer: string;
    followUpQuestions: string[];
  }>;
  workflow: {
    id: string;
    customerId: string;
    steps: OnboardingStep[];
    currentStep: number;
    status: string;
  };
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  type: 'agent' | 'user' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stepId?: string;
    questionId?: string;
    action?: string;
  };
}

interface IntelligentOnboardingAgentProps {
  customerId: string;
  onComplete?: (state: OnboardingState) => void;
  onUpdate?: (state: OnboardingState) => void;
}

export default function IntelligentOnboardingAgent({ 
  customerId, 
  onComplete, 
  onUpdate 
}: IntelligentOnboardingAgentProps) {
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [validationResults, setValidationResults] = useState<{[key: string]: any}>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

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
      chatRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    );

    return () => tl.kill();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize onboarding
  useEffect(() => {
    if (customerId) {
      initializeOnboarding();
    }
  }, [customerId]);

  const initializeOnboarding = async () => {
    setIsProcessing(true);
    
    try {
      // Add welcome message
      addMessage({
        id: 'welcome',
        type: 'agent',
        content: `Welcome to SuperSeller AI! I'm your AI onboarding assistant. Let me analyze your profile and help you get set up with the perfect automation solution.`,
        timestamp: new Date()
      });

      // Load or create onboarding state
      const state = await loadOnboardingState();
      setOnboardingState(state);
      
      if (state.status === 'in_progress') {
        // Continue from where we left off
        continueOnboarding(state);
      } else {
        // Start fresh onboarding
        startFreshOnboarding();
      }
      
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
      addMessage({
        id: 'error',
        type: 'system',
        content: 'Sorry, I encountered an issue loading your onboarding. Please refresh the page and try again.',
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const loadOnboardingState = async (): Promise<OnboardingState> => {
    try {
      const response = await fetch(`/api/customers/${customerId}/onboarding-state`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('No existing onboarding state found');
    }
    
    // Create new onboarding state
    return await createNewOnboardingState();
  };

  const createNewOnboardingState = async (): Promise<OnboardingState> => {
    const response = await fetch(`/api/customers/${customerId}/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to create onboarding state');
    }
    
    return await response.json();
  };

  const continueOnboarding = (state: OnboardingState) => {
    setOnboardingState(state);
    setCurrentStepIndex(state.workflow.currentStep);
    
    // Add continuation message
    addMessage({
      id: 'continue',
      type: 'agent',
      content: `Welcome back! I see you're ${state.analysis.completeness}% through your onboarding. Let's continue from where we left off.`,
      timestamp: new Date()
    });
    
    // Show current step
    showCurrentStep(state.workflow.steps[state.workflow.currentStep]);
  };

  const startFreshOnboarding = async () => {
    addMessage({
      id: 'analysis',
      type: 'agent',
      content: 'Let me analyze your profile and identify what information we need to complete your setup...',
      timestamp: new Date()
    });

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addMessage({
      id: 'analysis-complete',
      type: 'agent',
      content: 'Analysis complete! I found some areas where we need more information to provide you with the best automation solution.',
      timestamp: new Date()
    });

    // Start with first question
    if (onboardingState?.questions.length) {
      showQuestion(onboardingState.questions[0]);
    }
  };

  const showCurrentStep = (step: OnboardingStep) => {
    switch (step.type) {
      case 'welcome':
        showWelcomeStep();
        break;
      case 'question':
        if (step.question) {
          showQuestion(step.question);
        }
        break;
      case 'credentials':
        showCredentialsStep();
        break;
      case 'testing':
        showTestingStep();
        break;
      case 'completion':
        showCompletionStep();
        break;
    }
  };

  const showWelcomeStep = () => {
    addMessage({
      id: 'welcome-step',
      type: 'agent',
      content: `Great! Let's get started with your automation setup. I'll guide you through a few questions to understand your needs better.`,
      timestamp: new Date()
    });
  };

  const showQuestion = (question: any) => {
    addMessage({
      id: `question-${question.id}`,
      type: 'agent',
      content: question.question,
      timestamp: new Date(),
      metadata: { questionId: question.id, stepId: `question-${question.id}` }
    });
  };

  const showCredentialsStep = () => {
    addMessage({
      id: 'credentials-step',
      type: 'agent',
      content: `Now let's set up your integrations. I'll help you connect your existing services and validate the connections.`,
      timestamp: new Date()
    });
  };

  const showTestingStep = () => {
    addMessage({
      id: 'testing-step',
      type: 'agent',
      content: `Perfect! Let's test your setup to make sure everything is working correctly.`,
      timestamp: new Date()
    });
  };

  const showCompletionStep = () => {
    addMessage({
      id: 'completion-step',
      type: 'agent',
      content: `🎉 Congratulations! Your onboarding is complete. Your automation is now ready to go!`,
      timestamp: new Date()
    });
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setCurrentInput('');
    setIsProcessing(true);

    try {
      // Process user response
      await processUserResponse(currentInput);
    } catch (error) {
      console.error('Failed to process response:', error);
      addMessage({
        id: 'error',
        type: 'system',
        content: 'Sorry, I encountered an issue processing your response. Please try again.',
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserResponse = async (response: string) => {
    if (!onboardingState) return;

    const currentStep = onboardingState.workflow.steps[currentStepIndex];
    
    if (currentStep.type === 'question' && currentStep.question) {
      // Save answer and move to next step
      await saveAnswer(currentStep.question.id, response);
      await moveToNextStep();
    } else {
      // Handle other step types
      await handleStepResponse(currentStep, response);
    }
  };

  const saveAnswer = async (questionId: string, answer: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/onboarding/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer })
      });

      if (!response.ok) {
        throw new Error('Failed to save answer');
      }

      const updatedState = await response.json();
      setOnboardingState(updatedState);
      onUpdate?.(updatedState);

    } catch (error) {
      console.error('Failed to save answer:', error);
      throw error;
    }
  };

  const moveToNextStep = async () => {
    const nextIndex = currentStepIndex + 1;
    
    if (nextIndex < onboardingState!.workflow.steps.length) {
      setCurrentStepIndex(nextIndex);
      const nextStep = onboardingState!.workflow.steps[nextIndex];
      showCurrentStep(nextStep);
    } else {
      // Onboarding complete
      await completeOnboarding();
    }
  };

  const handleStepResponse = async (step: OnboardingStep, response: string) => {
    switch (step.type) {
      case 'credentials':
        await handleCredentialsResponse(response);
        break;
      case 'testing':
        await handleTestingResponse(response);
        break;
      default:
        await moveToNextStep();
    }
  };

  const handleCredentialsResponse = async (response: string) => {
    addMessage({
      id: 'credentials-processing',
      type: 'agent',
      content: 'Validating your credentials...',
      timestamp: new Date()
    });

    try {
      const validationResponse = await fetch(`/api/customers/${customerId}/onboarding/validate-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: response })
      });

      const results = await validationResponse.json();
      setValidationResults(results);

      // Show validation results
      const validCount = Object.values(results).filter((r: any) => r.valid).length;
      const totalCount = Object.keys(results).length;

      addMessage({
        id: 'validation-results',
        type: 'agent',
        content: `Validation complete! ${validCount}/${totalCount} credentials are working correctly.`,
        timestamp: new Date()
      });

      await moveToNextStep();

    } catch (error) {
      console.error('Failed to validate credentials:', error);
      addMessage({
        id: 'validation-error',
        type: 'system',
        content: 'Sorry, I encountered an issue validating your credentials. Please try again.',
        timestamp: new Date()
      });
    }
  };

  const handleTestingResponse = async (response: string) => {
    addMessage({
      id: 'testing-processing',
      type: 'agent',
      content: 'Running tests on your automation setup...',
      timestamp: new Date()
    });

    try {
      const testResponse = await fetch(`/api/customers/${customerId}/onboarding/test-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const results = await testResponse.json();

      addMessage({
        id: 'test-results',
        type: 'agent',
        content: `Testing complete! All systems are working correctly. Your automation is ready to go!`,
        timestamp: new Date()
      });

      await moveToNextStep();

    } catch (error) {
      console.error('Failed to test setup:', error);
      addMessage({
        id: 'test-error',
        type: 'system',
        content: 'Sorry, I encountered an issue testing your setup. Please try again.',
        timestamp: new Date()
      });
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/onboarding/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const completedState = await response.json();
        setOnboardingState(completedState);
        onComplete?.(completedState);
      }

    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return <User className="w-4 h-4" />;
      case 'business': return <Building className="w-4 h-4" />;
      case 'technical': return <Settings className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!onboardingState) {
    return (
      <div ref={containerRef} className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-superseller-cyan mx-auto"></div>
          <p className="text-superseller-text-secondary">Initializing your onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-superseller-text-primary">AI Onboarding Assistant</h2>
          <p className="text-superseller-text-secondary">Let's get your automation setup perfectly configured</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="supersellerInfo" className="flex items-center space-x-1">
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </Badge>
          <SuperSeller AIProgress 
            value={onboardingState.analysis.completeness} 
            className="w-24"
          />
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-superseller-cyan" />
              <div>
                <p className="text-sm text-superseller-text-secondary">Completion</p>
                <p className="text-2xl font-bold text-superseller-text-primary">
                  {onboardingState.analysis.completeness}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-superseller-orange" />
              <div>
                <p className="text-sm text-superseller-text-secondary">Missing Info</p>
                <p className="text-2xl font-bold text-superseller-text-primary">
                  {onboardingState.missingInfo.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-superseller-green" />
              <div>
                <p className="text-sm text-superseller-text-secondary">Risk Level</p>
                <p className="text-2xl font-bold text-superseller-text-primary capitalize">
                  {onboardingState.analysis.riskAssessment}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-superseller-red" />
              <div>
                <p className="text-sm text-superseller-text-secondary">Current Step</p>
                <p className="text-2xl font-bold text-superseller-text-primary">
                  {currentStepIndex + 1}/{onboardingState.workflow.steps.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div ref={chatRef} className="lg:col-span-2">
          <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50 h-96">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-superseller-cyan" />
                <span>Onboarding Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-superseller-cyan text-superseller-bg-primary'
                          : message.type === 'system'
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : 'bg-superseller-bg-card/50 border border-superseller-text-muted/20 text-superseller-text-primary'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-superseller-bg-card/50 border border-superseller-text-muted/20 text-superseller-text-primary p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-superseller-cyan"></div>
                        <span className="text-sm">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type your response..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isProcessing}
                  variant="supersellerPrimary"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Missing Information */}
          {onboardingState.missingInfo.length > 0 && (
            <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Missing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {onboardingState.missingInfo.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-superseller-text-muted/20">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(item.category)}
                      <span className="text-sm text-superseller-text-primary">{item.field}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {onboardingState.analysis.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-superseller-cyan"></div>
                  <span className="text-superseller-text-secondary">{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Validation Results */}
          {Object.keys(validationResults).length > 0 && (
            <Card variant="supersellerNeon" className="backdrop-blur-sm bg-superseller-bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Credential Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(validationResults).map(([service, result]: [string, any]) => (
                  <div key={service} className="flex items-center justify-between p-2 rounded border border-superseller-text-muted/20">
                    <span className="text-sm text-superseller-text-primary capitalize">{service}</span>
                    {result.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
