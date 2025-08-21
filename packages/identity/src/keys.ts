import crypto from 'crypto';

/**
 * Convert string to kebab-case slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate deterministic hash for content
 */
export function hashContent(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate event key for webhook deduplication
 */
export function generateEventKey(provider: string, eventId: string): string {
  return `${provider}:${eventId}`;
}

/**
 * Generate job ID for queue deduplication
 */
export function generateJobId(queue: string, rgid: string, operation: string): string {
  return `${queue}:${rgid}:${operation}`;
}

/**
 * Generate API idempotency key
 */
export function generateApiKey(route: string, rgid: string, payload: any): string {
  const payloadHash = hashContent(JSON.stringify(payload));
  return `api:${route}:${rgid}:${payloadHash}`;
}

/**
 * Generate webhook idempotency key
 */
export function generateWebhookKey(provider: string, eventId: string, payload: any): string {
  const payloadHash = hashContent(JSON.stringify(payload));
  return `webhook:${provider}:${eventId}:${payloadHash}`;
}

/**
 * Generate Redis lock key for concurrency control
 */
export function generateLockKey(rgid: string, operation: string): string {
  return `lock:${rgid}:${operation}`;
}

/**
 * Normalize provider names for consistency
 */
export function normalizeProvider(provider: string): string {
  const providerMap: Record<string, string> = {
    'airtable': 'airtable',
    'webflow': 'webflow',
    'n8n': 'n8n',
    'sellerassistant': 'sellerassistant',
    'junglescout': 'junglescout',
    'amazon-ads': 'amazon-ads',
    'stripe': 'stripe',
    'quickbooks': 'quickbooks',
    'mongodb': 'mongodb',
    'openai': 'openai',
    'openrouter': 'openrouter',
    'typeform': 'typeform',
    'esignatures': 'esignatures',
    'vercel': 'vercel',
    'github': 'github',
    'cloudflare': 'cloudflare'
  };

  return providerMap[provider.toLowerCase()] || provider.toLowerCase();
}

/**
 * Validate RGID format
 */
export function isValidRgid(rgid: string): boolean {
  // CUID2 format validation
  return /^[a-z][a-z0-9]*$/.test(rgid) && rgid.length >= 24 && rgid.length <= 32;
}

/**
 * Generate RGID for entity
 */
export function generateRgid(): string {
  // This should use the same CUID2 library as the database package
  return crypto.randomUUID().replace(/-/g, '').substring(0, 24);
}

/**
 * Create normalized entity key
 */
export function createEntityKey(kind: string, slug: string): string {
  return `${kind}:${slug}`;
}

/**
 * Parse entity key back to components
 */
export function parseEntityKey(key: string): { kind: string; slug: string } | null {
  const match = key.match(/^([^:]+):(.+)$/);
  if (!match) return null;
  
  return {
    kind: match[1],
    slug: match[2]
  };
}
