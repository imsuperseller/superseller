import { nanoid } from "nanoid";
import { uploadFile } from "./r2";

const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/mp4",
  "audio/ogg",
]);

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EXTENSIONS: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/aac": "aac",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

/** Infer MIME type from filename extension when browser/curl sends application/octet-stream */
function inferAudioType(file: File): string {
  if (AUDIO_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp3: "audio/mpeg", wav: "audio/wav", aac: "audio/aac", m4a: "audio/mp4", ogg: "audio/ogg",
  };
  return ext && map[ext] ? map[ext] : file.type;
}

export function validateAudioFile(file: File): string {
  const mimeType = inferAudioType(file);
  if (!AUDIO_TYPES.has(mimeType)) {
    throw new FileValidationError(
      `Invalid audio type: ${file.type}. Accepted: mp3, wav, aac, ogg`
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`
    );
  }
  return mimeType;
}

export function validateImageFile(file: File): void {
  if (!IMAGE_TYPES.has(file.type)) {
    throw new FileValidationError(
      `Invalid image type: ${file.type}. Accepted: jpg, png, webp`
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`
    );
  }
}

async function uploadToR2(
  file: File,
  userId: string,
  tenantId: string,
  mediaType: "audio" | "image",
  overrideType?: string
): Promise<UploadResult> {
  const contentType = overrideType || file.type;
  const ext = EXTENSIONS[contentType] || "bin";
  const key = `${tenantId}/${userId}/${mediaType}/${Date.now()}-${nanoid(8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const url = await uploadFile(key, buffer, contentType);
  return { url, key, size: file.size, contentType };
}

export function uploadAudio(
  file: File,
  userId: string,
  tenantId: string
): Promise<UploadResult> {
  const mimeType = validateAudioFile(file);
  return uploadToR2(file, userId, tenantId, "audio", mimeType);
}

export function uploadImage(
  file: File,
  userId: string,
  tenantId: string
): Promise<UploadResult> {
  validateImageFile(file);
  return uploadToR2(file, userId, tenantId, "image");
}
