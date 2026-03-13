import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream, statSync } from "fs";
// @ts-ignore
import { lookup } from "mime-types";
import { config } from "../config";
import { logger } from "../utils/logger";
import { registerAsset } from "./tenant-asset";

export interface AssetInfo {
    tenantId: string;
    type: string;
    filename: string;
    metadata?: Record<string, unknown>;
}

/** Upload a Buffer to R2 (for base64 from web forms). Returns public URL. */
export async function uploadBufferToR2(
    buffer: Buffer,
    r2Key: string,
    contentType: string = "image/png",
    assetInfo?: AssetInfo
): Promise<string> {
    logger.info({
        msg: "Uploading buffer to R2",
        key: r2Key,
        size: `${(buffer.length / 1024).toFixed(1)}KB`,
        type: contentType,
    });
    await r2Client.send(new PutObjectCommand({
        Bucket: config.r2.bucket,
        Key: r2Key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000",
    }));
    const publicUrl = config.r2.publicUrl
        ? `${config.r2.publicUrl.replace(/\/$/, "")}/${r2Key}`
        : `/${r2Key}`;
    if (!config.r2.publicUrl && publicUrl.startsWith("/")) {
        logger.warn({ msg: "R2_PUBLIC_URL not set — Kie.ai cannot fetch relative URL", key: r2Key });
    }
    logger.info({ msg: "R2 buffer upload complete", url: publicUrl });

    if (assetInfo) {
        try {
            await registerAsset({
                tenantId: assetInfo.tenantId,
                type: assetInfo.type,
                filename: assetInfo.filename,
                r2Key,
                publicUrl,
                mimeType: contentType,
                sizeBytes: buffer.length,
                metadata: assetInfo.metadata,
            });
        } catch (err) {
            logger.error({ msg: "TenantAsset registration failed (upload succeeded)", r2Key, err });
        }
    }

    return publicUrl;
}

const r2Client = new S3Client({
    region: "auto",
    endpoint: config.r2.endpoint,
    forcePathStyle: true, // R2: avoid virtual-hosted style (bucket.endpoint) which causes ENOTFOUND
    credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
    },
});

export async function uploadToR2(
    localPath: string,
    r2Key: string,
    contentType?: string,
    assetInfo?: AssetInfo
): Promise<string> {
    const detectedType = contentType || lookup(localPath) || "application/octet-stream";
    const fileSize = statSync(localPath).size;

    logger.info({
        msg: "Uploading to R2",
        key: r2Key,
        size: `${(fileSize / 1024 / 1024).toFixed(1)}MB`,
        type: detectedType,
    });

    await r2Client.send(new PutObjectCommand({
        Bucket: config.r2.bucket,
        Key: r2Key,
        Body: createReadStream(localPath),
        ContentType: detectedType,
        CacheControl: "public, max-age=31536000",
    }));

    // CRITICAL: When passing URLs to Kie.ai (Kling, Nano Banana), they MUST be full public URLs.
    // If R2_PUBLIC_URL is empty, we return a relative path — Kie will fail with "media file unavailable."
    const publicUrl = config.r2.publicUrl
        ? `${config.r2.publicUrl.replace(/\/$/, "")}/${r2Key}`
        : `/${r2Key}`;

    if (!config.r2.publicUrl && publicUrl.startsWith("/")) {
        logger.warn({ msg: "R2_PUBLIC_URL not set — returned URL is relative; Kie.ai cannot fetch it", key: r2Key });
    }
    logger.info({ msg: "R2 upload complete", url: publicUrl });

    if (assetInfo) {
        try {
            await registerAsset({
                tenantId: assetInfo.tenantId,
                type: assetInfo.type,
                filename: assetInfo.filename,
                r2Key,
                publicUrl,
                mimeType: detectedType,
                sizeBytes: fileSize,
                metadata: assetInfo.metadata,
            });
        } catch (err) {
            logger.error({ msg: "TenantAsset registration failed (upload succeeded)", r2Key, err });
        }
    }

    return publicUrl;
}

export async function deleteFromR2(r2Key: string): Promise<void> {
    await r2Client.send(new DeleteObjectCommand({
        Bucket: config.r2.bucket,
        Key: r2Key,
    }));
    logger.info({ msg: "R2 object deleted", key: r2Key });
}

export async function objectExists(r2Key: string): Promise<boolean> {
    try {
        await r2Client.send(new HeadObjectCommand({
            Bucket: config.r2.bucket,
            Key: r2Key,
        }));
        return true;
    } catch {
        return false;
    }
}

export function buildR2Key(userId: string, jobId: string, filename: string): string {
    return `${userId}/${jobId}/${filename}`;
}
