import { NextResponse } from "next/server";
import { verifyOtp, setSessionCookie } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    const sessionToken = await verifyOtp(phone.trim(), code.trim());
    if (!sessionToken) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    await setSessionCookie(sessionToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
