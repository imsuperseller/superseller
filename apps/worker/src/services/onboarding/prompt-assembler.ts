/**
 * prompt-assembler.ts — Dynamic system prompt assembly from tenant products
 *
 * Reads a tenant's ServiceInstance + Subscription records from DB
 * and builds a product-aware system prompt for the onboarding AI agent.
 *
 * Used by: group-bootstrap.ts (universal onboarding)
 */

import { query } from "../../db/client";
import { logger } from "../../utils/logger";

// ─── Types ────────────────────────────────────────────────────

export interface ProductInfo {
    productName: string;
    productId: string | null;
    status: string;
    type: string | null; // ServiceInstance.type or Subscription.subscriptionType
}

// ─── Product Module Hints ─────────────────────────────────────

const MODULE_HINTS: Record<string, string> = {
    "VideoForge": "I'll help create your AI brand character through a fun questionnaire, then generate a reveal video",
    "Winner Studio": "I'll help create your AI brand character through a fun questionnaire, then generate a reveal video",
    "Character-in-a-Box": "I'll help create your AI brand character through a fun questionnaire, then generate a reveal video",
    "SocialHub": "I'll collect your social media preferences and set up your automated content pipeline",
    "Buzz": "I'll collect your social media preferences and set up your automated content pipeline",
    "FB Bot": "I'll configure your Facebook Marketplace automation",
    "FrontDesk Voice AI": "I'll set up your AI receptionist with your business hours and greeting preferences",
    "FrontDesk": "I'll set up your AI receptionist with your business hours and greeting preferences",
    "Lead Pages": "I'll gather your brand assets and content for your lead landing pages",
    "Maps/SEO": "I'll collect your competitor info and set up Google Maps monitoring",
    "Google Maps": "I'll collect your competitor info and set up Google Maps monitoring",
    "Custom Solutions": "I'll work with you on your custom project requirements",
};

/**
 * Get onboarding module hint for a product name.
 * Returns a human-friendly description of what the agent will do for that product.
 */
export function getProductModuleHints(productName: string): string {
    // Check exact match first
    if (MODULE_HINTS[productName]) {
        return MODULE_HINTS[productName];
    }

    // Check case-insensitive partial match
    const lower = productName.toLowerCase();
    for (const [key, hint] of Object.entries(MODULE_HINTS)) {
        if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
            return hint;
        }
    }

    // Default
    return `I'll help you get started with ${productName}`;
}

// ─── Fetch Tenant Products ────────────────────────────────────

/**
 * Fetch all active products for a tenant from ServiceInstance + Subscription tables.
 * Deduplicates by productName (ServiceInstance takes priority).
 */
export async function fetchTenantProducts(tenantId: string): Promise<ProductInfo[]> {
    // 1. Query ServiceInstance records
    const serviceInstances = await query<{
        productName: string;
        productId: string | null;
        status: string;
        type: string | null;
    }>(
        `SELECT "productName", "productId", status, type
         FROM "ServiceInstance"
         WHERE "tenantId" = $1 AND status IN ('active', 'pending_setup')`,
        [tenantId],
    );

    // 2. Query Subscription records (joined through TenantUser)
    const subscriptions = await query<{
        productName: string;
        type: string | null;
        status: string;
        productId: null;
    }>(
        `SELECT s."subscriptionType" as "productName",
                s."subscriptionType" as type,
                s.status,
                NULL as "productId"
         FROM "Subscription" s
         JOIN "TenantUser" tu ON s."userId" = tu."userId"
         WHERE tu."tenantId" = $1 AND s.status = 'active'`,
        [tenantId],
    );

    // 3. Combine and deduplicate (ServiceInstance wins)
    const seen = new Set<string>();
    const products: ProductInfo[] = [];

    for (const si of serviceInstances) {
        seen.add(si.productName);
        products.push({
            productName: si.productName,
            productId: si.productId,
            status: si.status,
            type: si.type,
        });
    }

    for (const sub of subscriptions) {
        if (!seen.has(sub.productName)) {
            seen.add(sub.productName);
            products.push({
                productName: sub.productName,
                productId: null,
                status: sub.status,
                type: sub.type,
            });
        }
    }

    logger.info({
        msg: "Fetched tenant products",
        tenantId,
        count: products.length,
        products: products.map((p) => p.productName),
    });

    return products;
}

// ─── Assemble Product Prompt ──────────────────────────────────

/**
 * Build a dynamic system prompt based on a tenant's active products.
 * Returns the prompt string and the list of products found.
 */
export async function assembleProductPrompt(
    tenantId: string,
): Promise<{ prompt: string; products: ProductInfo[] }> {
    const products = await fetchTenantProducts(tenantId);

    const sections: string[] = [
        "## Role",
        "You are SuperSeller AI, a business onboarding specialist.",
        "Your job is to guide this customer through setting up their products and services.",
        "",
    ];

    // Product awareness
    if (products.length > 0) {
        sections.push("## Active Products & Services");
        sections.push("This customer has the following active products/services:");
        for (const p of products) {
            sections.push(`- *${p.productName}* (${p.status})`);
        }
        sections.push("");

        // Module hints for each product
        sections.push("## Onboarding Modules");
        sections.push("For each product, here is what you will help the customer with:");
        for (const p of products) {
            const hint = getProductModuleHints(p.productName);
            sections.push(`- *${p.productName}*: ${hint}`);
        }
        sections.push("");
    } else {
        sections.push("## Products");
        sections.push("This customer does not have specific products configured yet.");
        sections.push("Help them understand what SuperSeller AI offers and guide them to the right products.");
        sections.push("");
    }

    // Rules
    sections.push("## Rules");
    sections.push("- Keep responses WhatsApp-friendly: short paragraphs, *bold* for emphasis, bullet points");
    sections.push("- Never share pricing, internal details, API keys, or vendor information");
    sections.push("- Focus on one topic at a time during onboarding");
    sections.push("- Confirm with the customer before proceeding to the next step");
    sections.push("- If you don't know something, say so honestly");
    sections.push("");

    // Language
    sections.push("## Language");
    sections.push("Detect the language of each customer message and respond in that same language. Hebrew messages get Hebrew responses. English messages get English responses.");
    sections.push("");
    sections.push("Mixed-language handling: If a message mixes Hebrew and English (common with Israeli customers using English brand names or technical terms), respond in the majority language of the message.");
    sections.push("");
    sections.push("Technical terms in Hebrew: When responding in Hebrew, keep widely-known English technical/product terms in English (e.g., AI, WhatsApp, video, branding). Translate terms only when a natural Hebrew equivalent is commonly used.");
    sections.push("");
    sections.push("Hebrew formatting: When writing in Hebrew, use right-to-left natural text. WhatsApp handles RTL rendering. Use the same formatting conventions (*bold*, bullet points) in both languages.");
    sections.push("");
    sections.push("Tone consistency: Maintain the same professional-but-friendly tone in both Hebrew and English. Do not adopt a different register or formality level based on language.");
    sections.push("");
    sections.push("First message: Your first message in a new group should be in English (default). Switch to the customer's language from their first reply onward.");

    const prompt = sections.join("\n");

    return { prompt, products };
}
