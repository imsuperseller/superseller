# Doc 7: Lib Modules Specification

> **Purpose:** Interface contract for every `src/lib/` module — exports, dependencies, error handling, and implementation notes.
> **Action:** Claude Code creates each file following these contracts. All external service calls are isolated in lib modules — route handlers never call external APIs directly.

---

## Module Map

```
src/lib/
  env.ts          ← Environment validation (Doc 3, already specified)
  db.ts           ← Postgres connection pool + query helpers
  redis.ts        ← Redis/Upstash client + key helpers
  r2.ts           ← Cloudflare R2 upload/download/signed URLs
  kie.ts          ← kie.ai API client (createTask, getStatus, Gemini)
  gemini.ts       ← Gemini brain prompt builder + caller
  waha.ts         ← WAHA WhatsApp API client
  resend.ts       ← Resend email client (magic links)
  aitable.ts      ← Aitable read client (model registry, scripts, tone)
  auth.ts         ← Session management, magic links, OTP
  pipeline.ts     ← State machine transitions + task firing
  credits.ts      ← Credit check, consume, refund (atomic)
  upload.ts       ← File upload to R2 with validation
```

---

## 1. db.ts — Postgres Client

### Exports

```typescript
// Connection pool (singleton)
export const pool: Pool;

// Query helpers
export function query(sql: string, params?: any[]): Promise<QueryResult>;
export function queryRow<T>(sql: string, params?: any[]): Promise<T | null>;
export function queryRows<T>(sql: string, params?: any[]): Promise<T[]>;
export function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
```

### Implementation Notes

```typescript
import { Pool, PoolClient, QueryResult } from 'pg';
import { getEnv } from './env';

// Singleton pool — created once, reused across requests
let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    const env = getEnv();
    _pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.isNeon ? { rejectUnauthorized: false } : undefined,
      max: env.isVercel ? 5 : 20,           // Vercel: limited connections
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
    _pool.on('error', (err) => console.error('DB pool error:', err));
  }
  return _pool;
}

export const pool = new Proxy({} as Pool, {
  get(_, prop) { return getPool()[prop as keyof Pool]; }
});

export async function query(sql: string, params?: any[]): Promise<QueryResult> {
  return getPool().query(sql, params);
}

export async function queryRow<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const result = await query(sql, params);
  return (result.rows[0] as T) || null;
}

export async function queryRows<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const result = await query(sql, params);
  return result.rows as T[];
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

### Dependencies
- `pg` (npm)
- `./env`

---

## 2. redis.ts — Redis Client

### Exports

```typescript
export const redis: RedisClient;

// Typed helpers
export function getJson<T>(key: string): Promise<T | null>;
export function setJson(key: string, value: any, ttlSeconds?: number): Promise<void>;
export function del(key: string): Promise<void>;
export function incr(key: string, ttlSeconds?: number): Promise<number>;
export function decr(key: string): Promise<number>;
```

### Implementation Notes

Supports two backends transparently:

```typescript
import { getEnv } from './env';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: any[]): Promise<any>;
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ping(): Promise<string>;
}

let _client: RedisClient | null = null;

function getClient(): RedisClient {
  if (!_client) {
    const env = getEnv();

    if (env.kvRestUrl && env.kvRestToken) {
      // Vercel KV / Upstash REST — works in edge/serverless
      _client = createUpstashClient(env.kvRestUrl, env.kvRestToken);
    } else if (env.redisUrl) {
      // Direct Redis (ioredis) — for Racknerd
      const Redis = require('ioredis');
      _client = new Redis(env.redisUrl);
    } else {
      // In-memory fallback for local dev
      _client = createMemoryRedis();
    }
  }
  return _client;
}

// Upstash REST client (no TCP connection needed)
function createUpstashClient(url: string, token: string): RedisClient {
  async function command(cmd: string, ...args: any[]): Promise<any> {
    const res = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([cmd, ...args]),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.result;
  }

  return {
    get: (key) => command('GET', key),
    set: (key, value, ...args) => command('SET', key, value, ...args),
    del: (key) => command('DEL', key),
    incr: (key) => command('INCR', key),
    decr: (key) => command('DECR', key),
    expire: (key, sec) => command('EXPIRE', key, sec),
    ping: () => command('PING'),
  };
}

