/**
 * 1-clip validation BEFORE full smoke. Validates opening shot (no collage, front-of-house).
 * Run this before expensive MAX_CLIPS=3 smoke.
 *
 * Usage:
 * 1. Terminal 1: MAX_CLIPS=1 npx tsx src/index.ts   # Worker with 1 clip only
 * 2. Terminal 2: npx tsx tools/run-1clip-validation.ts
 *
 * Checks: preflight passes, job completes, opening is single shot (not collage).
 * If pass → run full smoke with MAX_CLIPS=3.
 */
import { execSync } from "child_process";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

function run(name: string, cmd: string): boolean {
    console.log("\n---", name, "---");
    try {
        execSync(cmd, { cwd: ROOT, stdio: "inherit" });
        return true;
    } catch (e: any) {
        console.error(name, "failed:", e.message);
        return false;
    }
}

async function main() {
    console.log("\n=== 1-CLIP VALIDATION (before full smoke) ===\n");
    console.log("Validates: opening photo selection, Nano Banana opening, Kling single clip.");
    console.log("No collage, front-of-house start. Cost: 1 Nano + 1 Kling (~$0.10 vs ~$0.30 for 3 clips).\n");

    console.log("⚠️  Ensure worker is running with MAX_CLIPS=1:");
    console.log("   MAX_CLIPS=1 npx tsx src/index.ts");
    console.log("   (If you see 3 clips, .env may override. Remove MAX_CLIPS from .env files.)\n");

    if (!run("preflight --free", "npx tsx tools/run-preflight.ts --free")) {
        process.exit(1);
    }

    console.log("\n--- Creating 1-clip job (run-smoke) ---");
    console.log("Ensure worker is running (PORT=3001 when site on 3002; default 3002 when worker-only). MAX_CLIPS=1.\n");

    if (!run("smoke (1 clip)", "npx tsx tools/run-smoke.ts")) {
        process.exit(1);
    }

    console.log("\n=== 1-CLIP VALIDATION COMPLETE ===\n");
    console.log("Manually verify the output video:");
    console.log("  - Opening is SINGLE shot (realtor in front-of-house), NOT collage");
    console.log("  - No visible transitions within the clip");
    console.log("\nIf pass → set MAX_CLIPS=3, restart worker, run full smoke.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
