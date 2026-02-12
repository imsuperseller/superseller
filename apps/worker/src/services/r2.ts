import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream, statSync } from "fs";
import { lookup } from "mime-types";
import { config } from "../config";
import { logger } from "../utils/logger";

const r2Client = new S3Client({
    region: "auto",
    endpoint: config.r2.endpoint,
    credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
    },
});

export async function uploadToR2(
    localPath: string,
    r2Key: string,
    contentType?: string
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

    const publicUrl = config.r2.publicUrl
        ? `${config.r2.publicUrl.replace(/\/$/, "")}/${r2Key}`
        : `/${r2Key}`;

    logger.info({ msg: "R2 upload complete", url: publicUrl });
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