// Typed helpers
export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await getClient().get(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; }
  catch { return null; }
}

export async function setJson(key: string, value: any, ttlSeconds?: number): Promise<void> {
  const raw = JSON.stringify(value);
  if (ttlSeconds) {
    await getClient().set(key, raw, 'EX', ttlSeconds);
  } else {
    await getClient().set(key, raw);
  }
}

export async function del(key: string): Promise<void> {
  await getClient().del(key);
}

export async function incr(key: string, ttlSeconds?: number): Promise<number> {
  const val = await getClient().incr(key);
  if (ttlSeconds && val === 1) {
    await getClient().expire(key, ttlSeconds);
  }
  return val;
}

export async function decr(key: string): Promise<number> {
  return getClient().decr(key);
}

export const redis = new Proxy({} as RedisClient, {
  get(_, prop) { return getClient()[prop as keyof RedisClient]; }
});
```

### Dependencies
- `ioredis` (npm, optional — only for direct Redis)
- `./env`

---

## 3. r2.ts — Cloudflare R2 Client

### Exports

```typescript
export function uploadFile(key: string, body: Buffer | ReadableStream, contentType: string): Promise<string>;
export function downloadFile(key: string): Promise<Buffer>;
export function deleteFile(key: string): Promise<void>;
export function getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
export function getPublicUrl(key: string): string;
export function fileExists(key: string): Promise<boolean>;
```

### Implementation Notes

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getEnv } from './env';

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    const env = getEnv();
    _client = new S3Client({
      region: 'auto',
      endpoint: env.r2.endpoint,
      credentials: {
        accessKeyId: env.r2.accessKeyId,
        secretAccessKey: env.r2.secretAccessKey,
      },
    });
  }
  return _client;
}

export async function uploadFile(
  key: string,
  body: Buffer | ReadableStream,
  contentType: string
): Promise<string> {
  const env = getEnv();
  await getClient().send(new PutObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return getPublicUrl(key);
}

export async function downloadFile(key: string): Promise<Buffer> {
  const env = getEnv();
  const response = await getClient().send(new GetObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
  }));
  const stream = response.Body as ReadableStream;
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function deleteFile(key: string): Promise<void> {
  const env = getEnv();
  await getClient().send(new DeleteObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
  }));
}

export async function getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const env = getEnv();
  return awsGetSignedUrl(getClient(), new GetObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
  }), { expiresIn: expiresInSeconds });
}

export function getPublicUrl(key: string): string {
  const env = getEnv();
  // If custom public URL configured, use it. Otherwise use endpoint + bucket.
  if (env.r2.publicUrl) return `${env.r2.publicUrl}/${key}`;
  return `${env.r2.endpoint}/${env.r2.bucketName}/${key}`;
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    const env = getEnv();
    await getClient().send(new HeadObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
    }));
    return true;
  } catch { return false; }
}
```

### Dependencies
- `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` (npm)
- `./env`

---

## 4. kie.ts — kie.ai API Client

### Exports

```typescript
export interface CreateTaskRequest {
  model: string;
  input: Record<string, any>;
  callBackUrl: string;
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: { taskId: string };
}

export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'success' | 'fail';
    param: string;          // JSON string
    resultJson: string;     // JSON string with { resultUrls: string[] }
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}

export function createTask(request: CreateTaskRequest): Promise<CreateTaskResponse>;
export function getTaskStatus(taskId: string): Promise<TaskStatusResponse>;
export function callGemini(messages: GeminiMessage[], responseFormat?: any): Promise<GeminiResponse>;
```

### Implementation Notes

