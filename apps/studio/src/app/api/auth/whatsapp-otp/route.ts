import { NextResponse } from "next/server";
import { sendWhatsAppOtp } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const sent = await sendWhatsAppOtp(phone.trim());
    if (!sent) {
      return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("WhatsApp OTP error:", msg, err instanceof Error ? err.stack : "");
    return NextResponse.json({ error: "Internal error", detail: msg }, { status: 500 });
  }
}
