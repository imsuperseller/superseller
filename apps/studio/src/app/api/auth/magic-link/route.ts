import { NextResponse } from "next/server";
import { sendMagicLinkEmail } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const sent = await sendMagicLinkEmail(email.toLowerCase().trim());
    if (!sent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Magic link error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
