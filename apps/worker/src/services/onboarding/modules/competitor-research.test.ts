import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ModuleState } from "./types";

// Mock DB client (already globally mocked in setup.ts, but we need handles)
const mockQuery = vi.fn().mockResolvedValue([]);
const mockQueryOne = vi.fn().mockResolvedValue(null);

vi.mock("../../../db/client", () => ({
    query: (...args: any[]) => mockQuery(...args),
    queryOne: (...args: any[]) => mockQueryOne(...args),
}));

// Mock module-state upsert
const mockUpsertModuleState = vi.fn().mockResolvedValue(null);
vi.mock("../module-state", () => ({
    upsertModuleState: (...args: any[]) => mockUpsertModuleState(...args),
}));

import { competitorResearchModule } from "./competitor-research";

function makeState(phase: string, collectedData: Record<string, any> = {}): ModuleState {
    return {
        id: "state-1",
        groupId: "group-1",
        tenantId: "tenant-1",
        moduleType: "competitor-research",
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

describe("competitor-research module", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── shouldActivate ────────────────────────────────────────

    it("shouldActivate returns true for Maps/SEO product", () => {
        const result = competitorResearchModule.shouldActivate([
            { productName: "Maps/SEO", productId: "ms-1", status: "active", type: "seo" },
        ]);
        expect(result).toBe(true);
    });

    it("shouldActivate returns true for Google Maps product", () => {
        const result = competitorResearchModule.shouldActivate([
            { productName: "Google Maps", productId: "gm-1", status: "active", type: "maps" },
        ]);
        expect(result).toBe(true);
    });

    it("shouldActivate returns true for Lead Pages product", () => {
        const result = competitorResearchModule.shouldActivate([
            { productName: "Lead Pages", productId: "lp-1", status: "active", type: "web" },
        ]);
        expect(result).toBe(true);
    });

    it("shouldActivate returns false for non-relevant products", () => {
        const result = competitorResearchModule.shouldActivate([
            { productName: "SocialHub", productId: "sh-1", status: "active", type: "social" },
        ]);
        expect(result).toBe(false);
    });

    // ── getIntroMessage ───────────────────────────────────────

    it("getIntroMessage asks for competitor info", () => {
        const msg = competitorResearchModule.getIntroMessage("Acme Corp");
        expect(msg).toContain("competitor");
        expect(msg).toContain("name");
    });

    // ── handleMessage: collecting phase ───────────────────────

    it("handleMessage in collecting phase parses competitor name, asks for details", async () => {
        const state = makeState("collecting", { competitors: [], currentIndex: 0 });
        const result = await competitorResearchModule.handleMessage({
            ...baseParams,
            messageBody: "Bob's Plumbing",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
        // Should store competitor and ask for details (url/location) or next
        expect(mockUpsertModuleState).toHaveBeenCalled();
    });

    it("handleMessage in collecting_details phase accepts details and asks for next", async () => {
        const state = makeState("collecting_details", {
            competitors: [{ name: "Bob's Plumbing", details: "" }],
            currentIndex: 0,
        });
        const result = await competitorResearchModule.handleMessage({
            ...baseParams,
            messageBody: "bobsplumbing.com, Dallas TX",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
        // Should store details and ask for next competitor or move to confirming
        expect(mockUpsertModuleState).toHaveBeenCalled();
    });

    it("handleMessage in collecting_details with skip moves to next competitor", async () => {
        const state = makeState("collecting_details", {
            competitors: [{ name: "Bob's Plumbing", details: "" }],
            currentIndex: 0,
        });
        const result = await competitorResearchModule.handleMessage({
            ...baseParams,
            messageBody: "skip",
            state,
        });

        expect(result.handled).toBe(true);
        // Should ask for next competitor
        expect(mockUpsertModuleState).toHaveBeenCalled();
    });

    it("handleMessage stores up to 3 competitors then moves to confirming", async () => {
        const state = makeState("collecting_details", {
            competitors: [
                { name: "Comp A", details: "compa.com" },
                { name: "Comp B", details: "compb.com" },
                { name: "Comp C", details: "" },
            ],
            currentIndex: 2,
        });
        const result = await competitorResearchModule.handleMessage({
            ...baseParams,
            messageBody: "compc.com, Austin",
            state,
        });

        expect(result.handled).toBe(true);
        // Should show summary and ask for confirmation
        expect(result.response).toContain("Comp A");
        expect(result.response).toContain("Comp B");
        expect(result.response).toContain("Comp C");
        // State should move to confirming
        const upsertCall = mockUpsertModuleState.mock.calls[0];
        expect(upsertCall[3]).toBe("confirming"); // phase arg
    });

    it("handleMessage in confirming phase with yes stores competitors in ServiceInstance", async () => {
        const state = makeState("confirming", {
            competitors: [
                { name: "Comp A", details: "compa.com" },
                { name: "Comp B", details: "compb.com, Dallas" },
            ],
            currentIndex: 2,
        });

        mockQueryOne.mockResolvedValueOnce({ id: "si-1", configuration: {} });
        mockQuery.mockResolvedValueOnce([]);

        const result = await competitorResearchModule.handleMessage({
            ...baseParams,
            messageBody: "yes",
            state,
        });

        expect(result.handled).toBe(true);
        expect(result.completed).toBe(true);
        expect(result.response).toContain("saved");
        expect(result.moduleType).toBe("competitor-research");
        // Should update ServiceInstance configuration
        expect(mockQuery).toHaveBeenCalled();
        // State should move to complete
        const upsertCall = mockUpsertModuleState.mock.calls[0];
        expect(upsertCall[3]).toBe("complete");
    });

    it("handleMessage in confirming phase with no resets to collecting", async () => {
        const state = makeState("confirming", {
            competitors: [{ name: "Comp A", details: "" }],
            currentIndex: 1,
        });
        const result = await competitorResearchModule.handleMessage({
            ...baseParams,
            messageBody: "no",
            state,
        });

        expect(result.handled).toBe(true);
        const upsertCall = mockUpsertModuleState.mock.calls[0];
        expect(upsertCall[3]).toBe("collecting"); // reset
    });

    it("handleMessage handles done during collection (fewer than 3 is OK)", async () => {
        const state = makeState("collecting", {
            competitors: [{ name: "Comp A", details: "compa.com" }],
            currentIndex: 1,
        });
        const result = await competitorResearchModule.handleMessage({
            ...baseParams,
            messageBody: "done",
            state,
        });

        expect(result.handled).toBe(true);
        // Should move to confirming with 1 competitor
        expect(result.response).toContain("Comp A");
        const upsertCall = mockUpsertModuleState.mock.calls[0];
        expect(upsertCall[3]).toBe("confirming");
    });
});
