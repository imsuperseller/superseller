import { query } from "./db";

export async function registerAsset(params: {
  tenantId: string;
  type: string;
  filename: string;
  r2Key: string;
  r2Bucket?: string;
  publicUrl: string;
  mimeType?: string;
  sizeBytes?: number;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const rows = await query<{ id: string }>(
    `INSERT INTO "TenantAsset" ("id", "tenantId", "type", "filename", "r2Key", "r2Bucket", "publicUrl", "mimeType", "sizeBytes", "metadata", "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
     ON CONFLICT ("r2Key") DO UPDATE SET "updatedAt" = NOW()
     RETURNING id`,
    [
      params.tenantId,
      params.type,
      params.filename,
      params.r2Key,
      params.r2Bucket ?? "superseller-assets",
      params.publicUrl,
      params.mimeType ?? null,
      params.sizeBytes ?? null,
      params.metadata ? JSON.stringify(params.metadata) : null,
    ]
  );
  return rows[0].id;
}
