/**
 * types.ts -- Shared interfaces for onboarding modules
 *
 * All three modules (asset-collection, social-setup, competitor-research)
 * implement OnboardingModule. ModuleState persists in DB.
 *
 * Used by: module-state.ts, module-router.ts, individual module implementations
 */

// Re-export ProductInfo from prompt-assembler for convenience
export type { ProductInfo } from "../prompt-assembler";

export type PipelineStatus = 'active' | 'paused' | 'awaiting-approval' | 'complete' | 'failed';

export type ModuleType =
    | "asset-collection"
    | "character-questionnaire"
    | "character-video-gen"
    | "social-setup"
    | "competitor-research";

export interface ModuleState {
    id: string;
    groupId: string;
    tenantId: string;
    moduleType: ModuleType;
    phase: string; // module-specific phases like 'intro' | 'collecting' | 'confirming' | 'complete'
    collectedData: Record<string, any>;
    updatedAt: Date;
}

export interface ModuleHandleResult {
    handled: boolean;
    response?: string; // text to send back to the group
    moduleType?: string;
    completed?: boolean; // true when module transitions to 'complete'
}

export interface OnboardingModule {
    moduleType: ModuleType;
    shouldActivate(products: import("../prompt-assembler").ProductInfo[]): boolean;
    handleMessage(params: {
        groupId: string;
        tenantId: string;
        tenantSlug: string;
        messageBody: string;
        hasMedia: boolean;
        mediaUrl?: string;
        mediaType?: string;
        messageId?: string;
        senderChatId?: string;
        state: ModuleState;
    }): Promise<ModuleHandleResult>;
    getIntroMessage(tenantName: string): string;
}