```typescript
import { getEnv } from './env';

async function kieRequest<T>(method: string, url: string, body?: any): Promise<T> {
  const env = getEnv();
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${env.kie.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new KieApiError(response.status, text, url);
  }

  return response.json() as Promise<T>;
}

export async function createTask(request: CreateTaskRequest): Promise<CreateTaskResponse> {
  const env = getEnv();
  return kieRequest('POST', env.kie.taskCreateUrl, request);
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const env = getEnv();
  return kieRequest('GET', `${env.kie.taskStatusUrl}?taskId=${taskId}`);
}

export async function callGemini(
  messages: Array<{ role: string; content: any }>,
  responseFormat?: any
): Promise<any> {
  const env = getEnv();
  const body: any = {
    messages,
    stream: false,
    include_thoughts: false,
    reasoning_effort: 'high',
  };
  if (responseFormat) {
    body.response_format = responseFormat;
  }
  return kieRequest('POST', env.kie.geminiUrl, body);
}

// Custom error class for kie.ai errors
export class KieApiError extends Error {
  constructor(
    public statusCode: number,
    public responseBody: string,
    public endpoint: string
  ) {
    super(`kie.ai API error ${statusCode} on ${endpoint}: ${responseBody.slice(0, 200)}`);
    this.name = 'KieApiError';
  }

  get isRateLimit(): boolean { return this.statusCode === 429; }
  get isInsufficientBalance(): boolean { return this.statusCode === 402; }
  get isRetryable(): boolean {
    return this.statusCode >= 500 || this.statusCode === 429;
  }
}
```

### Dependencies
- `./env`
- Native `fetch`

---

## 5. gemini.ts — Gemini Brain Prompt Builder

### Exports

```typescript
export interface GeminiBrainInput {
  rawScript?: string;
  audioUrl?: string;
  imageUrl?: string;
  character: string;
  vibe: string;
  language: string;
  contentTypeHint?: string;
  audioDurationSeconds?: number;
  userTier: string;
}

export interface GeminiBrainOutput {
  processed_script: string;
  video_prompt: string;
  recommended_model: string;
  model_params: { resolution: string; mode: string };
  routing_reasoning: string;
  content_tags: string[];
  music_prompt: { style: string; title: string; negativeTags: string };
  needs_isolation: boolean;
  voice_clarity_score: number;
  subtitle_text: string;
}

export async function callGeminiBrain(input: GeminiBrainInput): Promise<GeminiBrainOutput>;
```

### Implementation Notes

