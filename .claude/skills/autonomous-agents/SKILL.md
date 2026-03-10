---
name: autonomous-agents
description: >
  Autonomous monitoring agents that prevent credential drift, session expiry, doc staleness,
  and config divergence. Self-healing, self-documenting, WhatsApp-alerting.
autoTrigger:
  - "agent"
  - "sentinel"
  - "watchdog"
  - "doc integrity"
  - "credential drift"
  - "session expired"
  - "stale docs"
  - "agent findings"
negativeTrigger:
  - "video pipeline"
  - "UI design"
---

# Autonomous Agents

## Architecture

5 files in `apps/worker/src/services/agents/`:

| File | Agent | Schedule | What It Prevents |
|------|-------|----------|-----------------|
| `credential-sentinel.ts` | Credential Sentinel | Every 6h | Wrong/stale API keys, cross-file drift, unexpanded `${}` vars |
| `session-watchdog.ts` | Session Watchdog | Every 4h | FB cookies expiring silently, PM2 crash loops, posting gaps |
| `doc-integrity-scanner.ts` | Doc Integrity Scanner | Daily | Wrong emails/phones/script names persisting in docs |
| `orchestrator.ts` | Orchestrator | Every 6h | Coordinates all agents, dedup findings, daily WhatsApp digest |
| `index.ts` | Barrel export | — | Re-exports all agents |

## How It Works

1. **Scheduler** (`scheduler.ts`) runs `runOrchestrator()` every 6 hours (first run 15min after boot)
2. **Orchestrator** runs each agent sequentially, collects findings
3. **Dedup**: Fingerprints stored in Redis — only NEW findings trigger alerts
4. **Persistence**: `agent_findings` table tracks all findings + resolution
5. **Alerts**: Critical → immediate WhatsApp. Morning 7-9 AM → daily digest
6. **Self-healing**: Resolved findings auto-marked when they disappear from next run

## Database

```sql
-- Auto-created by orchestrator on first run
SELECT * FROM agent_findings WHERE resolved = false ORDER BY found_at DESC;

-- Agent run history
SELECT * FROM health_checks WHERE service = 'agent-orchestrator' ORDER BY checked_at DESC LIMIT 5;
```

## Manual Run

```bash
# On RackNerd
cd /opt/tourreel-worker && npx tsx -e "
  import { runOrchestrator } from './apps/worker/src/services/agents';
  runOrchestrator().then(console.log);
"
```

## Banned Values (auto-detected)

| Value | Why It's Banned | Correct Value |
|-------|----------------|---------------|
| `uad.garage.doors@gmail.com` | Wrong UAD email | `1shaifriedman@gmail.com` |
| `${REDIS_PASSWORD}` | Unexpanded env var | Actual password value |
| `cb711f74a221be35a20df8e26e722e04` | Old Kie.ai key | `6bb5a5733b79dc30f42ea4ab6a95b9a0` |
| `7Te1UudOE54aU79xrZ` | Old RackNerd password | Current password |
| `internalBoss` | Deleted WAHA session | `personal` |
| `interactive_login.js` | Old script name | `session-login.js` |

## Adding New Banned Values

Edit `BANNED_VALUES` in `doc-integrity-scanner.ts` and `KNOWN_BAD_VALUES` in `credential-sentinel.ts`.

## Daily Digest Format (WhatsApp)

```
🤖 Daily Agent Report
━━━━━━━━━━━━━━━━━━━
✅ Credential Sentinel: clean (all keys valid)
⚠️ Session Watchdog: UAD cookies expire in 28 days
✅ Doc Integrity Scanner: clean (142 files scanned)
━━━━━━━━━━━━━━━━━━━
New findings: 1 | Resolved: 0
```

## References
- `apps/worker/src/services/health-monitor.ts` — Existing health checks (agents complement these)
- `apps/worker/src/services/scheduler.ts` — Job scheduling
- `CREDENTIAL_REFERENCE.md` — Shared vs Separate keys ground truth
