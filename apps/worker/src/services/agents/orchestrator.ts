/**
 * Agent Orchestrator — Master coordinator for all autonomous agents.
 *
 * Responsibilities:
 *  1. Run each agent on schedule, collecting findings.
 *  2. Persist NEW findings to `agent_findings` (Postgres).
 *  3. Mark RESOLVED findings (present last run, absent now).
 *  4. Send immediate WhatsApp alert for CRITICAL severity.
 *  5. Send a daily digest WhatsApp message during the 7-9 AM window.
 *  6. Store run history in Redis for deduplication.
 *  7. Write overall run summary to `health_checks` table.
 *
 * Table creation (run once on startup via ensureTable):
 *   CREATE TABLE IF NOT EXISTS agent_findings (
 *     id SERIAL PRIMARY KEY,
 *     agent TEXT NOT NULL,
 *     severity TEXT NOT NULL,
 *     finding TEXT NOT NULL,
 *     file_path TEXT,
 *     details JSONB,
 *     resolved BOOLEAN DEFAULT false,
 *     found_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     resolved_at TIMESTAMPTZ
 *   );
 */

import { query } from "../../db/client";
import { redisConnection } from "../../queue/connection";
import { logger } from "../../utils/logger";
import { sendText, phoneToChatId } from "../waha-client";
import { config } from "../../config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentFinding {
  agent: string;
  severity: "critical" | "warning" | "info";
  finding: string;
  filePath?: string;
  details?: Record<string, unknown>;
}

