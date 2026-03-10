import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

type Status = 'green' | 'red' | 'amber' | 'blue' | 'gray';

interface MCNode {
  name: string;
  status: Status;
  detail: string;
  tooltip: string;
  url?: string;
  latencyMs?: number;
}

interface MCCategory {
  key: string;
  icon: string;
  label: string;
  items: MCNode[];
}

const VPS_IP = '172.245.56.50';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '4fc7e008d7d24fc995475029effc8fa8';
const SHAI_PHONE = '14695885133@c.us';

async function probe(url: string, timeoutMs = 5000): Promise<{ ok: boolean; status: number; latencyMs: number; body?: string }> {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
    const latencyMs = Date.now() - start;
    let body: string | undefined;
    try { body = await res.text(); } catch {}
    return { ok: res.ok, status: res.status, latencyMs, body };
  } catch {
    return { ok: false, status: 0, latencyMs: Date.now() - start };
  }
}

// Cached previous statuses for change detection
let previousStatuses: Record<string, Status> = {};

function detectChanges(categories: MCCategory[]): { name: string; from: Status; to: Status; category: string }[] {
  const changes: { name: string; from: Status; to: Status; category: string }[] = [];
  const currentStatuses: Record<string, Status> = {};

  for (const cat of categories) {
    for (const item of cat.items) {
      const key = `${cat.key}:${item.name}`;
      currentStatuses[key] = item.status;
      const prev = previousStatuses[key];
      if (prev && prev !== item.status) {
        changes.push({ name: item.name, from: prev, to: item.status, category: cat.label });
      }
    }
  }

  previousStatuses = currentStatuses;
  return changes;
}

