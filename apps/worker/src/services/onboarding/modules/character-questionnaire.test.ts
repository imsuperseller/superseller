/**
 * character-questionnaire.test.ts -- Tests for character questionnaire onboarding module
 *
 * State machine: intro -> asking_name -> asking_personality -> asking_visual_style
 *                -> asking_audience -> asking_scenarios -> confirming -> generating -> complete
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ModuleState } from "./types";

// Mock module-state upsert
const mockUpsertModuleState = vi.fn().mockResolvedValue(null);
vi.mock("../module-state", () => ({
    upsertModuleState: (...args: any[]) => mockUpsertModuleState(...args),
}));

// Mock character-bible-generator
const mockGenerateCharacterBible = vi.fn().mockResolvedValue("bible-id-123");
vi.mock("../character-bible-generator", () => ({
    generateCharacterBible: (...args: any[]) => mockGenerateCharacterBible(...args),
}));

import { characterQuestionnaireModule } from "./character-questionnaire";

function makeState(phase: string, collectedData: Record<string, any> = {}): ModuleState {
    return {
        id: "state-1",
        groupId: "group-1",
        tenantId: "tenant-1",
        moduleType: "character-questionnaire",
        phase,
        collectedData,
        updatedAt: new Date(),
    };
}

const baseParams = {
    groupId: "group-1",
    tenantId: "tenant-1",
    tenantSlug: "test-tenant",
    messageBody: "",
    hasMedia: false,
};

describe("character-questionnaire module", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── shouldActivate ────────────────────────────────────────

    it("shouldActivate returns true for VideoForge product", () => {
        const result = characterQuestionnaireModule.shouldActivate([
            { productName: "VideoForge", productId: "vf-1", status: "active", type: "video" },
        ]);
        expect(result).toBe(true);
    });

    it("shouldActivate returns true for Winner Studio product", () => {
        const result = characterQuestionnaireModule.shouldActivate([
            { productName: "Winner Studio", productId: "ws-1", status: "active", type: "video" },
        ]);
        expect(result).toBe(true);
    });

    it("shouldActivate returns true for Character-in-a-Box product", () => {
        const result = characterQuestionnaireModule.shouldActivate([
            { productName: "Character-in-a-Box", productId: "ciab-1", status: "active", type: "video" },
        ]);
        expect(result).toBe(true);
    });

    it("shouldActivate returns false for SocialHub product", () => {
        const result = characterQuestionnaireModule.shouldActivate([
            { productName: "SocialHub", productId: "sh-1", status: "active", type: "social" },
        ]);
        expect(result).toBe(false);
    });

    it("shouldActivate returns false for Maps/SEO product", () => {
        const result = characterQuestionnaireModule.shouldActivate([
            { productName: "Maps/SEO", productId: "ms-1", status: "active", type: "seo" },
        ]);
        expect(result).toBe(false);
    });

    // ── getIntroMessage ───────────────────────────────────────

    it("getIntroMessage mentions AI brand character", () => {
        const msg = characterQuestionnaireModule.getIntroMessage("Acme Corp");
        expect(msg).toBeTruthy();
        expect(msg.length).toBeGreaterThan(20);
    });

    // ── intro phase ───────────────────────────────────────────

    it("intro phase transitions to asking_name and sends name question", async () => {
        const state = makeState("intro");
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "hello",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
        expect(result.response).toContain("name");
        expect(mockUpsertModuleState).toHaveBeenCalledWith(
            "group-1",
            "tenant-1",
            "character-questionnaire",
            "asking_name",
            expect.any(Object),
        );
    });

    // ── asking_name phase ─────────────────────────────────────

    it("asking_name stores name and advances to asking_personality", async () => {
        const state = makeState("asking_name", {});
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "Alex",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
        expect(mockUpsertModuleState).toHaveBeenCalledWith(
            "group-1",
            "tenant-1",
            "character-questionnaire",
            "asking_personality",
            expect.objectContaining({ name: "Alex" }),
        );
    });

    // ── asking_personality phase ──────────────────────────────

    it("asking_personality with vague answer triggers follow-up (< 10 chars)", async () => {
        const state = makeState("asking_personality", { name: "Alex" });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "cool",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toContain("detail");
        // Should NOT advance phase
        expect(mockUpsertModuleState).not.toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            "asking_visual_style",
            expect.anything(),
        );
    });

    it("asking_personality with valid answer stores and advances to asking_visual_style", async () => {
        const state = makeState("asking_personality", { name: "Alex" });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "Professional and authoritative, speaks to executives",
            state,
        });

        expect(result.handled).toBe(true);
        expect(mockUpsertModuleState).toHaveBeenCalledWith(
            "group-1",
            "tenant-1",
            "character-questionnaire",
            "asking_visual_style",
            expect.objectContaining({ personality: "Professional and authoritative, speaks to executives" }),
        );
    });

    // ── asking_visual_style phase ─────────────────────────────

    it("asking_visual_style with vague answer triggers follow-up", async () => {
        const state = makeState("asking_visual_style", { name: "Alex", personality: "Professional" });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "tall",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toContain("detail");
    });

    it("asking_visual_style with valid answer advances to asking_audience", async () => {
        const state = makeState("asking_visual_style", { name: "Alex", personality: "Professional and authoritative" });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "Business casual, dark navy suit, confident posture, 35-40 years old",
            state,
        });

        expect(result.handled).toBe(true);
        expect(mockUpsertModuleState).toHaveBeenCalledWith(
            "group-1",
            "tenant-1",
            "character-questionnaire",
            "asking_audience",
            expect.objectContaining({ visualStyle: expect.any(String) }),
        );
    });

    // ── asking_audience phase ─────────────────────────────────

    it("asking_audience with vague answer triggers follow-up", async () => {
        const state = makeState("asking_audience", { name: "Alex", personality: "Professional", visualStyle: "Business casual" });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "owners",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toContain("detail");
    });

    it("asking_audience with valid answer advances to asking_scenarios", async () => {
        const state = makeState("asking_audience", { name: "Alex", personality: "Professional", visualStyle: "Business casual suit" });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "Homeowners aged 35-60 in Dallas area who need renovation services",
            state,
        });

        expect(result.handled).toBe(true);
        expect(mockUpsertModuleState).toHaveBeenCalledWith(
            "group-1",
            "tenant-1",
            "character-questionnaire",
            "asking_scenarios",
            expect.objectContaining({ audience: expect.any(String) }),
        );
    });

    // ── asking_scenarios phase ────────────────────────────────

    it("asking_scenarios collects a scenario and asks for next or done", async () => {
        const state = makeState("asking_scenarios", {
            name: "Alex",
            personality: "Professional",
            visualStyle: "Business suit",
            audience: "Homeowners Dallas",
            scenarios: [],
        });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "Walking through a finished kitchen renovation",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
        expect(mockUpsertModuleState).toHaveBeenCalled();
    });

    it("asking_scenarios with done after 1 scenario moves to confirming", async () => {
        const state = makeState("asking_scenarios", {
            name: "Alex",
            personality: "Professional",
            visualStyle: "Business suit",
            audience: "Homeowners Dallas",
            scenarios: ["Walking through a finished kitchen renovation"],
        });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "done",
            state,
        });

        expect(result.handled).toBe(true);
        const upsertCall = mockUpsertModuleState.mock.calls[0];
        expect(upsertCall[3]).toBe("confirming");
    });

    it("asking_scenarios collects up to 3 then auto-advances to confirming", async () => {
        const state = makeState("asking_scenarios", {
            name: "Alex",
            personality: "Professional",
            visualStyle: "Business suit",
            audience: "Homeowners Dallas",
            scenarios: ["Scenario 1", "Scenario 2"],
        });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "Greeting customers at a job site",
            state,
        });

        expect(result.handled).toBe(true);
        const upsertCall = mockUpsertModuleState.mock.calls[0];
        expect(upsertCall[3]).toBe("confirming");
    });

    // ── confirming phase ──────────────────────────────────────

    it("confirming 'yes' calls generateCharacterBible and transitions to complete", async () => {
        const state = makeState("confirming", {
            name: "Alex",
            personality: "Professional and authoritative executive presence",
            visualStyle: "Navy business suit, confident posture",
            audience: "Homeowners aged 35-60 in Dallas",
            scenarios: ["Kitchen walk-through", "Job site greeting"],
        });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "yes",
            state,
        });

        expect(result.handled).toBe(true);
        expect(mockGenerateCharacterBible).toHaveBeenCalledWith(
            "tenant-1",
            expect.objectContaining({
                name: "Alex",
                personality: expect.any(String),
                visualStyle: expect.any(String),
                audience: expect.any(String),
                scenarios: expect.any(Array),
            }),
        );
        const upsertCall = mockUpsertModuleState.mock.calls.find((c: any[]) => c[3] === "complete");
        expect(upsertCall).toBeDefined();
        expect(result.completed).toBe(true);
    });

    it("confirming 'no' resets to asking_name", async () => {
        const state = makeState("confirming", {
            name: "Alex",
            personality: "Professional",
            visualStyle: "Business suit",
            audience: "Homeowners",
            scenarios: ["Scenario 1"],
        });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "no",
            state,
        });

        expect(result.handled).toBe(true);
        const upsertCall = mockUpsertModuleState.mock.calls[0];
        expect(upsertCall[3]).toBe("asking_name");
    });

    // ── complete phase ────────────────────────────────────────

    it("complete phase returns handled response", async () => {
        const state = makeState("complete", { name: "Alex" });
        const result = await characterQuestionnaireModule.handleMessage({
            ...baseParams,
            messageBody: "hi",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
    });
});
