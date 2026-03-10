/**
 * Doc Integrity Scanner — autonomous agent that detects stale/wrong values
 * in documentation and config files before they cause hours of debugging.
 *
 * Runs daily on RackNerd as part of the worker scheduler.
 * Stores results in health_checks table (service='doc-integrity').
 * Alerts via WhatsApp only for NEW findings (deduped against previous run in Redis).
 */

import { config } from "../../config";
import { query } from "../../db/client";
import { redisConnection } from "../../queue/connection";
import { logger } from "../../utils/logger";
import { sendText, phoneToChatId } from "../waha-client";
import * as fs from "fs";
import * as path from "path";

// ─── Types ───

export interface Finding {
    file: string;
    line: number;
    pattern: string;
    correctValue: string;
    context: string;
    severity: "critical" | "warning";
}

export interface ScanResult {
    status: "clean" | "issues_found";
    findings: Finding[];
    filesScanned: number;
    checkedAt: Date;
}

// ─── Banned Values ───
// These are values that were historically wrong and caused debugging pain.
// If any appear in docs/config, it means someone re-introduced a stale value.

const BANNED_VALUES: Array<{
    pattern: string;
    correct: string;
    context: string;
    severity: "critical" | "warning";
}> = [
    { pattern: "uad.garage.doors@gmail.com", correct: "1shaifriedman@gmail.com", context: "UAD Facebook email", severity: "critical" },
    { pattern: "interactive_login.js", correct: "session-login.js", context: "FB login script name", severity: "warning" },
    { pattern: "manual-login-uad.js", correct: "session-login.js", context: "FB login script name", severity: "warning" },
    { pattern: "internalBoss", correct: "personal", context: "WAHA session name", severity: "critical" },
    { pattern: "7Te1UudOE54aU79xrZ", correct: "[REDACTED]", context: "Old wrong RackNerd password", severity: "critical" },
    { pattern: "cb711f74a221be35a20df8e26e722e04", correct: "6bb5a5733b79dc30f42ea4ab6a95b9a0", context: "Old Kie.ai key", severity: "critical" },
    { pattern: "${REDIS_PASSWORD}", correct: "[actual value]", context: "Unexpanded env var", severity: "critical" },
    { pattern: "${WAHA_API_KEY}", correct: "[actual value]", context: "Unexpanded env var", severity: "critical" },
];

// ─── Historical Context Markers ───
// Lines containing these tokens are documenting history, not asserting current truth.

const HISTORY_MARKERS = [
    "→",
    "changed to",
    "was ",
    "corrected to",
    "replaced",
    "deprecated",
    "old:",
    "wrong:",
    "FINAL:",
];

// ─── Scan Directories & Extensions ───

const SCAN_ROOTS = ["/opt/tourreel-worker/", "/opt/fb-marketplace-bot/"];
const SCAN_EXTENSIONS = new Set([".md", ".json"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "archives", ".next", "package-lock.json"]);

// ─── Helpers ───

function isHistoricalLine(line: string): boolean {
    const lower = line.toLowerCase();
    return HISTORY_MARKERS.some((m) => lower.includes(m.toLowerCase()));
}

function collectFiles(root: string): string[] {
    const files: string[] = [];
    if (!fs.existsSync(root)) return files;

    try {
        const entries = fs.readdirSync(root, { withFileTypes: true, recursive: true } as any) as fs.Dirent[];
        for (const entry of entries) {
            if (!entry.isFile()) continue;

            const ext = path.extname(entry.name);
            if (!SCAN_EXTENSIONS.has(ext)) continue;

            // Skip package-lock.json and similar large generated files
            if (entry.name === "package-lock.json" || entry.name === "pnpm-lock.yaml") continue;

            // Build full path — Node 18.17+ recursive readdirSync gives parentPath
            const parentPath = (entry as any).parentPath || (entry as any).path || "";
            const fullPath = path.join(parentPath, entry.name);

            // Check if any ancestor dir is in skip list
            const relPath = path.relative(root, fullPath);
            const parts = relPath.split(path.sep);
            if (parts.some((p) => SKIP_DIRS.has(p))) continue;

            files.push(fullPath);
        }
    } catch (err: any) {
        logger.warn({ msg: "doc-integrity: failed to walk directory", root, error: err.message });
    }

    return files;
}