export interface AgentResult {
  agent: string;
  findings: AgentFinding[];
  /** One-line summary shown in the daily digest (e.g. "clean (6 keys tested)"). */
  summary: string;
  durationMs: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REDIS_PREFIX = "agent:last-run";
const WAHA_SESSION = "personal";
const DIGEST_HOUR_START = 7;
const DIGEST_HOUR_END = 9;

// ---------------------------------------------------------------------------
// DB bootstrap
// ---------------------------------------------------------------------------

let tableEnsured = false;

async function ensureTable(): Promise<void> {
  if (tableEnsured) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS agent_findings (
        id SERIAL PRIMARY KEY,
        agent TEXT NOT NULL,
        severity TEXT NOT NULL,
        finding TEXT NOT NULL,
        file_path TEXT,
        details JSONB,
        resolved BOOLEAN DEFAULT false,
        found_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );
    `);
    tableEnsured = true;
  } catch (err: any) {
    logger.error({ msg: "Failed to ensure agent_findings table", error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Agent runner helper
// ---------------------------------------------------------------------------

type AgentFn = () => Promise<{ findings: AgentFinding[]; summary: string }>;

interface AgentDefinition {
  name: string;
  load: () => Promise<AgentFn>;
}

const AGENTS: AgentDefinition[] = [
  {
    name: "credential-sentinel",
    load: async () => {
      const { runCredentialSentinel } = await import("./credential-sentinel");
      return async () => {
        const result = await runCredentialSentinel();
        return {
          findings: result.issues.map((i) => ({
            agent: "credential-sentinel",
            severity: i.severity as "critical" | "warning",
            finding: `[${i.key}] ${i.message}`,
            filePath: i.file,
          })),
          summary: result.status === "clean"
            ? `clean (${result.issues.length === 0 ? "all keys valid" : "0 issues"})`
            : `${result.issues.length} issue(s) — ${result.status}`,
        };
      };
    },
  },
  {
    name: "session-watchdog",
    load: async () => {
      const { runSessionWatchdog } = await import("./session-watchdog");
      return async () => {
        const result = await runSessionWatchdog();
        return {
          findings: result.checks
            .filter((c) => c.status !== "healthy")
            .map((c) => ({
              agent: "session-watchdog",
              severity: c.status as "critical" | "warning",
              finding: c.message,
            })),
          summary: result.status === "healthy"
            ? `healthy (${result.checks.length} checks passed)`
            : result.checks.filter((c) => c.status !== "healthy").map((c) => c.message).join("; "),
        };
      };
    },
  },
  {
    name: "doc-integrity-scanner",
    load: async () => {
      const { runDocIntegrityScanner } = await import("./doc-integrity-scanner");
      return async () => {
        const result = await runDocIntegrityScanner();
        return {
          findings: result.findings.map((f) => ({
            agent: "doc-integrity-scanner",
            severity: f.severity,
            finding: `${f.context}: found "${f.pattern}" (should be "${f.correctValue}")`,
            filePath: f.file,
          })),
          summary: result.status === "clean"
            ? `clean (${result.filesScanned} files scanned)`
            : `${result.findings.length} stale reference(s) in ${result.filesScanned} files`,
        };
      };
    },
  },
];

async function executeAgent(def: AgentDefinition): Promise<AgentResult> {
  const start = Date.now();
  try {
    const fn = await def.load();
    const { findings, summary } = await fn();
    return {
      agent: def.name,
      findings,
      summary,
      durationMs: Date.now() - start,
    };
  } catch (err: any) {
    logger.error({ msg: `Agent ${def.name} threw`, error: err.message, stack: err.stack });
    return {
      agent: def.name,
      findings: [
        {
          agent: def.name,
          severity: "critical",
          finding: `Agent crashed: ${err.message}`,
        },
      ],
      summary: `ERROR: ${err.message}`,
      durationMs: Date.now() - start,
      error: err.message,
    };
  }
}

// ---------------------------------------------------------------------------
// Finding fingerprint — deterministic key for dedup
// ---------------------------------------------------------------------------

function fingerprintFinding(f: AgentFinding): string {
  return `${f.agent}::${f.severity}::${f.finding}::${f.filePath ?? ""}`;
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

async function getPreviousFingerprints(agent: string): Promise<Set<string>> {
  const key = `${REDIS_PREFIX}:${agent}`;
  try {
    const raw = await redisConnection.get(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function storeFingerprints(agent: string, prints: string[]): Promise<void> {
  const key = `${REDIS_PREFIX}:${agent}`;
  try {
    // Keep for 48 hours so we can diff between runs even if one is skipped.
    await redisConnection.set(key, JSON.stringify(prints), "EX", 48 * 3600);
  } catch (err: any) {
    logger.warn({ msg: "Redis store fingerprints failed", agent, error: err.message });
  }
}

async function insertFinding(f: AgentFinding): Promise<void> {
  await query(
    `INSERT INTO agent_findings (agent, severity, finding, file_path, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [f.agent, f.severity, f.finding, f.filePath ?? null, f.details ? JSON.stringify(f.details) : null]
  );
}

async function markResolved(agent: string, finding: string): Promise<void> {
  await query(
    `UPDATE agent_findings
        SET resolved = true, resolved_at = NOW()
      WHERE agent = $1
        AND finding = $2
        AND resolved = false`,
    [agent, finding]
  );
}

async function writeHealthCheck(status: string, details: Record<string, unknown>): Promise<void> {
  try {
    await query(
      `INSERT INTO health_checks (service, status, details, checked_at)
       VALUES ('agent-orchestrator', $1, $2, NOW())`,
      [status, JSON.stringify(details)]
    );
  } catch (err: any) {
    // health_checks table may not exist — non-fatal.
    logger.warn({ msg: "Could not write health_check row", error: err.message });
  }
}

// ---------------------------------------------------------------------------
// WhatsApp helpers
// ---------------------------------------------------------------------------

function getAlertChatId(): string | null {
  const phone = config.healthMonitor?.alertPhone;
  if (!phone) return null;
  return phoneToChatId(phone);
}

async function sendWhatsApp(text: string): Promise<void> {
  const chatId = getAlertChatId();
  if (!chatId) {
    logger.warn("No alertPhone configured — skipping WhatsApp message");
    return;
  }
  try {
    await sendText(chatId, text, { session: WAHA_SESSION });
  } catch (err: any) {
    logger.error({ msg: "WhatsApp send failed", error: err.message });
  }
}

function severityIcon(s: string): string {
  switch (s) {
    case "critical":
      return "\u274c";
    case "warning":
      return "\u26a0\ufe0f";
    default:
      return "\u2705";
  }
}

function buildDigest(results: AgentResult[], newCount: number, resolvedCount: number): string {
  const lines: string[] = [
    "\ud83e\udd16 *Daily Agent Report*",
    "\u2501".repeat(19),
  ];

  for (const r of results) {
    const icon = r.error ? "\u274c" : r.findings.some((f) => f.severity === "critical")
      ? "\u274c"
      : r.findings.some((f) => f.severity === "warning")
        ? "\u26a0\ufe0f"
        : "\u2705";

    // Capitalize first letter of agent name for display.
    const label = r.agent
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    lines.push(`${icon} ${label}: ${r.summary}`);
  }

  lines.push("\u2501".repeat(19));
  lines.push(`New findings: ${newCount} | Resolved: ${resolvedCount}`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runOrchestrator(): Promise<void> {
  const orchestratorStart = Date.now();
  logger.info("Agent orchestrator starting");

  // Ensure the findings table exists.
  await ensureTable();

  const results: AgentResult[] = [];
  let totalNew = 0;
  let totalResolved = 0;

  // ----- 1. Run each agent sequentially (keeps resource usage predictable) -----
  for (const def of AGENTS) {
    const result = await executeAgent(def);
    results.push(result);
    logger.info({
      msg: `Agent completed`,
      agent: def.name,
      findings: result.findings.length,
      durationMs: result.durationMs,
    });
  }

  // ----- 2. Diff against previous run → new / resolved -----
  for (const result of results) {
    try {
      const prevPrints = await getPreviousFingerprints(result.agent);
      const currentPrints = result.findings.map(fingerprintFinding);

      // New findings = in current but not in previous.
      const newFindings = result.findings.filter(
        (f) => !prevPrints.has(fingerprintFinding(f))
      );

      // Resolved = in previous but not in current.
      const currentSet = new Set(currentPrints);
      const resolvedPrints = Array.from(prevPrints).filter((p) => !currentSet.has(p));

      // Persist new findings.
      for (const f of newFindings) {
        try {
          await insertFinding(f);
          totalNew++;
        } catch (err: any) {
          logger.error({ msg: "Insert finding failed", finding: f.finding, error: err.message });
        }
      }

      // Mark resolved.
      for (const rp of resolvedPrints) {
        const parts = rp.split("::");
        const finding = parts[2] ?? "";
        if (finding) {
          try {
            await markResolved(result.agent, finding);
            totalResolved++;
          } catch (err: any) {
            logger.error({ msg: "Mark resolved failed", error: err.message });
          }
        }
      }

      // Store current run's fingerprints for next diff.
      await storeFingerprints(result.agent, currentPrints);

      // ----- 3. Immediate alert for critical findings -----
      for (const f of newFindings) {
        if (f.severity === "critical") {
          const msg = `${severityIcon("critical")} *CRITICAL — ${f.agent}*\n${f.finding}${f.filePath ? `\nFile: ${f.filePath}` : ""}`;
          await sendWhatsApp(msg);
        }
      }
    } catch (err: any) {
      logger.error({ msg: "Diff/persist failed for agent", agent: result.agent, error: err.message });
    }
  }

  // ----- 4. Daily digest (morning window) -----
  const hour = new Date().getHours();
  if (hour >= DIGEST_HOUR_START && hour <= DIGEST_HOUR_END) {
    const digest = buildDigest(results, totalNew, totalResolved);
    await sendWhatsApp(digest);
    logger.info("Daily digest sent via WhatsApp");
  }

  // ----- 5. Write run summary to health_checks -----
  const totalDuration = Date.now() - orchestratorStart;
  await writeHealthCheck(
    results.every((r) => !r.error) ? "healthy" : "degraded",
    {
      agents: results.map((r) => ({
        name: r.agent,
        findings: r.findings.length,
        durationMs: r.durationMs,
        error: r.error ?? null,
      })),
      totalNew,
      totalResolved,
      totalDurationMs: totalDuration,
    }
  );

  logger.info({
    msg: "Agent orchestrator complete",
    totalDurationMs: totalDuration,
    newFindings: totalNew,
    resolved: totalResolved,
  });
}
