/**
 * social-setup.test.ts — Tests for the social setup onboarding module
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { query, queryOne } from "../../../db/client";
import type { ModuleState } from "./types";

import { socialSetupModule } from "./social-setup";

function makeState(overrides: Partial<ModuleState> = {}): ModuleState {
    return {
        id: "state-1",
        groupId: "group-1@g.us",
        tenantId: "tenant-1",
        moduleType: "social-setup",
        phase: "asking_platforms",
        collectedData: {},
        updatedAt: new Date(),
        ...overrides,
    };
}

describe("socialSetupModule", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── shouldActivate ──────────────────────────────────────

    it("Test 1: shouldActivate returns true for SocialHub and Buzz", () => {
        expect(
            socialSetupModule.shouldActivate([
                { productName: "SocialHub", productType: "service", source: "ServiceInstance" as const },
            ]),
        ).toBe(true);

        expect(
            socialSetupModule.shouldActivate([
                { productName: "Buzz", productType: "service", source: "ServiceInstance" as const },
            ]),
        ).toBe(true);
    });

    it("Test 2: shouldActivate returns false for non-social products", () => {
        expect(
            socialSetupModule.shouldActivate([
                { productName: "VideoForge", productType: "service", source: "ServiceInstance" as const },
            ]),
        ).toBe(false);

        expect(
            socialSetupModule.shouldActivate([
                { productName: "Maps/SEO", productType: "service", source: "ServiceInstance" as const },
            ]),
        ).toBe(false);
    });

    // ── getIntroMessage ─────────────────────────────────────

    it("Test 3: getIntroMessage explains SocialHub and asks which platforms", () => {
        const msg = socialSetupModule.getIntroMessage("Acme Corp");
        expect(msg).toContain("SocialHub");
        expect(msg).toContain("platform");
    });

    // ── handleMessage: asking_platforms ──────────────────────

    it("Test 4: handleMessage in asking_platforms collects platform names", async () => {
        const result = await socialSetupModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "Instagram and Facebook",
            hasMedia: false,
            state: makeState({ phase: "asking_platforms" }),
        });

        expect(result.handled).toBe(true);
        expect(result.response).toContain("often"); // asks about frequency
    });

    // ── handleMessage: asking_frequency ─────────────────────

    it("Test 5: handleMessage in asking_frequency collects posting frequency", async () => {
        const result = await socialSetupModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "3 times a week",
            hasMedia: false,
            state: makeState({
                phase: "asking_frequency",
                collectedData: { platforms: ["instagram", "facebook"] },
            }),
        });

        expect(result.handled).toBe(true);
        expect(result.response).toContain("style"); // asks about style
    });

    // ── handleMessage: asking_style ─────────────────────────

    it("Test 6: handleMessage in asking_style collects content style", async () => {
        const result = await socialSetupModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "professional and educational",
            hasMedia: false,
            state: makeState({
                phase: "asking_style",
                collectedData: {
                    platforms: ["instagram", "facebook"],
                    frequency: "3 times a week",
                },
            }),
        });

        expect(result.handled).toBe(true);
        expect(result.response).toContain("instagram"); // shows summary
        expect(result.response).toContain("yes"); // asks confirmation
    });

    // ── handleMessage: confirming (yes) ─────────────────────

    it("Test 7: handleMessage in confirming with 'yes' stores config and completes", async () => {
        // Mock DB: SELECT returns a ServiceInstance row
        vi.mocked(queryOne).mockResolvedValueOnce({
            id: "si-1",
            configuration: JSON.stringify({ existingKey: true }),
        });

        const result = await socialSetupModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "yes",
            hasMedia: false,
            state: makeState({
                phase: "confirming",
                collectedData: {
                    platforms: ["instagram", "facebook"],
                    frequency: "3x/week",
                    style: "professional",
                },
            }),
        });

        expect(result.handled).toBe(true);
        expect(result.completed).toBe(true);

        // Verify DB update was called
        expect(query).toHaveBeenCalled();
        const updateCall = vi.mocked(query).mock.calls.find((c) =>
            (c[0] as string).includes("UPDATE"),
        );
        expect(updateCall).toBeDefined();
    });

    // ── handleMessage: confirming (no) ──────────────────────

    it("Test 8: handleMessage in confirming with 'no' returns to asking_platforms", async () => {
        const result = await socialSetupModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "no",
            hasMedia: false,
            state: makeState({
                phase: "confirming",
                collectedData: {
                    platforms: ["instagram"],
                    frequency: "daily",
                    style: "casual",
                },
            }),
        });

        expect(result.handled).toBe(true);
        expect(result.completed).toBeFalsy();
        expect(result.response).toContain("platform"); // re-asks platforms
    });

    // ── ServiceInstance JSON storage ─────────────────────────

    it("Test 9: stores preferences as JSON in ServiceInstance.configuration (merge with existing)", async () => {
        // Mock: SELECT returns existing config
        vi.mocked(queryOne).mockResolvedValueOnce({
            id: "si-1",
            configuration: JSON.stringify({ existingKey: "keep-me" }),
        });

        await socialSetupModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "looks good",
            hasMedia: false,
            state: makeState({
                phase: "confirming",
                collectedData: {
                    platforms: ["linkedin"],
                    frequency: "weekly",
                    style: "educational",
                },
            }),
        });

        // Verify the UPDATE SQL merges config (contains socialPreferences)
        const updateCall = vi.mocked(query).mock.calls.find((c) =>
            (c[0] as string).includes("UPDATE"),
        );
        expect(updateCall).toBeDefined();

        // The JSON parameter should contain both existingKey and socialPreferences
        const jsonParam = updateCall![1]![0]; // first SQL param = configuration JSON
        const parsed = JSON.parse(jsonParam as string);
        expect(parsed.existingKey).toBe("keep-me");
        expect(parsed.socialPreferences).toBeDefined();
        expect(parsed.socialPreferences.platforms).toContain("linkedin");
        expect(parsed.socialPreferences.frequency).toBe("weekly");
        expect(parsed.socialPreferences.style).toBe("educational");
    });
});
