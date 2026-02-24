import { NextResponse } from "next/server";
import { verifyMagicLink, setSessionCookie } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const sessionToken = await verifyMagicLink(token);
    if (!sessionToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await setSessionCookie(sessionToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Verify magic link error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
