'use client';

import { useState } from 'react';
import { CREDIT_COSTS } from '@/data/pricing';

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  href?: string;
  done: boolean;
}

interface PortalOnboardingProps {
  userName: string;
  planTier: string;
  planCredits: number;
  creditsUsed: number;
  features: Record<string, boolean>;
  /** Total usage events — 0 means brand new user */
  totalActions: number;
}

const FEATURE_ACTIONS: Record<string, { label: string; description: string; credits: number }> = {
  tourReel: { label: 'Create your first video', description: 'Upload a listing and generate a cinematic property tour', credits: CREDIT_COSTS.forge.credits },
  socialHub: { label: 'Publish your first post', description: 'Generate AI content and publish to your social channels', credits: CREDIT_COSTS.buzz.credits },
  fbBot: { label: 'Launch a marketplace listing', description: 'Create an AI-powered listing for Facebook Marketplace', credits: CREDIT_COSTS.market.credits },
  frontDesk: { label: 'Set up your AI receptionist', description: 'Configure your phone assistant and test with a call', credits: CREDIT_COSTS.frontdesk.credits },
  leadPages: { label: 'Create a lead capture page', description: 'Build a branded landing page for your business', credits: 0 },
  winnerStudio: { label: 'Create a spokesperson video', description: 'Generate an AI avatar video for your brand', credits: CREDIT_COSTS.spoke.credits },
  agentForge: { label: 'Run a business intelligence report', description: 'Launch an AI research agent for competitive analysis', credits: CREDIT_COSTS.cortex.credits },
};

export function PortalOnboarding({
  userName,
  planTier,
  planCredits,
  creditsUsed,
  features,
  totalActions,
}: PortalOnboardingProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user has already taken 3+ actions or dismissed
  if (totalActions >= 3 || dismissed) return null;

  const creditsRemaining = Math.max(0, planCredits - creditsUsed);
  const activeFeatures = Object.entries(features).filter(([, enabled]) => enabled);
  const firstFeature = activeFeatures[0]?.[0];
  const featureAction = firstFeature ? FEATURE_ACTIONS[firstFeature] : null;

  const steps: OnboardingStep[] = [
    {
      id: 'payment',
      label: 'Payment confirmed',
      description: `Your ${planTier} plan is active`,
      done: true,
    },
    {
      id: 'credits',
      label: `${planCredits.toLocaleString()} credits loaded`,
      description: `${creditsRemaining.toLocaleString()} remaining`,
      done: true,
    },
    {
      id: 'first-action',
      label: featureAction?.label || 'Take your first action',
      description: featureAction
        ? `${featureAction.description} (${featureAction.credits} credits)`
        : 'Use any crew member to get started',
      done: totalActions > 0,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="rounded-2xl border border-[#f47920]/20 bg-gradient-to-br from-[#f47920]/5 to-transparent p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Welcome{userName ? `, ${userName}` : ''}! Let&apos;s get started.
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Complete these steps to unlock your AI crew&apos;s full potential.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/30 hover:text-white/60 transition-colors text-sm"
          aria-label="Dismiss onboarding"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{completedCount}/{steps.length} steps complete</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f47920] to-[#4ecdc4] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
              step.done ? 'bg-white/[0.02]' : 'bg-white/[0.04] border border-white/5'
            }`}
          >
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-[#f47920]/20 text-[#f47920]'
              }`}
            >
              {step.done ? '✓' : '→'}
            </div>
            <div className="min-w-0">
              <span className={`text-sm font-medium ${step.done ? 'text-white/50 line-through' : 'text-white'}`}>
                {step.label}
              </span>
              <p className="text-xs text-white/40 mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Credit reminder */}
      <div className="flex items-center gap-2 rounded-lg bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 px-4 py-2">
        <span className="text-[#4ecdc4] text-sm">⚡</span>
        <span className="text-xs text-[#4ecdc4]/80">
          You have <strong className="text-[#4ecdc4]">{creditsRemaining.toLocaleString()}</strong> credits ready to use.
          Credits reset each billing cycle.
        </span>
      </div>
    </div>
  );
}
