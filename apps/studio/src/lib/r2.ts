import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "./env";

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    const env = getEnv();
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }
  return _client;
}

export async function uploadFile(
  key: string,
  body: Buffer | ReadableStream | Uint8Array,
  contentType: string
): Promise<string> {
  const env = getEnv();
  await getClient().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return getPublicUrl(key);
}

export async function uploadFromUrl(key: string, sourceUrl: string): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Failed to fetch ${sourceUrl}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  return uploadFile(key, buffer, contentType);
}

export async function downloadFile(key: string): Promise<Buffer> {
  const env = getEnv();
  const result = await getClient().send(
    new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key })
  );
  if (!result.Body) throw new Error(`Empty body for key: ${key}`);
  const chunks: Uint8Array[] = [];
  // @ts-expect-error - Body is a readable stream
  for await (const chunk of result.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function deleteFile(key: string): Promise<void> {
  const env = getEnv();
  await getClient().send(
    new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key })
  );
}

export function getPublicUrl(key: string): string {
  const env = getEnv();
  if (env.R2_PUBLIC_URL) return `${env.R2_PUBLIC_URL}/${key}`;
  return `https://${env.R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

/** Generate a presigned URL for an R2 object (default 1 hour expiry) */
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const env = getEnv();
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

/**
 * Extract R2 key from a stored URL. Returns null if not an R2 URL.
 * Handles both formats:
 *   - https://{bucket}.{accountId}.r2.cloudflarestorage.com/{key}
 *   - {R2_PUBLIC_URL}/{key}
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url) return null;
  const env = getEnv();

  // Check R2_PUBLIC_URL prefix
  if (env.R2_PUBLIC_URL && url.startsWith(env.R2_PUBLIC_URL)) {
    return url.slice(env.R2_PUBLIC_URL.length + 1);
  }

  // Check r2.cloudflarestorage.com pattern
  const r2Pattern = `https://${env.R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`;
  if (url.startsWith(r2Pattern)) {
    return url.slice(r2Pattern.length);
  }

  // Check pub-*.r2.dev pattern
  if (url.includes(".r2.dev/")) {
    const idx = url.indexOf(".r2.dev/");
    return url.slice(idx + ".r2.dev/".length);
  }

  return null;
}

/**
 * Convert an R2 URL to a publicly accessible URL via our file proxy.
 * External APIs (kie.ai, Gemini) need to fetch these files directly.
 * Uses /api/files/{key} proxy instead of presigned URLs because
 * kie.ai rejects URLs with query parameters ("file type not supported").
 * If the URL is already public (non-R2), returns it unchanged.
 */
export function ensurePublicUrl(url: string): string {
  const key = extractKeyFromUrl(url);
  if (!key) return url; // Not an R2 URL, return as-is
  const env = getEnv();
  return `${env.CALLBACK_BASE_URL}/api/files/${key}`;
}

export async function healthCheck(): Promise<boolean> {
  try {
    // Try a simple HEAD-like operation
    getClient();
    return true;
  } catch {
    return false;
  }
}
