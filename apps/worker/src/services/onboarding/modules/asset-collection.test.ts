/**
 * asset-collection.test.ts — Tests for the asset collection onboarding module
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ModuleState } from "./types";

// Mock R2 and WAHA before importing the module
vi.mock("../../r2", () => ({
    uploadBufferToR2: vi.fn().mockResolvedValue("https://test.r2.dev/some-key"),
}));

vi.mock("../../waha-client", () => ({
    reactToMessage: vi.fn().mockResolvedValue(true),
}));

import { assetCollectionModule } from "./asset-collection";
import { uploadBufferToR2 } from "../../r2";
import { reactToMessage } from "../../waha-client";

function makeState(overrides: Partial<ModuleState> = {}): ModuleState {
    return {
        id: "state-1",
        groupId: "group-1@g.us",
        tenantId: "tenant-1",
        moduleType: "asset-collection",
        phase: "intro",
        collectedData: {},
        updatedAt: new Date(),
        ...overrides,
    };
}

describe("assetCollectionModule", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup fetch to return a valid media buffer (new Response each call)
        vi.mocked(fetch).mockImplementation(async () =>
            new Response(Buffer.alloc(500, "x"), {
                status: 200,
                headers: { "Content-Type": "image/jpeg" },
            }),
        );
    });

    // ── shouldActivate ──────────────────────────────────────

    it("Test 1: shouldActivate returns true for visual products", () => {
        const products = [
            { productName: "VideoForge", productType: "service", source: "ServiceInstance" as const },
        ];
        expect(assetCollectionModule.shouldActivate(products)).toBe(true);

        expect(
            assetCollectionModule.shouldActivate([
                { productName: "Winner Studio", productType: "service", source: "ServiceInstance" as const },
            ]),
        ).toBe(true);

        expect(
            assetCollectionModule.shouldActivate([
                { productName: "Character-in-a-Box", productType: "service", source: "ServiceInstance" as const },
            ]),
        ).toBe(true);

        expect(
            assetCollectionModule.shouldActivate([
                { productName: "Lead Pages", productType: "service", source: "ServiceInstance" as const },
            ]),
        ).toBe(true);

        expect(
            assetCollectionModule.shouldActivate([
                { productName: "SocialHub", productType: "service", source: "ServiceInstance" as const },
            ]),
        ).toBe(true);
    });

    it("Test 2: shouldActivate returns false for non-visual products", () => {
        const products = [
            { productName: "Maps/SEO", productType: "service", source: "ServiceInstance" as const },
        ];
        expect(assetCollectionModule.shouldActivate(products)).toBe(false);
    });

    // ── getIntroMessage ─────────────────────────────────────

    it("Test 3: getIntroMessage returns greeting asking for assets", () => {
        const msg = assetCollectionModule.getIntroMessage("Acme Corp");
        expect(msg).toContain("logo");
        expect(msg).toContain("photo");
        expect(msg).toContain("done");
    });

    // ── handleMessage with media ────────────────────────────

    it("Test 4: handleMessage with media downloads, uploads to R2, returns confirmation", async () => {
        const result = await assetCollectionModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "here is our logo",
            hasMedia: true,
            mediaUrl: "http://localhost:3000/api/files/default/msg123.jpg",
            mediaType: "image",
            messageId: "msg123",
            senderChatId: "user@c.us",
            state: makeState(),
        });

        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
        expect(result.response).toContain("logo");
        expect(uploadBufferToR2).toHaveBeenCalledOnce();
        // Verify assetInfo was passed
        const call = vi.mocked(uploadBufferToR2).mock.calls[0];
        expect(call[3]).toMatchObject({
            tenantId: "tenant-1",
            type: "logo",
        });
    });

    // ── handleMessage text only ─────────────────────────────

    it("Test 5: handleMessage with text-only asks to send media", async () => {
        const result = await assetCollectionModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "hello there",
            hasMedia: false,
            state: makeState(),
        });

        expect(result.handled).toBe(true);
        expect(result.response).toContain("send");
        expect(uploadBufferToR2).not.toHaveBeenCalled();
    });

    // ── Asset classification ────────────────────────────────

    it("Test 6: handleMessage categorizes assets from caption", async () => {
        // "logo" in caption -> type "logo"
        await assetCollectionModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "our company logo",
            hasMedia: true,
            mediaUrl: "http://localhost:3000/api/files/default/msg1.jpg",
            mediaType: "image",
            messageId: "msg1",
            state: makeState(),
        });
        expect(vi.mocked(uploadBufferToR2).mock.calls[0][3]?.type).toBe("logo");

        vi.mocked(uploadBufferToR2).mockClear();

        // "team photo" -> type "team_photo"
        await assetCollectionModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "our team",
            hasMedia: true,
            mediaUrl: "http://localhost:3000/api/files/default/msg2.jpg",
            mediaType: "image",
            messageId: "msg2",
            state: makeState(),
        });
        expect(vi.mocked(uploadBufferToR2).mock.calls[0][3]?.type).toBe("team_photo");
    });

    // ── Emoji reaction ──────────────────────────────────────

    it("Test 7: handleMessage with media reacts with checkmark", async () => {
        await assetCollectionModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "photo",
            hasMedia: true,
            mediaUrl: "http://localhost:3000/api/files/default/msg3.jpg",
            mediaType: "image",
            messageId: "msg3",
            state: makeState(),
        });

        expect(reactToMessage).toHaveBeenCalledWith(
            "group-1@g.us",
            "msg3",
            expect.stringContaining(""),
        );
    });

    // ── "done" transition ───────────────────────────────────

    it("Test 8: handleMessage with 'done' transitions to complete", async () => {
        const result = await assetCollectionModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "done",
            hasMedia: false,
            state: makeState({ phase: "collecting", collectedData: { assetCount: 3 } }),
        });

        expect(result.handled).toBe(true);
        expect(result.completed).toBe(true);
        expect(result.response).toContain("3");
    });

    // ── No caption (media only) ─────────────────────────────

    it("Test 9: handleMessage with media-only (no caption) classifies as photo", async () => {
        await assetCollectionModule.handleMessage({
            groupId: "group-1@g.us",
            tenantId: "tenant-1",
            tenantSlug: "acme",
            messageBody: "",
            hasMedia: true,
            mediaUrl: "http://localhost:3000/api/files/default/msg4.jpg",
            mediaType: "image",
            messageId: "msg4",
            state: makeState(),
        });

        expect(vi.mocked(uploadBufferToR2).mock.calls[0][3]?.type).toBe("photo");
    });
});
