/**
 * PATCH /api/admin/tenants — Update tenant settings
 * Body: { slug, settings: { ...partial settings to merge } }
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, settings } = body;

    if (!slug || !settings) {
      return NextResponse.json(
        { error: "slug and settings are required" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Deep merge settings
    const existing = (tenant.settings as Record<string, unknown>) || {};
    const merged = { ...existing, ...settings };

    const updated = await prisma.tenant.update({
      where: { slug },
      data: { settings: merged },
    });

    return NextResponse.json({ ok: true, tenant: { slug: updated.slug, settings: updated.settings } });
  } catch (err) {
    console.error("[admin/tenants] PATCH error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await verifySession();
  if (!session.isValid || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    select: { id: true, slug: true, name: true, settings: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tenants });
}
