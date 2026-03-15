/**
 * BeforeAfterPropsSchema — Zod validation tests
 *
 * Verifies required fields, defaults, optional fields, and enum validation
 * for the parametric BeforeAfterComposition schema.
 */
import { describe, it, expect } from "vitest";
import { BeforeAfterPropsSchema } from "../../remotion/src/types/before-after-props";

const VALID_REQUIRED = {
    beforeImageUrl: "https://example.com/before.jpg",
    afterImageUrl: "https://example.com/after.jpg",
    serviceLabel: "Kitchen Remodel",
};

describe("BeforeAfterPropsSchema", () => {
    // ── Required fields ───────────────────────────────────────────

    describe("required fields", () => {
        it("parses successfully with all required fields", () => {
            const result = BeforeAfterPropsSchema.parse(VALID_REQUIRED);
            expect(result.beforeImageUrl).toBe("https://example.com/before.jpg");
            expect(result.afterImageUrl).toBe("https://example.com/after.jpg");
            expect(result.serviceLabel).toBe("Kitchen Remodel");
        });

        it("rejects when beforeImageUrl is missing", () => {
            const { beforeImageUrl: _, ...rest } = VALID_REQUIRED;
            expect(() => BeforeAfterPropsSchema.parse(rest)).toThrow();
        });

        it("rejects when afterImageUrl is missing", () => {
            const { afterImageUrl: _, ...rest } = VALID_REQUIRED;
            expect(() => BeforeAfterPropsSchema.parse(rest)).toThrow();
        });

        it("rejects when serviceLabel is missing", () => {
            const { serviceLabel: _, ...rest } = VALID_REQUIRED;
            expect(() => BeforeAfterPropsSchema.parse(rest)).toThrow();
        });

        it("rejects when all required fields are missing", () => {
            expect(() => BeforeAfterPropsSchema.parse({})).toThrow();
        });
    });

    // ── Defaults ─────────────────────────────────────────────────

    describe("defaults", () => {
        it("applies default tagline when omitted", () => {
            const result = BeforeAfterPropsSchema.parse(VALID_REQUIRED);
            expect(result.tagline).toBe("See the difference");
        });

        it("applies default brandColor when omitted", () => {
            const result = BeforeAfterPropsSchema.parse(VALID_REQUIRED);
            expect(result.brandColor).toBe("#F97316");
        });

        it("applies default ctaText when omitted", () => {
            const result = BeforeAfterPropsSchema.parse(VALID_REQUIRED);
            expect(result.ctaText).toBe("Book Now");
        });

        it("applies default logoPosition when omitted", () => {
            const result = BeforeAfterPropsSchema.parse(VALID_REQUIRED);
            expect(result.logoPosition).toBe("top-right");
        });

        it("applies default logoWidth when omitted", () => {
            const result = BeforeAfterPropsSchema.parse(VALID_REQUIRED);
            expect(result.logoWidth).toBe(120);
        });

        it("overrides default tagline with provided value", () => {
            const result = BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, tagline: "Custom Tagline" });
            expect(result.tagline).toBe("Custom Tagline");
        });

        it("overrides default brandColor with provided value", () => {
            const result = BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, brandColor: "#14B8A6" });
            expect(result.brandColor).toBe("#14B8A6");
        });
    });

    // ── Optional fields ───────────────────────────────────────────

    describe("optional fields", () => {
        it("logoUrl is optional and can be omitted", () => {
            const result = BeforeAfterPropsSchema.parse(VALID_REQUIRED);
            expect(result.logoUrl).toBeUndefined();
        });

        it("logoUrl is accepted when provided", () => {
            const result = BeforeAfterPropsSchema.parse({
                ...VALID_REQUIRED,
                logoUrl: "https://example.com/logo.png",
            });
            expect(result.logoUrl).toBe("https://example.com/logo.png");
        });
    });

    // ── Enum validation ──────────────────────────────────────────

    describe("logoPosition enum", () => {
        it("accepts top-right", () => {
            const result = BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, logoPosition: "top-right" });
            expect(result.logoPosition).toBe("top-right");
        });

        it("accepts top-left", () => {
            const result = BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, logoPosition: "top-left" });
            expect(result.logoPosition).toBe("top-left");
        });

        it("accepts bottom-right", () => {
            const result = BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, logoPosition: "bottom-right" });
            expect(result.logoPosition).toBe("bottom-right");
        });

        it("accepts bottom-left", () => {
            const result = BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, logoPosition: "bottom-left" });
            expect(result.logoPosition).toBe("bottom-left");
        });

        it("rejects invalid logoPosition", () => {
            expect(() => BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, logoPosition: "center" })).toThrow();
        });
    });

    // ── Type correctness ─────────────────────────────────────────

    describe("type validation", () => {
        it("rejects non-string beforeImageUrl", () => {
            expect(() => BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, beforeImageUrl: 42 })).toThrow();
        });

        it("rejects non-number logoWidth", () => {
            expect(() => BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, logoWidth: "120" })).toThrow();
        });

        it("accepts logoWidth as number", () => {
            const result = BeforeAfterPropsSchema.parse({ ...VALID_REQUIRED, logoWidth: 200 });
            expect(result.logoWidth).toBe(200);
        });
    });
});
