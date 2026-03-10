/**
 * map-codebase.ts — Auto-generate REPO_MAP.md from the actual file tree.
 *
 * Usage: npx tsx tools/map-codebase.ts
 *
 * Scans the repo for key structural elements (apps, API routes, components,
 * skills, tools, config) and writes a fresh REPO_MAP.md. Replaces manual
 * maintenance of the codebase index.
 */

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "fs";
import { join, relative, basename, extname } from "path";

const ROOT = join(import.meta.dirname, "..");
const IGNORE = new Set([
  "node_modules", ".next", ".git", "dist", ".turbo", ".vercel",
  "__pycache__", ".cache", "coverage", "temp-backup",
]);

function walk(dir: string, maxDepth = 4, depth = 0): string[] {
  if (depth > maxDepth) return [];
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      if (IGNORE.has(entry) || entry.startsWith(".")) continue;
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        results.push(...walk(full, maxDepth, depth + 1));
      } else {
        results.push(full);
      }
    }
  } catch {}
  return results;
}

function rel(p: string): string {
  return relative(ROOT, p);
}

// --- Scanners ---

function scanApiRoutes(webSrc: string): string[] {
  const apiDir = join(webSrc, "app/api");
  if (!existsSync(apiDir)) return [];
  const routes: string[] = [];
  for (const f of walk(apiDir, 6)) {
    if (basename(f) === "route.ts") {
      const routePath = relative(apiDir, f)
        .replace(/\/route\.ts$/, "")
        .replace(/\[([^\]]+)\]/g, ":$1");
      routes.push(`/api/${routePath}`);
    }
  }
  return routes.sort();
}

function scanLocalePages(webSrc: string): string[] {
  const pagesDir = join(webSrc, "app/[locale]");
  if (!existsSync(pagesDir)) return [];
  const pages: string[] = [];
  for (const f of walk(pagesDir, 6)) {
    if (basename(f) === "page.tsx") {
      let pagePath = relative(pagesDir, f)
        .replace(/\/page\.tsx$/, "")
        .replace(/\(.*?\)\//g, "")
        .replace(/\[([^\]]+)\]/g, ":$1");
      if (!pagePath) pagePath = "/";
      pages.push(`/${pagePath}`);
    }
  }
  return pages.sort();
}

function scanComponents(dir: string): { name: string; path: string }[] {
  if (!existsSync(dir)) return [];
  const comps: { name: string; path: string }[] = [];
  for (const f of walk(dir, 2)) {
    if (extname(f) === ".tsx" && !basename(f).startsWith("index")) {
      comps.push({ name: basename(f, ".tsx"), path: rel(f) });
    }
  }
  return comps.sort((a, b) => a.name.localeCompare(b.name));
}

function scanWorkerRoutes(routesFile: string): string[] {
  if (!existsSync(routesFile)) return [];
  const routes: string[] = [];
  try {
    const content = readFileSync(routesFile, "utf-8");
    const regex = /apiRouter\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
      routes.push(`${match[1].toUpperCase()} /api${match[2]}`);
    }
  } catch {}
  return routes;
}

