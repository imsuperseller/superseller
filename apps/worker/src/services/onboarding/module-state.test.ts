import { describe, it, expect, vi, beforeEach } from "vitest";
import { query, queryOne } from "../../db/client";
import {
    initModuleStateTable,
    getModuleState,
    getActiveModule,
    upsertModuleState,
} from "./module-state";

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);

describe("module-state", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("initModuleStateTable", () => {
        it("creates table without error (idempotent)", async () => {
            mockQuery.mockResolvedValueOnce([]); // CREATE TABLE
            mockQuery.mockResolvedValueOnce([]); // index 1
            mockQuery.mockResolvedValueOnce([]); // index 2

            await expect(initModuleStateTable()).resolves.not.toThrow();
            expect(mockQuery).toHaveBeenCalledTimes(3);
            // Verify CREATE TABLE IF NOT EXISTS is used
            expect(mockQuery.mock.calls[0][0]).toContain("CREATE TABLE IF NOT EXISTS");
        });
    });

    describe("upsertModuleState", () => {
        it("creates new state row for (groupId, moduleType)", async () => {
            mockQueryOne.mockResolvedValueOnce({
                id: "ms-1",
                group_id: "group-1",
                tenant_id: "tenant-1",
                module_type: "asset-collection",
                phase: "intro",
                collected_data: {},
                updated_at: new Date(),
            });

            const state = await upsertModuleState(
                "group-1",
                "tenant-1",
                "asset-collection",
                "intro",
                {},
            );

            expect(state).not.toBeNull();
            expect(state!.groupId).toBe("group-1");
            expect(state!.moduleType).toBe("asset-collection");
            expect(state!.phase).toBe("intro");
            // Verify INSERT ... ON CONFLICT is used
            expect(mockQueryOne.mock.calls[0][0]).toContain("ON CONFLICT");
        });

        it("updates existing row (same groupId + moduleType)", async () => {
            mockQueryOne.mockResolvedValueOnce({
                id: "ms-1",
                group_id: "group-1",
                tenant_id: "tenant-1",
                module_type: "asset-collection",
                phase: "collecting",
                collected_data: { photos: ["url1"] },
                updated_at: new Date(),
            });

            const state = await upsertModuleState(
                "group-1",
                "tenant-1",
                "asset-collection",
                "collecting",
                { photos: ["url1"] },
            );

            expect(state!.phase).toBe("collecting");
            expect(state!.collectedData).toEqual({ photos: ["url1"] });
        });
    });

    describe("getModuleState", () => {
        it("returns null for non-existent group/module combo", async () => {
            mockQueryOne.mockResolvedValueOnce(null);

            const state = await getModuleState("nonexistent", "asset-collection");
            expect(state).toBeNull();
        });

        it("returns correct state after upsert", async () => {
            mockQueryOne.mockResolvedValueOnce({
                id: "ms-1",
                group_id: "group-1",
                tenant_id: "tenant-1",
                module_type: "social-setup",
                phase: "collecting",
                collected_data: { platforms: ["instagram"] },
                updated_at: new Date("2026-03-13"),
            });

            const state = await getModuleState("group-1", "social-setup");
            expect(state).not.toBeNull();
            expect(state!.groupId).toBe("group-1");
            expect(state!.tenantId).toBe("tenant-1");
            expect(state!.moduleType).toBe("social-setup");
            expect(state!.phase).toBe("collecting");
            expect(state!.collectedData).toEqual({ platforms: ["instagram"] });
        });
    });

    describe("getActiveModule", () => {
        it("returns the non-complete module for a group", async () => {
            mockQueryOne.mockResolvedValueOnce({
                id: "ms-2",
                group_id: "group-1",
                tenant_id: "tenant-1",
                module_type: "asset-collection",
                phase: "collecting",
                collected_data: {},
                updated_at: new Date(),
            });

            const state = await getActiveModule("group-1");
            expect(state).not.toBeNull();
            expect(state!.moduleType).toBe("asset-collection");
            expect(state!.phase).not.toBe("complete");
        });

        it("returns null when all modules are complete", async () => {
            mockQueryOne.mockResolvedValueOnce(null);

            const state = await getActiveModule("group-1");
            expect(state).toBeNull();
        });
    });
});