```typescript
import { callGemini } from './kie';
import { getActiveTonePreset, getScriptExamples, getActiveModels } from './aitable';
import { GEMINI_DEFAULTS, SYSTEM_PROMPT_TEMPLATE, RESPONSE_SCHEMA } from './gemini-constants';

// Cache hydrated prompt for 5 minutes (avoid re-fetching Aitable every call)
let _cachedPrompt: { prompt: string; expiry: number } | null = null;

async function getSystemPrompt(): Promise<string> {
  if (_cachedPrompt && Date.now() < _cachedPrompt.expiry) {
    return _cachedPrompt.prompt;
  }

  const [tonePreset, examples, models] = await Promise.all([
    getActiveTonePreset('mivnim'),
    getScriptExamples('mivnim', { limit: 10 }),
    getActiveModels(),
  ]);

  const prompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{TENANT_NAME}', 'Mivnim Group (קבוצת מבנים)')
    .replace('{BRAND_VOICE_NAME}', tonePreset?.preset_name || 'Poscas Winner')
    .replace('{TONE_PRESET_FROM_AITABLE}', tonePreset?.system_prompt_fragment || '')
    .replace('{EXAMPLE_SCRIPTS_FROM_AITABLE}', formatExamples(examples))
    .replace('{MODEL_REGISTRY_JSON}', JSON.stringify(formatModels(models), null, 2))
    .replace('{BRAND_CONTEXT}', 'Company: Mivnim Group. Industry: Urban renewal. Style: Premium dark luxury with turquoise accents.');

  _cachedPrompt = { prompt, expiry: Date.now() + 5 * 60 * 1000 };
  return prompt;
}

export async function callGeminiBrain(input: GeminiBrainInput): Promise<GeminiBrainOutput> {
  const systemPrompt = await getSystemPrompt();

  // Build user payload
  const userPayload = {
    raw_script: input.rawScript || '(audio only — please transcribe)',
    character: input.character,
    vibe: input.vibe,
    language: input.language,
    content_type_hint: input.contentTypeHint || 'general',
    has_audio: !!input.audioUrl,
    audio_duration_seconds: input.audioDurationSeconds || 0,
    has_reference_image: !!input.imageUrl,
    user_tier: input.userTier,
    brand_context: {
      company: 'Mivnim Group (קבוצת מבנים)',
      industry: 'Urban renewal real estate',
      recurring_themes: ['real estate', 'cognac', 'winners', 'networking', 'VIP', 'LOFTI24 Haifa'],
    },
  };

  // Build messages
  const userContent: any[] = [
    { type: 'text', text: JSON.stringify(userPayload) },
  ];

  // Add audio as "image_url" (kie.ai quirk)
  if (input.audioUrl) {
    userContent.push({
      type: 'image_url',
      image_url: { url: input.audioUrl },
    });
  }

  const messages = [
    { role: 'developer', content: [{ type: 'text', text: systemPrompt }] },
    { role: 'user', content: userContent },
  ];

  try {
    const response = await callGemini(messages, {
      type: 'json_schema',
      json_schema: RESPONSE_SCHEMA,
    });

    // Parse response
    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty Gemini response');

    const parsed: GeminiBrainOutput = typeof content === 'string'
      ? JSON.parse(content)
      : content;

    // Validate and sanitize
    return sanitizeGeminiOutput(parsed, input);
  } catch (err) {
    console.error('Gemini brain failed:', err);
    // Return defaults with raw script
    return {
      ...GEMINI_DEFAULTS,
      processed_script: input.rawScript || '',
      subtitle_text: input.rawScript || '',
      video_prompt: `Professional speaker in modern office, direct to camera, confident posture, warm lighting, cinematic feel`,
    };
  }
}

function sanitizeGeminiOutput(output: GeminiBrainOutput, input: GeminiBrainInput): GeminiBrainOutput {
  // Validate model is in registry
  const VALID_MODELS = ['kling/ai-avatar-pro', 'infinitalk/from-audio', 'kling-3.0/video'];
  if (!VALID_MODELS.includes(output.recommended_model)) {
    output.recommended_model = 'kling/ai-avatar-pro';
    output.routing_reasoning += ' [OVERRIDE: unknown model, defaulting to kling/ai-avatar-pro]';
  }

  // Prevent audio-incompatible model with audio input
  if (input.audioUrl && output.recommended_model === 'kling-3.0/video') {
    output.recommended_model = 'kling/ai-avatar-pro';
    output.routing_reasoning += ' [OVERRIDE: audio present but text-only model selected]';
  }

  // Prevent infinitalk with audio > 15s
  if (output.recommended_model === 'infinitalk/from-audio' &&
      input.audioDurationSeconds && input.audioDurationSeconds > 15) {
    output.recommended_model = 'kling/ai-avatar-pro';
    output.routing_reasoning += ' [OVERRIDE: audio exceeds 15s limit for infinitalk]';
  }

  // Truncate video prompt to 500 chars
  if (output.video_prompt.length > 500) {
    output.video_prompt = output.video_prompt.slice(0, 497) + '...';
  }

  // Default voice clarity
  if (!Number.isInteger(output.voice_clarity_score)) {
    output.voice_clarity_score = 7;
    output.needs_isolation = false;
  }

  return output;
}
```

### Dependencies
- `./kie`, `./aitable`, `./env`

---

## 6. waha.ts — WhatsApp API Client

### Exports

```typescript
export interface SendTextParams {
  session: string;
  chatId: string;     // format: "972501234567@c.us"
  text: string;
}

export interface SendFileParams {
  session: string;
  chatId: string;
  file: {
    mimetype: string;
    filename: string;
    url: string;
  };
  caption?: string;
}

export function sendText(params: SendTextParams): Promise<void>;
export function sendFile(params: SendFileParams): Promise<void>;
export function isSessionAlive(): Promise<boolean>;
export function phoneToChatId(phone: string): string;
```

### Implementation Notes

