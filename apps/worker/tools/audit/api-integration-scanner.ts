/**
 * API Integration Scanner
 *
 * Programmatically scans codebase for all third-party API integrations.
 * Creates inventory with endpoints, auth types, and usage locations.
 *
 * Usage: npx tsx tools/audit/api-integration-scanner.ts
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface APIIntegration {
  service: string;
  endpoint: string;
  method: string;
  authType: 'bearer' | 'apiKey' | 'oauth' | 'none';
  credentialSource: string;
  files: string[];
  lastVerified?: string;
  status?: 'active' | 'deprecated' | 'broken' | 'unknown';
}

const REPO_ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'audit-results');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'api-integrations.json');

// Known API patterns to search for
const API_PATTERNS = [
  // Kie.ai
  { service: 'Kie.ai', pattern: 'api.kie.ai', auth: 'bearer' as const },
  { service: 'Kie.ai', pattern: 'KIE_API_KEY', auth: 'bearer' as const },
  { service: 'Kie.ai', pattern: 'KIE_BASE', auth: 'bearer' as const },

  // Google/Gemini
  { service: 'Google Gemini', pattern: 'generativelanguage.googleapis.com', auth: 'apiKey' as const },
  { service: 'Google Gemini', pattern: 'GOOGLE_API_KEY', auth: 'apiKey' as const },

  // Apify
  { service: 'Apify', pattern: 'api.apify.com', auth: 'bearer' as const },
  { service: 'Apify', pattern: 'APIFY_API_KEY', auth: 'bearer' as const },

  // Cloudflare R2
  { service: 'Cloudflare R2', pattern: 'r2.cloudflarestorage.com', auth: 'apiKey' as const },
  { service: 'Cloudflare R2', pattern: 'R2_ACCESS_KEY', auth: 'apiKey' as const },

  // Stripe
  { service: 'Stripe', pattern: 'api.stripe.com', auth: 'bearer' as const },
  { service: 'Stripe', pattern: 'STRIPE_SECRET_KEY', auth: 'bearer' as const },

  // Telnyx
  { service: 'Telnyx', pattern: 'api.telnyx.com', auth: 'bearer' as const },
  { service: 'Telnyx', pattern: 'TELNYX_API_KEY', auth: 'bearer' as const },

  // Resend
  { service: 'Resend', pattern: 'api.resend.com', auth: 'bearer' as const },
  { service: 'Resend', pattern: 'RESEND_API_KEY', auth: 'bearer' as const },

  // Deprecated services
  { service: 'Firestore (DEPRECATED)', pattern: 'firestore.googleapis.com', auth: 'oauth' as const },
  { service: 'FAL.ai (DEPRECATED)', pattern: 'fal.ai', auth: 'apiKey' as const },
  { service: 'Clerk (DEPRECATED)', pattern: 'clerk.dev', auth: 'apiKey' as const },
];

function scanCodebase(): Map<string, APIIntegration> {
  const integrations = new Map<string, APIIntegration>();

  console.log('🔍 Scanning codebase for API integrations...\n');

  for (const pattern of API_PATTERNS) {
    console.log(`  Searching for: ${pattern.service} (${pattern.pattern})`);

    try {
      // Search for pattern in TypeScript/JavaScript files
      const cmd = `grep -r "${pattern.pattern}" ${REPO_ROOT}/apps --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" -l 2>/dev/null || true`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      const files = output.trim().split('\n').filter(f => f.length > 0);

      if (files.length === 0) continue;

      // Extract endpoint details from files
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const relPath = path.relative(REPO_ROOT, file);

        // Extract endpoints (URLs starting with http/https)
        const urlMatches = content.match(/https?:\/\/[^\s"'`]+/g) || [];

        for (const url of urlMatches) {
          if (!url.includes(pattern.pattern)) continue;

          const key = `${pattern.service}:${url}`;

          if (!integrations.has(key)) {
            integrations.set(key, {
              service: pattern.service,
              endpoint: url,
              method: 'UNKNOWN', // Will be determined from code context
              authType: pattern.auth,
              credentialSource: extractCredentialSource(content, pattern),
              files: [],
              status: pattern.service.includes('DEPRECATED') ? 'deprecated' : 'unknown',
            });
          }

          const integration = integrations.get(key)!;
          if (!integration.files.includes(relPath)) {
            integration.files.push(relPath);
          }
        }
      }

      console.log(`    Found in ${files.length} files`);

    } catch (error) {
      console.error(`    Error scanning for ${pattern.service}:`, (error as Error).message);
    }
  }

  return integrations;
}

function extractCredentialSource(content: string, pattern: { service: string; pattern: string }): string {
  // Look for environment variable usage
  const envMatch = content.match(/process\.env\.([A-Z_]+API_KEY[A-Z_]*)/);
  if (envMatch) return `process.env.${envMatch[1]}`;

  // Look for config references
  const configMatch = content.match(/config\.[a-z]+\.(apiKey|secretKey|accessKey)/);
  if (configMatch) return `config.${configMatch[1]}`;

  return 'UNKNOWN';
}

function generateReport(integrations: Map<string, APIIntegration>): void {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Convert to array and sort by service
  const integrationArray = Array.from(integrations.values()).sort((a, b) =>
    a.service.localeCompare(b.service)
  );

  // Write JSON report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(integrationArray, null, 2));

  // Print summary
  console.log('\n📊 API Integration Inventory Summary:\n');
  console.log(`Total integrations found: ${integrationArray.length}\n`);

  const byService = new Map<string, number>();
  const deprecated: string[] = [];

  for (const integration of integrationArray) {
    const count = byService.get(integration.service) || 0;
    byService.set(integration.service, count + 1);

    if (integration.status === 'deprecated') {
      deprecated.push(`${integration.service}: ${integration.endpoint}`);
    }
  }

  console.log('By Service:');
  for (const [service, count] of Array.from(byService.entries()).sort()) {
    console.log(`  ${service}: ${count} endpoint(s)`);
  }

  if (deprecated.length > 0) {
    console.log('\n⚠️  Deprecated Services Found:');
    for (const dep of deprecated) {
      console.log(`  - ${dep}`);
    }
  }

  console.log(`\n✅ Report saved to: ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);
}

// Main execution
const integrations = scanCodebase();
generateReport(integrations);
