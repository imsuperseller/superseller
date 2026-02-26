// TypeScript types for the Solution Planning system

export interface QualificationAnswers {
    'revenue-qualification'?: string;
    'timeline-commitment'?: string;
    'investment-readiness'?: string;
    'primary-pain'?: string;
    email?: string;
    [key: string]: string | undefined;
}

export interface SolutionDeliverable {
    name: string;
    description: string;
    businessImpact: string;
}

export interface TimelinePhase {
    name: string;
    duration: string;
}

export interface ROIEstimate {
    hoursSavedPerWeek: number;
    estimatedMonthlySavings: number;
    breakEvenMonths: number;
}

export interface SolutionTimeline {
    phases: TimelinePhase[];
    totalDuration: string;
}

export interface PricingOption {
    id: string;
    name: string;
    price: number;
    monthlyFee: number;
    timeline: string;
    description: string;
    includes: string[];
    ideal: string;
    isRecommended: boolean;
}

export interface TierDetails {
    name: string;
    basePrice: number;
    monthlyFee: number;
    timeline: string;
    description: string;
    includes: string[];
    ideal: string;
}

export interface SolutionPlan {
    summary: string;
    primaryPain: string;
    recommendedTier: 'starter' | 'professional' | 'enterprise';
    customizations: string[];
    deliverables: SolutionDeliverable[];
    whatWeNeed: string[];
    estimatedROI: ROIEstimate;
    timeline: SolutionTimeline;
    tierDetails: TierDetails;
    pricingOptions: PricingOption[];
}

export interface SolutionGenerationRequest {
    qualificationAnswers: QualificationAnswers;
    qualificationScore: number;
    qualificationTier: 'high' | 'medium' | 'low';
    voiceTranscript?: string;
    websiteUrl?: string;
}

export interface SolutionGenerationResponse {
    success: boolean;
    plan?: SolutionPlan;
    error?: string;
    generatedAt?: string;
}
