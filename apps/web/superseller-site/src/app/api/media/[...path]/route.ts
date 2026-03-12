import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

const BUCKET = "zillow-to-video-finals";

function getR2Client() {
  const accountId =
    process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY ||
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");

  // Only allow known media extensions
  const ext = key.split(".").pop()?.toLowerCase() || "";
  if (!MIME[ext]) {
    return NextResponse.json({ error: "unsupported format" }, { status: 400 });
  }

  const s3 = getR2Client();
  if (!s3) {
    return NextResponse.json(
      { error: "R2 not configured" },
      { status: 500 }
    );
  }

  try {
    const range = request.headers.get("range") || undefined;

    const cmd = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Range: range,
    });

    const resp = await s3.send(cmd);
    const body = resp.Body as Readable;

    if (!body) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // Convert Node stream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        body.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        body.on("end", () => controller.close());
        body.on("error", (err: Error) => controller.error(err));
      },
    });

    const status = range && resp.ContentRange ? 206 : 200;

    const headers: Record<string, string> = {
      "Content-Type": MIME[ext],
      "Cache-Control": "public, max-age=86400, immutable",
      "Accept-Ranges": "bytes",
    };

    if (resp.ContentLength != null) {
      headers["Content-Length"] = String(resp.ContentLength);
    }
    if (resp.ContentRange) {
      headers["Content-Range"] = resp.ContentRange;
    }

    return new Response(webStream, { status, headers });
  } catch (err: unknown) {
    const code = (err as { name?: string }).name;
    if (code === "NoSuchKey") {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    console.error("[media-proxy]", err);
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
