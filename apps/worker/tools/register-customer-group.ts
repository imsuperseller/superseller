/**
 * register-customer-group.ts — One-command WhatsApp group agent onboarding
 *
 * Usage (from apps/worker/):
 *   npx tsx tools/register-customer-group.ts \
 *     --groupId "120363408376076110@g.us" \
 *     --tenantId "elite-pro-remodeling" \
 *     --agentName "SuperSeller AI" \
 *     --agentRole "Instagram Autopilot for Elite Pro Remodeling & Construction" \
 *     --language he \
 *     --context "Built for Saar Bitton & Mor Dayan. Remodeling contractor in DFW."
 *
 * What this does:
 *   1. Registers the group in group_agent_config (DB)
 *   2. Sets the WhatsApp group description
 *   3. Sends an introduction message from the agent
 *   4. Confirms everything is live
 */

import "dotenv/config";
import { query } from "../src/db/client";
import { sendText, setGroupDescription } from "../src/services/waha-client";
import { config } from "../src/config";

function parseArgs(): Record<string, string> {
    const args: Record<string, string> = {};
    const argv = process.argv.slice(2);
    for (let i = 0; i < argv.length; i += 2) {
        if (argv[i].startsWith("--")) {
            args[argv[i].slice(2)] = argv[i + 1] || "";
        }
    }
    return args;
}

function buildIntroMessage(agentName: string, agentRole: string, language: string): string {
    if (language === "he") {
        return [
            `שלום! 👋 אני *${agentName}* — הסוכן החכם של הקבוצה.`,
            "",
            `*תפקידי:* ${agentRole}`,
            "",
            "*מה אני יודע לעשות:*",
            "✅ לענות על שאלות על הפרויקטים והתוכן",
            "✅ לקבל תמונות וסרטונים ולשמור אותם אוטומטית",
            "✅ לתאם אישורים ועדכוני סטטוס",
            "✅ לזכור את כל מה שנאמר בקבוצה",
            "",
            "*איך לפנות אליי:* פשוט כתבו @superseller או /פקודה",
            "",
            "מוכן לעבוד! 🚀",
        ].join("\n");
    }

    return [
        `Hi! 👋 I'm *${agentName}* — your group AI agent.`,
        "",
        `*My role:* ${agentRole}`,
        "",
        "*What I can do:*",
        "✅ Answer questions about projects and content",
        "✅ Receive and auto-save photos & videos",
        "✅ Coordinate approvals and status updates",
        "✅ Remember everything discussed in this group",
        "",
        "*How to reach me:* Just write @superseller or /command",
        "",
        "Ready to go! 🚀",
    ].join("\n");
}

async function main() {
    const args = parseArgs();

    const required = ["groupId", "tenantId", "agentName", "agentRole"];
    const missing = required.filter((k) => !args[k]);
    if (missing.length > 0) {
        console.error(`❌ Missing required args: ${missing.map((k) => `--${k}`).join(", ")}`);
        console.error("\nUsage:");
        console.error("  npx tsx tools/register-customer-group.ts \\");
        console.error("    --groupId \"120363...@g.us\" \\");
        console.error("    --tenantId \"customer-slug\" \\");
        console.error("    --agentName \"SuperSeller AI\" \\");
        console.error("    --agentRole \"Your role description\" \\");
        console.error("    --language he \\          (optional, default: adaptive)");
        console.error("    --context \"Extra context...\"  (optional)");
        console.error("    --skipIntro              (optional, skip the intro message)");
        process.exit(1);
    }

    const { groupId, tenantId, agentName, agentRole, language, context } = args;
    const skipIntro = "skipIntro" in args;

    console.log("\n🔧 Registering WhatsApp group agent...\n");
    console.log(`  Group:    ${groupId}`);
    console.log(`  Tenant:   ${tenantId}`);
    console.log(`  Agent:    ${agentName}`);
    console.log(`  Role:     ${agentRole}`);
    console.log(`  Language: ${language || "adaptive"}`);
    console.log(`  Context:  ${context ? context.slice(0, 60) + "..." : "(none)"}`);
    console.log();

    // 1. Register in DB
    await query(
        `INSERT INTO group_agent_config
            (group_id, tenant_id, agent_name, agent_role, system_prompt_additions, allowed_phones, language)
         VALUES ($1, $2, $3, $4, $5, '{}', $6)
         ON CONFLICT (group_id) DO UPDATE SET
             tenant_id = EXCLUDED.tenant_id,
             agent_name = EXCLUDED.agent_name,
             agent_role = EXCLUDED.agent_role,
             system_prompt_additions = EXCLUDED.system_prompt_additions,
             language = EXCLUDED.language,
             updated_at = NOW()`,
        [groupId, tenantId, agentName, agentRole, context || null, language || null],
    );
    console.log("✅ Group registered in database");

    // 2. Set group description
    const description = `${agentName} — AI-powered group. Powered by SuperSeller AI.\nSend @superseller to ask the agent anything.`;
    const descOk = await setGroupDescription(groupId, description);
    console.log(descOk ? "✅ Group description updated" : "⚠️  Group description update failed (non-critical)");

    // 3. Send intro message (unless skipped)
    if (!skipIntro) {
        const intro = buildIntroMessage(agentName, agentRole, language || "en");
        const msgId = await sendText(groupId, intro);
        console.log(msgId ? "✅ Introduction message sent" : "⚠️  Intro message failed — check WAHA session");
    }

    console.log("\n🎉 Group agent is LIVE!");
    console.log("\n📋 Quick reference:");
    console.log(`  Group ID:   ${groupId}`);
    console.log(`  Tenant ID:  ${tenantId}`);
    console.log(`  Language:   ${language || "adaptive"}`);
    console.log(`  DB table:   group_agent_config`);
    console.log(`  Trigger:    @superseller or /command`);
    console.log(`  Media:      Any photo/video auto-saved to R2 + ep_incoming_assets`);
    console.log();
    console.log("ℹ️  Worker must be restarted for in-memory registry to reload:");
    console.log("  ssh root@172.245.56.50 pm2 restart tourreel-worker");

    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Registration failed:", err.message);
    process.exit(1);
});