```typescript
import { getEnv } from './env';

async function wahaRequest(method: string, path: string, body?: any): Promise<any> {
  const env = getEnv();
  const url = `${env.waha.apiUrl}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      'X-Api-Key': env.waha.apiKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`WAHA error ${response.status} on ${path}: ${text.slice(0, 200)}`);
  }

  return response.json().catch(() => null);
}

export async function sendText(params: SendTextParams): Promise<void> {
  await wahaRequest('POST', '/api/sendText', params);
}

export async function sendFile(params: SendFileParams): Promise<void> {
  // WAHA uses /api/sendFile for generic file sending
  await wahaRequest('POST', '/api/sendFile', params);
}

export async function isSessionAlive(): Promise<boolean> {
  try {
    const sessions = await wahaRequest('GET', '/api/sessions');
    const env = getEnv();
    return sessions.some((s: any) =>
      s.name === env.waha.session && s.status === 'WORKING'
    );
  } catch { return false; }
}

export function phoneToChatId(phone: string): string {
  let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '972' + cleaned.substring(1);
  }
  return `${cleaned}@c.us`;
}
```

### Dependencies
- `./env`
- Native `fetch`

---

## 7. resend.ts — Email Client

### Exports

```typescript
export function sendMagicLink(email: string, token: string, userName?: string): Promise<void>;
export function sendNotification(email: string, subject: string, body: string): Promise<void>;
```

### Implementation Notes

```typescript
import { Resend } from 'resend';
import { getEnv } from './env';

let _client: Resend | null = null;

function getClient(): Resend {
  if (!_client) {
    _client = new Resend(getEnv().resend.apiKey);
  }
  return _client;
}

export async function sendMagicLink(
  email: string,
  token: string,
  userName?: string
): Promise<void> {
  const env = getEnv();
  const loginUrl = `${env.app.url}/api/auth/verify?token=${token}`;

  try {
    await getClient().emails.send({
      from: env.resend.fromEmail,
      to: email,
      subject: `🔗 הכניסה שלך ל-${env.app.name}`,
      html: buildMagicLinkEmail(loginUrl, userName, env.app.name),
    });
  } catch (err: any) {
    // If domain not verified, try fallback
    if (err.message?.includes('not verified') || err.statusCode === 403) {
      await getClient().emails.send({
        from: env.resend.fromEmailFallback,
        to: email,
        subject: `🔗 הכניסה שלך ל-${env.app.name}`,
        html: buildMagicLinkEmail(loginUrl, userName, env.app.name),
      });
    } else {
      throw err;
    }
  }
}

function buildMagicLinkEmail(url: string, name?: string, appName?: string): string {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #3A388E;">🔗 ${appName || 'Winner Video Studio'}</h2>
      <p>שלום ${name || 'Boss'},</p>
      <p>לחץ על הכפתור למטה כדי להתחבר:</p>
      <a href="${url}" style="display: inline-block; background: #3A388E; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
        התחבר עכשיו →
      </a>
      <p style="color: #666; font-size: 13px;">הקישור תקף ל-15 דקות.</p>
      <p style="color: #999; font-size: 12px;">אם לא ביקשת התחברות, התעלם מהמייל הזה.</p>
    </div>
  `;
}
```

### Dependencies
- `resend` (npm)
- `./env`

---

## 8. aitable.ts — Configuration Database Client

### Exports

```typescript
export interface ModelRegistryEntry {
  model_id: string;
  display_name: string;
  content_types: string[];
  requires_audio: boolean;
  requires_image: boolean;
  max_audio_duration: number;
  default_params: Record<string, any>;
  is_active: boolean;
  fallback_model_id?: string;
}

export interface ScriptExample {
  raw_input: string;
  processed_output: string;
  content_type: string;
  character?: string;
  vibe?: string;
  notes?: string;
}

export interface TonePreset {
  preset_name: string;
  tenant_id: string;
  system_prompt_fragment: string;
}

export function getActiveModels(): Promise<ModelRegistryEntry[]>;
export function getScriptExamples(tenantId: string, opts?: { limit?: number }): Promise<ScriptExample[]>;
export function getActiveTonePreset(tenantId: string): Promise<TonePreset | null>;
```

### Implementation Notes

```typescript
import { getEnv } from './env';

// Cache layer: Aitable data changes rarely, cache for 5 min
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function aitableGet<T>(datastoreId: string, params?: Record<string, string>): Promise<T[]> {
  const cacheKey = `${datastoreId}:${JSON.stringify(params || {})}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) return cached.data;

  const env = getEnv();
  const queryParams = new URLSearchParams(params || {});
  const url = `${env.aitable.baseUrl}/datasheets/${datastoreId}/records?${queryParams}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${env.aitable.apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Aitable error ${response.status} for ${datastoreId}`);
  }

  const json = await response.json();
  const records = json.data?.records?.map((r: any) => r.fields) || [];

  cache.set(cacheKey, { data: records, expiry: Date.now() + CACHE_TTL });
  return records;
}

