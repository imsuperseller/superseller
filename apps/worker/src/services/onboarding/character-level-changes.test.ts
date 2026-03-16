/**
 * character-level-changes.test.ts
 *
 * Unit tests for the character-level-changes service module.
 * All external dependencies (WAHA, DB, queue) are mocked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing the module under test
vi.mock("../waha-client", () => ({
    phoneToChatId: vi.fn((phone: string) => phone + "@c.us"),
    sendText: vi.fn().mockResolvedValue("msg-text-id"),
    sendPoll: vi.fn().mockResolvedValue("msg-poll-id"),
    sendVideo: vi.fn().mockResolvedValue("msg-video-id"),
}));

vi.mock("./change-request-intake", () => ({
    updateChangeRequestStatus: vi.fn().mockResolvedValue(undefined),
    getPendingAdminApprovalRequest: vi.fn(),
}));

vi.mock("../../queue/queues", () => ({
    characterRegenQueue: {
        add: vi.fn().mockResolvedValue({ id: "job-1" }),
    },
}));

vi.mock("../../config", () => ({
    config: {
        admin: {
            defaultPhone: "9720501234567",
        },
    },
}));

vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

import {
    classifyChangeDelta,
    sendAdminCharacterChangeReview,
    handleAdminCharacterApprovalPollVote,
    handleAdminSceneSelectionText,
    handleNameOnlyChange,
} from "./character-level-changes";
import { sendText, sendPoll, sendVideo } from "../waha-client";
import { updateChangeRequestStatus, getPendingAdminApprovalRequest } from "./change-request-intake";
import { characterRegenQueue } from "../../queue/queues";

// ── classifyChangeDelta ──────────────────────────────────────────

describe("classifyChangeDelta", () => {
    it("returns hasVisualChanges=true for visualStyle change", () => {
        const result = classifyChangeDelta({ visualStyle: { from: "cinematic", to: "casual" } });
        expect(result.hasVisualChanges).toBe(true);
        expect(result.affectedSceneCount).toBe(5);
        expect(result.changedFields).toEqual(["visualStyle"]);
    });

    it("returns hasVisualChanges=true for soraHandle change", () => {
        const result = classifyChangeDelta({ soraHandle: { from: "@old", to: "@new" } });
        expect(result.hasVisualChanges).toBe(true);
        expect(result.affectedSceneCount).toBe(5);
        expect(result.changedFields).toEqual(["soraHandle"]);
    });

    it("returns hasVisualChanges=false for name-only change", () => {
        const result = classifyChangeDelta({ name: { from: "Sara", to: "Maya" } });
        expect(result.hasVisualChanges).toBe(false);
        expect(result.affectedSceneCount).toBe(0);
        expect(result.changedFields).toEqual(["name"]);
    });

    it("returns hasVisualChanges=false for name + personaDescription change", () => {
        const result = classifyChangeDelta({
            name: { from: "A", to: "B" },
            personaDescription: { from: "x", to: "y" },
        });
        expect(result.hasVisualChanges).toBe(false);
        expect(result.affectedSceneCount).toBe(0);
        expect(result.changedFields).toContain("name");
        expect(result.changedFields).toContain("personaDescription");
    });

    it("returns hasVisualChanges=true when mixing name + visualStyle", () => {
        const result = classifyChangeDelta({
            name: { from: "A", to: "B" },
            visualStyle: { from: "x", to: "y" },
        });
        expect(result.hasVisualChanges).toBe(true);
        expect(result.affectedSceneCount).toBe(5);
    });

    it("treats unknown field as visual (safe default)", () => {
        const result = classifyChangeDelta({ unknownField: { from: "a", to: "b" } });
        expect(result.hasVisualChanges).toBe(true);
    });

    it("returns empty result for empty changeDelta", () => {
        const result = classifyChangeDelta({});
        expect(result.hasVisualChanges).toBe(false);
        expect(result.affectedSceneCount).toBe(0);
        expect(result.changedFields).toEqual([]);
    });
});

// ── sendAdminCharacterChangeReview ───────────────────────────────

describe("sendAdminCharacterChangeReview", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(sendText).mockResolvedValue("msg-text-id");
        vi.mocked(sendPoll).mockResolvedValue("msg-poll-id");
        vi.mocked(updateChangeRequestStatus).mockResolvedValue(undefined);
    });

    it("sends text diff and poll to admin chatId, returns poll message ID", async () => {
        const result = await sendAdminCharacterChangeReview({
            groupId: "group1@g.us",
            tenantId: "tenant-1",
            changeRequestId: "cr-123",
            changeDelta: { visualStyle: { from: "cinematic", to: "casual" } },
            customerName: "Sara",
            affectedSceneCount: 5,
            costDollars: 5,
        });

        expect(sendText).toHaveBeenCalledOnce();
        const textCall = vi.mocked(sendText).mock.calls[0];
        // First arg is adminChatId
        expect(textCall[0]).toContain("@c.us");
        // Message body includes key fields
        expect(textCall[1]).toContain("cr-123");
        expect(textCall[1]).toContain("Sara");
        expect(textCall[1]).toContain("visualStyle");

        expect(sendPoll).toHaveBeenCalledOnce();
        const pollCall = vi.mocked(sendPoll).mock.calls[0];
        expect(pollCall[0]).toContain("@c.us"); // admin chatId
        expect(pollCall[2]).toHaveLength(3); // 3 options

        expect(updateChangeRequestStatus).toHaveBeenCalledWith(
            "cr-123",
            "pending-admin-approval",
            expect.objectContaining({ adminApprovalPollId: "msg-poll-id" }),
        );

        expect(result).toBe("msg-poll-id");
    });

    it("returns null if sendPoll fails", async () => {
        vi.mocked(sendPoll).mockResolvedValue(null);
        const result = await sendAdminCharacterChangeReview({
            groupId: "group1@g.us",
            tenantId: "tenant-1",
            changeRequestId: "cr-123",
            changeDelta: {},
            customerName: "Sara",
            affectedSceneCount: 5,
            costDollars: 5,
        });
        expect(result).toBeNull();
    });
});

// ── handleAdminCharacterApprovalPollVote ─────────────────────────

describe("handleAdminCharacterApprovalPollVote", () => {
    const mockPendingCR = {
        id: "cr-123",
        group_id: "group1@g.us",
        tenant_id: "tenant-1",
        message_body: "change my hair",
        intent: "character-change",
        scope: "character",
        scene_number: null,
        change_summary: "visual style change",
        status: "pending-admin-approval",
        estimated_cost_cents: 500,
        poll_message_id: null,
        character_bible_version_id: "bible-v2",
        admin_approval_poll_id: "poll-msg-id",
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getPendingAdminApprovalRequest).mockResolvedValue(mockPendingCR);
        vi.mocked(updateChangeRequestStatus).mockResolvedValue(undefined);
        vi.mocked(sendText).mockResolvedValue("msg-id");
        vi.mocked(characterRegenQueue.add).mockResolvedValue({ id: "job-1" } as any);
    });

    it("returns false when no pending request exists", async () => {
        vi.mocked(getPendingAdminApprovalRequest).mockResolvedValue(null);
        const result = await handleAdminCharacterApprovalPollVote({
            pollOption: "Approve all 5 scenes",
            adminChatId: "admin@c.us",
        });
        expect(result).toBe(false);
    });

    it("dispatches regen job on 'Approve all' and returns true", async () => {
        const result = await handleAdminCharacterApprovalPollVote({
            pollOption: "Approve all 5 scenes",
            adminChatId: "admin@c.us",
        });

        expect(result).toBe(true);
        expect(updateChangeRequestStatus).toHaveBeenCalledWith(
            "cr-123",
            "admin-approved",
            expect.anything(),
        );
        expect(characterRegenQueue.add).toHaveBeenCalledWith(
            "regen-character",
            expect.objectContaining({
                changeRequestId: "cr-123",
                affectedSceneIndices: [0, 1, 2, 3, 4],
                tenantId: "tenant-1",
                groupId: "group1@g.us",
            }),
        );
        // Customer ack sent to group
        expect(sendText).toHaveBeenCalledWith(
            "group1@g.us",
            expect.stringContaining("approved"),
        );
    });

    it("denies with customer notification on 'Deny' and returns true", async () => {
        const result = await handleAdminCharacterApprovalPollVote({
            pollOption: "Deny",
            adminChatId: "admin@c.us",
        });

        expect(result).toBe(true);
        expect(updateChangeRequestStatus).toHaveBeenCalledWith("cr-123", "admin-denied", expect.anything());
        expect(sendText).toHaveBeenCalledWith(
            "group1@g.us",
            expect.stringContaining("declined"),
        );
        expect(characterRegenQueue.add).not.toHaveBeenCalled();
    });

    it("transitions to pending-scene-selection on 'Select specific scenes' and returns true", async () => {
        const result = await handleAdminCharacterApprovalPollVote({
            pollOption: "Select specific scenes",
            adminChatId: "admin@c.us",
        });

        expect(result).toBe(true);
        expect(updateChangeRequestStatus).toHaveBeenCalledWith(
            "cr-123",
            "pending-scene-selection",
            expect.anything(),
        );
        // Sends follow-up to admin asking for scene numbers
        expect(sendText).toHaveBeenCalledWith(
            "admin@c.us",
            expect.stringContaining("scene"),
        );
    });

    it("returns false for unrecognized poll option", async () => {
        const result = await handleAdminCharacterApprovalPollVote({
            pollOption: "Some unknown option",
            adminChatId: "admin@c.us",
        });
        expect(result).toBe(false);
    });
});

// ── handleAdminSceneSelectionText ────────────────────────────────

describe("handleAdminSceneSelectionText", () => {
    const mockPendingCR = {
        id: "cr-123",
        group_id: "group1@g.us",
        tenant_id: "tenant-1",
        message_body: "select scenes",
        intent: "character-change",
        scope: "character",
        scene_number: null,
        change_summary: null,
        status: "pending-scene-selection",
        estimated_cost_cents: 300,
        poll_message_id: null,
        character_bible_version_id: "bible-v2",
        admin_approval_poll_id: "poll-msg-id",
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getPendingAdminApprovalRequest).mockResolvedValue(null);
        vi.mocked(updateChangeRequestStatus).mockResolvedValue(undefined);
        vi.mocked(sendText).mockResolvedValue("msg-id");
        vi.mocked(characterRegenQueue.add).mockResolvedValue({ id: "job-1" } as any);
    });

    it("returns false when no pending-scene-selection request exists", async () => {
        const result = await handleAdminSceneSelectionText({
            messageBody: "1, 3",
            adminChatId: "admin@c.us",
        });
        expect(result).toBe(false);
    });

    it("parses scene numbers and dispatches regen job", async () => {
        // Override to return a pending-scene-selection row
        const getCR = vi.mocked(getPendingAdminApprovalRequest);
        getCR.mockResolvedValueOnce({ ...mockPendingCR, status: "pending-scene-selection" } as any);

        const result = await handleAdminSceneSelectionText({
            messageBody: "1, 3, 5",
            adminChatId: "admin@c.us",
        });

        expect(result).toBe(true);
        expect(characterRegenQueue.add).toHaveBeenCalledWith(
            "regen-character",
            expect.objectContaining({
                affectedSceneIndices: [0, 2, 4], // 1-based input converted to 0-based
            }),
        );
    });

    it("sends error message if no valid scene numbers found", async () => {
        const getCR = vi.mocked(getPendingAdminApprovalRequest);
        getCR.mockResolvedValueOnce({ ...mockPendingCR, status: "pending-scene-selection" } as any);

        const result = await handleAdminSceneSelectionText({
            messageBody: "no numbers here",
            adminChatId: "admin@c.us",
        });

        expect(result).toBe(true); // handled, retrying
        expect(sendText).toHaveBeenCalledWith(
            "admin@c.us",
            expect.stringContaining("parse"),
        );
        expect(characterRegenQueue.add).not.toHaveBeenCalled();
    });
});

// ── handleNameOnlyChange ─────────────────────────────────────────

describe("handleNameOnlyChange", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(sendVideo).mockResolvedValue("msg-video-id");
        vi.mocked(updateChangeRequestStatus).mockResolvedValue(undefined);
    });

    it("sends video to group with updated name caption and marks CR completed at $0", async () => {
        await handleNameOnlyChange({
            groupId: "group1@g.us",
            changeRequestId: "cr-123",
            revealUrl: "https://example.com/video.mp4",
            newName: "Maya",
        });

        expect(sendVideo).toHaveBeenCalledWith(
            "group1@g.us",
            "https://example.com/video.mp4",
            expect.stringContaining("Maya"),
        );
        expect(updateChangeRequestStatus).toHaveBeenCalledWith(
            "cr-123",
            "completed",
            expect.objectContaining({ estimatedCostCents: 0 }),
        );
    });
});
