/**
 * Character-in-a-Box — WhatsApp Group Bootstrap
 *
 * Creates a branded WhatsApp group for client onboarding,
 * adds the client, and registers the AI questionnaire agent.
 *
 * Triggered by: POST /api/character-pipeline/start
 * Uses: waha-client (group mgmt), group-agent (agent registration)
 */

import { query, queryOne } from "../../db/client";
import { createGroup, setGroupDescription, addGroupParticipant, sendText, phoneToChatId } from "../waha-client";
import { registerGroup } from "../group-agent";
import { createPipelineRun, updatePipelineRun } from "../pipeline-run";
import { config } from "../../config";
import { logger } from "../../utils/logger";

export interface BootstrapResult {
    groupId: string;
    pipelineRunId: string;
    tenantId: string;
    tenantName: string;
}

const QUESTIONNAIRE_SYSTEM_PROMPT = `You are a Character Creation Specialist for SuperSeller AI.

## Your Mission
You are conducting a brand character questionnaire for a new client. Your goal is to understand their brand deeply enough to create an AI character that represents their business.

## Questionnaire Flow
Ask these questions ONE AT A TIME, conversationally. Wait for each answer before asking the next.

1. **Brand Personality**: "How would you describe your brand's personality? Is it professional and serious, friendly and approachable, bold and edgy, or something else? Give me 3-5 words that capture the vibe."

2. **Visual Style**: "What visual style fits your brand? Think colors, mood, setting. For example: clean and modern, rustic and warm, high-energy and vibrant. Share any references — photos of your work, competitors you admire, even movie scenes that capture the feel."

3. **Target Audience**: "Who are your ideal customers? What do they care about? What problem do you solve for them?"

4. **Business Scenarios**: "Give me 3 scenarios where your brand character would appear in video content. For example: greeting a customer at a job site, presenting results in a studio, walking through a neighborhood. Think about where your business happens."

5. **Anything Else**: "Is there anything else about your brand that's important? Taglines, mascots, specific colors that are non-negotiable, things you definitely DON'T want?"

## Rules
- Ask ONE question at a time — don't overwhelm
- If an answer is vague, ask a follow-up: "Can you give me a specific example?"
- Use the client's language — mirror their energy
- After all questions answered, summarize what you've collected and ask for confirmation
- When confirmed, respond with exactly: "✅ CHARACTER BRIEF CONFIRMED — generating your character now!"
- Keep it WhatsApp-friendly: short paragraphs, *bold* for emphasis, bullet points
- Be enthusiastic but professional — this is their brand identity`;

/**
 * Bootstrap a Character-in-a-Box WhatsApp group for a tenant.
 *
 * 1. Looks up tenant + brand in DB
 * 2. Creates WhatsApp group via WAHA
 * 3. Adds client phone to group
 * 4. Registers AI agent in group_agent_config
 * 5. Sends welcome message
 * 6. Creates PipelineRun record
 */
export async function bootstrapCharacterGroup(
    tenantId: string,
    clientPhone: string,
): Promise<BootstrapResult> {
    const start = Date.now();

    // 1. Fetch tenant + brand
    const tenant = await queryOne<{
        id: string;
        name: string;
        slug: string;
    }>(`SELECT id, name, slug FROM "Tenant" WHERE id = $1`, [tenantId]);

    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const brand = await queryOne<{
        id: string;
        logo_url: string | null;
        primary_color: string;
        accent_color: string;
        tagline: string | null;
    }>(
        `SELECT id, "logoUrl" as logo_url, "primaryColor" as primary_color, "accentColor" as accent_color, tagline FROM "TenantBrand" WHERE "tenantId" = $1`,
        [tenantId],
    );

    // 2. Create PipelineRun
    const pipelineRunId = await createPipelineRun({
        tenantId,
        pipelineType: "character-in-a-box",
        status: "running",
        inputJson: JSON.stringify({
            clientPhone,
            tenantName: tenant.name,
            step: "group-bootstrap",
        }),
    });

    try {
        // 3. Create WhatsApp group
        const groupName = `${tenant.name} — Character Studio`;
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
            msg: "Character group created",
            groupId,
            tenantId,
            tenantName: tenant.name,
        });

        // 4. Set group description
        await setGroupDescription(
            groupId,
            `🎬 Character Creation Studio for ${tenant.name}\nPowered by SuperSeller AI\n\nYour AI brand character is being created here.`,
            wahaTarget,
        );

        // 5. Register AI agent in group_agent_config
        await registerGroup({
            groupId,
            tenantId,
            agentName: "Character Creator",
            agentRole: "Brand character questionnaire specialist",
            systemPromptAdditions: QUESTIONNAIRE_SYSTEM_PROMPT,
            allowedPhones: [], // Allow all group members
            language: undefined, // Match user's language
        });

        // 6. Store group mapping for pipeline tracking
        await query(
            `INSERT INTO character_pipeline_state (tenant_id, group_id, client_phone, pipeline_run_id, stage, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'questionnaire', NOW(), NOW())
             ON CONFLICT (tenant_id) DO UPDATE SET
                group_id = EXCLUDED.group_id,
                client_phone = EXCLUDED.client_phone,
                pipeline_run_id = EXCLUDED.pipeline_run_id,
                stage = EXCLUDED.stage,
                updated_at = NOW()`,
            [tenantId, groupId, clientPhone, pipelineRunId],
        );

        // 7. Send welcome message
        const welcomeMsg = [
            `👋 *Welcome to your Character Studio, ${tenant.name}!*`,
            "",
            "I'm your AI Character Creator. Over the next few minutes, I'll ask you some questions about your brand — personality, visual style, target audience, and scenarios where your character will appear.",
            "",
            "Your answers will be used to generate a unique AI brand character for your business. You'll receive a branded *Character Reveal* video with your character in 5 different environments.",
            "",
            "Ready? Let's start! 🎬",
            "",
            "*How would you describe your brand's personality?*",
            "Is it professional and serious, friendly and approachable, bold and edgy, or something else?",
            "Give me 3-5 words that capture the vibe.",
        ].join("\n");

        await sendText(groupId, welcomeMsg, wahaTarget);

        // 8. Update PipelineRun
        const durationMs = Date.now() - start;
        await updatePipelineRun(pipelineRunId, {
            status: "running",
            outputJson: JSON.stringify({
                groupId,
                step: "group-bootstrap-complete",
                nextStep: "questionnaire",
            }),
            durationMs,
        });

        logger.info({
            msg: "Character group bootstrap complete",
            groupId,
            tenantId,
            pipelineRunId,
            durationMs,
        });

        return {
            groupId,
            pipelineRunId,
            tenantId,
            tenantName: tenant.name,
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
