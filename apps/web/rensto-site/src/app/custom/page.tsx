'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import {
  Mic,
  MicOff,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Globe,
  Terminal,
  Play
} from 'lucide-react';
import { Footer } from '@/components/Footer';

// Types for the flow state
type FlowState = 'IDLE' | 'BOOTING' | 'INTERRUPTION' | 'REVEAL' | 'GENERATING';

export default function CustomSolutionsPage() {
  const [flowState, setFlowState] = useState<FlowState>('IDLE');
  const [url, setUrl] = useState('');
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [interruptionStep, setInterruptionStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [emailInput, setEmailInput] = useState('');

  // Voice Logic State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Mock data for the interruption questions
  const questions = [
    {
      id: 'bottleneck',
      apiStep: 'challenges',
      text: "SYSTEM ALERT: Revenue bottleneck detected. Identify the source.",
      options: ["Lead Quality", "Follow-up Speed", "Manual Data Entry"],
      type: 'choice' as const
    },
    {
      id: 'budget',
      apiStep: 'budget',
      text: "CONFIGURATION REQUIRED: Select Budget Clearance Level.",
      options: ["<$1k/mo", "$1k-$5k/mo", "$5k+/mo"],
      type: 'choice' as const
    },
    {
      id: 'email',
      apiStep: 'email',
      text: "SECURE CHANNEL REQUIRED: Enter delivery address.",
      options: [],
      type: 'email' as const
    }
  ];

  // Voice Recording Functions
  const startVoiceConsultation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice override.');
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
    try {
      const currentQuestion = questions[interruptionStep];

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('step', currentQuestion.apiStep);
      formData.append('sessionId', `session-${Date.now()}`);

      // Use existing API
      const response = await fetch('/api/voice-ai/consultation', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to process voice');

      const data = await response.json();

      if (data.success) {
        // Use the transcription as the answer
        console.log("Voice Answer:", data.transcription);
        handleInterruptionAnswer(data.transcription);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      alert('Voice processing failed. Please try again or use the buttons.');
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopVoiceConsultation();
    } else {
      startVoiceConsultation();
    }
  };

  // Boot Sequence Logic
  useEffect(() => {
    if (flowState === 'BOOTING') {
      const logs = [
        "Initializing Rensto Core...",
        `> Scanning target: ${url}...`,
        "> Analyzing digital footprint...",
        "> Detecting tech stack...",
        "> Identifying decision maker...",
        "WARNING: OPTIMIZATION GAPS FOUND.",
        "Calculating potential ROI...",
        "Architecting solution..."
      ];

      let currentLog = 0;
      const interval = setInterval(() => {
        if (currentLog < logs.length) {
          setBootLogs(prev => [...prev, logs[currentLog]]);
          currentLog++;
        } else {
          clearInterval(interval);
          // Trigger interruption after logs are done
          setTimeout(() => setFlowState('INTERRUPTION'), 1000);
        }
      }, 800); // Add a log every 800ms

      return () => clearInterval(interval);
    }
  }, [flowState, url]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // Auto-add https:// if no protocol is present
      const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      setUrl(formattedUrl);
      setFlowState('BOOTING');
    }
  };

  const handleInterruptionAnswer = async (answer: string) => {
    const currentQuestion = questions[interruptionStep];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    console.log("Answered:", currentQuestion.id, answer);

    if (interruptionStep < questions.length - 1) {
      setInterruptionStep(prev => prev + 1);
    } else {
      // All questions answered - trigger video generation
      setFlowState('GENERATING');
      await generateVideo();
    }
  };

  const generateVideo = async () => {
    try {
      // TODO: Replace with actual n8n workflow webhook URL
      const webhookUrl = 'https://n8n.rensto.com/webhook/cinematic-pitch';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          answers,
          timestamp: Date.now()
        })
      });

      if (!response.ok) throw new Error('Video generation failed');

      const data = await response.json();

      // For now, use a placeholder since the workflow isn't fully connected
      // setVideoUrl(data.videoUrl);
      setFlowState('REVEAL');
    } catch (error) {
      console.error('Video generation error:', error);
      setGenerationError('Failed to generate video. Please try again.');
      setFlowState('REVEAL');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
            <span className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>Rensto</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:opacity-80">Home</Link>
            <Link href="/marketplace" className="hover:opacity-80">Marketplace</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden py-20 px-4">

        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(30, 174, 247, 0.2) 0%, transparent 70%)' }} />
        </div>

        {/* STATE: IDLE (Hero + URL Input) */}
        {flowState === 'IDLE' && (
          <div className="text-center max-w-4xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">New: Cinematic Ego-Pitch Engine</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              See Your Business<br />in the Future.
            </h1>

            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Enter your website. Our AI will analyze your digital footprint and generate a cinematic trailer of your future empire.
            </p>

            <form onSubmit={handleUrlSubmit} className="relative max-w-lg mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Globe className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="text"
                required
                placeholder="example.com or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-5 rounded-xl text-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-white placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center gap-2"
              >
                Generate
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STATE: BOOTING (Command Center) */}
        {flowState === 'BOOTING' && (
          <div className="w-full max-w-3xl z-10">
            <div className="bg-black/80 border border-green-500/30 rounded-xl p-8 font-mono text-green-400 shadow-[0_0_50px_rgba(34,197,94,0.1)] backdrop-blur-xl h-[400px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-green-500/20 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  <span className="font-bold">RENSTO_CORE_V2.0</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>

              <div className="flex-grow overflow-y-auto space-y-2 font-sm">
                {bootLogs.map((log, i) => (
                  <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </div>
                ))}
                <div className="animate-pulse">_</div>
              </div>
            </div>
          </div>
        )}

        {/* STATE: INTERRUPTION (Hybrid Input) */}
        {flowState === 'INTERRUPTION' && (
          <div className="w-full max-w-2xl z-10 animate-in zoom-in-95 duration-500">
            <div className="bg-slate-900/90 border border-red-500/50 rounded-2xl p-8 shadow-[0_0_100px_rgba(239,68,68,0.2)] backdrop-blur-xl text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Target className="w-8 h-8 text-red-500" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 font-mono">
                {questions[interruptionStep].text}
              </h2>

              <p className="text-slate-400 mb-8">
                Clarification needed to finalize architecture.
              </p>

              {questions[interruptionStep].type === 'choice' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {questions[interruptionStep].options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleInterruptionAnswer(option)}
                        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all text-sm font-medium"
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-900 px-2 text-slate-500">Or use voice override</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={toggleVoice}
                      className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      <span className="font-medium">
                        {isListening ? "Listening..." : "Tap to Speak"}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && emailInput) {
                        handleInterruptionAnswer(emailInput);
                      }
                    }}
                    className="w-full px-6 py-4 rounded-xl text-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-white placeholder:text-slate-600 mb-4"
                  />
                  <button
                    onClick={() => emailInput && handleInterruptionAnswer(emailInput)}
                    disabled={!emailInput}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all"
                  >
                    Proceed to Analysis →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATE: GENERATING (Processing) */}
        {flowState === 'GENERATING' && (
          <div className="w-full max-w-3xl z-10">
            <div className="bg-slate-900/90 border border-purple-500/50 rounded-2xl p-12 shadow-[0_0_100px_rgba(168,85,247,0.2)] backdrop-blur-xl text-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6 animate-spin">
                <Zap className="w-10 h-10 text-purple-500" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                Calculating ROI Potential...
              </h2>

              <p className="text-slate-400 mb-2">
                Analyzing 47 optimization vectors.
              </p>
              <p className="text-slate-500 text-sm">
                System compiling your results.
              </p>
            </div>
          </div>
        )}

        {/* STATE: REVEAL (Video Player) */}
        {flowState === 'REVEAL' && (
          <div className="w-full max-w-5xl z-10 animate-in zoom-in-90 duration-1000">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 mb-4">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-mono">SYSTEM ONLINE</span>
              </div>
              <h2 className="text-4xl font-bold text-white">The Revelation.</h2>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer">
              {generationError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="text-center p-8">
                    <p className="text-red-400 mb-4">{generationError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : videoUrl ? (
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={videoUrl}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                    <p className="text-slate-400 mb-2">Processing Complete</p>
                    <p className="text-slate-500 text-sm">Your analysis will be delivered via email</p>
                  </div>
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">The Temple of {url.replace('https://', '').replace('http://', '').split('/')[0]}</h3>
                <p className="text-slate-300">Generated for {url}</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)]"
              >
                Claim This System
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
