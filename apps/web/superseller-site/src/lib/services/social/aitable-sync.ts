/**
 * SocialHub — Aitable.ai Dashboard Sync
 * Syncs content posts to Aitable for dashboard visibility.
 * Datasheet: "SocialHub Content" (dstTYYmleksXHj3sCj)
 */

const AITABLE_BASE = "https://aitable.ai/fusion/v1";
const SOCIAL_CONTENT_DATASHEET = "dstTYYmleksXHj3sCj";

function getToken(): string | undefined {
  return process.env.AITABLE_API_TOKEN || process.env.AITABLE_API_KEY;
}

async function aitableFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message: string }> {
  const token = getToken();
  if (!token) {
    return { success: false, data: null as T, message: "No Aitable token" };
  }

  const res = await fetch(`${AITABLE_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return res.json();
}

export interface SocialContentRecord {
  title: string;
  content: string;
  platform: string;
  status: string;
  contentType: string;
  aiPrompt?: string;
  aiModel?: string;
  hashtags?: string;
  imagePrompt?: string;
  imageUrl?: string;
  platformUrl?: string;
  platformPostId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  approvedBy?: string;
  rejectionNote?: string;
  postgresId: string;
  characterCount?: string;
  tone?: string;
  generationCost?: string;
}

/**
 * Create a new record in the SocialHub Content datasheet.
 * Returns the Aitable record ID.
 */
export async function createContentRecord(
  record: SocialContentRecord
): Promise<{ recordId?: string; error?: string }> {
  try {
    const res = await aitableFetch<{
      records: Array<{ recordId: string }>;
    }>(`/datasheets/${SOCIAL_CONTENT_DATASHEET}/records`, {
      method: "POST",
      body: JSON.stringify({
        records: [
          {
            fields: {
              Title: record.title,
              Content: record.content,
              Platform: record.platform,
              Status: record.status,
              "Content Type": record.contentType,
              "AI Prompt": record.aiPrompt || "",
              "AI Model": record.aiModel || "",
              Hashtags: record.hashtags || "",
              "Image Prompt": record.imagePrompt || "",
              "Image URL": record.imageUrl || "",
              "Platform URL": record.platformUrl || "",
              "Platform Post ID": record.platformPostId || "",
              "Scheduled At": record.scheduledAt || "",
              "Published At": record.publishedAt || "",
              "Approved By": record.approvedBy || "",
              "Rejection Note": record.rejectionNote || "",
              "Postgres ID": record.postgresId,
              "Character Count": record.characterCount || "",
              Tone: record.tone || "",
              "Generation Cost": record.generationCost || "",
            },
          },
        ],
      }),
    });

    if (!res.success) {
      return { error: `Aitable create failed: ${res.message}` };
    }

    return { recordId: res.data?.records?.[0]?.recordId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Update an existing record in the SocialHub Content datasheet.
 */
export async function updateContentRecord(
  recordId: string,
  fields: Partial<Record<string, string>>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Map camelCase field names to Aitable column names
    const fieldMap: Record<string, string> = {
      status: "Status",
      platformUrl: "Platform URL",
      platformPostId: "Platform Post ID",
      publishedAt: "Published At",
      approvedBy: "Approved By",
      rejectionNote: "Rejection Note",
      imageUrl: "Image URL",
      content: "Content",
      contentType: "Content Type",
    };

    const aitableFields: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      const aitableKey = fieldMap[key] || key;
      aitableFields[aitableKey] = value;
    }

    const res = await aitableFetch(
      `/datasheets/${SOCIAL_CONTENT_DATASHEET}/records`,
      {
        method: "PATCH",
        body: JSON.stringify({
          records: [{ recordId, fields: aitableFields }],
        }),
      }
    );

    return { success: res.success, error: res.success ? undefined : res.message };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Find a record by Postgres ID.
 */
export async function findRecordByPostgresId(
  postgresId: string
): Promise<string | null> {
  try {
    const res = await aitableFetch<{
      records: Array<{ recordId: string; fields: Record<string, unknown> }>;
    }>(
      `/datasheets/${SOCIAL_CONTENT_DATASHEET}/records?filterByFormula={Postgres ID}="${postgresId}"`
    );

    if (!res.success || !res.data?.records?.length) return null;
    return res.data.records[0].recordId;
  } catch {
    return null;
  }
}

export { SOCIAL_CONTENT_DATASHEET };