export async function getActiveModels(): Promise<ModelRegistryEntry[]> {
  const env = getEnv();
  const records = await aitableGet<any>(env.aitable.tables.modelRegistry);
  return records
    .filter((r: any) => r.is_active !== false)
    .map((r: any) => ({
      model_id: r.model_id || r.model_name,
      display_name: r.display_name,
      content_types: r.content_types || [],
      requires_audio: r.requires_audio ?? true,
      requires_image: r.requires_image ?? true,
      max_audio_duration: r.max_audio_duration || 30,
      default_params: tryParseJson(r.default_params, {}),
      is_active: r.is_active !== false,
      fallback_model_id: r.fallback_model_id,
    }));
}

export async function getScriptExamples(
  tenantId: string,
  opts?: { limit?: number }
): Promise<ScriptExample[]> {
  const env = getEnv();
  const records = await aitableGet<any>(env.aitable.tables.scriptLibrary, {
    pageSize: String(opts?.limit || 10),
  });
  return records.map((r: any) => ({
    raw_input: r.raw_input || '',
    processed_output: r.processed_output || '',
    content_type: r.content_type || 'general',
    character: r.character,
    vibe: r.vibe,
    notes: r.notes,
  }));
}

export async function getActiveTonePreset(tenantId: string): Promise<TonePreset | null> {
  const env = getEnv();
  const records = await aitableGet<any>(env.aitable.tables.tonePresets, {
    pageSize: '1',
  });
  const preset = records.find((r: any) => r.is_default || r.tenant_id === tenantId);
  if (!preset) return null;
  return {
    preset_name: preset.preset_name,
    tenant_id: preset.tenant_id || tenantId,
    system_prompt_fragment: preset.system_prompt_fragment || '',
  };
}

function tryParseJson(val: any, fallback: any): any {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}
```

### Dependencies
- `./env`
- Native `fetch`

---

## 9. auth.ts — Authentication Module

### Exports

```typescript
export interface SessionData {
  userId: string;
  tenantId: string;
  tier: string;
}

export function getSessionFromRequest(req: Request): Promise<SessionData | null>;
export function createSession(userId: string): Promise<{ token: string; expiresAt: Date }>;
export function destroySession(token: string): Promise<void>;
export function generateMagicToken(): string;
export function generateOtp(): string;
```

### Implementation Notes

```typescript
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import * as db from './db';
import * as redis from './redis';
import { getEnv } from './env';

