export type CaseStatus =
    | 'pending'
    | 'researching'
    | 'fixing'
    | 'testing'
    | 'awaiting_approval'
    | 'resolved'
    | 'escalated';

export interface SupportCase {
    id: string;
    customerId: string;
    workflowId?: string;
    carePlanTier: 'starter' | 'growth' | 'scale';
    submissionMethod: 'magic_button' | 'voice' | 'whatsapp';
    issueDescription: string;
    contextData: {
        recentErrors?: Array<{
            executionId: string;
            errorMessage: string;
            timestamp: string;
        }>;
        workflowJson?: object;
        capturedAt?: string;
    };
    status: CaseStatus;
    aiReasoningLog: string[];
    attemptCount: number;
    proposedFix?: {
        diff: string;
        testResult: 'pass' | 'fail';
        confidence: number;
    };
    resolution?: {
        approved: boolean;
        feedback?: string;
        resolvedAt: string | Date;
    };
    createdAt: string | Date;
    updatedAt: string | Date;
}
