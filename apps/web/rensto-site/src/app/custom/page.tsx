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
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // Voice Logic State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Interruption questions - apiStep matches voice-ai/consultation API
  // These questions fill the video generation wait time (13+ minutes) with valuable discovery
  const questions = [
    {
      id: 'internal-diagnostic',
      apiStep: 'challenges',
      text: "INTERNAL DIAGNOSTIC: Where is the biggest friction in your current workflow?",
      options: [
        "Lead Qualification/Follow-up",
        "Customer Onboarding",
        "Inventory/Logistics",
        "Reporting & Analytics",
        "Team Communication"
      ],
      type: 'choice' as const
    },
    {
      id: 'growth-blocker',
      apiStep: 'challenges',
      text: "GROWTH BLOCKER: What is preventing you from scaling 10x right now?",
      options: [
        "Team Bandwidth",
        "Operational Chaos",
        "Marketing Reach",
        "Technical Debt",
        "Cash Flow/Funding"
      ],
      type: 'choice' as const
    },
    {
      id: 'automation-target',
      apiStep: 'goals',
      text: "AUTOMATION TARGET: If you could clone your best employee, what would they do?",
      options: [
        "Sales Outreach",
        "Customer Support",
        "Project Management",
        "Data Entry/Admin",
        "Creative/Content"
      ],
      type: 'choice' as const
    },
    {
      id: 'success-metric',
      apiStep: 'goals',
      text: "SUCCESS METRIC: What is the one number you check every morning?",
      options: [
        "Revenue/MRR",
        "New Leads",
        "Customer Satisfaction (NPS)",
        "Profit Margin",
        "Active Users"
      ],
      type: 'choice' as const
    },
    {
      id: 'email',
      apiStep: 'timeline', // maps email collection to timeline step
      text: "SECURE CHANNEL REQUIRED: Enter delivery address for your personalized solution.",
      options: [],
      type: 'email' as const
    }
  ];

  // Handle "Claim This System" - redirect to Stripe checkout
  const handleClaimSystem = async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowType: 'custom-solutions',
          productId: 'cinematic-pitch-consultation',
          tier: 'starter',
          customerEmail: answers.email || '',
          metadata: {
            url,
            answers,
            source: 'cinematic-pitch-engine'
          }
        }),
      });

      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        // Fallback: open TidyCal booking
        window.open('https://tidycal.com/rensto/custom-consultation', '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Fallback: open TidyCal booking
      window.open('https://tidycal.com/rensto/custom-consultation', '_blank');
    }
  };

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

  // Ensure progress updates when GENERATING state is active
  useEffect(() => {
    if (flowState === 'GENERATING') {
      if (generationProgress === 0) {
        console.log('GENERATING state detected but progress is 0, initializing to 1%...');
        setGenerationProgress(1);
        setGenerationStatus("Weaving digital threads into vision...");
        setEstimatedTimeRemaining(60);
      }
      console.log(`GENERATING state active - Progress: ${generationProgress}%, Status: ${generationStatus}`);
    }
  }, [flowState, generationProgress, generationStatus]);

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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // Auto-add https:// if no protocol is present
      const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      setUrl(formattedUrl);
      setFlowState('BOOTING');

      // Start video generation immediately (in parallel with boot sequence)
      generateVideo();
    }
  };

  const handleInterruptionAnswer = async (answer: string) => {
    const currentQuestion = questions[interruptionStep];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    console.log("Answered:", currentQuestion.id, answer);

    if (interruptionStep < questions.length - 1) {
      setInterruptionStep(prev => prev + 1);
    } else {
      // All questions answered - check if video is ready
      if (videoUrl) {
        setFlowState('REVEAL');
      } else if (videoGenerating) {
        // Video is still generating, show generating state
        setFlowState('GENERATING');
        // Poll for video completion
        pollForVideo();
      } else {
        // Video generation failed or hasn't started, try again
        setFlowState('GENERATING');
        await generateVideo();
      }
    }
  };

  const pollForVideo = async () => {
    // Simple polling - check if videoUrl is set (would need backend endpoint for proper polling)
    const maxAttempts = 30;
    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;
      if (videoUrl) {
        clearInterval(interval);
        setFlowState('REVEAL');
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setGenerationError('Video generation is taking longer than expected. Please refresh and try again.');
        setFlowState('REVEAL');
      }
    }, 2000); // Check every 2 seconds
  };

  const generateVideo = async () => {
    setVideoGenerating(true);
    try {
      const webhookUrl = '/api/cinematic-pitch';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          answers: {}, // Start with empty answers - video generation doesn't need them
          timestamp: Date.now()
        })
      });

      if (!response.ok) throw new Error('Video generation failed');

      const data = await response.json();
      console.log('Full response from n8n:', JSON.stringify(data, null, 2));

      // Set video URL if available immediately
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setVideoGenerating(false);
        // If we're past interruption phase, go to reveal
        if (flowState === 'GENERATING' || interruptionStep === questions.length - 1) {
          setFlowState('REVEAL');
        }
      } else if (data.taskId) {
        // Video is processing - start polling
        console.log('Received taskId from n8n:', data.taskId);
        setVideoGenerating(true);
        setFlowState('GENERATING');
        // Initialize progress immediately
        setGenerationProgress(1);
        setGenerationStatus("Weaving digital threads into vision...");
        setEstimatedTimeRemaining(60);
        pollVideoStatus(data.taskId);
      } else if (data.state === 'generating' || data.state === 'processing') {
        // Workflow returned with generating state - extract taskId and poll
        const taskId = data.taskId || (data.data?.taskId);
        console.log('Extracted taskId from generating state:', taskId);
        if (taskId) {
          setFlowState('GENERATING');
          setVideoGenerating(true);
          // Initialize progress immediately
          setGenerationProgress(1);
          setGenerationStatus("Weaving digital threads into vision...");
          setEstimatedTimeRemaining(60);
          console.log('Progress set to 1% after taskId extracted');
          pollVideoStatus(taskId);
        } else {
          console.error('No taskId found in response:', data);
          throw new Error('No task ID received for polling');
        }
      } else {
        // Unknown state - log and wait
        console.warn('Unknown response state:', data);
        console.warn('Full response:', JSON.stringify(data, null, 2));
        // Try to extract taskId from any field
        const possibleTaskId = data.taskId || data.data?.taskId || data.id || data.task_id;
        if (possibleTaskId) {
          console.log('Found taskId in unknown response:', possibleTaskId);
          setFlowState('GENERATING');
          setVideoGenerating(true);
          setGenerationProgress(1);
          setGenerationStatus("Weaving digital threads into vision...");
          setEstimatedTimeRemaining(60);
          console.log('Progress set to 1% after taskId found in fallback');
          pollVideoStatus(possibleTaskId);
        } else {
          setVideoGenerating(false);
        }
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setGenerationError('Failed to generate video. Please try again.');
      setVideoGenerating(false);
      // Don't change state here - let user complete questions first
    }
  };

  const pollVideoStatus = async (taskId: string) => {
    console.log('Starting video status polling for taskId:', taskId);
    const maxAttempts = 60; // 10 minutes max (60 * 10s) - increased for medium/high quality videos
    const delayMs = 10000; // 10 seconds
    const startTime = Date.now();

    // Dynamic status messages that rotate - mysterious and intriguing
    const statusMessages = [
      "Weaving digital threads into vision...",
      "Translating potential into reality...",
      "Crafting the narrative arc...",
      "Illuminating hidden patterns...",
      "Converging data streams...",
      "Almost ready..."
    ];

    // Initialize progress immediately
    setGenerationProgress(1);
    setGenerationStatus(statusMessages[0]);
    setEstimatedTimeRemaining(60);
    console.log('Progress initialized to 1% in pollVideoStatus');

    for (let i = 1; i <= maxAttempts; i++) {
      try {
        // Update progress (0-90%, leave 10% for final processing)
        // Start from 1% on first attempt, not 0%
        const progress = Math.min(90, Math.max(1, (i / maxAttempts) * 90));
        console.log(`Polling attempt ${i}/${maxAttempts}: Setting progress to ${progress}%`);
        setGenerationProgress(progress);
        // Force React to recognize the update
        if (i === 1) {
          console.log('First polling attempt - progress should be visible now');
        }

        // Update status message (rotate every 2 attempts)
        const statusIndex = Math.floor((i - 1) / 2) % statusMessages.length;
        setGenerationStatus(statusMessages[statusIndex]);

        // Calculate estimated time remaining
        const elapsed = Date.now() - startTime;
        const avgTimePerAttempt = elapsed / i;
        const remainingAttempts = maxAttempts - i;
        const estimated = Math.ceil((remainingAttempts * avgTimePerAttempt) / 1000);
        setEstimatedTimeRemaining(estimated);

        console.log(`Polling attempt ${i}/${maxAttempts} for taskId: ${taskId}`);

        // Poll Veo3.1 API directly for status
        const response = await fetch(`/api/cinematic-pitch/status?taskId=${taskId}`);

        if (!response.ok) {
          // If status endpoint doesn't exist, try n8n webhook again
          if (response.status === 404) {
            // Fallback: wait and check videoUrl state
            await new Promise(r => setTimeout(r, delayMs));
            if (videoUrl) {
              setFlowState('REVEAL');
              return;
            }
            continue;
          }
          throw new Error(`Status check failed: ${response.status}`);
        }

        const data = await response.json();

        // Veo3.1 uses successFlag: 0=generating, 1=success, 2/3=failed
        if (data.videoUrl || data.successFlag === 1) {
          setVideoUrl(data.videoUrl);
          setVideoGenerating(false);
          setGenerationProgress(100);
          setGenerationStatus("Vision complete.");
          setEstimatedTimeRemaining(0);
          // If we're past interruption phase, go to reveal
          if (flowState === 'GENERATING' || interruptionStep === questions.length - 1) {
            setTimeout(() => setFlowState('REVEAL'), 500);
          }
          return;
        }

        if (data.state === 'fail' || data.successFlag === 2 || data.successFlag === 3) {
          setGenerationError(data.message || 'Video generation failed.');
          setVideoGenerating(false);
          setFlowState('REVEAL');
          return;
        }

        // Still generating - wait and try again
        await new Promise(r => setTimeout(r, delayMs));
      } catch (error) {
        console.error(`Polling attempt ${i} error:`, error);
        // Continue polling unless it's the last attempt
        if (i < maxAttempts) {
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    }

    // Timeout
    setGenerationError('Video generation timed out. Please try again.');
    setVideoGenerating(false);
    setFlowState('REVEAL');
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
            <Link href="/" className="hover:opacity-80 transition-colors">Home</Link>
            <Link href="/marketplace" className="hover:opacity-80 transition-colors">Marketplace</Link>
            <Link href="/solutions" className="hover:opacity-80 transition-colors">Solutions</Link>
            <Link href="/subscriptions" className="hover:opacity-80 transition-colors">Subscriptions</Link>
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
              Enter your website. Our AI will analyze your digital footprint and reveal a vision of your future empire.
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
                className="absolute right-2 top-2 bottom-2 px-6 rounded-lg text-white font-semibold transition-all flex items-center gap-2 hover:opacity-90"
                style={{
                  background: 'var(--rensto-gradient-primary)',
                  boxShadow: '0 0 20px rgba(254, 61, 81, 0.3)'
                }}
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
            <div className="bg-slate-900/90 border border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_100px_rgba(6,182,212,0.2)] backdrop-blur-xl text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Target className="w-8 h-8 text-cyan-500" />
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
                        ? 'bg-cyan-500 text-white animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.5)]'
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
                    className="w-full px-6 py-4 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all hover:opacity-90"
                    style={{
                      background: emailInput ? 'var(--rensto-gradient-primary)' : undefined,
                      boxShadow: emailInput ? '0 0 20px rgba(254, 61, 81, 0.3)' : undefined
                    }}
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
          <div className="w-full max-w-4xl z-10">
            <div className="bg-slate-900/90 border border-purple-500/50 rounded-2xl p-12 shadow-[0_0_100px_rgba(168,85,247,0.2)] backdrop-blur-xl">
              {/* Progress Section */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Zap className="w-10 h-10 text-purple-500" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">
                  {generationStatus || "Assembling the vision..."}
                </h2>

                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto mb-4">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.max(1, generationProgress)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>{Math.max(1, Math.round(generationProgress))}% Complete</span>
                    {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
                      <span>~{estimatedTimeRemaining}s remaining</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Preview Skeleton */}
              <div className="bg-black/50 rounded-xl p-6 mb-6 border border-purple-500/20">
                <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.3),transparent_50%)] animate-pulse" />
                  </div>

                  {/* Play icon preview */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-purple-500/30 flex items-center justify-center animate-pulse">
                      <Play className="w-8 h-8 text-purple-400" fill="currentColor" />
                    </div>
                  </div>

                  {/* Corner badge */}
                  <div className="absolute top-4 right-4 bg-purple-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-purple-300 border border-purple-500/30">
                    AI Generated
                  </div>
                </div>

                <p className="text-center text-slate-400 text-sm mt-4">
                  The vision takes shape...
                </p>
              </div>

              {/* Value-Added Tips (Rotating) */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-slate-300">
                      <strong className="text-blue-400">Pro Tip:</strong> While you wait, our AI is analyzing your business model, identifying optimization opportunities, and crafting a personalized narrative that highlights your unique value proposition.
                    </p>
                  </div>
                </div>
              </div>
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
                      className="px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-all"
                      style={{
                        background: 'var(--rensto-gradient-primary)',
                        boxShadow: '0 0 20px rgba(254, 61, 81, 0.3)'
                      }}
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
                onClick={handleClaimSystem}
                className="text-white px-8 py-6 text-lg rounded-xl font-bold"
                style={{
                  background: 'var(--rensto-gradient-primary)',
                  boxShadow: 'var(--rensto-glow-primary)'
                }}
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
