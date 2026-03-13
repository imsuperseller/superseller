import { query, queryRow } from "./db";

export async function createPipelineRun(params: {
  tenantId?: string;
  pipelineType: string;
  status?: string;
  inputJson?: Record<string, unknown>;
  modelUsed?: string;
}): Promise<string> {
  const rows = await query<{ id: string }>(
    `INSERT INTO "PipelineRun" ("id", "tenantId", "pipelineType", "status", "inputJson", "modelUsed", "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id`,
    [params.tenantId ?? null, params.pipelineType, params.status ?? "running", params.inputJson ? JSON.stringify(params.inputJson) : null, params.modelUsed ?? null]
  );
  return rows[0].id;
}

export async function updatePipelineRun(id: string, updates: {
  status?: string;
  outputJson?: Record<string, unknown>;
  modelUsed?: string;
  costCents?: number;
  deliveredVia?: string;
  deliveredAt?: Date;
  errorMessage?: string;
  durationMs?: number;
}): Promise<void> {
  const setClauses: string[] = ['"updatedAt" = NOW()'];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.status !== undefined) { setClauses.push(`"status" = $${paramIndex++}`); values.push(updates.status); }
  if (updates.outputJson !== undefined) { setClauses.push(`"outputJson" = $${paramIndex++}`); values.push(JSON.stringify(updates.outputJson)); }
  if (updates.modelUsed !== undefined) { setClauses.push(`"modelUsed" = $${paramIndex++}`); values.push(updates.modelUsed); }
  if (updates.costCents !== undefined) { setClauses.push(`"costCents" = $${paramIndex++}`); values.push(updates.costCents); }
  if (updates.deliveredVia !== undefined) { setClauses.push(`"deliveredVia" = $${paramIndex++}`); values.push(updates.deliveredVia); }
  if (updates.deliveredAt !== undefined) { setClauses.push(`"deliveredAt" = $${paramIndex++}`); values.push(updates.deliveredAt); }
  if (updates.errorMessage !== undefined) { setClauses.push(`"errorMessage" = $${paramIndex++}`); values.push(updates.errorMessage); }
  if (updates.durationMs !== undefined) { setClauses.push(`"durationMs" = $${paramIndex++}`); values.push(updates.durationMs); }

  values.push(id);
  await query(
    `UPDATE "PipelineRun" SET ${setClauses.join(", ")} WHERE "id" = $${paramIndex}`,
    values
  );
}

/**
 * Find a PipelineRun by generationId stored in inputJson.
 * Used when we don't have a direct reference to the pipelineRunId
 * (e.g., in callback handlers that only know the generationId).
 */
export async function findPipelineRunByGenerationId(
  generationId: string
): Promise<string | null> {
  const row = await queryRow<{ id: string }>(
    `SELECT id FROM "PipelineRun" WHERE "inputJson"->>'generationId' = $1 ORDER BY "createdAt" DESC LIMIT 1`,
    [generationId]
  );
  return row?.id ?? null;
}
