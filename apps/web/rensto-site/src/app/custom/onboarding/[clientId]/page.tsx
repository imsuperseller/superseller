'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { CustomHeader } from '@/components/CustomHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button-enhanced';
import { StepIndicator } from '@/components/wizard/StepIndicator';
import { TechStackForm } from '@/components/wizard/TechStackForm';
import { BusinessLogicForm } from '@/components/wizard/BusinessLogicForm';
import { CredentialsForm } from '@/components/wizard/CredentialsForm';
import { Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export default function OnboardingWizardPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.clientId as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        crm: '',
        twilioPhone: '',
        wabaId: '',
        afterHoursMsg: '',
        minJobSize: '',
        emergencyPhone: '',
        useRenstoOpenai: false,
        openaiKey: '',
        crmKey: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const totalSteps = 3;
    const stepLabels = ['Tech Stack', 'Rules', 'Keys'];

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/custom-solutions/intake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    config: formData
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit configuration');
            }

            const result = await response.json();
            console.log('Submission Result:', result);
            setIsComplete(true);

        } catch (error) {
            console.error('Submission error:', error);
            // Optional: Show error toast here
            alert('Something went wrong saving your configuration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isComplete) {
        return (
            <div className="min-h-screen text-white relative flex flex-col items-center justify-center">
                <AnimatedGridBackground />
                <CustomHeader />

                <div
                    className="relative z-10 max-w-2xl w-full mx-auto p-8 rounded-3xl border border-[var(--rensto-cyan)] bg-black/40 backdrop-blur-xl text-center transition-all duration-500 animate-in fade-in zoom-in-95"
                    style={{ boxShadow: '0 0 50px rgba(30,174,247,0.2)' }}
                >
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <Check size={48} className="text-green-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--rensto-blue)] to-[var(--rensto-cyan)]">
                        Setup Complete!
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        We have received your configuration. The Rensto Engine is now compiling your custom system.
                    </p>

                    <div className="bg-black/50 rounded-xl p-6 text-left mb-8 overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            System Payload (Debug)
                        </div>
                        <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                    </div>

                    <Button
                        onClick={() => router.push(`/dashboard/${clientId}`)}
                        variant="renstoNeon"
                        className="w-full py-6 text-lg"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white relative flex flex-col">
            <AnimatedGridBackground />
            <CustomHeader />

            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[var(--rensto-cyan)] mb-4 uppercase tracking-wider">
                            Client ID: {clientId}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            System Configuration
                        </h1>
                        <p className="text-lg text-gray-400">
                            Let&apos;s map your business DNA to the Rensto Engine.
                        </p>
                    </div>

                    {/* Progress */}
                    <StepIndicator
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        labels={stepLabels}
                    />

                    {/* Form Container */}
                    <div className="relative min-h-[500px] mb-12">
                        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(30,174,247,0.05)] to-transparent rounded-3xl -z-10" />
                        <div className="backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">

                            {currentStep === 1 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <TechStackForm data={formData} onUpdate={(d) => setFormData({ ...formData, ...d })} />
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <BusinessLogicForm data={formData} onUpdate={(d) => setFormData({ ...formData, ...d })} />
                                </div>
                            )}
                            {currentStep === 3 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <CredentialsForm data={formData} onUpdate={(d) => setFormData({ ...formData, ...d })} />
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center max-w-3xl mx-auto">
                        <Button
                            variant="renstoGhost"
                            onClick={handleBack}
                            disabled={currentStep === 1 || isSubmitting}
                            className={`flex gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                            <ArrowLeft size={16} /> Back
                        </Button>

                        <Button
                            variant={currentStep === totalSteps ? 'renstoNeon' : 'renstoPrimary'}
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="w-40"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin mr-2" /> Saving...</>
                            ) : currentStep === totalSteps ? (
                                'Compile System'
                            ) : (
                                <>Next <ArrowRight size={16} className="ml-2" /></>
                            )}
                        </Button>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
