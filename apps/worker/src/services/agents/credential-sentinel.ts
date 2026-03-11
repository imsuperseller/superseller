/**
 * Credential Sentinel — Autonomous credential drift detector
 *
 * Runs every 6 hours on the RackNerd worker. Validates:
 * 1. Cross-file consistency (matching keys across .env files)
 * 2. Credential liveness (API endpoints respond)
 * 3. Known-bad value detection (unexpanded vars, old passwords)
 * 4. Ownership validation (correct Telnyx keys per service)
 *
 * Results stored in health_checks table, critical issues alert via WhatsApp.
 */

import { config } from "../../config";
import { query } from "../../db/client";
import { redisConnection } from "../../queue/connection";
import { logger } from "../../utils/logger";
import { sendText, phoneToChatId } from "../waha-client";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SentinelIssue {
  severity: "critical" | "warning";
  file: string;
  key: string;
  message: string;
}

export interface SentinelResult {
  status: "clean" | "drift" | "critical";
  issues: SentinelIssue[];
  checkedAt: Date;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENV_FILES = [
  "/opt/tourreel-worker/apps/worker/.env",
  "/opt/fb-marketplace-bot/.env",
];

const FB_BOT_CONFIG = "/opt/fb-marketplace-bot/bot-config.json";

/** Keys that MUST match between worker .env and FB bot .env when both exist */
const SHARED_KEYS = [
  "DATABASE_URL",
  "WAHA_API_KEY",
  "WAHA_URL",
];

/** Values that should NEVER appear in any config file */
const KNOWN_BAD_VALUES: Array<{ value: string; reason: string }> = [
  { value: "uad.garage.doors@gmail.com", reason: "Wrong UAD email — replaced" },
  { value: "${REDIS_PASSWORD}", reason: "Unexpanded env var reference" },
  { value: "${WAHA_API_KEY}", reason: "Unexpanded env var reference" },
  { value: "${DATABASE_URL}", reason: "Unexpanded env var reference" },
  { value: "${KIE_API_KEY}", reason: "Unexpanded env var reference" },
  { value: "7Te1UudOE54aU79xrZ", reason: "Old wrong RackNerd password" },
  { value: "cb711f74a221be35a20df8e26e722e04", reason: "Old wrong Kie.ai key" },
];

/** FB bot must use UAD's Telnyx key, not SuperSeller's */
const UAD_TELNYX_PREFIX = "KEY019B52B283";
const SUPERSELLER_TELNYX_PREFIX = "KEY019CDA945";

const FETCH_TIMEOUT_MS = 10_000;
const ALERT_PHONE = config.healthMonitor.alertPhone || "14695885133";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseEnvFile(filePath: string): Record<string, string> {
  const vars: Record<string, string> = {};
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      vars[key] = val;
    }
  } catch (err: any) {
    logger.warn({ msg: "credential-sentinel: cannot read env file", file: filePath, error: err.message });
  }
  return vars;
}

function readJsonFile(filePath: string): Record<string, any> | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err: any) {
    logger.warn({ msg: "credential-sentinel: cannot read JSON file", file: filePath, error: err.message });
    return null;
  }
}

