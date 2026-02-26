'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Phone,
  Calendar,
  Zap
} from 'lucide-react';

interface VoiceAIConsultationProps {
  onComplete?: (data: any) => void;
  onBooking?: () => void;
}

export default function VoiceAIConsultation({ onComplete, onBooking }: VoiceAIConsultationProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [consultationData, setConsultationData] = useState({
    businessType: '',
    challenges: '',
    goals: '',
    budget: '',
    timeline: ''
  });
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const consultationSteps = [
    {
      id: 'business-type',
      question: 'What type of business do you run?',
      followUp: 'Tell me about your industry and what you do.',
      icon: '🏢'
    },
    {
      id: 'challenges',
      question: 'What are your biggest operational challenges?',
      followUp: 'What takes up most of your time that you wish could be automated?',
      icon: '⚡'
    },
    {
      id: 'goals',
      question: 'What automation goals do you have?',
      followUp: 'What would you like to achieve with automation?',
      icon: '🎯'
    },
    {
      id: 'budget',
      question: 'What\'s your automation budget range?',
      followUp: 'How much are you willing to invest in automation solutions?',
      icon: '💰'
    },
    {
      id: 'timeline',
      question: 'When do you need this implemented?',
      followUp: 'What\'s your preferred timeline for implementation?',
      icon: '⏰'
    }
  ];

  const startVoiceConsultation = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorder.start();
      setIsListening(true);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Please allow microphone access to use voice consultation');
    }
  };

  const stopVoiceConsultation = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setIsProcessing(true);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      // Simulate voice processing with OpenAI Whisper
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      
      // In production, this would call OpenAI Whisper API
      // For demo purposes, simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTranscription = `I understand you're looking for ${consultationSteps[currentStep].id} solutions. Let me help you with that.`;
      setTranscription(mockTranscription);
      
      // Simulate AI response generation
      await generateAIResponse(mockTranscription);
      
    } catch (error) {
      console.error('Error processing voice input:', error);
      setError('Failed to process voice input. Please try again.');
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (transcription: string) => {
    try {
      // Simulate AI response generation with OpenAI GPT
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = `Thank you for that information. I understand you're looking for ${consultationSteps[currentStep].id} solutions. Based on what you've told me, I can recommend some specific automation approaches that would work well for your business.`;
      
      setAiResponse(mockResponse);
      
      // Update consultation data
      const currentStepId = consultationSteps[currentStep].id as keyof typeof consultationData;
      setConsultationData(prev => ({
        ...prev,
        [currentStepId]: transcription
      }));
      
      // Move to next step or complete
      if (currentStep < consultationSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Consultation complete
        if (onComplete) {
          onComplete(consultationData);
        }
      }
      
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      setError('Failed to generate AI response. Please try again.');
      setIsProcessing(false);
    }
  };

  const playAIResponse = async () => {
    try {
      setIsPlaying(true);
      
      // Simulate TTS with OpenAI
      // In production, this would call OpenAI TTS API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsPlaying(false);
      
    } catch (error) {
      console.error('Error playing AI response:', error);
      setError('Failed to play AI response. Please try again.');
      setIsPlaying(false);
    }
  };

  const nextStep = () => {
    if (currentStep < consultationSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTranscription('');
      setAiResponse('');
    }
  };

  const bookConsultation = () => {
    if (onBooking) {
      onBooking();
    }
  };

  const currentStepData = consultationSteps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Voice AI Consultation
          </h2>
          <p className="text-gray-600">
            Step {currentStep + 1} of {consultationSteps.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / consultationSteps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / consultationSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">{currentStepData.icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {currentStepData.question}
          </h3>
          <p className="text-gray-600 mb-6">
            {currentStepData.followUp}
          </p>
        </div>

        {/* Voice Input */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={isListening ? stopVoiceConsultation : startVoiceConsultation}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-green-600 hover:bg-green-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isListening ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            {isListening 
              ? 'Listening... Click to stop' 
              : isProcessing
              ? 'Processing your response...'
              : 'Click the microphone to start voice input'
            }
          </p>
        </div>

        {/* Transcription */}
        {transcription && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Response:</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{transcription}</p>
            </div>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Response:</h4>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-700 mb-4">{aiResponse}</p>
              <Button
                onClick={playAIResponse}
                disabled={isPlaying}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {isPlaying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Play Response
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentStep < consultationSteps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!transcription || isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Continue to Next Step
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={bookConsultation}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Detailed Consultation
              </Button>
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </div>
          )}
        </div>

        {/* Consultation Summary */}
        {currentStep === consultationSteps.length - 1 && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Consultation Summary:</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Business Type:</span>
                <span className="text-gray-600">{consultationData.businessType || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Challenges:</span>
                <span className="text-gray-600">{consultationData.challenges || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Goals:</span>
                <span className="text-gray-600">{consultationData.goals || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Budget:</span>
                <span className="text-gray-600">{consultationData.budget || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Timeline:</span>
                <span className="text-gray-600">{consultationData.timeline || 'Not specified'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
