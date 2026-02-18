#!/usr/bin/env npx tsx
/**
 * rebrand-component.ts — Convert generic Tailwind/shadcn components to Rensto brand tokens
 *
 * Usage:
 *   npx tsx tools/rebrand-component.ts <file.tsx>           # Rebrand in-place
 *   npx tsx tools/rebrand-component.ts <file.tsx> --dry-run # Preview changes
 *   npx tsx tools/rebrand-component.ts <file.tsx> --output <out.tsx> # Write to new file
 *
 * What it does:
 *   1. Replaces generic dark backgrounds with rensto-bg-* tokens
 *   2. Replaces generic accent colors with rensto brand colors
 *   3. Replaces generic text colors with rensto-text-* tokens
 *   4. Replaces generic borders with rensto borders
 *   5. Adds rensto glow/gradient classes where applicable
 *   6. Reports what changed
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// === REPLACEMENT RULES ===

interface ReplacementRule {
  patterns: RegExp[];
  replacement: string;
  category: string;
}

const rules: ReplacementRule[] = [
  // --- BACKGROUNDS ---
  // Dark page backgrounds → rensto-bg-primary
  {
    patterns: [
      /\bbg-gray-950\b/g,
      /\bbg-slate-950\b/g,
      /\bbg-zinc-950\b/g,
      /\bbg-neutral-950\b/g,
      /\bbg-gray-900\b/g,
      /\bbg-slate-900\b/g,
      /\bbg-zinc-900\b/g,
      /\bbg-neutral-900\b/g,
      /\bbg-\[#111827\]/g,
      /\bbg-\[#0f172a\]/g,
      /\bbg-\[#18181b\]/g,
      /\bbg-\[#09090b\]/g,
      /\bbg-black\b/g,
    ],
    replacement: 'bg-[var(--rensto-bg-primary)]',
    category: 'background',
  },
  // Panel/surface backgrounds → rensto-bg-secondary
  {
    patterns: [
      /\bbg-gray-800\b(?!\/)/g,
      /\bbg-slate-800\b(?!\/)/g,
      /\bbg-zinc-800\b(?!\/)/g,
      /\bbg-neutral-800\b(?!\/)/g,
      /\bbg-\[#1f2937\]/g,
      /\bbg-\[#1e293b\]/g,
      /\bbg-\[#27272a\]/g,
    ],
    replacement: 'bg-[var(--rensto-bg-secondary)]',
    category: 'background',
  },
  // Card backgrounds → rensto-bg-card
  {
    patterns: [
      /\bbg-gray-800\/50\b/g,
      /\bbg-slate-800\/50\b/g,
      /\bbg-slate-800\/80\b/g,
      /\bbg-zinc-800\/50\b/g,
      /\bbg-gray-800\/80\b/g,
      /\bbg-gray-850\b/g,
    ],
    replacement: 'bg-[var(--rensto-bg-card)]',
    category: 'background',
  },

  // --- ACCENT COLORS: RED (CTA) ---
  // IMPORTANT: hover: variants MUST come before base patterns to avoid premature matching
  {
    patterns: [
      /\bhover:bg-red-600\b/g,
      /\bhover:bg-red-700\b/g,
      /\bhover:bg-rose-600\b/g,
      /\bhover:bg-rose-700\b/g,
    ],
    replacement: 'hover:bg-[var(--rensto-red)]/80',
    category: 'accent',
  },
  {
    patterns: [
      /\bbg-red-500\b/g,
      /\bbg-red-600\b/g,
      /\bbg-rose-500\b/g,
      /\bbg-rose-600\b/g,
    ],
    replacement: 'bg-[var(--rensto-red)]',
    category: 'accent',
  },
  {
    patterns: [
      /\btext-red-500\b/g,
      /\btext-red-400\b/g,
      /\btext-rose-500\b/g,
      /\btext-rose-400\b/g,
    ],
    replacement: 'text-[var(--rensto-red)]',
    category: 'accent',
  },

  // --- ACCENT COLORS: BLUE ---
  {
    patterns: [
      /\bbg-blue-500\b/g,
      /\bbg-blue-600\b/g,
      /\bbg-sky-500\b/g,
      /\bbg-sky-600\b/g,
    ],
    replacement: 'bg-[var(--rensto-blue)]',
    category: 'accent',
  },
  {
    patterns: [
      /\btext-blue-500\b/g,
      /\btext-blue-400\b/g,
      /\btext-sky-500\b/g,
      /\btext-sky-400\b/g,
    ],
    replacement: 'text-[var(--rensto-blue)]',
    category: 'accent',
  },

  // --- ACCENT COLORS: CYAN/TEAL (highlight) ---
  {
    patterns: [
      /\bbg-cyan-400\b/g,
      /\bbg-cyan-500\b/g,
      /\bbg-teal-400\b/g,
      /\bbg-teal-500\b/g,
      /\bbg-emerald-400\b/g,
    ],
    replacement: 'bg-[var(--rensto-cyan)]',
    category: 'accent',
  },
  {
    patterns: [
      /\btext-cyan-400\b/g,
      /\btext-cyan-300\b/g,
      /\btext-teal-400\b/g,
      /\btext-teal-300\b/g,
      /\btext-emerald-400\b/g,
    ],
    replacement: 'text-[var(--rensto-cyan)]',
    category: 'accent',
  },

  // --- ACCENT COLORS: ORANGE ---
  {
    patterns: [
      /\bbg-orange-500\b/g,
      /\bbg-orange-600\b/g,
      /\bbg-amber-500\b/g,
      /\bbg-amber-600\b/g,
    ],
    replacement: 'bg-[var(--rensto-orange)]',
    category: 'accent',
  },
  {
    patterns: [
      /\btext-orange-500\b/g,
      /\btext-orange-400\b/g,
      /\btext-amber-500\b/g,
      /\btext-amber-400\b/g,
    ],
    replacement: 'text-[var(--rensto-orange)]',
    category: 'accent',
  },

  // --- TEXT COLORS ---
  // Primary text (white / near-white)
  {
    patterns: [
      /\btext-white\b/g,
      /\btext-gray-50\b/g,
      /\btext-slate-50\b/g,
    ],
    replacement: 'text-[var(--rensto-text-primary)]',
    category: 'text',
  },
  // Secondary text
  {
    patterns: [
      /\btext-gray-300\b/g,
      /\btext-slate-300\b/g,
      /\btext-zinc-300\b/g,
    ],
    replacement: 'text-[var(--rensto-text-secondary)]',
    category: 'text',
  },
  // Muted text
  {
    patterns: [
      /\btext-gray-400\b/g,
      /\btext-slate-400\b/g,
      /\btext-zinc-400\b/g,
      /\btext-gray-500\b/g,
      /\btext-slate-500\b/g,
    ],
    replacement: 'text-[var(--rensto-text-muted)]',
    category: 'text',
  },

  // --- BORDERS ---
  {
    patterns: [
      /\bborder-gray-700\b/g,
      /\bborder-slate-700\b/g,
      /\bborder-zinc-700\b/g,
      /\bborder-gray-800\b/g,
      /\bborder-slate-800\b/g,
    ],
    replacement: 'border-[var(--rensto-bg-secondary)]',
    category: 'border',
  },
  {
    patterns: [
      /\bborder-gray-600\b/g,
      /\bborder-slate-600\b/g,
      /\bborder-zinc-600\b/g,
    ],
    replacement: 'border-[var(--rensto-bg-secondary)]',
    category: 'border',
  },

  // --- RING / FOCUS ---
  {
    patterns: [
      /\bring-blue-500\b/g,
      /\bring-sky-500\b/g,
      /\bfocus:ring-blue-500\b/g,
    ],
    replacement: 'ring-[var(--rensto-cyan)]',
    category: 'focus',
  },

  // --- PLACEHOLDER ---
  {
    patterns: [
      /\bplaceholder-gray-400\b/g,
      /\bplaceholder-gray-500\b/g,
      /\bplaceholder-slate-400\b/g,
    ],
    replacement: 'placeholder-[var(--rensto-text-muted)]',
    category: 'text',
  },
];

// === INLINE STYLE REPLACEMENTS (for HTML/CSS from Stitch) ===

interface InlineStyleRule {
  pattern: RegExp;
  replacement: string;
  category: string;
}

const inlineStyleRules: InlineStyleRule[] = [
  { pattern: /#111827/g, replacement: 'var(--rensto-bg-primary)', category: 'inline-bg' },
  { pattern: /#0f172a/g, replacement: 'var(--rensto-bg-primary)', category: 'inline-bg' },
  { pattern: /#18181b/g, replacement: 'var(--rensto-bg-primary)', category: 'inline-bg' },
  { pattern: /#1f2937/g, replacement: 'var(--rensto-bg-secondary)', category: 'inline-bg' },
  { pattern: /#1e293b/g, replacement: 'var(--rensto-bg-secondary)', category: 'inline-bg' },
  { pattern: /#27272a/g, replacement: 'var(--rensto-bg-secondary)', category: 'inline-bg' },
  { pattern: /#ef4444/g, replacement: 'var(--rensto-red)', category: 'inline-accent' },
  { pattern: /#f43f5e/g, replacement: 'var(--rensto-red)', category: 'inline-accent' },
  { pattern: /#3b82f6/g, replacement: 'var(--rensto-blue)', category: 'inline-accent' },
  { pattern: /#0ea5e9/g, replacement: 'var(--rensto-blue)', category: 'inline-accent' },
  { pattern: /#22d3ee/g, replacement: 'var(--rensto-cyan)', category: 'inline-accent' },
  { pattern: /#2dd4bf/g, replacement: 'var(--rensto-cyan)', category: 'inline-accent' },
];

// === MAIN ===

function rebrand(content: string): { result: string; changes: { category: string; count: number }[] } {
  let result = content;
  const changes: { category: string; count: number }[] = [];

  // Apply Tailwind class rules
  for (const rule of rules) {
    let ruleCount = 0;
    for (const pattern of rule.patterns) {
      const matches = result.match(pattern);
      if (matches) {
        ruleCount += matches.length;
        result = result.replace(pattern, rule.replacement);
      }
    }
    if (ruleCount > 0) {
      const existing = changes.find((c) => c.category === rule.category);
      if (existing) existing.count += ruleCount;
      else changes.push({ category: rule.category, count: ruleCount });
    }
  }

  // Apply inline style rules (for HTML/CSS from Stitch or other sources)
  for (const rule of inlineStyleRules) {
    const matches = result.match(rule.pattern);
    if (matches) {
      const existing = changes.find((c) => c.category === rule.category);
      if (existing) existing.count += matches.length;
      else changes.push({ category: rule.category, count: matches.length });
      result = result.replace(rule.pattern, rule.replacement);
    }
  }

  return { result, changes };
}

// === CLI ===

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const outputIdx = args.indexOf('--output');
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
const inputFile = args.find((a) => !a.startsWith('--') && a !== outputPath);

if (!inputFile) {
  console.error('Usage: npx tsx tools/rebrand-component.ts <file.tsx> [--dry-run] [--output <out.tsx>]');
  process.exit(1);
}

const filePath = resolve(inputFile);
const content = readFileSync(filePath, 'utf-8');
const { result, changes } = rebrand(content);

const totalChanges = changes.reduce((sum, c) => sum + c.count, 0);

if (totalChanges === 0) {
  console.log(`No generic tokens found in ${inputFile} — already branded or no matches.`);
  process.exit(0);
}

console.log(`\nRebrand Report for ${inputFile}:`);
console.log('─'.repeat(50));
for (const { category, count } of changes) {
  console.log(`  ${category.padEnd(20)} ${count} replacement${count > 1 ? 's' : ''}`);
}
console.log('─'.repeat(50));
console.log(`  Total: ${totalChanges} replacements\n`);

if (dryRun) {
  console.log('[DRY RUN] No files modified. Use without --dry-run to apply.');
} else {
  const target = outputPath ? resolve(outputPath) : filePath;
  writeFileSync(target, result, 'utf-8');
  console.log(`Written to: ${target}`);
}