function collectAllValues(filePath: string, parsed: Record<string, any>, prefix = ""): Array<{ key: string; value: string }> {
  const entries: Array<{ key: string; value: string }> = [];
  for (const [k, v] of Object.entries(parsed)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      entries.push({ key: fullKey, value: v });
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      entries.push(...collectAllValues(filePath, v, fullKey));
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Check 1: Cross-file consistency
// ---------------------------------------------------------------------------

function checkCrossFileConsistency(): SentinelIssue[] {
  const issues: SentinelIssue[] = [];
  const envMaps: Record<string, Record<string, string>> = {};

  for (const file of ENV_FILES) {
    if (!fs.existsSync(file)) {
      issues.push({ severity: "warning", file, key: "*", message: `Env file not found: ${file}` });
      continue;
    }
    envMaps[file] = parseEnvFile(file);
  }

  const fileKeys = Object.keys(envMaps);
  if (fileKeys.length < 2) return issues;

  const workerFile = ENV_FILES[0];
  const fbBotFile = ENV_FILES[1];
  const workerVars = envMaps[workerFile];
  const fbBotVars = envMaps[fbBotFile];

  if (!workerVars || !fbBotVars) return issues;

  for (const key of SHARED_KEYS) {
    const wVal = workerVars[key];
    const fVal = fbBotVars[key];
    if (!wVal || !fVal) continue;

    // Normalize DATABASE_URL: postgres:// vs postgresql:// are equivalent,
    // and localhost vs 172.245.56.50 both point to the same RackNerd machine.
    let wNorm = wVal;
    let fNorm = fVal;
    if (key === "DATABASE_URL") {
      const normDbUrl = (url: string) =>
        url
          .replace(/^postgresql:\/\//, "postgres://")
          .replace(/localhost/g, "172.245.56.50");
      wNorm = normDbUrl(wVal);
      fNorm = normDbUrl(fVal);
    }

    if (wNorm !== fNorm) {
      issues.push({
        severity: "critical",
        file: `${workerFile} vs ${fbBotFile}`,
        key,
        message: `Value mismatch — worker and FB bot have different ${key}`,
      });
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Check 2: Credential liveness
// ---------------------------------------------------------------------------

async function checkCredentialLiveness(): Promise<SentinelIssue[]> {
  const issues: SentinelIssue[] = [];

  // Kie.ai liveness check — use the probe endpoint (recordInfo with dummy taskId)
  // A valid key returns 200 (with error body for unknown task), an invalid key returns 401/403.
  try {
    const res = await fetch(`${config.kie.baseUrl}/v1/jobs/recordInfo?taskId=probe-credential-sentinel`, {
      headers: { Authorization: `Bearer ${config.kie.apiKey}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    // 404 is OK — means key is valid but task doesn't exist (expected).
    // Only flag 401/403 as credential issues.
    if (res.status === 401 || res.status === 403) {
      issues.push({
        severity: "critical",
        file: "worker .env",
        key: "KIE_API_KEY",
        message: `Kie.ai returned ${res.status} — API key may be invalid or expired`,
      });
    }
  } catch (err: any) {
    issues.push({
      severity: "warning",
      file: "worker .env",
      key: "KIE_API_KEY",
      message: `Kie.ai unreachable: ${err.message}`,
    });
  }

  // WAHA sessions check
  try {
    const res = await fetch(`${config.waha.url}/api/sessions`, {
      headers: { "X-Api-Key": config.waha.apiKey },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      issues.push({
        severity: "critical",
        file: "worker .env",
        key: "WAHA_API_KEY",
        message: `WAHA returned ${res.status} — API key may be invalid`,
      });
    }
  } catch (err: any) {
    issues.push({
      severity: "warning",
      file: "worker .env",
      key: "WAHA_API_KEY",
      message: `WAHA unreachable: ${err.message}`,
    });
  }

  // Ollama tags check
  try {
    const res = await fetch(`${config.ollama.url}/api/tags`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      issues.push({
        severity: "warning",
        file: "worker .env",
        key: "OLLAMA_URL",
        message: `Ollama returned ${res.status}`,
      });
    }
  } catch (err: any) {
    issues.push({
      severity: "warning",
      file: "worker .env",
      key: "OLLAMA_URL",
      message: `Ollama unreachable: ${err.message}`,
    });
  }

  // PostgreSQL check
  try {
    await query("SELECT 1");
  } catch (err: any) {
    issues.push({
      severity: "critical",
      file: "worker .env",
      key: "DATABASE_URL",
      message: `PostgreSQL query failed: ${err.message}`,
    });
  }

  // Redis check
  try {
    const pong = await redisConnection.ping();
    if (pong !== "PONG") {
      issues.push({
        severity: "critical",
        file: "worker .env",
        key: "REDIS_URL",
        message: `Redis PING returned "${pong}" instead of PONG`,
      });
    }
  } catch (err: any) {
    issues.push({
      severity: "critical",
      file: "worker .env",
      key: "REDIS_URL",
      message: `Redis PING failed: ${err.message}`,
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Check 3: Known-bad value detection
// ---------------------------------------------------------------------------

function checkKnownBadValues(): SentinelIssue[] {
  const issues: SentinelIssue[] = [];

  // Scan .env files
  for (const file of ENV_FILES) {
    if (!fs.existsSync(file)) continue;
    const vars = parseEnvFile(file);
    for (const [key, value] of Object.entries(vars)) {
      for (const bad of KNOWN_BAD_VALUES) {
        if (value.includes(bad.value)) {
          issues.push({
            severity: "critical",
            file,
            key,
            message: `Contains known-bad value: ${bad.reason}`,
          });
        }
      }
    }
  }

  // Scan bot-config.json
  if (fs.existsSync(FB_BOT_CONFIG)) {
    const jsonData = readJsonFile(FB_BOT_CONFIG);
    if (jsonData) {
      const allVals = collectAllValues(FB_BOT_CONFIG, jsonData);
      for (const { key, value } of allVals) {
        for (const bad of KNOWN_BAD_VALUES) {
          if (value.includes(bad.value)) {
            issues.push({
              severity: "critical",
              file: FB_BOT_CONFIG,
              key,
              message: `Contains known-bad value: ${bad.reason}`,
            });
          }
        }
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Check 4: Ownership validation
// ---------------------------------------------------------------------------

function checkOwnership(): SentinelIssue[] {
  const issues: SentinelIssue[] = [];

  const fbBotFile = ENV_FILES[1]; // /opt/fb-marketplace-bot/.env
  if (!fs.existsSync(fbBotFile)) return issues;

  const fbVars = parseEnvFile(fbBotFile);
  const telnyxKey = fbVars["TELNYX_API_KEY"] || "";

  if (telnyxKey && telnyxKey.startsWith(SUPERSELLER_TELNYX_PREFIX)) {
    issues.push({
      severity: "critical",
      file: fbBotFile,
      key: "TELNYX_API_KEY",
      message: `FB bot is using SuperSeller's Telnyx key (${SUPERSELLER_TELNYX_PREFIX}...) — should use UAD's key (${UAD_TELNYX_PREFIX}...)`,
    });
  }

  if (telnyxKey && !telnyxKey.startsWith(UAD_TELNYX_PREFIX) && !telnyxKey.startsWith(SUPERSELLER_TELNYX_PREFIX)) {
    issues.push({
      severity: "warning",
      file: fbBotFile,
      key: "TELNYX_API_KEY",
      message: `FB bot Telnyx key doesn't match any known prefix — verify it's correct`,
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Store results
// ---------------------------------------------------------------------------

async function storeResult(result: SentinelResult): Promise<void> {
  try {
    const details = JSON.stringify({
      status: result.status,
      issueCount: result.issues.length,
      issues: result.issues.map((i) => ({
        severity: i.severity,
        file: i.file,
        key: i.key,
        message: i.message,
      })),
    });

    await query(
      `INSERT INTO health_checks (service, status, response_ms, details, checked_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        "credential-sentinel",
        result.status === "clean" ? "healthy" : result.status === "drift" ? "degraded" : "unhealthy",
        0,
        details,
        result.checkedAt,
      ]
    );
  } catch (err: any) {
    logger.error({ msg: "credential-sentinel: failed to store result", error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

async function alertCritical(issues: SentinelIssue[]): Promise<void> {
  const critical = issues.filter((i) => i.severity === "critical");
  if (critical.length === 0) return;

  const lines = [
    `🚨 *Credential Sentinel — ${critical.length} critical issue(s)*`,
    "",
    ...critical.map((i) => `• *${i.key}* (${path.basename(i.file)}): ${i.message}`),
    "",
    `Run \`runCredentialSentinel()\` for full report.`,
  ];

  try {
    const chatId = ALERT_PHONE.includes("@") ? ALERT_PHONE : phoneToChatId(ALERT_PHONE);
    await sendText(chatId, lines.join("\n"));
    logger.info({ msg: "credential-sentinel: WhatsApp alert sent", phone: ALERT_PHONE, issues: critical.length });
  } catch (err: any) {
    logger.error({ msg: "credential-sentinel: WhatsApp alert failed", error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runCredentialSentinel(): Promise<SentinelResult> {
  const startedAt = Date.now();
  logger.info({ msg: "credential-sentinel: starting scan" });

  const allIssues: SentinelIssue[] = [];

  try {
    // Check 1: Cross-file consistency
    const consistencyIssues = checkCrossFileConsistency();
    allIssues.push(...consistencyIssues);

    // Check 2: Credential liveness
    const livenessIssues = await checkCredentialLiveness();
    allIssues.push(...livenessIssues);

    // Check 3: Known-bad values
    const badValueIssues = checkKnownBadValues();
    allIssues.push(...badValueIssues);

    // Check 4: Ownership validation
    const ownershipIssues = checkOwnership();
    allIssues.push(...ownershipIssues);
  } catch (err: any) {
    // Never crash the worker — catch anything unexpected
    logger.error({ msg: "credential-sentinel: unexpected error during scan", error: err.message, stack: err.stack });
    allIssues.push({
      severity: "warning",
      file: "credential-sentinel",
      key: "INTERNAL",
      message: `Scan error: ${err.message}`,
    });
  }

  const hasCritical = allIssues.some((i) => i.severity === "critical");
  const hasWarning = allIssues.some((i) => i.severity === "warning");

  const result: SentinelResult = {
    status: hasCritical ? "critical" : hasWarning ? "drift" : "clean",
    issues: allIssues,
    checkedAt: new Date(),
  };

  const durationMs = Date.now() - startedAt;

  // Log summary
  logger.info({
    msg: "credential-sentinel: scan complete",
    status: result.status,
    totalIssues: allIssues.length,
    critical: allIssues.filter((i) => i.severity === "critical").length,
    warnings: allIssues.filter((i) => i.severity === "warning").length,
    durationMs,
  });

  // Log each issue individually for easy searching
  for (const issue of allIssues) {
    const logFn = issue.severity === "critical" ? logger.error.bind(logger) : logger.warn.bind(logger);
    logFn({
      msg: "credential-sentinel: issue found",
      severity: issue.severity,
      file: issue.file,
      key: issue.key,
      detail: issue.message,
    });
  }

  // Store in health_checks table
  await storeResult(result);

  // Alert via WhatsApp for critical issues
  if (hasCritical) {
    await alertCritical(allIssues);
  }

  return result;
}