function scanSkills(skillsDir: string): { name: string; path: string }[] {
  if (!existsSync(skillsDir)) return [];
  const skills: { name: string; path: string }[] = [];
  for (const entry of readdirSync(skillsDir)) {
    const skillFile = join(skillsDir, entry, "SKILL.md");
    if (existsSync(skillFile)) {
      skills.push({ name: entry, path: rel(skillFile) });
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function scanQueues(queuesFile: string): string[] {
  if (!existsSync(queuesFile)) return [];
  const queues: string[] = [];
  try {
    const content = readFileSync(queuesFile, "utf-8");
    const regex = /new Queue\s*\(\s*["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      queues.push(match[1]);
    }
  } catch {}
  return queues;
}

function scanSchedulerJobs(schedulerFile: string): string[] {
  if (!existsSync(schedulerFile)) return [];
  const jobs: string[] = [];
  try {
    const content = readFileSync(schedulerFile, "utf-8");
    const regex = /scheduleJob\s*\(\s*["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      jobs.push(match[1]);
    }
  } catch {}
  return jobs;
}

function scanKeyModules(libDir: string): { name: string; path: string }[] {
  if (!existsSync(libDir)) return [];
  const modules: { name: string; path: string }[] = [];
  try {
    for (const entry of readdirSync(libDir)) {
      const full = join(libDir, entry);
      const stat = statSync(full);
      if (stat.isFile() && (entry.endsWith(".ts") || entry.endsWith(".tsx"))) {
        modules.push({ name: basename(entry, extname(entry)), path: rel(full) });
      } else if (stat.isDirectory()) {
        modules.push({ name: entry + "/", path: rel(full) + "/" });
      }
    }
  } catch {}
  return modules.sort((a, b) => a.name.localeCompare(b.name));
}

function scanWorkerServices(servicesDir: string): { name: string; path: string }[] {
  if (!existsSync(servicesDir)) return [];
  const services: { name: string; path: string }[] = [];
  try {
    for (const entry of readdirSync(servicesDir)) {
      const full = join(servicesDir, entry);
      const stat = statSync(full);
      if (stat.isFile() && entry.endsWith(".ts")) {
        services.push({ name: basename(entry, ".ts"), path: rel(full) });
      } else if (stat.isDirectory()) {
        services.push({ name: entry + "/", path: rel(full) + "/" });
      }
    }
  } catch {}
  return services.sort((a, b) => a.name.localeCompare(b.name));
}

function countFiles(dir: string, ext: string): number {
  if (!existsSync(dir)) return 0;
  return walk(dir, 6).filter(f => f.endsWith(ext)).length;
}

// --- Build ---

const webSrc = join(ROOT, "apps/web/superseller-site/src");
const workerSrc = join(ROOT, "apps/worker/src");
const skillsDir = join(ROOT, ".claude/skills");

const apiRoutes = scanApiRoutes(webSrc);
const pages = scanLocalePages(webSrc);
const adminComponents = scanComponents(join(webSrc, "components/admin"));
const uiComponents = scanComponents(join(webSrc, "components/ui"));
const workerRoutes = scanWorkerRoutes(join(workerSrc, "api/routes.ts"));
const skills = scanSkills(skillsDir);
const queues = scanQueues(join(workerSrc, "queue/queues.ts"));
const schedulerJobs = scanSchedulerJobs(join(workerSrc, "services/scheduler.ts"));

const webLibModules = scanKeyModules(join(webSrc, "lib"));
const workerServices = scanWorkerServices(join(workerSrc, "services"));

const tsxCount = countFiles(webSrc, ".tsx");
const tsWorkerCount = countFiles(workerSrc, ".ts");

const now = new Date().toISOString().split("T")[0];

const output = `# Repo Map — Codebase Structure Index

**Auto-generated**: ${now} by \`npx tsx tools/map-codebase.ts\`
**Purpose**: Directed search index — find any key file in 1 lookup instead of 3+ Glob attempts.

---

## Stats

| Metric | Count |
|--------|-------|
| Web .tsx files | ${tsxCount} |
| Worker .ts files | ${tsWorkerCount} |
| API routes (web) | ${apiRoutes.length} |
| Worker endpoints | ${workerRoutes.length} |
| Pages | ${pages.length} |
| Admin components | ${adminComponents.length} |
| UI components | ${uiComponents.length} |
| Skills | ${skills.length} |
| BullMQ queues | ${queues.length} |
| Scheduler jobs | ${schedulerJobs.length} |

---

## Live Apps

| App | Path | Framework | Deploy |
|-----|------|-----------|--------|
| **Web** (superseller.agency, admin, API) | \`apps/web/superseller-site/\` | Next.js 14+ (Vercel) | \`git push\` or \`vercel --prod\` |
| **Worker** (VideoForge, FrontDesk) | \`apps/worker/\` | Express + BullMQ (RackNerd) | \`./apps/worker/deploy-to-racknerd.sh\` |

---

## Web API Routes (${apiRoutes.length})

${apiRoutes.map(r => `- \`${r}\``).join("\n")}

---

## Web Pages (${pages.length})

${pages.map(p => `- \`${p}\``).join("\n")}

---

## Worker Endpoints (${workerRoutes.length})

${workerRoutes.map(r => `- \`${r}\``).join("\n")}

---

## Web Key Modules (\`src/lib/\`) (${webLibModules.length})

| Module | Path |
|--------|------|
${webLibModules.map(m => `| \`${m.name}\` | \`${m.path}\` |`).join("\n")}

---

## Worker Services (${workerServices.length})

| Service | Path |
|---------|------|
${workerServices.map(s => `| \`${s.name}\` | \`${s.path}\` |`).join("\n")}

---

## Admin Components (${adminComponents.length})

| Component | Path |
|-----------|------|
${adminComponents.map(c => `| \`${c.name}\` | \`${c.path}\` |`).join("\n")}

---

## BullMQ Queues (${queues.length})

${queues.map(q => `- \`${q}\``).join("\n")}

---

## Scheduler Jobs (${schedulerJobs.length})

${schedulerJobs.map(j => `- \`${j}\``).join("\n")}

---

## Skills (${skills.length})

| Skill | Path |
|-------|------|
${skills.map(s => `| \`${s.name}\` | \`${s.path}\` |`).join("\n")}

---

## Key Config Files

| File | Purpose |
|------|---------|
| \`brain.md\` | Mission Control, authority precedence |
| \`CLAUDE.md\` | Technical router |
| \`METHODOLOGY.md\` | Process methodology |
| \`.cursor/rules/agent-behavior.mdc\` | Agent execution rules |
| \`.claude/skills/SKILL_ROUTER.md\` | Task → skill mapping |
| \`apps/web/superseller-site/prisma/schema.prisma\` | Web DB schema |
| \`apps/worker-packages/db/src/schema.ts\` | Worker DB schema (Drizzle) |
| \`apps/worker/src/queue/queues.ts\` | BullMQ queue definitions |
| \`apps/worker/ecosystem.config.js\` | PM2 config |
| \`.env\` | Environment variables |
`;

writeFileSync(join(ROOT, "REPO_MAP.md"), output);
console.log(`✅ REPO_MAP.md generated (${now})`);
console.log(`   ${apiRoutes.length} API routes, ${pages.length} pages, ${adminComponents.length} admin components`);
console.log(`   ${workerRoutes.length} worker endpoints, ${queues.length} queues, ${skills.length} skills`);