export async function getSessionFromRequest(req: Request): Promise<SessionData | null> {
  const env = getEnv();

  // Extract token from cookie
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${env.auth.cookieName}=([^;]+)`));
  if (!match) return null;

  const token = match[1];

  // Check Redis cache first
  const cached = await redis.getJson<SessionData>(`winner:session:${token}`);
  if (cached) return cached;

  // Fall back to database
  const session = await db.queryRow<any>(
    'SELECT s.user_id, u.tenant_id, u.tier FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1 AND s.expires_at > NOW()',
    [token]
  );

  if (!session) return null;

  const data: SessionData = {
    userId: session.user_id,
    tenantId: session.tenant_id,
    tier: session.tier,
  };

  // Repopulate cache
  await redis.setJson(`winner:session:${token}`, data, 86400);

  // Touch last_active
  await db.query('UPDATE sessions SET last_active = NOW() WHERE token = $1', [token]);

  return data;
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const env = getEnv();
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + env.auth.sessionMaxAgeDays * 24 * 60 * 60 * 1000);

  await db.query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  // Get user info for cache
  const user = await db.queryRow<any>(
    'SELECT tenant_id, tier FROM users WHERE id = $1',
    [userId]
  );

  await redis.setJson(`winner:session:${token}`, {
    userId,
    tenantId: user?.tenant_id || 'mivnim',
    tier: user?.tier || 'starter',
  }, env.auth.sessionMaxAgeDays * 86400);

  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await db.query('DELETE FROM sessions WHERE token = $1', [token]);
  await redis.del(`winner:session:${token}`);
}

export function generateMagicToken(): string {
  return nanoid(32);
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

### Dependencies
- `nanoid` (npm)
- `./db`, `./redis`, `./env`

---

## 10. pipeline.ts — State Machine + Task Orchestration

### Exports

```typescript
export function transitionStage(params: TransitionParams): Promise<void>;
export function fireIsolationTask(gen: Generation): Promise<string>;
export function fireVideoTask(gen: Generation, audioUrl: string, modelOverride?: string): Promise<string>;
export function processCallbackSuccess(gen: Generation, data: KieCallbackData): Promise<void>;
export function processCallbackFailure(gen: Generation, data: KieCallbackData): Promise<void>;
export function failGeneration(generationId: string, failedStage: string, errorMessage: string): Promise<void>;
export function deliverGeneration(generationId: string): Promise<void>;
export function downloadToR2(sourceUrl: string, r2Key: string): Promise<string>;
```

Full implementation defined in Doc 6 (Pipeline State Machine). This module imports from `db`, `redis`, `r2`, `kie`, `waha`, `credits`, `env`.

### Dependencies
- `./db`, `./redis`, `./r2`, `./kie`, `./waha`, `./credits`, `./env`

---

## 11. credits.ts — Credit Operations

### Exports

```typescript
export interface CreditStatus {
  available: number;
  total: number;
  monthlyRemaining: number;
  tier: string;
}

export function checkCredits(userId: string): Promise<CreditStatus>;
export function consumeCredit(userId: string, generationId: string): Promise<CreditStatus>;
export function refundCredit(generationId: string): Promise<void>;
```

### Implementation Notes

```typescript
import * as db from './db';
import * as redis from './redis';

export async function checkCredits(userId: string): Promise<CreditStatus> {
  // Check cache first
  const cached = await redis.getJson<CreditStatus>(`winner:user:credits:${userId}`);
  if (cached) return cached;

  const row = await db.queryRow<any>(
    'SELECT available_credits, total_credits, monthly_cap - monthly_used as monthly_remaining, tier FROM user_credits WHERE user_id = $1',
    [userId]
  );

  if (!row) throw new Error(`No credit record for user ${userId}`);

  const status: CreditStatus = {
    available: row.available_credits,
    total: row.total_credits,
    monthlyRemaining: row.monthly_remaining,
    tier: row.tier,
  };

  await redis.setJson(`winner:user:credits:${userId}`, status, 300);
  return status;
}

export async function consumeCredit(userId: string, generationId: string): Promise<CreditStatus> {
  return db.transaction(async (tx) => {
    // Atomic update with guard
    const result = await tx.query(`
      UPDATE user_credits
      SET used_credits = used_credits + 1, monthly_used = monthly_used + 1
      WHERE user_id = $1 AND available_credits > 0 AND monthly_used < monthly_cap
      RETURNING available_credits, total_credits, monthly_cap - monthly_used as monthly_remaining, tier
    `, [userId]);

    if (result.rowCount === 0) {
      throw new InsufficientCreditsError(userId);
    }

    const row = result.rows[0];

    // Log transaction
    await tx.query(`
      INSERT INTO credit_transactions (user_id, type, amount, balance_after, generation_id, description)
      VALUES ($1, 'consume', -1, $2, $3, 'Video generation')
    `, [userId, row.available_credits, generationId]);

    const status: CreditStatus = {
      available: row.available_credits,
      total: row.total_credits,
      monthlyRemaining: row.monthly_remaining,
      tier: row.tier,
    };

    // Invalidate cache
    await redis.del(`winner:user:credits:${userId}`);

    return status;
  });
}

export async function refundCredit(generationId: string): Promise<void> {
  // Full implementation in Doc 6 Section 8
  // Restores used_credits, monthly_used, logs transaction, invalidates cache
}

export class InsufficientCreditsError extends Error {
  constructor(public userId: string) {
    super(`Insufficient credits for user ${userId}`);
    this.name = 'InsufficientCreditsError';
  }
}
```

### Dependencies
- `./db`, `./redis`

---

## 12. upload.ts — File Upload Utility

### Exports

```typescript
export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

export function uploadAudio(file: File, userId: string, tenantId: string): Promise<UploadResult>;
export function uploadImage(file: File, userId: string, tenantId: string): Promise<UploadResult>;
export function validateAudioFile(file: File): void;  // throws on invalid
export function validateImageFile(file: File): void;  // throws on invalid
```

### Implementation Notes

```typescript
import { nanoid } from 'nanoid';
import { uploadFile } from './r2';

const AUDIO_TYPES = new Set([
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/ogg',
]);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EXTENSIONS: Record<string, string> = {
  'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav',
  'audio/aac': 'aac', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg',
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
};

export function validateAudioFile(file: File): void {
  if (!AUDIO_TYPES.has(file.type)) {
    throw new FileValidationError(`Invalid audio type: ${file.type}. Accepted: mp3, wav, aac, ogg`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`);
  }
}

export function validateImageFile(file: File): void {
  if (!IMAGE_TYPES.has(file.type)) {
    throw new FileValidationError(`Invalid image type: ${file.type}. Accepted: jpg, png, webp`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`);
  }
}

async function uploadToR2(
  file: File,
  userId: string,
  tenantId: string,
  mediaType: 'audio' | 'image'
): Promise<UploadResult> {
  const ext = EXTENSIONS[file.type] || 'bin';
  const key = `${tenantId}/${userId}/${mediaType}/${Date.now()}-${nanoid(8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const url = await uploadFile(key, buffer, file.type);

  return { url, key, size: file.size, contentType: file.type };
}

export function uploadAudio(file: File, userId: string, tenantId: string): Promise<UploadResult> {
  validateAudioFile(file);
  return uploadToR2(file, userId, tenantId, 'audio');
}

export function uploadImage(file: File, userId: string, tenantId: string): Promise<UploadResult> {
  validateImageFile(file);
  return uploadToR2(file, userId, tenantId, 'image');
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}
```

### Dependencies
- `nanoid` (npm)
- `./r2`

---

## Module Dependency Graph

```
                    env.ts
                   /  |  \  \
                  /   |   \   \
              db.ts redis.ts r2.ts
               |      |       |
               |      |       |
            auth.ts   |    upload.ts
               |      |
               |      |
           credits.ts |
               \      |
                \     |
              pipeline.ts ──── kie.ts ──── gemini.ts ──── aitable.ts
                  |
                waha.ts    resend.ts
```

**Rule:** No circular dependencies. `env.ts` is the root. `pipeline.ts` is the heaviest — it orchestrates everything else.

---

## Error Handling Convention

Every lib module:
1. Throws typed errors (e.g. `KieApiError`, `InsufficientCreditsError`, `FileValidationError`)
2. Route handlers catch and map to HTTP status codes
3. Unexpected errors bubble up as 500 with generic message

```typescript
// Pattern in route handlers:
try {
  const result = await someLibFunction();
  return Response.json(result);
} catch (err) {
  if (err instanceof InsufficientCreditsError) {
    return Response.json({ error: 'No credits remaining.' }, { status: 402 });
  }
  if (err instanceof FileValidationError) {
    return Response.json({ error: err.message }, { status: 400 });
  }
  if (err instanceof KieApiError && err.isInsufficientBalance) {
    return Response.json({ error: 'Service temporarily unavailable.' }, { status: 503 });
  }
  console.error('Unexpected error:', err);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
```
