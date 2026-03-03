#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const SKILLS_DIR =
  process.env.SKILLS_DIR ||
  "/Users/shaifriedman/superseller/.claude/skills";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse YAML-ish frontmatter from a SKILL.md file.
 * We only need `name` and `description` — both are in the --- block.
 * This is intentionally simple (no YAML lib dependency).
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { name: null, description: null };

  const block = match[1];

  // name: value
  const nameMatch = block.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : null;

  // description can be multi-line (YAML folded scalar with >- )
  // Grab everything between "description:" and the next top-level key or end.
  const descStart = block.indexOf("description:");
  if (descStart === -1) return { name, description: null };

  const afterDesc = block.slice(descStart + "description:".length);
  // Collect lines until we hit a line that starts a new key (no leading whitespace, has colon)
  const lines = afterDesc.split("\n");
  const descLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // First line may contain >- or the value directly
    if (i === 0) {
      const trimmed = line.trim();
      if (trimmed === ">-" || trimmed === ">" || trimmed === "|" || trimmed === "|-") continue;
      if (trimmed) {
        descLines.push(trimmed);
        continue;
      }
      continue;
    }
    // Subsequent lines: if it looks like a new YAML key, stop
    if (/^[a-zA-Z]/.test(line)) break;
    const trimmed = line.trim();
    if (trimmed) descLines.push(trimmed);
  }

  const description = descLines.join(" ").trim() || null;
  return { name, description };
}

/**
 * Discover all skill directories (exclude "archived").
 * Returns array of { dirName, skillDir } objects.
 */
async function discoverSkillDirs() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "archived") continue;
    const skillFile = join(SKILLS_DIR, entry.name, "SKILL.md");
    try {
      await stat(skillFile);
      dirs.push({ dirName: entry.name, skillDir: join(SKILLS_DIR, entry.name) });
    } catch {
      // No SKILL.md — skip
    }
  }
  return dirs.sort((a, b) => a.dirName.localeCompare(b.dirName));
}

/**
 * Load all skills into memory. Returns a Map<dirName, { name, description, content }>.
 */
async function loadSkills() {
  const dirs = await discoverSkillDirs();
  const skills = new Map();
  for (const { dirName, skillDir } of dirs) {
    const filePath = join(skillDir, "SKILL.md");
    const content = await readFile(filePath, "utf-8");
    const { name, description } = parseFrontmatter(content);
    skills.set(dirName, {
      name: name || dirName,
      description: description || "(no description)",
      content,
    });
  }
  return skills;
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const skills = await loadSkills();

const server = new McpServer({
  name: "skills-mcp-server",
  version: "1.0.0",
});

// Tool: list_skills
server.tool(
  "list_skills",
  "List all available Claude Code skills with a short description for each. Use this to discover what skills exist before fetching a specific one.",
  {},
  async () => {
    const lines = [];
    for (const [dirName, skill] of skills) {
      // Truncate description to first sentence for brevity
      const shortDesc =
        skill.description.length > 160
          ? skill.description.slice(0, 157) + "..."
          : skill.description;
      lines.push(`- **${dirName}** — ${shortDesc}`);
    }
    return {
      content: [
        {
          type: "text",
          text: `# Available Skills (${skills.size})\n\n${lines.join("\n")}`,
        },
      ],
    };
  }
);

// Tool: get_skill
server.tool(
  "get_skill",
  "Get the full SKILL.md content for a specific skill. This returns the complete instructions/context that Claude Code uses when that skill is triggered. Pass the skill directory name (e.g. 'tourreel-pipeline', 'deploy-ops').",
  { skill_name: z.string().describe("The skill directory name (e.g. 'tourreel-pipeline')") },
  async ({ skill_name }) => {
    const skill = skills.get(skill_name);
    if (!skill) {
      // Try fuzzy: case-insensitive substring match
      const match = [...skills.keys()].find(
        (k) =>
          k.toLowerCase().includes(skill_name.toLowerCase()) ||
          skill_name.toLowerCase().includes(k.toLowerCase())
      );
      if (match) {
        const s = skills.get(match);
        return {
          content: [
            {
              type: "text",
              text: `# Skill: ${s.name} (matched from "${skill_name}" → "${match}")\n\n${s.content}`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Skill "${skill_name}" not found. Use list_skills to see available skills.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `# Skill: ${skill.name}\n\n${skill.content}`,
        },
      ],
    };
  }
);

// Tool: search_skills
server.tool(
  "search_skills",
  "Search all SKILL.md files for a keyword or phrase. Returns matching skill names with the relevant snippet. Useful when you don't know which skill covers a topic.",
  { query: z.string().describe("Keyword or phrase to search for across all skills") },
  async ({ query }) => {
    const queryLower = query.toLowerCase();
    const results = [];

    for (const [dirName, skill] of skills) {
      const contentLower = skill.content.toLowerCase();
      const idx = contentLower.indexOf(queryLower);
      if (idx === -1) continue;

      // Extract a snippet around the match
      const start = Math.max(0, idx - 80);
      const end = Math.min(skill.content.length, idx + query.length + 80);
      const snippet = (start > 0 ? "..." : "") +
        skill.content.slice(start, end).replace(/\n/g, " ") +
        (end < skill.content.length ? "..." : "");

      // Count occurrences for ranking
      let count = 0;
      let searchIdx = 0;
      while ((searchIdx = contentLower.indexOf(queryLower, searchIdx)) !== -1) {
        count++;
        searchIdx += queryLower.length;
      }

      results.push({ dirName, name: skill.name, description: skill.description, snippet, count });
    }

    // Sort by occurrence count descending
    results.sort((a, b) => b.count - a.count);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No skills matched the query "${query}".`,
          },
        ],
      };
    }

    const lines = results.map(
      (r) =>
        `### ${r.dirName} (${r.count} match${r.count > 1 ? "es" : ""})\n${r.description}\n> ${r.snippet}`
    );

    return {
      content: [
        {
          type: "text",
          text: `# Search results for "${query}" (${results.length} skill${results.length > 1 ? "s" : ""})\n\n${lines.join("\n\n")}`,
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