function scanFileLines(filePath: string): string[] {
    try {
        // Skip files larger than 1MB — they're not docs
        const stat = fs.statSync(filePath);
        if (stat.size > 1_000_000) return [];
        return fs.readFileSync(filePath, "utf-8").split("\n");
    } catch {
        return [];
    }
}

// ─── Check 1: Banned Values ───

function checkBannedValues(filePath: string, lines: string[]): Finding[] {
    const findings: Finding[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isHistoricalLine(line)) continue;

        for (const banned of BANNED_VALUES) {
            if (line.includes(banned.pattern)) {
                findings.push({
                    file: filePath,
                    line: i + 1,
                    pattern: banned.pattern,
                    correctValue: banned.correct,
                    context: banned.context,
                    severity: banned.severity,
                });
            }
        }
    }

    return findings;
}

// ─── Check 2: Cross-Reference Validation (bot-config.json) ───

interface BotConfigProduct {
    name?: string;
    phone?: string;
    category?: string;
    [key: string]: unknown;
}

function loadBotConfig(): Record<string, BotConfigProduct> | null {
    const configPaths = [
        "/opt/fb-marketplace-bot/bot-config.json",
        "/opt/tourreel-worker/fb-marketplace-lister/deploy-package/bot-config.json",
    ];

    for (const p of configPaths) {
        try {
            const raw = fs.readFileSync(p, "utf-8");
            const parsed = JSON.parse(raw);
            // bot-config.json has a "products" key with product entries
            if (parsed.products && typeof parsed.products === "object") {
                return parsed.products;
            }
            // Or it may be a flat object of products
            return parsed;
        } catch {
            continue;
        }
    }

    return null;
}

