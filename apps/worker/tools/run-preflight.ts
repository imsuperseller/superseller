/**
 * Pre-flight checks before a full smoke test. Runs diagnostics + dry-run.
 * Zero or minimal Kie credits (--free = zero).
 *
 * Usage: cd apps/worker && npx tsx tools/run-preflight.ts [JOB_ID]
 *
 * With --free: verify-infra + verify-ffmpeg + dry-run --free (no API calls)
 * Without: also runs verify-ai + dry-run with Gemini (cheap)
 */
import { execSync } from "child_process";
import path from "path";

const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const flags = process.argv.slice(2).filter((a) => a.startsWith("-"));
const JOB_ID = process.env.JOB_ID || args[0];
const FREE = flags.includes("--free");

const ROOT = path.resolve(__dirname, "..");

function run(name: string, cmd: string) {
    console.log("\n---", name, "---");
    try {
        execSync(cmd, { cwd: ROOT, stdio: "inherit" });
    } catch (e: any) {
        console.error(name, "failed:", e.message);
        process.exit(1);
    }
}

async function main() {
    console.log("\n=== PREFLIGHT (before smoke test) ===\n");
    console.log("Job:", JOB_ID || "(set JOB_ID=xxx)");
    console.log("Mode:", FREE ? "free (no API)" : "with Gemini (cheap)\n");

    run("verify-infra", "npx tsx tools/diagnostics/verify-infra.ts");
    run("verify-ffmpeg", "npx tsx tools/diagnostics/verify-ffmpeg.ts");

    if (!FREE) {
        run("verify-ai", "npx tsx tools/diagnostics/verify-ai.ts");
    }

    if (JOB_ID) {
        const dryFlags = FREE ? "--free" : "";
        run("dry-run", `npx tsx tools/dry-run-pipeline.ts ${dryFlags} ${JOB_ID}`);
    } else {
        console.log("\n--- dry-run (skipped, no JOB_ID) ---");
        console.log("Set JOB_ID=xxx to validate pipeline for an existing job.");
    }

    console.log("\n=== PREFLIGHT COMPLETE ===\n");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