async function sendWhatsAppAlert(changes: { name: string; from: Status; to: Status; category: string }[]) {
  if (changes.length === 0) return;

  const statusEmoji: Record<Status, string> = {
    green: '🟢', red: '🔴', amber: '🟡', blue: '🔵', gray: '⚫',
  };

  const lines = changes.map(c =>
    `${statusEmoji[c.to]} *${c.name}* ${c.from.toUpperCase()} → ${c.to.toUpperCase()}\n   _${c.category}_`
  );

  const message = `⚡ *Mission Control Alert*\n\n${lines.join('\n\n')}\n\n_${new Date().toLocaleTimeString()}_`;

  try {
    await fetch(`http://${VPS_IP}:3000/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': WAHA_API_KEY },
      body: JSON.stringify({
        session: 'default',
        chatId: SHAI_PHONE,
        text: message,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Silent fail — alerts are best-effort
  }
}

export async function GET() {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parallel probe everything
  const [
    webProbe, adminProbe, studioProbe, workerProbe,
    wahaProbe, ollamaProbe, fbBotProbe, renstoProbe,
    n8nProbe, r2Probe, diagnosticsProbe,
  ] = await Promise.all([
    probe('https://superseller.agency/api/health'),
    probe('https://admin.superseller.agency/en/login'),
    probe('https://studio.superseller.agency'),
    probe(`http://${VPS_IP}:3002/api/health`),
    probe(`http://${VPS_IP}:3000/api/health`),
    probe(`http://${VPS_IP}:11434/api/tags`),
    probe(`http://${VPS_IP}:8082/health`),
    probe('https://rensto.com'),
    probe('https://n8n.superseller.agency'),
    probe('https://videos.superseller.agency'),
    probe(`http://${VPS_IP}:3002/api/diagnostics`),
  ]);

  // Parse worker health
  let workerChecks: Record<string, string> = {};
  if (workerProbe.body) {
    try { const wd = JSON.parse(workerProbe.body); workerChecks = wd.checks || {}; } catch {}
  }

  // Parse Ollama models
  let ollamaModels: string[] = [];
  if (ollamaProbe.body) {
    try { const od = JSON.parse(ollamaProbe.body); ollamaModels = (od.models || []).map((m: any) => m.name || m.model || '?'); } catch {}
  }

  // Parse diagnostics
  let diag: any = null;
  if (diagnosticsProbe.body) {
    try { diag = JSON.parse(diagnosticsProbe.body); } catch {}
  }

  const s = (p: typeof webProbe): Status => p.ok ? 'green' : p.status > 0 ? 'amber' : 'red';
  const diskPercent = diag?.server?.disk?.percent ? parseInt(diag.server.disk.percent) : null;

  const categories: MCCategory[] = [];

  // ─── 1. BUSINESSES ───
  categories.push({
    key: 'businesses', icon: '◆', label: 'BUSINESSES',
    items: [
      { name: 'SuperSeller AI', status: webProbe.ok ? 'green' : 'red', detail: 'Primary SaaS', url: 'https://superseller.agency', tooltip: 'SaaS platform for AI business automation\nProducts: VideoForge, FB Bot, ClaudeClaw, SocialHub, Winner Studio, AgentForge\nStack: Next.js + Node.js + PostgreSQL + Redis + R2' },
      { name: 'Rensto.com', status: s(renstoProbe), detail: renstoProbe.ok ? `HTTP ${renstoProbe.status}` : 'UNREACHABLE', url: 'https://rensto.com', latencyMs: renstoProbe.latencyMs, tooltip: 'Contractor directory (SEPARATE business)\nCode: ~/rensto - online directory/\nGitHub: imsuperseller/rensto-app\nPort: 3001 via nginx on RackNerd\nNEVER mix with SuperSeller' },
    ]
  });

  // ─── 2. DOMAINS & URLS ───
  categories.push({
    key: 'domains', icon: '◎', label: 'DOMAINS & URLS',
    items: [
      { name: 'superseller.agency', status: s(webProbe), detail: `HTTP ${webProbe.status || 'ERR'}`, latencyMs: webProbe.latencyMs, url: 'https://superseller.agency', tooltip: `Main website (Vercel)\nLatency: ${webProbe.latencyMs}ms` },
      { name: 'admin.superseller.agency', status: s(adminProbe), detail: `HTTP ${adminProbe.status || 'ERR'}`, latencyMs: adminProbe.latencyMs, url: 'https://admin.superseller.agency', tooltip: `Admin dashboard (same Vercel project)\nLatency: ${adminProbe.latencyMs}ms` },
      { name: 'studio.superseller.agency', status: studioProbe.status === 307 || studioProbe.ok ? 'green' : 'red', detail: `HTTP ${studioProbe.status || 'ERR'}`, latencyMs: studioProbe.latencyMs, url: 'https://studio.superseller.agency', tooltip: `Winner Studio\n307 = redirect to login (expected)\nLatency: ${studioProbe.latencyMs}ms` },
      { name: 'n8n.superseller.agency', status: n8nProbe.status > 0 ? 'green' : 'red', detail: n8nProbe.status > 0 ? 'backup engine' : 'UNREACHABLE', latencyMs: n8nProbe.latencyMs, url: 'https://n8n.superseller.agency', tooltip: `n8n automation (backup — Antigravity is primary)\n2 active production workflows: Telnyx voice lead analysis\nLatency: ${n8nProbe.latencyMs}ms` },
      { name: 'rensto.com', status: s(renstoProbe), detail: renstoProbe.ok ? `HTTP ${renstoProbe.status}` : 'UNREACHABLE', latencyMs: renstoProbe.latencyMs, url: 'https://rensto.com', tooltip: `Rensto contractor directory\nSEPARATE business — nginx proxy to localhost:3001\nLatency: ${renstoProbe.latencyMs}ms` },
      { name: 'videos.superseller.agency', status: r2Probe.status > 0 ? 'green' : 'amber', detail: 'R2 CDN', latencyMs: r2Probe.latencyMs, tooltip: `Cloudflare R2 public video storage\nBucket: zillow-to-video-finals\nLatency: ${r2Probe.latencyMs}ms` },
      { name: 'iron-dome-os.vercel.app', status: 'amber', detail: 'shows zeros', url: 'https://iron-dome-os.vercel.app', tooltip: 'Shai personal brand dashboard\nUI exists but data pipeline broken (3 Aitable tables deleted)\nNeeds: Rebuild pipeline on PostgreSQL' },
    ]
  });

  // ─── 3. SERVER RESOURCES ───
  categories.push({
    key: 'server', icon: '▣', label: 'SERVER RESOURCES',
    items: [
      { name: 'RackNerd VPS', status: workerProbe.ok ? 'green' : 'red', detail: diag?.server?.uptime?.replace('up ', '') || (workerProbe.ok ? 'online' : 'DOWN'), tooltip: `172.245.56.50 (Ubuntu 24.04, KVM, Dallas DC)\nUptime: ${diag?.server?.uptime || 'unknown'}` },
      { name: 'Disk Usage', status: diskPercent !== null ? (diskPercent >= 85 ? 'red' : diskPercent >= 70 ? 'amber' : 'green') : 'gray', detail: diag?.server?.disk ? `${diag.server.disk.used}/${diag.server.disk.total} (${diag.server.disk.percent})` : 'unknown', tooltip: `Disk: ${diag?.server?.disk?.used || '?'} used of ${diag?.server?.disk?.total || '?'}\nClean up: /tmp/videoforge-jobs/, old video renders\nAlert threshold: 85%` },
      { name: 'Memory', status: diag?.server?.memory?.available ? (parseFloat(diag.server.memory.available) < 1 ? 'red' : parseFloat(diag.server.memory.available) < 2 ? 'amber' : 'green') : 'gray', detail: diag?.server?.memory ? `${diag.server.memory.used}/${diag.server.memory.total} (${diag.server.memory.available} free)` : 'unknown', tooltip: `RAM: ${diag?.server?.memory?.used || '?'} used, ${diag?.server?.memory?.available || '?'} available\nTotal: ${diag?.server?.memory?.total || '?'}` },
    ]
  });

  // ─── 4. CORE INFRASTRUCTURE ───
  categories.push({
    key: 'infra', icon: '⬢', label: 'CORE INFRASTRUCTURE',
    items: [
      { name: 'PostgreSQL', status: workerChecks.postgres === 'ok' ? 'green' : 'red', detail: diag?.database ? `${diag.database.tables} tables, ${diag.database.dbSize}` : (workerChecks.postgres === 'ok' ? 'connected' : 'DOWN'), tooltip: `Database: app_db on ${VPS_IP}:5432\nORM: Prisma (web) + Drizzle (worker)\nExtensions: pgvector 0.8.1 (HNSW)\nTables: ${diag?.database?.tables || '?'}\nSize: ${diag?.database?.dbSize || '?'}\nActive connections: ${diag?.database?.connections || '?'}` },
      { name: 'Redis', status: workerChecks.redis === 'ok' ? 'green' : 'red', detail: workerChecks.redis === 'ok' ? 'PONG' : 'DOWN', tooltip: `Redis on ${VPS_IP}:6379\nUsed for: BullMQ queues, sessions, rate limits, caching` },
      { name: 'Ollama', status: s(ollamaProbe), detail: ollamaProbe.ok ? `${ollamaModels.length} model${ollamaModels.length !== 1 ? 's' : ''}: ${ollamaModels.join(', ') || 'none'}` : 'DOWN', latencyMs: ollamaProbe.latencyMs, tooltip: `LLM server on ${VPS_IP}:11434\nModels: ${ollamaModels.join(', ') || 'none loaded'}\nUsed for: RAG embeddings (nomic-embed-text 768-dim)` },
      { name: 'Vercel', status: 'green', detail: 'auto-deploy', tooltip: 'Vercel hosting (this page is served by it)\nProject: rensto-site (legacy slug, serves SuperSeller domains)\nDeploy: git push or vercel --prod from repo root' },
      { name: 'Cloudflare R2', status: process.env.R2_ACCESS_KEY_ID ? 'green' : 'red', detail: process.env.R2_ACCESS_KEY_ID ? 'configured' : 'MISSING KEY', tooltip: `Bucket: zillow-to-video-finals\nPublic domain: videos.superseller.agency\nStores: Videos, photos, assets` },
    ]
  });

  // ─── 5. NGINX & REVERSE PROXY ───
  const nginxActive = diag?.systemd?.find((s: any) => s.name === 'nginx');
  categories.push({
    key: 'nginx', icon: '⇌', label: 'NGINX & PROXY',
    items: [
      { name: 'nginx', status: nginxActive?.active ? 'green' : 'red', detail: nginxActive?.active ? 'active' : 'STOPPED', tooltip: `Reverse proxy for rensto.com (→ :3001) and n8n (→ :5678)\nIf stopped: rensto.com, n8n.superseller.agency go down\nFix: systemctl start nginx` },
      ...(diag?.sslCerts || []).map((cert: any) => ({
        name: `SSL: ${cert.domain}`, status: (() => {
          if (!cert.expiry) return 'gray' as Status;
          const exp = new Date(cert.expiry);
          const days = Math.floor((exp.getTime() - Date.now()) / 86400000);
          return days < 7 ? 'red' as Status : days < 30 ? 'amber' as Status : 'green' as Status;
        })(),
        detail: cert.expiry ? (() => { const d = Math.floor((new Date(cert.expiry).getTime() - Date.now()) / 86400000); return `${d}d left`; })() : 'unknown',
        tooltip: `SSL certificate for ${cert.domain}\nExpires: ${cert.expiry || 'unknown'}\nPath: /etc/letsencrypt/live/${cert.domain}/`,
      })),
    ]
  });

  // ─── 6. PM2 PROCESSES ───
  const pm2Items: MCNode[] = (diag?.pm2 || []).map((p: any) => ({
    name: p.name,
    status: p.status === 'online' ? 'green' as Status : p.status === 'stopped' ? 'red' as Status : 'amber' as Status,
    detail: `${p.status} (${p.memory}, ${p.restarts} restarts)`,
    tooltip: `PID: ${p.pid}\nStatus: ${p.status}\nMemory: ${p.memory}\nRestarts: ${p.restarts}\nUptime since: ${p.uptime ? new Date(p.uptime).toLocaleString() : 'unknown'}`,
  }));
  // Add systemd services
  (diag?.systemd || []).filter((s: any) => s.name !== 'nginx').forEach((svc: any) => {
    pm2Items.push({
      name: `${svc.name} (systemd)`,
      status: svc.active ? 'green' : 'red',
      detail: svc.active ? 'active' : 'STOPPED',
      tooltip: `systemd service: ${svc.name}\nManage: systemctl start/stop/restart ${svc.name}`,
    });
  });
  if (pm2Items.length === 0) {
    pm2Items.push({ name: 'Worker unreachable', status: 'red', detail: 'No data', tooltip: 'Cannot reach worker /api/diagnostics to list processes' });
  }
  categories.push({ key: 'pm2', icon: '▶', label: 'PM2 & SERVICES', items: pm2Items });

  // ─── 7. BULLMQ QUEUES ───
  const queueItems: MCNode[] = (diag?.queues || []).map((q: any) => {
    const hasActive = q.active > 0;
    const hasFailed = q.failed > 0;
    const hasWaiting = q.waiting > 0;
    return {
      name: q.name,
      status: hasFailed ? 'red' as Status : hasActive ? 'green' as Status : 'green' as Status,
      detail: `A:${q.active} W:${q.waiting} F:${q.failed} C:${q.completed} D:${q.delayed}`,
      tooltip: `Queue: ${q.name}\nActive: ${q.active}\nWaiting: ${q.waiting}\nFailed: ${q.failed}\nCompleted: ${q.completed}\nDelayed: ${q.delayed}`,
    };
  });
  if (queueItems.length === 0) {
    queueItems.push({ name: 'Queues unreachable', status: 'gray', detail: 'No data', tooltip: 'Cannot reach worker /api/diagnostics to list queues' });
  }
  categories.push({ key: 'queues', icon: '⟐', label: 'BULLMQ QUEUES', items: queueItems });

  // ─── 8. WHATSAPP (WAHA) ───
  const wahaSessionCount = (diag?.wahaSessions || []).length;
  const wahaItems: MCNode[] = [
    { name: 'WAHA Service', status: wahaProbe.status === 401 || wahaProbe.ok ? 'green' : wahaProbe.status > 0 ? 'amber' : 'red', detail: wahaProbe.status === 401 ? 'running (auth required)' : wahaProbe.ok ? 'online' : 'DOWN', latencyMs: wahaProbe.latencyMs, tooltip: `WAHA Pro WhatsApp API on ${VPS_IP}:3000\nLatency: ${wahaProbe.latencyMs}ms` },
  ];
  (diag?.wahaSessions || []).forEach((ws: any) => {
    wahaItems.push({
      name: `Session: ${ws.name}`,
      status: ws.status === 'WORKING' ? 'green' : ws.status === 'SCAN_QR_CODE' ? 'red' : 'amber',
      detail: ws.status,
      tooltip: `WhatsApp session: ${ws.name}\nStatus: ${ws.status}\nIf SCAN_QR_CODE: re-authenticate at http://${VPS_IP}:3000`,
    });
  });
  categories.push({ key: 'waha', icon: '💬', label: 'WHATSAPP SESSIONS', items: wahaItems });

  // ─── 9. PRODUCTS ───
  categories.push({
    key: 'products', icon: '◈', label: 'PRODUCTS',
    items: [
      { name: 'VideoForge', status: workerProbe.ok ? 'amber' : 'red', detail: workerProbe.ok ? 'live (unvalidated)' : 'WORKER DOWN', tooltip: 'AI real estate video pipeline\nDual-path: Kling 3.0 AI clips + Remotion photo composition\n7 quality fix phases applied but NOT validated end-to-end\nNeeds: 1 test job (~$1-2)' },
      { name: 'FB Bot (UAD)', status: fbBotProbe.ok ? 'green' : 'red', detail: fbBotProbe.ok ? '5/5 posting' : 'DOWN', tooltip: 'David Szender — Garage doors DFW\nRevenue: % split on leads\n4 Telnyx phones, 30 cities' },
      { name: 'FB Bot (MissParty)', status: fbBotProbe.ok ? 'green' : 'red', detail: fbBotProbe.ok ? '3/3 posting' : 'DOWN', tooltip: 'Michal — Bouncy castle rentals DFW\nRevenue: FREE (proving value)' },
      { name: 'ClaudeClaw', status: workerProbe.ok ? 'green' : 'red', detail: workerProbe.ok ? 'operational' : 'WORKER DOWN', tooltip: 'WhatsApp→Claude AI bridge\nPersonal + Group agent (3-tier memory + 4-layer guardrails)\nRAG context via pgvector' },
      { name: 'SocialHub / Buzz', status: 'amber', detail: 'Phase 1 only', tooltip: 'Multi-platform social media\nPhase 1 LIVE: text+image → WhatsApp approval → FB publish\nPhase 2 NOT BUILT: IG, LinkedIn, X, TikTok, YouTube' },
      { name: 'Winner Studio', status: 'blue', detail: 'PAUSED', tooltip: 'AI avatar videos — Yossi (Mivnim)\nPaused: war in Israel, no parties\nNext window: Pesach April 2026' },
      { name: 'Lead Pages', status: 'amber', detail: 'design 5.2/10', tooltip: 'Dynamic /lp/[slug] pages\nInfra: 100% complete\nDesign: needs dark theme + glassmorphism' },
      { name: 'FrontDesk Voice', status: 'amber', detail: 'partial', tooltip: 'Telnyx AI voice assistant\nPhone: +14699299314\nVoice works, webhook migration pending' },
      { name: 'Compete (Ad Intel)', status: 'green', detail: '63 ads cached', tooltip: 'Competitor ad intelligence feed\n63 competitor ads loaded for Elite Pro' },
      { name: 'AgentForge', status: 'gray', detail: 'spec only', tooltip: 'AI research pipeline — code NOT started' },
      { name: 'Model Observatory', status: workerProbe.ok ? 'green' : 'amber', detail: '34+ models', tooltip: 'AI model registry and auto-selector\n34+ models across 8 categories' },
    ]
  });

  // ─── 10. CUSTOMERS ───
  categories.push({
    key: 'customers', icon: '◉', label: 'CUSTOMERS',
    items: [
      { name: 'Miss Party (Michal)', status: fbBotProbe.ok ? 'green' : 'red', detail: fbBotProbe.ok ? 'posting' : 'BOT DOWN', tooltip: 'FB Marketplace bot — bouncy castles DFW\nRevenue: FREE\n3 posts/day' },
      { name: 'UAD (David)', status: fbBotProbe.ok ? 'green' : 'red', detail: fbBotProbe.ok ? 'posting' : 'BOT DOWN', tooltip: 'FB Marketplace bot — garage doors DFW\nRevenue: % split on lead conversions' },
      { name: 'Elite Pro Remodeling', status: 'red', detail: '$2k BLOCKED', tooltip: '$2,000/mo SIGNED but NOT started\nBlocked on: IG credentials, not yet paying\nContact: Saar Bitton, Mor Dayan' },
      { name: 'Yoram (Insurance)', status: 'amber', detail: 'low priority', tooltip: 'Landing page / lead gen\nSite LIVE: yoramfriedman.co.il\nApify: empty (0 actors)' },
      { name: 'Yossi (Mivnim)', status: 'blue', detail: 'PAUSED', tooltip: 'Winner Studio customer\nPaused: war in Israel\nNext: Pesach April 2026' },
      { name: 'Shai Personal Brand', status: 'green', detail: 'internal', tooltip: '10K+ IG, 17.8K+ FB followers\nPortal: /portal/shai-personal-brand\nCompete: /compete/shai-personal-brand\nInternal tenant — no billing' },
    ]
  });

  // ─── 11. API KEYS & INTEGRATIONS ───
  const apiKeyItems: MCNode[] = [
    { name: 'Kie.ai (Kling)', status: workerProbe.ok ? 'amber' : 'red', detail: process.env.KIE_API_KEY ? 'configured' : workerProbe.ok ? 'worker-side only' : 'MISSING', tooltip: `Primary AI video/image API — Kling 3.0, avatar-pro\nVercel env: ${process.env.KIE_API_KEY ? 'SET' : 'NOT SET'}\nWorker env: checked via worker health\nNote: key lives on RackNerd .env, not needed on Vercel` },
    { name: 'OpenAI', status: process.env.OPENAI_API_KEY ? 'green' : 'red', detail: process.env.OPENAI_API_KEY ? 'configured' : 'MISSING', tooltip: 'GPT models for content generation' },
    { name: 'Anthropic', status: process.env.ANTHROPIC_API_KEY ? 'green' : 'red', detail: process.env.ANTHROPIC_API_KEY ? 'configured' : 'MISSING', tooltip: 'Claude for ClaudeClaw + group agent' },
    { name: 'Google AI', status: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'green' : 'amber', detail: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'configured' : 'empty (Kie.ai proxy OK)', tooltip: 'Direct Gemini key empty but FB Bot uses api.kie.ai/gemini-3-flash proxy' },
    { name: 'Telnyx', status: process.env.TELNYX_API_KEY ? 'green' : n8nProbe.status > 0 ? 'amber' : 'red', detail: process.env.TELNYX_API_KEY ? 'configured' : n8nProbe.status > 0 ? 'n8n-side only' : 'MISSING', tooltip: `Voice AI + telephony for FrontDesk\nVercel env: ${process.env.TELNYX_API_KEY ? 'SET' : 'NOT SET'}\nTelnyx key used in n8n workflows, not the Next.js app` },
    { name: 'ElevenLabs', status: process.env.ELEVENLABS_API_KEY ? 'green' : 'amber', detail: process.env.ELEVENLABS_API_KEY ? '2 keys' : 'not set', tooltip: 'Voice cloning + TTS\nClones: Saar, Mor (Elite Pro)' },
    { name: 'PayPal/Stripe', status: process.env.STRIPE_SECRET_KEY ? 'green' : 'amber', detail: 'configured', tooltip: 'Payment processing\nPayPal via Stripe column names (migrated Feb 2026)' },
    { name: 'Apify', status: process.env.APIFY_API_KEY ? 'green' : 'amber', detail: process.env.APIFY_API_KEY ? '2 keys' : 'not set', tooltip: 'Web scraping for Zillow, competitor research' },
    { name: 'GoLogin', status: process.env.GOLOGIN_TOKEN ? 'green' : 'amber', detail: process.env.GOLOGIN_TOKEN ? 'configured' : 'not set', tooltip: 'Browser profiles for FB bot antidetect' },
    { name: 'Firecrawl', status: process.env.FIRECRAWL_API_KEY ? 'green' : 'amber', detail: process.env.FIRECRAWL_API_KEY ? 'configured' : 'not set', tooltip: 'Web content extraction API' },
    { name: 'eSignatures', status: process.env.ESIGNATURES_API_KEY ? 'green' : 'amber', detail: process.env.ESIGNATURES_API_KEY ? 'configured' : 'not set', tooltip: 'Contract signing — Elite Pro agreement' },
    { name: 'GitHub PAT', status: process.env.GITHUB_TOKEN ? 'green' : 'amber', detail: process.env.GITHUB_TOKEN ? 'active' : 'not set', tooltip: 'GitHub Personal Access Token for API operations' },
    { name: 'Vercel Token', status: process.env.VERCEL_TOKEN ? 'green' : 'amber', detail: process.env.VERCEL_TOKEN ? 'active' : 'not set', tooltip: 'Vercel deploy token for CI/CD' },
    { name: 'Aitable', status: process.env.AITABLE_API_KEY ? 'green' : 'gray', detail: process.env.AITABLE_API_KEY ? 'dashboards only' : 'not set', tooltip: 'Aitable.ai for dashboards only\nPostgreSQL is transactional DB truth' },
  ];
  categories.push({ key: 'apikeys', icon: '🔑', label: 'API KEYS & INTEGRATIONS', items: apiKeyItems });

  // ─── 12. N8N INSTANCES ───
  const n8nItems: MCNode[] = [];
  (diag?.n8nInstances || []).forEach((inst: any) => {
    n8nItems.push({
      name: `n8n ${inst.name}`,
      status: inst.status === 'online' ? 'green' : 'red',
      detail: `port ${inst.port} — ${inst.status}`,
      url: inst.port === 5678 ? 'https://n8n.superseller.agency' : undefined,
      tooltip: `n8n ${inst.name} instance\nPort: ${inst.port}\nStatus: ${inst.status}\n${inst.name === 'production' ? 'Hosts: Telnyx voice workflows (UAD + MissParty)\nRole: BACKUP engine (Antigravity is primary)' : 'Personal automation instance\nShai personal brand, experiments'}`,
    });
  });
  if (n8nItems.length === 0) {
    n8nItems.push({ name: 'n8n Service', status: n8nProbe.status > 0 ? 'green' : 'red', detail: n8nProbe.status > 0 ? 'running' : 'UNREACHABLE', latencyMs: n8nProbe.latencyMs, tooltip: `n8n automation\nLatency: ${n8nProbe.latencyMs}ms` });
  }
  n8nItems.push(
    { name: 'Telnyx Voice UAD', status: n8nProbe.status > 0 ? 'green' : 'amber', detail: 'production workflow', tooltip: 'Voice lead analysis for UAD garage doors\nWorkflow ID: U6EZ2iLQ4zCGg31H\nDO NOT disable' },
    { name: 'Telnyx Voice MissParty', status: n8nProbe.status > 0 ? 'green' : 'amber', detail: 'production workflow', tooltip: 'Voice lead analysis for MissParty\nWorkflow ID: 9gfvZo9sB4b3pMWQ\nDO NOT disable' },
  );
  categories.push({ key: 'n8n', icon: '⚡', label: 'N8N INSTANCES & WORKFLOWS', items: n8nItems });

  // ─── 13. DOCUMENTATION SYNC ───
  categories.push({
    key: 'docs', icon: '📋', label: 'DOCUMENTATION',
    items: [
      { name: 'brain.md', status: 'green', detail: 'synced', tooltip: 'Mission control — North Star, authority hierarchy\nTier 0 (highest precedence)' },
      { name: 'CLAUDE.md', status: 'green', detail: 'synced', tooltip: 'Technical router — paths, URLs, stack\nUpdated: Mar 9, 2026' },
      { name: 'PRODUCT_STATUS.md', status: 'amber', detail: 'partially stale', tooltip: 'Per-product status tracker\nSome entries outdated (admin 404 says pending, actually fixed)' },
      { name: 'findings.md', status: 'green', detail: 'synced', tooltip: 'Root causes and lessons learned' },
      { name: 'progress.md', status: 'green', detail: 'synced', tooltip: 'Execution logs and task tracking' },
      { name: 'DECISIONS.md', status: 'green', detail: '20 decisions', tooltip: 'User decisions as canonical truth' },
      { name: 'NotebookLM', status: 'amber', detail: '36 notebooks', tooltip: '36 notebooks — spec/methodology source of truth\nNot synced with latest code changes\nKey: BLAST (1dc7ce26), VideoForge (0baf5f36)' },
      { name: '.claude/skills/', status: 'green', detail: '20+ skills', tooltip: 'Agent skill library covering all products\nRouter: SKILL_ROUTER.md' },
      { name: 'ARCHITECTURE.md', status: 'green', detail: 'synced', tooltip: 'High-level code structure reference' },
      { name: 'DATA_DICTIONARY.md', status: 'green', detail: 'synced', tooltip: 'Where every entity lives, sync rules' },
    ]
  });

  // ─── 14. GITHUB REPOS ───
  categories.push({
    key: 'repos', icon: '⎔', label: 'GITHUB REPOS',
    items: [
      { name: 'superseller', status: 'green', detail: 'main repo', url: 'https://github.com/imsuperseller/superseller', tooltip: 'Main monorepo — web, worker, marketplace, infrastructure' },
      { name: 'rensto-app', status: renstoProbe.ok ? 'green' : 'amber', detail: 'separate', url: 'https://github.com/imsuperseller/rensto-app', tooltip: 'Rensto contractor directory (separate business)' },
      { name: 'iron-dome-os', status: 'amber', detail: 'broken pipeline', url: 'https://github.com/imsuperseller/iron-dome-os', tooltip: 'Shai personal brand dashboard\nData pipeline broken (Aitable tables deleted)' },
      { name: 'yoram-landing', status: 'green', detail: 'live', url: 'https://github.com/yoramnfridman1/yoram-landing', tooltip: 'Yoram Friedman insurance landing page\nLive at yoramfriedman.co.il' },
    ]
  });

  // ─── 15. CRON & SCHEDULED TASKS ───
  const cronLines = (diag?.cronJobs || '').split('\n').filter((l: string) => l.trim() && !l.startsWith('#'));
  categories.push({
    key: 'crons', icon: '⏰', label: 'SCHEDULED TASKS',
    items: [
      { name: 'FB Bot Scheduler', status: fbBotProbe.ok ? 'green' : 'red', detail: fbBotProbe.ok ? 'running' : 'DOWN', tooltip: 'PM2: fb-scheduler\nSchedules: UAD 5/cycle, MissParty 3/cycle\nCooldowns: UAD 15min, MissParty 30min' },
      { name: 'Health Monitor', status: workerProbe.ok ? 'green' : 'red', detail: workerProbe.ok ? 'running' : 'DOWN', tooltip: 'Worker health monitor (runs in worker process)\nChecks all services periodically' },
      { name: 'ClaudeClaw Scheduler', status: workerProbe.ok ? 'green' : 'red', detail: 'hourly + daily', tooltip: 'Hourly and daily scheduled tasks for ClaudeClaw\nRuns in worker process via startScheduler()' },
      ...(cronLines.length > 0 ? cronLines.map((line: string, i: number) => ({
        name: `Cron #${i + 1}`,
        status: 'green' as Status,
        detail: line.slice(0, 40),
        tooltip: `Full cron entry:\n${line}`,
      })) : [{ name: 'System Crons', status: 'gray' as Status, detail: cronLines.length === 0 ? 'none / not readable' : `${cronLines.length} entries`, tooltip: 'Root crontab entries on RackNerd' }]),
    ]
  });

  // ─── 16. PENDING BLOCKERS ───
  categories.push({
    key: 'blockers', icon: '🚧', label: 'PENDING BLOCKERS',
    items: [
      { name: 'VideoForge Validation', status: 'red', detail: 'needs $1-2 test', tooltip: 'Quality fixes NEVER validated end-to-end\nRun 1 full test job (~$1-2 Kling credits)\nBlocker for selling to realtors' },
      { name: 'Elite Pro IG Credentials', status: 'red', detail: 'waiting on Saar', tooltip: 'Need Meta App ID/Secret from Saar Bitton\nCannot request until he pays\n$2,000/mo waiting' },
      { name: 'BUSINESS_COVERAGE_INDEX', status: 'amber', detail: 'too abstract', tooltip: 'docs/BUSINESS_COVERAGE_INDEX.md is abstract, not a real navigation map\nEvery session loses context' },
      { name: 'Iron Dome Data Pipeline', status: 'red', detail: 'tables deleted', tooltip: '3 Aitable tables deleted in Mar 5 cleanup\nDashboard shows zeros/mock data\nNeed: Rebuild n8n → PostgreSQL pipeline' },
      { name: 'Elite Pro Contract', status: 'red', detail: 'not sent', tooltip: 'eSignatures contract never sent to Saar\n$2,000/mo not activated\nTemplate: SuperSeller AI Services Agreement' },
      { name: 'PM2 Name Rename', status: 'amber', detail: 'tourreel → videoforge', tooltip: 'PM2 process still named "tourreel-worker"\nShould be "videoforge-worker" to match rebrand\nRequires: pm2 delete + pm2 start' },
    ]
  });

  // ─── 17. AUDIENCES & PROSPECTS ───
  const audiences: MCNode[] = [
    { name: 'Israeli Parliament Dallas', status: 'green', detail: '40+ members', tooltip: 'WhatsApp group of Israeli expats in DFW area\n~40+ active members, many are contractors/service providers\nGoldmine for SuperSeller outreach\nLast activity: today (Mar 9)' },
    { name: 'Rensto Contractors', status: 'green', detail: 'directory', url: 'https://rensto.com', tooltip: 'Rensto contractor directory\nPotential SuperSeller AI prospects\nUse for outreach — never merge codebases' },
    { name: 'Yaron (Craft/AI Agent)', status: 'amber', detail: 'warm prospect', tooltip: 'Yaron from Dallas group asked about building a custom AI agent\nAsked TODAY (Mar 9) — immediate outreach opportunity\nPerfect fit for AgentForge or ClaudeClaw' },
    { name: 'Local Locksmith', status: 'blue', detail: 'prospect', tooltip: 'Active service provider in Dallas group\nFrequently responds to requests\nIdeal for: Lead Pages, VideoForge' },
    { name: 'Avi Construction', status: 'amber', detail: 'prospect/customer', tooltip: 'Avi Mazar — Construction company in Dallas\nDocs in projects/customers/avi-construction/\nAlso active in Dallas Israeli group\nPotential: VideoForge, SocialHub, Lead Pages' },
    { name: 'Eyal Levy (Food Business)', status: 'blue', detail: 'prospect', tooltip: 'Eyal Levy — promotes kosher food venues\nVery active in group, promotes businesses\nIdeal for: SocialHub, Lead Pages' },
    { name: 'Maydan (Insurance)', status: 'blue', detail: 'prospect', tooltip: 'Maydan — UnitedHealthcare insurance agent\nPhone: 806-500-8336\nRegularly advertises in group\nIdeal for: Lead Pages, FrontDesk Voice AI' },
    { name: 'David Szender', status: 'blue', detail: 'prospect', tooltip: 'Active in group, asks about services\nIdeal for: marketplace bot, lead pages' },
  ];
  categories.push({ key: 'audiences', icon: '👥', label: 'AUDIENCES & PROSPECTS', items: audiences });

  // ─── 18. CUSTOMER LEADS ───
  const biz = diag?.business || {};
  const leadItems: MCNode[] = [
    { name: 'Lead Pages (/lp/)', status: 'green', detail: 'infrastructure ready', tooltip: 'Dynamic lead landing pages\n/lp/[slug] per customer\nCapture: name, phone, email, message\nNotifies via WhatsApp + email' },
    { name: 'FB Bot Leads', status: fbBotProbe.ok ? 'green' : 'red', detail: fbBotProbe.ok ? 'capturing' : 'DOWN', tooltip: 'Facebook Marketplace bot generates inquiries\nWebhook-server captures buyer messages\nRoutes to customer via WhatsApp' },
    { name: 'Voice Call Leads', status: n8nProbe.status > 0 ? 'green' : 'amber', detail: 'via Telnyx n8n', tooltip: 'Telnyx voice AI captures caller intent\nn8n workflow analyzes and routes\nActive: UAD + MissParty' },
    { name: 'Total Leads in DB', status: biz.leads > 0 ? 'green' : 'gray', detail: `${biz.leads || 0} leads`, tooltip: `PostgreSQL leads table\nTotal: ${biz.leads || 0} records` },
  ];
  categories.push({ key: 'leads', icon: '🎯', label: 'CUSTOMER LEADS', items: leadItems });

  // ─── 19. REVENUE & BILLING ───
  const revenueItems: MCNode[] = [
    { name: 'PayPal Checkout', status: process.env.PAYPAL_CLIENT_ID ? 'green' : 'red', detail: process.env.PAYPAL_CLIENT_ID ? 'active' : 'NOT CONFIGURED', tooltip: 'PayPal checkout (migrated from Stripe Feb 2026)\nDB columns keep stripe* names but store PayPal IDs' },
    { name: 'Elite Pro (Saar)', status: 'red', detail: '$2K/mo NOT activated', tooltip: 'Saar Bitton — Elite Pro package\n$2,000/month contract not sent\nWaiting on IG credentials from Saar\nBlocked: needs eSignature contract' },
    { name: 'UAD Garage Doors', status: 'green', detail: 'active customer', tooltip: 'FB Marketplace Bot customer\nActive posting schedule\nTelnyx voice lead analysis live' },
    { name: 'MissParty', status: 'green', detail: 'active customer', tooltip: 'FB Marketplace Bot customer\nActive posting schedule\nTelnyx voice lead analysis live' },
    { name: 'Kedem Developments', status: 'amber', detail: 'pending', tooltip: 'Customer project in projects/customers/\nStatus: pending activation' },
    { name: 'Credit System', status: process.env.CREDITS_ENABLED !== 'false' ? 'green' : 'amber', detail: 'schema ready', tooltip: 'Credit billing system\nPer-service rates defined\nWeb: lib/credits.ts, Worker: services/credits.ts' },
  ];
  categories.push({ key: 'revenue', icon: '💰', label: 'REVENUE & BILLING', items: revenueItems });

  // ─── 20. EXPENSES & COSTS ───
  const exp = biz.expenses || {};
  const expenseItems: MCNode[] = [
    { name: 'API Spend Today', status: (exp.today_spend || 0) > 10 ? 'amber' : 'green', detail: `$${Number(exp.today_spend || 0).toFixed(2)}`, tooltip: `Today's API costs across all services\nKling Pro $0.10, Std $0.03, Suno $0.06, Nano $0.02, Gemini $0.001` },
    { name: 'API Spend Month', status: (exp.month_spend || 0) > 100 ? 'amber' : 'green', detail: `$${Number(exp.month_spend || 0).toFixed(2)}`, tooltip: `Last 30 days API costs\nTotal calls: ${exp.total_calls || 0}` },
    { name: 'All-Time API Spend', status: 'blue', detail: `$${Number(exp.total_spend || 0).toFixed(2)} (${exp.total_calls || 0} calls)`, tooltip: `Lifetime API expense tracking\nTable: api_expenses\nServices: Kling, Suno, Nano, Gemini, Recraft` },
    { name: 'RackNerd VPS', status: 'green', detail: '$47/yr', tooltip: 'RackNerd VPS hosting\n6GB RAM, 100GB disk, 9.77TB bandwidth\nDAL177KVM node, Ubuntu 24.04' },
    { name: 'Vercel', status: 'green', detail: 'hobby plan', tooltip: 'Vercel frontend hosting\nPro features via team plan' },
    { name: 'QuickBooks', status: 'gray', detail: 'CANCELLED', tooltip: 'Cancelled Mar 8, 2026\nSaves $600/yr\nReason: Solo LLC with ~5 customers\nPayPal reports + built-in tracker sufficient' },
    { name: 'Kie.ai Credits', status: workerProbe.ok ? 'amber' : 'red', detail: workerProbe.ok ? 'check balance' : 'worker DOWN', tooltip: 'Kie.ai API credits for Kling, Gemini, etc.\nKey lives on RackNerd worker .env\nMust monitor balance to avoid pipeline failures' },
  ];
  categories.push({ key: 'expenses', icon: '📊', label: 'EXPENSES & COSTS', items: expenseItems });

  // ─── 21. USAGE & ANALYTICS ───
  const vj = biz.videoJobs || {};
  const usageItems: MCNode[] = [
    { name: 'Registered Users', status: biz.users > 0 ? 'green' : 'gray', detail: `${biz.users || 0} users`, tooltip: 'PostgreSQL User table count' },
    { name: 'Video Jobs', status: vj.total > 0 ? 'green' : 'gray', detail: `${vj.total || 0} total (${vj.completed || 0} done, ${vj.failed || 0} failed, ${vj.active || 0} active)`, tooltip: `Video pipeline jobs\nCompleted: ${vj.completed || 0}\nFailed: ${vj.failed || 0}\nActive: ${vj.active || 0}` },
    { name: 'Video Clips', status: biz.clips > 0 ? 'green' : 'gray', detail: `${biz.clips || 0} clips`, tooltip: 'Individual AI-generated video clips\nKling 3.0 via Kie.ai' },
    { name: 'FB Listings', status: biz.listings > 0 ? 'green' : 'gray', detail: `${biz.listings || 0} listings`, tooltip: 'Facebook Marketplace listings in DB' },
    { name: 'Model Catalog', status: biz.modelCatalog > 0 ? 'green' : 'gray', detail: `${biz.modelCatalog || 0} models tracked`, tooltip: 'AI Model Observatory\n50+ models across 8 categories\nAuto-sync from Kie.ai/fal.ai' },
    { name: 'Group Agent Configs', status: biz.groupAgentConfigs > 0 ? 'green' : 'gray', detail: `${biz.groupAgentConfigs || 0} configs`, tooltip: 'ClaudeClaw group agent configurations\n3-tier memory + guardrails' },
  ];
  categories.push({ key: 'usage', icon: '📈', label: 'USAGE & ANALYTICS', items: usageItems });

  // ─── 22. WHATSAPP NUMBERS & TELEPHONY ───
  const telItems: MCNode[] = [
    { name: 'Shai Personal', status: 'green', detail: '+1 (469) 588-5133', tooltip: 'Primary WhatsApp for admin alerts\nUsed by Mission Control for status change notifications\nWAHA session: default' },
    { name: 'SuperSeller Business', status: 'amber', detail: 'TBD', tooltip: 'Business WhatsApp number\nNeeds dedicated number for customer comms' },
    { name: 'Telnyx UAD Number', status: n8nProbe.status > 0 ? 'green' : 'amber', detail: 'voice AI', tooltip: 'Telnyx number for UAD garage doors\nFrontDesk voice AI answers calls\nLeads analyzed by n8n workflow' },
    { name: 'Telnyx MissParty Number', status: n8nProbe.status > 0 ? 'green' : 'amber', detail: 'voice AI', tooltip: 'Telnyx number for MissParty\nFrontDesk voice AI answers calls\nLeads analyzed by n8n workflow' },
    { name: 'WAHA Service', status: wahaSessionCount > 0 ? 'green' : 'red', detail: `${wahaSessionCount} session(s)`, tooltip: `WAHA Pro WhatsApp API\nRunning in Docker on RackNerd\nSessions: ${wahaSessionCount}\nUsed by: ClaudeClaw, Lead Pages, Winner Studio` },
  ];
  categories.push({ key: 'telephony', icon: '📱', label: 'WHATSAPP NUMBERS & TELEPHONY', items: telItems });

  // ─── 23. ASSETS & DELIVERABLES ───
  const assetItems: MCNode[] = [
    { name: 'R2 Storage (Cloudflare)', status: process.env.R2_ACCESS_KEY_ID ? 'green' : 'red', detail: process.env.R2_ACCESS_KEY_ID ? 'connected' : 'NOT CONFIGURED', tooltip: 'Cloudflare R2 object storage\nStores: generated videos, photos, deliverables\nUsed by: VideoForge, Winner Studio' },
    { name: 'Generated Videos', status: vj.completed > 0 ? 'green' : 'gray', detail: `${vj.completed || 0} videos`, tooltip: 'AI-generated property/marketing videos\nStored in R2 + accessible via CDN' },
    { name: 'Customer Deliverables', status: 'amber', detail: 'manual tracking', tooltip: 'Delivered assets to customers\nNot yet tracked systematically\nNeed: per-customer deliverable log' },
    { name: 'Brand Assets', status: 'green', detail: 'in repo', tooltip: 'SuperSeller brand assets\nLogos, colors, fonts in design tokens\nCustomer brand assets in portal configs' },
    { name: 'Voice Clones', status: 'gray', detail: 'not started', tooltip: 'ElevenLabs voice clones\nPlanned for FrontDesk customization\nNot yet created' },
  ];
  categories.push({ key: 'assets', icon: '🗃️', label: 'ASSETS & DELIVERABLES', items: assetItems });

  // ─── 24. UX/UI QUALITY ───
  const uxItems: MCNode[] = [
    { name: 'superseller.agency', status: 'green', detail: 'modern', url: 'https://superseller.agency', tooltip: 'Main marketing website\nNext.js + Tailwind + i18n (7 locales)\nDark theme + glassmorphism' },
    { name: 'Admin Dashboard', status: 'green', detail: '9 tabs', url: 'https://admin.superseller.agency', tooltip: 'Admin portal at admin.superseller.agency\n9 tabs: Dashboard, Mission Control, Ecosystem, CRM, Monitor, Treasury, Workflows, Agents, Settings\nMagic-link auth' },
    { name: 'Lead Pages (/lp/)', status: 'amber', detail: 'design upgrade needed', tooltip: 'Dynamic lead pages — infrastructure works\nVisual quality: 5.2/10 per PRODUCT_STATUS\nNeeds: dark theme + glassmorphism\nPer-customer branding (colors, logo, font, RTL/LTR)' },
    { name: 'Customer Portal', status: 'amber', detail: 'basic', tooltip: 'Customer-facing portal at /portal/[slug]\nBasic functionality works\nNeeds: better onboarding UX, service cards' },
    { name: 'Compete Page', status: 'amber', detail: 'new', tooltip: 'Competitor ad intelligence feed\n/compete/[tenantSlug]\nRecently built, needs polish' },
    { name: 'Design System', status: 'amber', detail: 'partial', tooltip: 'Design tokens exist (src/lib/design-tokens.ts)\nNo unified component library\nShould extract common patterns' },
    { name: 'Mobile Responsiveness', status: 'amber', detail: 'varies', tooltip: 'Main site: responsive\nAdmin: desktop-optimized\nLead pages: needs testing\nCustomer portal: needs testing' },
  ];
  categories.push({ key: 'ux', icon: '🎨', label: 'UX/UI QUALITY', items: uxItems });

  // ─── 25. CUSTOMER JOURNEYS ───
  const journeyItems: MCNode[] = [
    { name: 'VideoForge Journey', status: 'amber', detail: '3 of 4 stages', tooltip: 'Stages: Awareness ✅ → Purchase ⚠️ → Onboarding ⚠️ → Retention ❌\nMissing: automated provisioning after PayPal payment\n25+ videos produced but manual onboarding' },
    { name: 'FB Bot Journey', status: 'green', detail: '4 of 4 stages', tooltip: 'Stages: Awareness ✅ → Purchase ✅ → Onboarding ✅ → Retention ✅\nMost mature product journey\nUAD + MissParty posting daily\nVoice lead analysis active' },
    { name: 'Lead Pages Journey', status: 'amber', detail: '2 of 4 stages', tooltip: 'Stages: Awareness ✅ → Purchase ❌ → Onboarding ⚠️ → Retention ❌\nInfra ready but no self-serve purchase\nManual setup per customer' },
    { name: 'FrontDesk Journey', status: 'red', detail: '1 of 4 stages', tooltip: 'Stages: Awareness ✅ → Purchase ❌ → Onboarding ❌ → Retention ❌\nVoice assistant works technically\nNo self-serve, no contract template, webhook migration pending' },
    { name: 'Winner Studio Journey', status: 'amber', detail: 'built, not active', tooltip: 'Stages: Awareness ✅ → Purchase ❌ → Onboarding ✅ → Retention ❌\nCode verified E2E\nYossi not actively using\nNeeds: reactivation strategy' },
    { name: 'AgentForge Journey', status: 'red', detail: 'spec only', tooltip: 'Stages: Awareness ❌ → Purchase ❌ → Onboarding ❌ → Retention ❌\nSpec complete, code not started\nInternal tool decision made' },
    { name: 'SocialHub Journey', status: 'red', detail: 'spec only', tooltip: 'Stages: Awareness ❌ → Purchase ❌ → Onboarding ❌ → Retention ❌\nPhase 2 product — spec complete, code NOT started' },
  ];
  categories.push({ key: 'journeys', icon: '🛤️', label: 'CUSTOMER JOURNEYS', items: journeyItems });

  // ─── 26. BRANDS ───
  const brandItems: MCNode[] = [
    { name: 'SuperSeller AI', status: 'green', detail: 'primary brand', url: 'https://superseller.agency', tooltip: 'Primary business brand\nSuperSeller AI — AI-powered marketing for SMBs\nDomain: superseller.agency' },
    { name: 'Rensto', status: renstoProbe.ok ? 'green' : 'red', detail: 'separate business', url: 'https://rensto.com', tooltip: 'SEPARATE BUSINESS — never mix with SuperSeller\nOnline contractor directory\nRensto contractors = SuperSeller prospects (strategy only)' },
    { name: 'UAD Garage Doors', status: 'green', detail: 'customer brand', tooltip: 'Customer: UAD garage door services\nFB Bot + Voice AI active\nBrand configured in bot-config.json' },
    { name: 'MissParty', status: 'green', detail: 'customer brand', tooltip: 'Customer: MissParty event services\nFB Bot + Voice AI active\nSolution data in library/solution-data/' },
    { name: 'Elite Pro', status: 'red', detail: 'not activated', tooltip: 'Saar Bitton — Elite Pro package\nContract not sent, IG creds not received\n$2,000/mo potential' },
    { name: 'Kedem Developments', status: 'amber', detail: 'pending', tooltip: 'Real estate customer\nDocs in projects/customers/kedem-developments/' },
    { name: 'Avi Construction', status: 'amber', detail: 'prospect/customer', tooltip: 'Avi Mazar Construction\nDocs in projects/customers/avi-construction/\nAlso active in Dallas Israeli group' },
    { name: 'Parliament Group Strategy', status: 'blue', detail: 'community', tooltip: 'Israeli Parliament WhatsApp group in Dallas\nStrategy doc: PARLIAMENT-GROUP-STRATEGY.md\nLead source for multiple products' },
  ];
  categories.push({ key: 'brands', icon: '🏷️', label: 'BRANDS & IDENTITIES', items: brandItems });

  // ─── 27. COMPETITIVE INTELLIGENCE ───
  const competeItems: MCNode[] = [
    { name: 'Compete Page', status: 'amber', detail: 'built', url: `https://superseller.agency/compete`, tooltip: 'Competitor ad intelligence feed\n/compete/[tenantSlug]\nShows competitor FB ads with analysis' },
    { name: 'Yoram Competitor Scrape', status: 'blue', detail: 'script ready', tooltip: 'Competitor video caching script\ntools/cache-competitor-videos.mjs\napps/worker/src/scripts/yoram-competitor-scrape.ts' },
    { name: 'Ad Library Integration', status: 'amber', detail: 'partial', tooltip: 'Facebook Ad Library API integration\nPulls competitor ads for analysis\nNeeds: scheduled refresh, more tenants' },
  ];
  categories.push({ key: 'compete', icon: '🔍', label: 'COMPETITIVE INTELLIGENCE', items: competeItems });

  // ─── 28. RAG & KNOWLEDGE BASE ───
  const ragDocs = biz.ragDocuments || {};
  const ragItems: MCNode[] = [
    { name: 'pgvector Extension', status: workerChecks.postgres === 'ok' ? 'green' : 'red', detail: 'v0.8.1 HNSW', tooltip: 'PostgreSQL pgvector extension\nHNSW indexing for fast similarity search\nEmbedding dim: 768 (nomic-embed-text)' },
    { name: 'Ollama Embeddings', status: ollamaProbe.ok ? 'green' : 'red', detail: ollamaProbe.ok ? 'running' : 'DOWN', latencyMs: ollamaProbe.latencyMs, tooltip: `Ollama LLM server on RackNerd\nModel: nomic-embed-text (768-dim)\nUsed by: ClaudeClaw context, Group Agent memory\nLatency: ${ollamaProbe.latencyMs}ms` },
    { name: 'RAG Documents', status: (ragDocs.docs || 0) > 0 ? 'green' : 'gray', detail: `${ragDocs.docs || 0} docs, ${ragDocs.tenants || 0} tenants`, tooltip: `Documents indexed for RAG retrieval\nTable: rag_documents\nTenants with docs: ${ragDocs.tenants || 0}` },
    { name: 'ClaudeClaw Memory', status: biz.groupAgentConfigs > 0 ? 'green' : 'gray', detail: '3-tier system', tooltip: 'ClaudeClaw group agent memory\n3 tiers: session (Redis), conversation (Postgres), long-term (pgvector)\nConfigs: ' + (biz.groupAgentConfigs || 0) },
  ];
  categories.push({ key: 'rag', icon: '🧠', label: 'RAG & KNOWLEDGE BASE', items: ragItems });

  // ─── 29. VOICE & AI AGENTS ───
  const agentItems: MCNode[] = [
    { name: 'ClaudeClaw', status: workerProbe.ok ? 'green' : 'red', detail: 'WhatsApp→Claude bridge', tooltip: 'WhatsApp to Claude AI bridge\nGroup Agent with 3-tier memory + guardrails\nRebuilt Mar 8, 2026' },
    { name: 'FrontDesk Voice AI', status: n8nProbe.status > 0 ? 'amber' : 'red', detail: 'partial', tooltip: 'Telnyx AI voice assistant\nVoice assistant works but webhook migration pending\neSignatures not started' },
    { name: 'Credential Sentinel', status: 'blue', detail: 'built', tooltip: 'Autonomous agent monitoring credential drift\nPrevents silent outages from expired keys\nWhatsApp-alerting capable' },
    { name: 'Doc Integrity Scanner', status: 'blue', detail: 'built', tooltip: 'Autonomous agent scanning doc staleness\nPrevents contradictions and stale references' },
    { name: 'Session Watchdog', status: 'blue', detail: 'built', tooltip: 'Autonomous agent monitoring session expiry\nPrevents WAHA/GoLogin session drops' },
  ];
  categories.push({ key: 'agents', icon: '🤖', label: 'AI AGENTS & VOICE', items: agentItems });

  // ─── 30. CONTENT PIPELINE ───
  const contentItems: MCNode[] = [
    { name: 'SocialHub', status: 'red', detail: 'code not started', tooltip: 'Multi-platform social media management\nSpec complete (see socialhub skill)\nPhase 2 product — code NOT started' },
    { name: 'FB Bot Posting', status: fbBotProbe.ok ? 'green' : 'red', detail: fbBotProbe.ok ? 'active' : 'DOWN', tooltip: 'Facebook Marketplace auto-posting\nUAD: 5/cycle (15min cooldown)\nMissParty: 3/cycle (30min cooldown)' },
    { name: 'Blog (superseller.agency)', status: 'green', detail: 'live', url: 'https://superseller.agency/blog', tooltip: 'SEO blog on main website\nSeeded via scripts/seed-blog.ts\nAutomatic i18n across 7 locales' },
    { name: 'Prompt Store', status: 'blue', detail: 'built', tooltip: 'Centralized prompt configuration\nAPI route: /api/admin/prompts\nDB-backed prompt management' },
  ];
  categories.push({ key: 'content', icon: '📝', label: 'CONTENT PIPELINE', items: contentItems });

  // ─── 31. PROMPTS ───
  const promptItems: MCNode[] = [
    { name: 'Prompt Store API', status: 'blue', detail: '/api/admin/prompts', tooltip: 'Centralized prompt configuration\nDB-backed management via PromptConfig model\nAPI: /api/admin/prompts (GET/POST/PUT)\nSeed: tools/seed-prompt-configs.ts' },
    { name: 'Video Pipeline Prompts', status: 'green', detail: 'in code', tooltip: 'Scene description prompts for Kling 3.0\nSource: apps/worker/src/services/prompt-generator.ts\nModel: gemini-3-flash, temp 0.7\nCritical: drives all video clip generation' },
    { name: 'ClaudeClaw System Prompt', status: 'green', detail: 'active', tooltip: 'Claude system prompt for WhatsApp bridge\nSource: apps/worker/src/services/claudeclaw-router.ts\nIncludes guardrails, memory context, group rules' },
    { name: 'FB Bot Content Prompts', status: 'green', detail: 'in code', tooltip: 'Gemini prompts for marketplace listing copy\nSource: fb-marketplace-lister/deploy-package/content-generator.js\nGenerates city-specific listing descriptions' },
    { name: 'AgentForge Prompts', status: 'gray', detail: 'spec only', tooltip: 'Multi-stage research prompts\nBusiness discovery, design analysis, market research\nNot implemented yet (AgentForge code not started)' },
    { name: 'Photo Classifier Prompt', status: 'green', detail: 'active', tooltip: 'Gemini Vision prompt for room classification\nSource: apps/worker/src/services/photo-classifier.ts\nClassifies listing photos into room types' },
    { name: 'Music Style Prompt', status: 'green', detail: 'active', tooltip: 'Prompt for selecting music style per property\nSource: apps/worker/src/services/music-style-picker.ts\nMaps property type → music mood' },
  ];
  categories.push({ key: 'prompts', icon: '💬', label: 'PROMPTS & AI CONFIGS', items: promptItems });

  // ─── 32. ERRORS & FAILURES ───
  const queueFailures = (diag?.queues || []).reduce((sum: number, q: any) => sum + (parseInt(q.failed) || 0), 0);
  const pm2Restarts = (diag?.pm2 || []).reduce((sum: number, p: any) => sum + (parseInt(p.restarts) || 0), 0);
  const vjFailed = parseInt(vj.failed) || 0;
  const vjTotal = parseInt(vj.total) || 1;
  const jobSuccessRate = vjTotal > 0 ? Math.round(((parseInt(vj.completed) || 0) / vjTotal) * 100) : 0;

  const errorItems: MCNode[] = [
    { name: 'Video Job Failures', status: vjFailed > 5 ? 'red' : vjFailed > 0 ? 'amber' : 'green', detail: `${vjFailed} of ${vjTotal} failed (${jobSuccessRate}% success)`, tooltip: `Video pipeline failure rate\nTotal: ${vjTotal}\nCompleted: ${vj.completed || 0}\nFailed: ${vjFailed}\nSuccess rate: ${jobSuccessRate}%\n${jobSuccessRate < 50 ? 'CRITICAL: Below 50% success rate' : ''}` },
    { name: 'Queue Failures (total)', status: queueFailures > 50 ? 'red' : queueFailures > 10 ? 'amber' : 'green', detail: `${queueFailures} failed jobs across queues`, tooltip: `Aggregate BullMQ queue failures\n${(diag?.queues || []).map((q: any) => `${q.name}: ${q.failed} failed`).join('\n')}` },
    { name: 'PM2 Restarts', status: pm2Restarts > 20 ? 'red' : pm2Restarts > 5 ? 'amber' : 'green', detail: `${pm2Restarts} total across all processes`, tooltip: `PM2 process crash restarts (aggregate)\n${(diag?.pm2 || []).map((p: any) => `${p.name}: ${p.restarts} restarts`).join('\n')}\nTotal: ${pm2Restarts}\nHigh restarts = instability or memory leaks` },
    { name: 'Elite Pro Activation', status: 'red', detail: 'BLOCKED', tooltip: 'Saar Bitton Elite Pro ($2K/mo)\nContract not sent, IG creds not received\nRevenue blocked since initial contact' },
    { name: 'Iron Dome Pipeline', status: 'red', detail: 'data pipeline broken', tooltip: '3 Aitable tables deleted in Mar 5 cleanup\nDashboard shows zeros/mock data\nNeed: Rebuild n8n → PostgreSQL pipeline' },
    { name: 'api_expenses Table', status: (biz.expenses === null) ? 'amber' : 'green', detail: biz.expenses === null ? 'table missing' : 'tracking', tooltip: biz.expenses === null ? 'api_expenses table does not exist in PostgreSQL\nCost tracking is MANDATORY per CLAUDE.md\nNo costs being logged — all trackExpense() calls silently fail' : 'Expense tracking active' },
    { name: 'rag_documents Table', status: (biz.ragDocuments === null) ? 'amber' : 'green', detail: biz.ragDocuments === null ? 'table missing' : `${(biz.ragDocuments as any)?.docs || 0} docs`, tooltip: biz.ragDocuments === null ? 'rag_documents table does not exist in PostgreSQL\nRAG system cannot store/retrieve documents\nClaudeClaw long-term memory non-functional' : 'RAG storage active' },
  ];
  categories.push({ key: 'errors', icon: '🚨', label: 'ERRORS & FAILURES', items: errorItems });

  // ─── 33. INSIGHTS & OBSERVATIONS ───
  const insightItems: MCNode[] = [];

  if (jobSuccessRate < 50 && vjTotal > 5) {
    insightItems.push({ name: 'Video Pipeline Health', status: 'red', detail: `${jobSuccessRate}% success rate`, tooltip: `Only ${jobSuccessRate}% of video jobs complete successfully\n${vjFailed} failures out of ${vjTotal} total\nThis is the CORE revenue product — needs investigation\nCommon causes: Kling API errors, WebP format issues, timeout` });
  }

  if (pm2Restarts > 20) {
    insightItems.push({ name: 'Worker Instability', status: 'red', detail: `${pm2Restarts} PM2 restarts`, tooltip: `Worker has restarted ${pm2Restarts} times\nPossible causes: memory leaks, unhandled exceptions, OOM kills\nCheck: pm2 logs tourreel-worker --lines 100` });
  }

  const wahaWorking = (diag?.wahaSessions || []).filter((s: any) => s.status === 'WORKING').length;
  if (wahaWorking >= 2) {
    insightItems.push({ name: 'WhatsApp Healthy', status: 'green', detail: `${wahaWorking} sessions active`, tooltip: 'All WAHA sessions operational\nReady for: ClaudeClaw, Lead notifications, Winner Studio delivery, Mission Control alerts' });
  }

  const n8nBothOnline = (diag?.n8nInstances || []).every((i: any) => i.status === 'online');
  if (n8nBothOnline && (diag?.n8nInstances || []).length === 2) {
    insightItems.push({ name: 'n8n Utilization', status: 'amber', detail: '2 instances, only 1 used', tooltip: 'Both n8n instances online but personal instance (:5679) is underutilized\nConsider: migrate personal brand automations to it\nOr: shut down to save memory (~200MB)' });
  }

  insightItems.push({ name: 'Prospect: Yaron (AI Agent)', status: 'amber', detail: 'HOT LEAD — asked Mar 9', tooltip: 'Yaron from Dallas Israeli group asked:\n"how to build a custom agent in ChatGPT"\nThis is a WARM PROSPECT for AgentForge or ClaudeClaw\nImmediate outreach recommended' });

  insightItems.push({ name: 'Revenue Gap', status: 'red', detail: 'Elite Pro $2K/mo stalled', tooltip: 'Biggest revenue opportunity blocked:\nSaar Bitton Elite Pro package = $2,000/month\nBlocked by: no contract sent, no IG credentials received\nAction: send eSignature contract, follow up on creds' });

  if (biz.expenses === null) {
    insightItems.push({ name: 'Cost Blind Spot', status: 'red', detail: 'no expense tracking', tooltip: 'api_expenses table missing — all trackExpense() calls fail silently\nYou have NO VISIBILITY into API costs\nKling Pro: $0.10/clip, Suno: $0.06/track\nWith 288 clips generated, that could be $28+ untracked' });
  }

  const leadPageScore = 5.2;
  if (leadPageScore < 7) {
    insightItems.push({ name: 'Lead Page Quality', status: 'amber', detail: `design score ${leadPageScore}/10`, tooltip: 'Lead pages are functional but visually 5.2/10\nNeeds: dark theme + glassmorphism upgrade\nThis is customer-facing — directly impacts conversion\nPRODUCT_STATUS.md rates it "design upgrade needed"' });
  }

  categories.push({ key: 'insights', icon: '💡', label: 'INSIGHTS & OBSERVATIONS', items: insightItems });

  // Summary counts
  const counts = { total: 0, green: 0, red: 0, amber: 0, blue: 0, gray: 0 };
  categories.forEach(cat => cat.items.forEach(item => {
    counts.total++;
    counts[item.status]++;
  }));

  // Detect changes and send WhatsApp alerts
  const liveProbeCategories = categories.filter(c =>
    ['domains', 'infra', 'server', 'pm2', 'waha', 'nginx', 'queues', 'n8n', 'telephony', 'rag'].includes(c.key)
  );
  const changes = detectChanges(liveProbeCategories);
  if (changes.length > 0) {
    sendWhatsAppAlert(changes).catch(() => {});
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    categories,
    counts,
    changes,
    serverInfo: {
      workerHealthy: workerProbe.ok,
      workerLatency: workerProbe.latencyMs,
      dbConnected: workerChecks.postgres === 'ok',
      redisConnected: workerChecks.redis === 'ok',
      disk: diag?.server?.disk || null,
      memory: diag?.server?.memory || null,
      uptime: diag?.server?.uptime || null,
    },
    businessSummary: {
      users: biz.users || 0,
      videoJobs: vj.total || 0,
      leads: biz.leads || 0,
      apiSpendToday: Number(exp.today_spend || 0).toFixed(2),
      apiSpendMonth: Number(exp.month_spend || 0).toFixed(2),
      ragDocs: ragDocs.docs || 0,
    }
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
}
