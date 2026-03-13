import { describe, it, expect, vi, beforeEach } from "vitest";
import { query } from "../../db/client";
import {
    assembleProductPrompt,
    fetchTenantProducts,
    getProductModuleHints,
    type ProductInfo,
} from "./prompt-assembler";

const mockQuery = vi.mocked(query);

describe("prompt-assembler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("fetchTenantProducts", () => {
        it("returns ServiceInstance products", async () => {
            // First call: ServiceInstance query
            mockQuery.mockResolvedValueOnce([
                { productName: "VideoForge", productId: "vf-1", status: "active", type: "video" },
            ]);
            // Second call: Subscription query
            mockQuery.mockResolvedValueOnce([]);

            const products = await fetchTenantProducts("tenant-1");
            expect(products).toHaveLength(1);
            expect(products[0].productName).toBe("VideoForge");
            expect(products[0].status).toBe("active");
        });

        it("combines ServiceInstance and Subscription products", async () => {
            mockQuery.mockResolvedValueOnce([
                { productName: "VideoForge", productId: "vf-1", status: "active", type: "video" },
            ]);
            mockQuery.mockResolvedValueOnce([
                { productName: "WhatsApp", type: "WhatsApp", status: "active", productId: null },
            ]);

            const products = await fetchTenantProducts("tenant-1");
            expect(products).toHaveLength(2);
            expect(products.map((p) => p.productName)).toEqual(["VideoForge", "WhatsApp"]);
        });

        it("deduplicates by productName (ServiceInstance wins)", async () => {
            mockQuery.mockResolvedValueOnce([
                { productName: "SocialHub", productId: "sh-1", status: "active", type: "social" },
            ]);
            mockQuery.mockResolvedValueOnce([
                { productName: "SocialHub", type: "SocialHub", status: "active", productId: null },
            ]);

            const products = await fetchTenantProducts("tenant-1");
            expect(products).toHaveLength(1);
            expect(products[0].productId).toBe("sh-1"); // ServiceInstance version
        });
    });

    describe("getProductModuleHints", () => {
        it("returns character creation hint for VideoForge", () => {
            const hint = getProductModuleHints("VideoForge");
            expect(hint).toContain("character");
        });

        it("returns social media hint for SocialHub", () => {
            const hint = getProductModuleHints("SocialHub");
            expect(hint).toContain("social media");
        });

        it("returns default hint for unknown product", () => {
            const hint = getProductModuleHints("SomeNewProduct");
            expect(hint).toContain("SomeNewProduct");
        });
    });

    describe("assembleProductPrompt", () => {
        it("returns prompt mentioning VideoForge when tenant has VideoForge", async () => {
            mockQuery.mockResolvedValueOnce([
                { productName: "VideoForge", productId: "vf-1", status: "active", type: "video" },
            ]);
            mockQuery.mockResolvedValueOnce([]);

            const result = await assembleProductPrompt("tenant-1");
            expect(result.prompt).toContain("VideoForge");
            expect(result.products).toHaveLength(1);
        });

        it("returns prompt mentioning multiple products", async () => {
            mockQuery.mockResolvedValueOnce([
                { productName: "VideoForge", productId: "vf-1", status: "active", type: "video" },
                { productName: "SocialHub", productId: "sh-1", status: "active", type: "social" },
            ]);
            mockQuery.mockResolvedValueOnce([]);

            const result = await assembleProductPrompt("tenant-1");
            expect(result.prompt).toContain("VideoForge");
            expect(result.prompt).toContain("SocialHub");
            expect(result.products).toHaveLength(2);
        });

        it("includes subscription info", async () => {
            mockQuery.mockResolvedValueOnce([]);
            mockQuery.mockResolvedValueOnce([
                { productName: "WhatsApp", type: "WhatsApp", status: "active", productId: null },
            ]);

            const result = await assembleProductPrompt("tenant-1");
            expect(result.prompt).toContain("WhatsApp");
            expect(result.products).toHaveLength(1);
        });

        it("returns base prompt even with zero products", async () => {
            mockQuery.mockResolvedValueOnce([]);
            mockQuery.mockResolvedValueOnce([]);

            const result = await assembleProductPrompt("tenant-1");
            expect(result.prompt).toContain("SuperSeller AI");
            expect(result.prompt).toContain("onboarding");
            expect(result.products).toHaveLength(0);
        });

        it("includes language matching rule", async () => {
            mockQuery.mockResolvedValueOnce([]);
            mockQuery.mockResolvedValueOnce([]);

            const result = await assembleProductPrompt("tenant-1");
            expect(result.prompt).toContain("Hebrew");
        });
    });
});
