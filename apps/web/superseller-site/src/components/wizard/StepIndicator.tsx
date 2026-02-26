'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
    return (
        <div className="w-full max-w-3xl mx-auto mb-12">
            <div className="relative flex justify-between items-center">
                {/* Connection Line Background */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full z-0" />

                {/* Animated Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[var(--superseller-blue)] to-[var(--superseller-cyan)] -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />

                {/* Steps */}
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive || isCompleted
                                        ? 'bg-[var(--superseller-bg-secondary)] border-[var(--superseller-cyan)] text-[var(--superseller-cyan)] shadow-[0_0_20px_rgba(95,251,253,0.4)] scale-110'
                                        : 'bg-[var(--superseller-bg-primary)] border-white/20 text-gray-500 scale-100'
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check size={20} className="text-[var(--superseller-cyan)]" />
                                ) : (
                                    <span className="font-bold text-sm">{stepNumber}</span>
                                )}
                            </div>

                            {labels && labels[index] && (
                                <div className={`absolute -bottom-8 w-32 text-center text-xs font-medium transition-colors duration-300 ${isActive ? 'text-[var(--superseller-cyan)]' : 'text-gray-500'
                                    }`}>
                                    {labels[index]}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
