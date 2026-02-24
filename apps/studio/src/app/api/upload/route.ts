import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { uploadAudio, uploadImage, FileValidationError } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const user = await getSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "audio" | "image"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!type || !["audio", "image"].includes(type)) {
      return NextResponse.json(
        { error: 'type must be "audio" or "image"' },
        { status: 400 }
      );
    }

    const result =
      type === "audio"
        ? await uploadAudio(file, user.id, user.tenant_id)
        : await uploadImage(file, user.id, user.tenant_id);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof FileValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