function checkBotConfigCrossRef(filePath: string, lines: string[], products: Record<string, BotConfigProduct>): Finding[] {
    // Only check markdown files for cross-reference issues
    if (!filePath.endsWith(".md")) return [];

    const findings: Finding[] = [];

    for (const [productKey, product] of Object.entries(products)) {
        if (!product || typeof product !== "object") continue;

        const phone = product.phone;
        const category = product.category;
        const productName = product.name || productKey;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (isHistoricalLine(line)) continue;

            // Check phone number contradictions:
            // Only flag if the line mentions this product by name AND contains a different phone
            const lineLower = line.toLowerCase();
            const productNameLower = productName.toLowerCase();
            const productKeyLower = productKey.toLowerCase();

            if (!lineLower.includes(productNameLower) && !lineLower.includes(productKeyLower)) continue;

            // Phone check: if line mentions a phone-like pattern that differs from config
            if (phone) {
                const phoneDigits = phone.replace(/[^0-9]/g, "");
                const phonePatterns = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
                for (const found of phonePatterns) {
                    const foundDigits = found.replace(/[^0-9]/g, "");
                    if (foundDigits.length >= 10 && phoneDigits.length >= 10 && foundDigits !== phoneDigits) {
                        findings.push({
                            file: filePath,
                            line: i + 1,
                            pattern: found,
                            correctValue: phone,
                            context: `Phone mismatch for ${productName} (bot-config.json is SoT)`,
                            severity: "warning",
                        });
                    }
                }
            }

            // Category check: if line asserts a category for this product that differs
            if (category) {
                const categoryLower = category.toLowerCase();
                // Look for "category: X" or "category X" patterns near the product name
                const catMatch = line.match(/category[:\s]+["']?([a-zA-Z\s&]+)["']?/i);
                if (catMatch) {
                    const foundCat = catMatch[1].trim().toLowerCase();
                    if (foundCat && foundCat !== categoryLower && !isHistoricalLine(line)) {
                        findings.push({
                            file: filePath,
                            line: i + 1,
                            pattern: catMatch[0],
                            correctValue: `category: ${category}`,
                            context: `Category mismatch for ${productName} (bot-config.json is SoT)`,
                            severity: "warning",
                        });
                    }
                }
            }
        }
    }

    return findings;
}

// ─── Check 3: Stale Script References ───

function checkStaleScriptRefs(filePath: string, lines: string[]): Finding[] {
    // Only check markdown files
    if (!filePath.endsWith(".md")) return [];

    const findings: Finding[] = [];
    // Match patterns like: node something.js, npx tsx something.ts, ts-node something.ts
    const scriptPattern = /(?:node|npx\s+tsx|ts-node)\s+([^\s;|&"'`]+\.(js|ts))/g;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isHistoricalLine(line)) continue;

        // Skip code fence language markers and comments
        if (line.trim().startsWith("```")) continue;

        let match: RegExpExecArray | null;
        scriptPattern.lastIndex = 0;

        while ((match = scriptPattern.exec(line)) !== null) {
            const scriptRef = match[1];

            // Resolve relative to the markdown file's directory or known roots
            const candidates: string[] = [];

            // If it's a relative path, resolve from the file's dir
            const mdDir = path.dirname(filePath);
            candidates.push(path.resolve(mdDir, scriptRef));

            // Also try from scan roots
            for (const root of SCAN_ROOTS) {
                candidates.push(path.resolve(root, scriptRef));
            }

            // If path is absolute, check directly
            if (path.isAbsolute(scriptRef)) {
                candidates.push(scriptRef);
            }

            const exists = candidates.some((c) => {
                try {
                    return fs.existsSync(c);
                } catch {
                    return false;
                }
            });

            if (!exists) {
                findings.push({
                    file: filePath,
                    line: i + 1,
                    pattern: scriptRef,
                    correctValue: "[script not found on disk]",
                    context: "Referenced script does not exist",
                    severity: "warning",
                });
            }
        }
    }

    return findings;
}

// ─── Redis Dedup (only alert on NEW findings) ───

const REDIS_KEY = "doc-integrity:previous-findings";
const REDIS_TTL = 86400 * 7; // 7 days

function findingKey(f: Finding): string {
    return `${f.file}:${f.line}:${f.pattern}`;
}

async function getPreviousFindings(): Promise<Set<string>> {
    try {
        const raw = await redisConnection.get(REDIS_KEY);
        if (!raw) return new Set();
        const keys: string[] = JSON.parse(raw);
        return new Set(keys);
    } catch {
        return new Set();
    }
}

async function storeCurrentFindings(findings: Finding[]): Promise<void> {
    try {
        const keys = findings.map(findingKey);
        await redisConnection.set(REDIS_KEY, JSON.stringify(keys), "EX", REDIS_TTL);
    } catch (err: any) {
        logger.warn({ msg: "doc-integrity: failed to store findings in Redis", error: err.message });
    }
}

// ─── Store in health_checks ───

async function storeHealthCheck(result: ScanResult): Promise<void> {
    try {
        await query(
            `INSERT INTO health_checks (service, status, details, response_ms, checked_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                "doc-integrity",
                result.status === "clean" ? "ok" : "degraded",
                JSON.stringify({
                    findingsCount: result.findings.length,
                    filesScanned: result.filesScanned,
                    criticalCount: result.findings.filter((f) => f.severity === "critical").length,
                    warningCount: result.findings.filter((f) => f.severity === "warning").length,
                    findings: result.findings.slice(0, 50), // Cap stored findings
                }),
                0,
                result.checkedAt,
            ]
        );
    } catch (err: any) {
        logger.warn({ msg: "doc-integrity: failed to store health check", error: err.message });
    }
}

// ─── WhatsApp Alert ───

async function alertNewFindings(newFindings: Finding[]): Promise<void> {
    if (newFindings.length === 0) return;

    const phone = config.healthMonitor.alertPhone;
    if (!phone) {
        logger.info("doc-integrity: no alert phone configured, skipping WhatsApp alert");
        return;
    }

    const criticals = newFindings.filter((f) => f.severity === "critical");
    const warnings = newFindings.filter((f) => f.severity === "warning");

    let msg = `🔍 *Doc Integrity Scanner* — ${newFindings.length} new issue${newFindings.length > 1 ? "s" : ""}\n\n`;

    if (criticals.length > 0) {
        msg += `🚨 *CRITICAL (${criticals.length}):*\n`;
        for (const f of criticals.slice(0, 10)) {
            const shortFile = f.file.replace("/opt/tourreel-worker/", "").replace("/opt/fb-marketplace-bot/", "fb-bot/");
            msg += `• ${shortFile}:${f.line} — ${f.context}\n  Found: \`${f.pattern}\`\n  Should be: \`${f.correctValue}\`\n`;
        }
        msg += "\n";
    }

    if (warnings.length > 0) {
        msg += `⚠️ *Warnings (${warnings.length}):*\n`;
        for (const f of warnings.slice(0, 10)) {
            const shortFile = f.file.replace("/opt/tourreel-worker/", "").replace("/opt/fb-marketplace-bot/", "fb-bot/");
            msg += `• ${shortFile}:${f.line} — ${f.context}\n`;
        }
    }

    if (newFindings.length > 20) {
        msg += `\n... and ${newFindings.length - 20} more. Check health_checks table for full list.`;
    }

    try {
        await sendText(phoneToChatId(phone), msg);
    } catch (err: any) {
        logger.warn({ msg: "doc-integrity: failed to send WhatsApp alert", error: err.message });
    }
}

// ─── Main Entry Point ───

export async function runDocIntegrityScanner(): Promise<ScanResult> {
    const startTime = Date.now();
    logger.info("doc-integrity: starting scan");

    // Collect all files to scan
    const allFiles: string[] = [];
    for (const root of SCAN_ROOTS) {
        allFiles.push(...collectFiles(root));
    }

    logger.info({ msg: "doc-integrity: files collected", count: allFiles.length });

    // Load bot-config.json for cross-reference validation
    const botProducts = loadBotConfig();

    // Run all checks
    const allFindings: Finding[] = [];

    for (const filePath of allFiles) {
        const lines = scanFileLines(filePath);
        if (lines.length === 0) continue;

        // Check 1: Banned values
        allFindings.push(...checkBannedValues(filePath, lines));

        // Check 2: Cross-reference validation
        if (botProducts) {
            allFindings.push(...checkBotConfigCrossRef(filePath, lines, botProducts));
        }

        // Check 3: Stale script references
        allFindings.push(...checkStaleScriptRefs(filePath, lines));
    }

    // Dedup: determine which findings are new
    const previousKeys = await getPreviousFindings();
    const newFindings = allFindings.filter((f) => !previousKeys.has(findingKey(f)));

    // Store current findings for next run's dedup
    await storeCurrentFindings(allFindings);

    // Build result
    const result: ScanResult = {
        status: allFindings.length === 0 ? "clean" : "issues_found",
        findings: allFindings,
        filesScanned: allFiles.length,
        checkedAt: new Date(),
    };

    // Store in health_checks table
    await storeHealthCheck(result);

    // Alert only for new findings
    if (newFindings.length > 0) {
        await alertNewFindings(newFindings);
    }

    const elapsed = Date.now() - startTime;
    logger.info({
        msg: "doc-integrity: scan complete",
        status: result.status,
        totalFindings: allFindings.length,
        newFindings: newFindings.length,
        filesScanned: allFiles.length,
        elapsedMs: elapsed,
    });

    return result;
}
