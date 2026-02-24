import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { queryRow } from "@/lib/db";
import type { UserCredits } from "@/types";

export async function GET() {
  try {
    const user = await getSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const credits = await queryRow<UserCredits>(
      "SELECT * FROM winner_user_credits WHERE user_id = $1",
      [user.id]
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tenant_id: user.tenant_id,
        tier: user.tier,
      },
      credits: credits
        ? {
            available: credits.available_credits,
            total: credits.total_credits,
            used: credits.used_credits,
            monthlyRemaining: credits.monthly_cap - credits.monthly_used,
          }
        : null,
    });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
