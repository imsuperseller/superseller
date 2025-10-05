'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    // In a real implementation, this would:
    // 1. Save consultation data
    // 2. Send to TidyCal for booking
    // 3. Send confirmation email
    // 4. Create follow-up workflow
    
    console.log('Booking consultation with data:', consultationData);
    alert('Consultation booked! You will receive a confirmation email shortly.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Custom Solutions</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">← Back to Home</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Voice AI Consultation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get a personalized automation plan for your business. Our AI consultant will analyze your needs 
              and create a tailored solution just for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">100% Free</span>
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">15 Minutes</span>
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Tailored Plan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Interface */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {consultationStep < consultationSteps.length ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {React.createElement(consultationSteps[consultationStep].icon, { className: "w-8 h-8 text-green-600" })}
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {consultationSteps[consultationStep].question}
                </h2>
                
                <p className="text-gray-600 mb-8">
                  {consultationSteps[consultationStep].placeholder}
                </p>

                {/* Voice Input */}
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Button
                      onClick={isListening ? stopVoiceConsultation : startVoiceConsultation}
                      className={`w-16 h-16 rounded-full ${
                        isListening 
                          ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>
                    <span className="text-lg font-semibold text-gray-700">
                      {isListening ? 'Listening...' : 'Click to speak'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500">
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
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Step {consultationStep + 1} of {consultationSteps.length}</span>
                    <span>{Math.round(((consultationStep + 1) / consultationSteps.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((consultationStep + 1) / consultationSteps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Next Button */}
                <Button
                  onClick={nextStep}
                  disabled={!consultationData[consultationSteps[consultationStep].id as keyof typeof consultationData]}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Consultation Complete!
                </h2>
                
                <p className="text-gray-600 mb-8">
                  Thank you for providing your information. We'll create a personalized automation plan for your business.
                </p>

                {/* Consultation Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Consultation Summary:</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">Business Type:</span>
                      <span className="ml-2 text-gray-600">{consultationData.businessType || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Challenges:</span>
                      <span className="ml-2 text-gray-600">{consultationData.currentChallenges || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Goals:</span>
                      <span className="ml-2 text-gray-600">{consultationData.automationGoals || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Budget:</span>
                      <span className="ml-2 text-gray-600">{consultationData.budget || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Timeline:</span>
                      <span className="ml-2 text-gray-600">{consultationData.timeline || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-green-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">What Happens Next?</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <span className="text-green-800">We'll analyze your requirements and create a custom automation plan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <span className="text-green-800">Schedule a detailed consultation call with our automation experts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <span className="text-green-800">Receive a comprehensive proposal with implementation timeline</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={bookConsultation}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Detailed Consultation
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Custom Solutions?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get a tailored automation solution designed specifically for your business needs and goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tailored Solutions</h3>
              <p className="text-gray-600">
                Every automation is designed specifically for your business processes and requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Implementation</h3>
              <p className="text-gray-600">
                Our team handles the entire implementation process from design to deployment.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ongoing Support</h3>
              <p className="text-gray-600">
                Continuous monitoring, optimization, and support to ensure your automation delivers results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your free consultation today and discover how automation can revolutionize your operations.
          </p>
          <Button
            onClick={bookConsultation}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Free Consultation
          </Button>
        </div>
      </section>
    </div>
  );
}
