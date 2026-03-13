/**
 * group-bootstrap.ts — Universal WhatsApp group creation + agent registration
 *
 * Creates a branded WhatsApp group for customer onboarding,
 * registers a product-aware AI agent, and sends a personalized welcome.
 *
 * Replaces the narrow character-pipeline/group-bootstrap.ts with a universal version
 * that works for ANY product mix.
 *
 * Triggered by: POST /api/onboarding/start (future)
 * Uses: prompt-assembler (product prompt), waha-client (group mgmt),
 *       group-agent (agent registration), pipeline-run (tracking)
 */

import { queryOne } from "../../db/client";
import {
    createGroup,
    setGroupIcon,
    setGroupDescription,
    sendText,
} from "../waha-client";
import { registerGroup } from "../group-agent";
import { createPipelineRun, updatePipelineRun } from "../pipeline-run";
import { config } from "../../config";
import { logger } from "../../utils/logger";
import { assembleProductPrompt, getProductModuleHints, type ProductInfo } from "./prompt-assembler";

// ─── Types ────────────────────────────────────────────────────

export interface OnboardingBootstrapResult {
    groupId: string;
    pipelineRunId: string;
    tenantId: string;
    tenantName: string;
    products: ProductInfo[];
}

// ─── Main Bootstrap Function ──────────────────────────────────

/**
 * Bootstrap a universal onboarding WhatsApp group for a tenant.
 *
 * 1. Fetches tenant + brand from DB
 * 2. Assembles product-aware system prompt
 * 3. Creates WhatsApp group via WAHA
 * 4. Sets group icon (from brand logo) and description (with product list)
 * 5. Registers AI agent with product-aware prompt
 * 6. Sends personalized welcome message listing products
 * 7. Tracks via PipelineRun
 */
export async function bootstrapOnboardingGroup(
    tenantId: string,
    clientPhone: string,
): Promise<OnboardingBootstrapResult> {
    const start = Date.now();

    // 1. Fetch tenant
    const tenant = await queryOne<{
        id: string;
        name: string;
        slug: string;
    }>(`SELECT id, name, slug FROM "Tenant" WHERE id = $1`, [tenantId]);

    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    // 2. Fetch brand
    const brand = await queryOne<{
        id: string;
        logo_url: string | null;
        primary_color: string | null;
        accent_color: string | null;
        tagline: string | null;
    }>(
        `SELECT id, "logoUrl" as logo_url, "primaryColor" as primary_color, "accentColor" as accent_color, tagline FROM "Brand" WHERE "tenantId" = $1`,
        [tenantId],
    );

    // 3. Assemble product prompt
    const { prompt: productPrompt, products } = await assembleProductPrompt(tenantId);

    // 4. Create PipelineRun
    const pipelineRunId = await createPipelineRun({
        tenantId,
        pipelineType: "customer-onboarding",
        status: "running",
        inputJson: {
            clientPhone,
            tenantName: tenant.name,
            products: products.map((p) => p.productName),
            step: "group-bootstrap",
        },
    });

    try {
        // 5. Create WhatsApp group
        const groupName = `${tenant.name} \u2014 SuperSeller AI`;
        const wahaTarget = {
            session: config.wahaSessions.biz,
        };

        const groupId = await createGroup({
            name: groupName,
            participants: [clientPhone],
            target: wahaTarget,
        });

        if (!groupId) {
            throw new Error("Failed to create WhatsApp group via WAHA");
        }

        logger.info({
            msg: "Onboarding group created",
            groupId,
            tenantId,
            tenantName: tenant.name,
            products: products.map((p) => p.productName),
        });

        // 6. Set group icon (non-fatal if fails)
        if (brand?.logo_url) {
            const iconSet = await setGroupIcon(groupId, brand.logo_url, wahaTarget);
            if (!iconSet) {
                logger.warn({
                    msg: "Failed to set group icon",
                    groupId,
                    logoUrl: brand.logo_url,
                });
            }
        }

        // 7. Set group description
        const productList = products.map((p) => `- ${p.productName}`).join("\n");
        const description = [
            `${tenant.name} \u2014 Powered by SuperSeller AI`,
            "",
            products.length > 0 ? `Active services:\n${productList}` : "Getting started with SuperSeller AI",
        ].join("\n");

        await setGroupDescription(groupId, description, wahaTarget);

        // 8. Register AI agent
        await registerGroup({
            groupId,
            tenantId,
            agentName: "SuperSeller AI",
            agentRole: "Universal business onboarding assistant",
            systemPromptAdditions: productPrompt,
            allowedPhones: [], // Allow all group members
            language: undefined, // Match user's language
        });

        // 9. Send welcome message
        const productLines = products.map(
            (p) => `- *${p.productName}*: ${getProductModuleHints(p.productName)}`,
        );

        const welcomeMsg = [
            `*Welcome to SuperSeller AI, ${tenant.name}!*`,
            "",
            "I'm your dedicated AI assistant. Here's what I'll help you with:",
            "",
            ...(productLines.length > 0
                ? productLines
                : ["- Getting your business set up with the right tools"]),
            "",
            "Let's get started! I'll walk you through setup one step at a time.",
            "",
            "What would you like to begin with?",
        ].join("\n");

        await sendText(groupId, welcomeMsg, wahaTarget);

        // 10. Update PipelineRun
        const durationMs = Date.now() - start;
        await updatePipelineRun(pipelineRunId, {
            status: "running", // Onboarding continues beyond bootstrap
            outputJson: {
                groupId,
                step: "group-bootstrap-complete",
                products: products.map((p) => p.productName),
            },
            durationMs,
        });

        logger.info({
            msg: "Onboarding group bootstrap complete",
            groupId,
            tenantId,
            pipelineRunId,
            products: products.map((p) => p.productName),
            durationMs,
        });

        return {
            groupId,
            pipelineRunId,
            tenantId,
            tenantName: tenant.name,
            products,
        };
    } catch (err: any) {
        await updatePipelineRun(pipelineRunId, {
            status: "failed",
            errorMessage: err.message,
            durationMs: Date.now() - start,
        });
        throw err;
    }
}
