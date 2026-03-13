/**
 * character-bible-generator.test.ts -- Tests for Claude-powered CharacterBible generation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally (used to call Claude API)
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock DB client
const mockQuery = vi.fn();
const mockQueryOne = vi.fn();
vi.mock("../../db/client", () => ({
    query: (...args: any[]) => mockQuery(...args),
    queryOne: (...args: any[]) => mockQueryOne(...args),
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

import { generateCharacterBible } from "./character-bible-generator";

const validData = {
    name: "Alex",
    personality: "Professional and authoritative executive presence",
    visualStyle: "Navy business suit, confident posture, 35-40 years old",
    audience: "Homeowners aged 35-60 in Dallas area who need renovation services",
    scenarios: ["Walking through a finished kitchen", "Greeting customers at a job site"],
};

const validClaudeJson = {
    personaDescription: "Alex is a confident and professional brand representative...",
    visualStyle: "Navy blue business casual suit with clean lines...",
    soraHandle: "alex_brand_rep",
    metadata: {
        personality_keywords: ["professional", "authoritative", "confident"],
        target_demo: "Homeowners aged 35-60 in Dallas",
        brand_tone: "professional",
        scenario_prompts: ["Alex walking through finished kitchen showing quality work", "Alex greeting customers professionally at job site"],
    },
};

function makeClaudeResponse(content: string, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => ({
            content: [{ type: "text", text: content }],
        }),
        text: async () => content,
    };
}

describe("generateCharacterBible", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.ANTHROPIC_API_KEY = "test-api-key";
    });

    // ── valid JSON response ────────────────────────────────────

    it("valid questionnaire data calls Claude with all fields and inserts CharacterBible", async () => {
        mockFetch.mockResolvedValueOnce(makeClaudeResponse(JSON.stringify(validClaudeJson)));
        mockQuery.mockResolvedValueOnce([{ id: "bible-id-abc" }]);

        const result = await generateCharacterBible("tenant-1", validData);

        expect(result).toBe("bible-id-abc");

        // Claude was called with correct API endpoint
        expect(mockFetch).toHaveBeenCalledWith(
            "https://api.anthropic.com/v1/messages",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ "x-api-key": "test-api-key" }),
                body: expect.stringContaining("Alex"),
            }),
        );

        // Prompt contains all questionnaire fields
        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        const promptContent = callBody.messages[0].content;
        expect(promptContent).toContain("Alex");
        expect(promptContent).toContain("Professional and authoritative");
        expect(promptContent).toContain("Navy business suit");
        expect(promptContent).toContain("Homeowners aged 35-60");
        expect(promptContent).toContain("Walking through a finished kitchen");

        // DB insert called with correct params
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining(`INSERT INTO "CharacterBible"`),
            expect.arrayContaining(["tenant-1", "Alex"]),
        );
    });

    it("Claude returns valid JSON -> fields parsed into structured CharacterBible insert", async () => {
        mockFetch.mockResolvedValueOnce(makeClaudeResponse(JSON.stringify(validClaudeJson)));
        mockQuery.mockResolvedValueOnce([{ id: "parsed-id" }]);

        const result = await generateCharacterBible("tenant-2", validData);

        expect(result).toBe("parsed-id");

        // DB insert uses parsed fields
        const dbCall = mockQuery.mock.calls[0];
        const dbParams = dbCall[1];
        expect(dbParams[2]).toBe(validClaudeJson.personaDescription); // personaDescription
        expect(dbParams[3]).toBe(validClaudeJson.visualStyle); // visualStyle
        expect(dbParams[4]).toBe(validClaudeJson.soraHandle); // soraHandle
    });

    // ── malformed JSON fallback ───────────────────────────────

    it("Claude returns malformed JSON -> falls back to raw text as personaDescription", async () => {
        const rawText = "This character is professional and authoritative...";
        mockFetch.mockResolvedValueOnce(makeClaudeResponse(rawText));
        mockQuery.mockResolvedValueOnce([{ id: "fallback-id" }]);

        const result = await generateCharacterBible("tenant-3", validData);

        expect(result).toBe("fallback-id");

        // DB insert uses raw text as personaDescription
        const dbParams = mockQuery.mock.calls[0][1];
        expect(dbParams[2]).toBe(rawText); // personaDescription = raw text
    });

    // ── Claude API error ──────────────────────────────────────

    it("Claude API returns error status -> returns null and logs error", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 429,
            text: async () => "Rate limit exceeded",
        });

        const result = await generateCharacterBible("tenant-4", validData);

        expect(result).toBeNull();
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it("Claude API throws network error -> returns null and logs error", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network connection refused"));

        const result = await generateCharacterBible("tenant-5", validData);

        expect(result).toBeNull();
        expect(mockQuery).not.toHaveBeenCalled();
    });

    // ── DB insert error ───────────────────────────────────────

    it("DB insert throws -> returns null and logs error", async () => {
        mockFetch.mockResolvedValueOnce(makeClaudeResponse(JSON.stringify(validClaudeJson)));
        mockQuery.mockRejectedValueOnce(new Error("DB connection failed"));

        const result = await generateCharacterBible("tenant-6", validData);

        expect(result).toBeNull();
    });

    // ── missing API key ───────────────────────────────────────

    it("missing ANTHROPIC_API_KEY -> returns null without calling API", async () => {
        delete process.env.ANTHROPIC_API_KEY;

        const result = await generateCharacterBible("tenant-7", validData);

        expect(result).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
    });
});
