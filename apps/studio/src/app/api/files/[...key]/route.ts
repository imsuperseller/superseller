import { NextResponse } from "next/server";
import { downloadFile } from "@/lib/r2";

export const maxDuration = 60;

const MIME_MAP: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  aac: "audio/aac",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
};

/**
 * Public proxy for R2 files.
 * URL: /api/files/{r2-key}
 * Returns the file with correct content-type header.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    const key = keyParts.join("/");
    if (!key) {
      return NextResponse.json({ error: "No key" }, { status: 400 });
    }

    const ext = key.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    const buffer = await downloadFile(key);
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("File proxy error:", err);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
