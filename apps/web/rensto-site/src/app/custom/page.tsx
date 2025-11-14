'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import { 
  Mic, 
  MicOff, 
  Phone, 
  Calendar, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Target,
  Clock,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react';

export default function CustomSolutionsPage() {
  const [isListening, setIsListening] = useState(false);
  const [consultationData, setConsultationData] = useState({
    businessType: '',
    currentChallenges: '',
    automationGoals: '',
    budget: '',
    timeline: ''
  });
  const [consultationStep, setConsultationStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const consultationSteps = [
    {
      id: 'business-type',
      question: 'What type of business do you run?',
      placeholder: 'e.g., HVAC company, real estate agency, insurance firm...',
      icon: Target
    },
    {
      id: 'challenges',
      question: 'What are your biggest operational challenges?',
      placeholder: 'e.g., lead management, customer follow-up, scheduling...',
      icon: TrendingUp
    },
    {
      id: 'goals',
      question: 'What automation goals do you have?',
      placeholder: 'e.g., automate lead scoring, streamline scheduling, improve customer communication...',
      icon: Zap
    },
    {
      id: 'budget',
      question: 'What\'s your automation budget range?',
      placeholder: 'e.g., $500-1000/month, $1000-5000/month, $5000+/month...',
      icon: Shield
    },
    {
      id: 'timeline',
      question: 'When do you need this implemented?',
      placeholder: 'e.g., ASAP, within 1 month, within 3 months, flexible...',
      icon: Clock
    }
  ];

  const startVoiceConsultation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice consultation');
    }
  };

  const stopVoiceConsultation = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    // Simulate voice processing
    console.log('Processing voice input...', audioBlob);
    
    // In a real implementation, this would:
    // 1. Send audio to OpenAI Whisper API
    // 2. Process the transcription
    // 3. Extract relevant information
    // 4. Update consultation data
    
    // For demo purposes, simulate processing
    setTimeout(() => {
      const currentStep = consultationSteps[consultationStep];
      const mockResponse = `I understand you're looking for ${currentStep.id} solutions. Let me help you with that.`;
      
      // Update consultation data based on current step
      setConsultationData(prev => ({
        ...prev,
        [currentStep.id]: mockResponse
      }));
      
      // Move to next step
      if (consultationStep < consultationSteps.length - 1) {
        setConsultationStep(prev => prev + 1);
      } else {
        // Consultation complete
        setConsultationStep(consultationSteps.length);
      }
    }, 2000);
  };

  const handleTextInput = (value: string) => {
    const currentStep = consultationSteps[consultationStep];
    setConsultationData(prev => ({
      ...prev,
      [currentStep.id]: value
    }));
  };

  const nextStep = () => {
    if (consultationStep < consultationSteps.length - 1) {
      setConsultationStep(prev => prev + 1);
    } else {
      setConsultationStep(consultationSteps.length);
    }
  };

  const bookConsultation = () => {
    // Open Typeform for Custom Solution Request
    // Form ID: fkYnNvga - "Custom Solution Request"
    const typeformUrl = 'https://form.typeform.com/to/fkYnNvga';
    
    // Pre-fill form with consultation data if available
    const params = new URLSearchParams();
    if (consultationData.businessType) params.append('business_type', consultationData.businessType);
    if (consultationData.currentChallenges) params.append('challenges', consultationData.currentChallenges);
    if (consultationData.automationGoals) params.append('goals', consultationData.automationGoals);
    if (consultationData.budget) params.append('budget', consultationData.budget);
    if (consultationData.timeline) params.append('timeline', consultationData.timeline);
    
    const finalUrl = params.toString() 
      ? `${typeformUrl}?${params.toString()}`
      : typeformUrl;
    
    window.open(finalUrl, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'var(--rensto-bg-primary)', 
      color: 'var(--rensto-text-primary)',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-all"
        style={{ 
          background: 'rgba(17, 13, 40, 0.98)',
          borderColor: 'rgba(254, 61, 81, 0.3)'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10">
                <Image
                  src="/rensto-logo.png"
                  alt="Rensto Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(254, 61, 81, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))'
                  }}
                  priority
                />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>Custom Solutions</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(30, 174, 247, 0.3) 0%, transparent 70%)'
          }}
        />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--rensto-accent-blue) 0%, var(--rensto-accent-cyan) 50%, var(--rensto-text-primary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Free Voice AI Consultation
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Get a personalized automation plan for your business. Our AI consultant will analyze your needs 
              and create a tailored solution just for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-accent-cyan)',
                  color: 'var(--rensto-accent-cyan)',
                  background: 'transparent'
                }}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">100% Free</span>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-primary)',
                  color: 'var(--rensto-primary)',
                  background: 'transparent'
                }}
              >
                <Clock className="w-5 h-5" />
                <span className="font-semibold">15 Minutes</span>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-accent-blue)',
                  color: 'var(--rensto-accent-blue)',
                  background: 'transparent'
                }}
              >
                <Target className="w-5 h-5" />
                <span className="font-semibold">Tailored Plan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Interface */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto max-w-4xl">
          <div 
            className="rounded-2xl border-2 p-8"
            style={{
              background: 'var(--rensto-bg-card)',
              borderColor: 'rgba(30, 174, 247, 0.3)',
              boxShadow: 'var(--rensto-glow-secondary)'
            }}
          >
            {consultationStep < consultationSteps.length ? (
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(30, 174, 247, 0.2)' }}
                >
                  {React.createElement(consultationSteps[consultationStep].icon, { 
                    className: "w-8 h-8",
                    style: { color: 'var(--rensto-accent-blue)' }
                  })}
                </div>
                
                <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                  {consultationSteps[consultationStep].question}
                </h2>
                
                <p className="mb-8" style={{ color: 'var(--rensto-text-secondary)' }}>
                  {consultationSteps[consultationStep].placeholder}
                </p>

                {/* Voice Input */}
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={isListening ? stopVoiceConsultation : startVoiceConsultation}
                      className={`w-16 h-16 rounded-full transition-all ${isListening ? 'animate-pulse' : ''}`}
                      style={
                        isListening
                          ? {
                              background: 'var(--rensto-primary)',
                              boxShadow: 'var(--rensto-glow-primary)'
                            }
                          : {
                              background: 'var(--rensto-gradient-secondary)',
                              boxShadow: 'var(--rensto-glow-secondary)'
                            }
                      }
                    >
                      {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                    </button>
                    <span className="text-lg font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>
                      {isListening ? 'Listening...' : 'Click to speak'}
                    </span>
                  </div>
                  
                  <p className="text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                    {isListening 
                      ? 'Speak clearly and we\'ll process your response' 
                      : 'Click the microphone to start voice input'
                    }
                  </p>
                </div>

                {/* Text Input Fallback */}
                <div className="mb-8">
                  <textarea
                    value={consultationData[consultationSteps[consultationStep].id as keyof typeof consultationData]}
                    onChange={(e) => handleTextInput(e.target.value)}
                    placeholder={consultationSteps[consultationStep].placeholder}
                    className="w-full p-4 rounded-lg focus:ring-2 focus:outline-none resize-none"
                    style={{
                      background: 'var(--rensto-bg-secondary)',
                      border: '1px solid rgba(30, 174, 247, 0.3)',
                      color: 'var(--rensto-text-primary)'
                    }}
                    rows={4}
                  />
                </div>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--rensto-text-secondary)' }}>
                    <span>Step {consultationStep + 1} of {consultationSteps.length}</span>
                    <span>{Math.round(((consultationStep + 1) / consultationSteps.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--rensto-bg-secondary)' }}>
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((consultationStep + 1) / consultationSteps.length) * 100}%`,
                        background: 'var(--rensto-gradient-secondary)',
                        boxShadow: 'var(--rensto-glow-secondary)'
                      }}
                    />
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={nextStep}
                  disabled={!consultationData[consultationSteps[consultationStep].id as keyof typeof consultationData]}
                  className="px-8 py-3 text-lg rounded-lg font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                  style={{
                    background: 'var(--rensto-gradient-secondary)',
                    color: '#ffffff',
                    boxShadow: 'var(--rensto-glow-secondary)'
                  }}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(30, 174, 247, 0.2)' }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: 'var(--rensto-accent-blue)' }} />
                </div>
                
                <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                  Consultation Complete!
                </h2>
                
                <p className="mb-8" style={{ color: 'var(--rensto-text-secondary)' }}>
                  Thank you for providing your information. We'll create a personalized automation plan for your business.
                </p>

                {/* Consultation Summary */}
                <div 
                  className="rounded-lg p-6 mb-8 text-left border-2"
                  style={{
                    background: 'var(--rensto-bg-secondary)',
                    borderColor: 'rgba(30, 174, 247, 0.3)'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                    Your Consultation Summary:
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>Business Type:</span>
                      <span className="ml-2" style={{ color: 'var(--rensto-text-secondary)' }}>{consultationData.businessType || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>Challenges:</span>
                      <span className="ml-2" style={{ color: 'var(--rensto-text-secondary)' }}>{consultationData.currentChallenges || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>Goals:</span>
                      <span className="ml-2" style={{ color: 'var(--rensto-text-secondary)' }}>{consultationData.automationGoals || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>Budget:</span>
                      <span className="ml-2" style={{ color: 'var(--rensto-text-secondary)' }}>{consultationData.budget || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>Timeline:</span>
                      <span className="ml-2" style={{ color: 'var(--rensto-text-secondary)' }}>{consultationData.timeline || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div 
                  className="rounded-lg p-6 mb-8 border-2"
                  style={{
                    background: 'rgba(30, 174, 247, 0.1)',
                    borderColor: 'rgba(30, 174, 247, 0.3)'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--rensto-accent-blue)' }}>
                    What Happens Next?
                  </h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--rensto-gradient-secondary)' }}
                      >
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <span style={{ color: 'var(--rensto-text-primary)' }}>
                        We'll analyze your requirements and create a custom automation plan
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--rensto-gradient-secondary)' }}
                      >
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <span style={{ color: 'var(--rensto-text-primary)' }}>
                        Schedule a detailed consultation call with our automation experts
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--rensto-gradient-secondary)' }}
                      >
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <span style={{ color: 'var(--rensto-text-primary)' }}>
                        Receive a comprehensive proposal with implementation timeline
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={bookConsultation}
                    className="px-8 py-3 text-lg rounded-lg font-bold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--rensto-gradient-secondary)',
                      color: '#ffffff',
                      boxShadow: 'var(--rensto-glow-secondary)'
                    }}
                  >
                    <Calendar className="w-5 h-5" />
                    Book Detailed Consultation
                  </button>
                  <button
                    className="px-8 py-3 text-lg rounded-lg font-bold border-2 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    style={{
                      borderColor: 'var(--rensto-primary)',
                      color: 'var(--rensto-primary)',
                      background: 'transparent'
                    }}
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Why Choose Custom Solutions?
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Get a tailored automation solution designed specifically for your business needs and goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div 
              className="text-center rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(30, 174, 247, 0.3)',
                boxShadow: 'var(--rensto-glow-secondary)'
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(30, 174, 247, 0.2)' }}
              >
                <Target className="w-8 h-8" style={{ color: 'var(--rensto-accent-blue)' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Tailored Solutions
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Every automation is designed specifically for your business processes and requirements.
              </p>
            </div>
            
            <div 
              className="text-center rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(254, 61, 81, 0.3)',
                boxShadow: 'var(--rensto-glow-primary)'
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(254, 61, 81, 0.2)' }}
              >
                <Zap className="w-8 h-8" style={{ color: 'var(--rensto-primary)' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Expert Implementation
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Our team handles the entire implementation process from design to deployment.
              </p>
            </div>
            
            <div 
              className="text-center rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(95, 251, 253, 0.3)',
                boxShadow: 'var(--rensto-glow-accent)'
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(95, 251, 253, 0.2)' }}
              >
                <Shield className="w-8 h-8" style={{ color: 'var(--rensto-accent-cyan)' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Ongoing Support
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Continuous monitoring, optimization, and support to ensure your automation delivers results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
            Start your free consultation today and discover how automation can revolutionize your operations.
          </p>
          <button
            onClick={bookConsultation}
            className="px-8 py-4 text-lg rounded-lg font-bold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
            style={{
              background: 'var(--rensto-gradient-secondary)',
              color: '#ffffff',
              boxShadow: 'var(--rensto-glow-secondary)'
            }}
          >
            <Mic className="w-5 h-5" />
            Start Free Consultation
          </button>
        </div>
      </section>
    </div>
  );
}
