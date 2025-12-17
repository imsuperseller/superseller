'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Clock, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';

interface VoiceCallCTAProps {
    qualificationScore: number;
    qualificationTier: 'high' | 'medium' | 'low';
    prospectAnswers: Record<string, string>;
    onCallStart?: () => void;
    onCallEnd?: (transcript: string) => void;
}

export function VoiceCallCTA({
    qualificationScore,
    qualificationTier,
    prospectAnswers,
    onCallStart,
    onCallEnd
}: VoiceCallCTAProps) {
    // Scarcity timer - 15 minutes from component mount
    const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
    const [isExpired, setIsExpired] = useState(false);

    // Voice call state
    const [callState, setCallState] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<string[]>([]);

    // Audio refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Scarcity countdown timer
    useEffect(() => {
        if (timeRemaining <= 0) {
            setIsExpired(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Format time for display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get urgency style based on time remaining - using Rensto tokens
    const getUrgencyStyle = () => {
        if (timeRemaining <= 60) return { color: 'var(--rensto-primary)' }; // Red - last minute
        if (timeRemaining <= 300) return { color: 'var(--rensto-orange)' }; // Orange - last 5 min
        return { color: 'var(--rensto-cyan)' }; // Cyan - normal
    };

    // Start voice call
    const startCall = async () => {
        try {
            setCallState('connecting');
            onCallStart?.();

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create audio context for processing
            audioContextRef.current = new AudioContext();

            // Create media recorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

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

            // Play greeting from AI
            setCallState('active');
            await playAIGreeting();

        } catch (error) {
            console.error('Failed to start call:', error);
            setCallState('idle');
            alert('Please allow microphone access to use voice consultation.');
        }
    };

    // Play AI greeting using ElevenLabs
    const playAIGreeting = async () => {
        setIsSpeaking(true);

        // Gatekeeper-style greeting based on qualification
        const greeting = qualificationTier === 'high'
            ? `Thanks for reaching out. Before we dive in, I want to make sure we're a good fit. Based on what you've already shared, you look like exactly the type of client we help best. I'm selective about who I work with because I want to ensure great results. Let me ask you a few quick questions to finalize your custom solution.`
            : qualificationTier === 'medium'
                ? `Thanks for reaching out. I want to be upfront with you - I'm selective about who I work with, not because I don't want your business, but because my approach works best for certain situations. Let's explore whether we're a good match. Tell me more about your current situation.`
                : `Thanks for your interest. I'll be honest with you - based on what you've shared so far, we might not be the perfect fit right now. But I'm open to learning more. What's the main challenge you're trying to solve?`;

        try {
            const response = await fetch('/api/voice-ai/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: greeting,
                    voice: 'professional'
                })
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);

                audio.onended = () => {
                    setIsSpeaking(false);
                    startListening();
                };

                await audio.play();
            } else {
                setIsSpeaking(false);
                startListening();
            }
        } catch (error) {
            console.error('TTS error:', error);
            setIsSpeaking(false);
            startListening();
        }
    };

    // Start listening for user voice input
    const startListening = () => {
        if (mediaRecorderRef.current && callState === 'active') {
            setIsRecording(true);
            mediaRecorderRef.current.start();

            setTimeout(() => {
                if (isRecording) {
                    stopListening();
                }
            }, 30000);
        }
    };

    // Stop listening
    const stopListening = () => {
        if (mediaRecorderRef.current && isRecording) {
            setIsRecording(false);
            mediaRecorderRef.current.stop();
        }
    };

    // Process voice input with Whisper
    const processVoiceInput = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('context', JSON.stringify({
                qualificationScore,
                qualificationTier,
                prospectAnswers,
                conversationHistory: transcript
            }));

            const response = await fetch('/api/voice-ai/conversation', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();

                if (data.userTranscript) {
                    setTranscript(prev => [...prev, `You: ${data.userTranscript}`]);
                }
                if (data.aiResponse) {
                    setTranscript(prev => [...prev, `Rensto: ${data.aiResponse}`]);
                    await playAIResponse(data.aiResponse);
                }

                if (data.shouldEnd) {
                    endCall();
                }
            }
        } catch (error) {
            console.error('Voice processing error:', error);
        }
    };

    // Play AI response
    const playAIResponse = async (text: string) => {
        setIsSpeaking(true);

        try {
            const response = await fetch('/api/voice-ai/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice: 'professional' })
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);

                audio.onended = () => {
                    setIsSpeaking(false);
                    startListening();
                };

                await audio.play();
            }
        } catch (error) {
            console.error('TTS error:', error);
            setIsSpeaking(false);
            startListening();
        }
    };

    // End call
    const endCall = () => {
        setCallState('ended');
        setIsRecording(false);
        setIsSpeaking(false);

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        onCallEnd?.(transcript.join('\n'));
    };

    // Toggle recording during active call
    const toggleRecording = () => {
        if (isRecording) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div
            className="rensto-card-neon rounded-2xl p-8 backdrop-blur-xl"
            style={{ backgroundColor: 'var(--rensto-bg-card)' }}
        >
            {/* Scarcity Timer Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                    <span style={{ color: 'var(--rensto-text-primary)' }} className="font-semibold">
                        Voice Consultation
                    </span>
                </div>

                {!isExpired && callState === 'idle' && (
                    <div className="flex items-center gap-2" style={getUrgencyStyle()}>
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-sm">
                            Available for {formatTime(timeRemaining)}
                        </span>
                    </div>
                )}
            </div>

            {/* Idle State - Show CTA */}
            {callState === 'idle' && !isExpired && (
                <div className="text-center">
                    <p style={{ color: 'var(--rensto-text-secondary)' }} className="mb-6">
                        Speak directly with our AI consultant.
                        <br />
                        <span style={{ color: 'var(--rensto-cyan)' }}>
                            Limited availability - {formatTime(timeRemaining)} remaining.
                        </span>
                    </p>

                    <button
                        onClick={startCall}
                        className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 rensto-animate-glow"
                        style={{
                            background: 'var(--rensto-gradient-secondary)',
                            color: 'var(--rensto-text-primary)',
                            boxShadow: 'var(--rensto-glow-secondary)'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5" />
                            Start Voice Consultation
                        </div>
                    </button>

                    <p style={{ color: 'var(--rensto-text-muted)' }} className="text-xs mt-4">
                        No phone needed. Uses your browser microphone.
                    </p>
                </div>
            )}

            {/* Expired State */}
            {isExpired && callState === 'idle' && (
                <div className="text-center">
                    <p style={{ color: 'var(--rensto-primary)' }} className="mb-4">
                        Voice consultation window has expired.
                    </p>
                    <button
                        onClick={() => window.open('https://tidycal.com/rensto/custom-consultation', '_blank')}
                        className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80"
                        style={{
                            border: '1px solid var(--rensto-text-muted)',
                            color: 'var(--rensto-text-primary)',
                            backgroundColor: 'transparent'
                        }}
                    >
                        Schedule a Call Instead
                    </button>
                </div>
            )}

            {/* Connecting State */}
            {callState === 'connecting' && (
                <div className="text-center">
                    <Loader2
                        className="w-12 h-12 animate-spin mx-auto mb-4"
                        style={{ color: 'var(--rensto-cyan)' }}
                    />
                    <p style={{ color: 'var(--rensto-text-primary)' }}>
                        Connecting to AI consultant...
                    </p>
                </div>
            )}

            {/* Active Call State */}
            {callState === 'active' && (
                <div className="space-y-6">
                    {/* Visual feedback */}
                    <div className="flex items-center justify-center gap-8">
                        {/* AI Speaking indicator */}
                        <div className={`flex flex-col items-center ${isSpeaking ? 'opacity-100' : 'opacity-40'}`}>
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center ${isSpeaking ? 'rensto-animate-pulse' : ''}`}
                                style={{
                                    backgroundColor: isSpeaking
                                        ? 'rgba(95, 251, 253, 0.2)'
                                        : 'var(--rensto-bg-secondary)'
                                }}
                            >
                                <Volume2
                                    className="w-8 h-8"
                                    style={{
                                        color: isSpeaking
                                            ? 'var(--rensto-cyan)'
                                            : 'var(--rensto-text-muted)'
                                    }}
                                />
                            </div>
                            <span style={{ color: 'var(--rensto-text-secondary)' }} className="text-sm mt-2">
                                AI Speaking
                            </span>
                        </div>

                        {/* User Recording indicator */}
                        <div className={`flex flex-col items-center ${isRecording ? 'opacity-100' : 'opacity-40'}`}>
                            <button
                                onClick={toggleRecording}
                                className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    backgroundColor: isRecording
                                        ? 'var(--rensto-primary)'
                                        : 'var(--rensto-bg-secondary)',
                                    boxShadow: isRecording
                                        ? 'var(--rensto-glow-primary)'
                                        : 'none'
                                }}
                            >
                                {isRecording ? (
                                    <MicOff className="w-8 h-8" style={{ color: 'var(--rensto-text-primary)' }} />
                                ) : (
                                    <Mic className="w-8 h-8" style={{ color: 'var(--rensto-text-muted)' }} />
                                )}
                            </button>
                            <span style={{ color: 'var(--rensto-text-secondary)' }} className="text-sm mt-2">
                                {isRecording ? 'Listening...' : 'Tap to speak'}
                            </span>
                        </div>
                    </div>

                    {/* Transcript */}
                    {transcript.length > 0 && (
                        <div
                            className="rounded-xl p-4 max-h-48 overflow-y-auto"
                            style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                        >
                            {transcript.slice(-4).map((line, i) => (
                                <p
                                    key={i}
                                    className="text-sm mb-2"
                                    style={{
                                        color: line.startsWith('You:')
                                            ? 'var(--rensto-cyan)'
                                            : 'var(--rensto-text-secondary)'
                                    }}
                                >
                                    {line}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* End call button */}
                    <button
                        onClick={endCall}
                        className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-80"
                        style={{
                            backgroundColor: 'rgba(254, 61, 81, 0.2)',
                            border: '1px solid rgba(254, 61, 81, 0.3)',
                            color: 'var(--rensto-primary)'
                        }}
                    >
                        End Consultation
                    </button>
                </div>
            )}

            {/* Ended State */}
            {callState === 'ended' && (
                <div className="text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: 'rgba(95, 251, 253, 0.2)' }}
                    >
                        <Phone className="w-8 h-8" style={{ color: 'var(--rensto-cyan)' }} />
                    </div>
                    <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: 'var(--rensto-text-primary)' }}
                    >
                        Consultation Complete
                    </h3>
                    <p style={{ color: 'var(--rensto-text-secondary)' }} className="mb-4">
                        Thank you for your time. Your custom solution is being prepared.
                    </p>
                    <p style={{ color: 'var(--rensto-cyan)' }} className="text-sm">
                        {transcript.length} messages exchanged
                    </p>
                </div>
            )}
        </div>
    );
}

export default VoiceCallCTA;
