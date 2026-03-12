import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Team onboarding API — auto-creates User + TenantUser + CompeteAllowlist.
 * No auth required — this IS the onboarding. Shared as a WhatsApp link.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant || tenant.status !== "active") {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, phone, role, soraCameo } = body;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userId = normalizedEmail.replace(/[^a-z0-9]/g, "_");

  try {
    // 1. Upsert User
    await prisma.user.upsert({
      where: { email: normalizedEmail },
      create: {
        id: userId,
        email: normalizedEmail,
        name: name.trim(),
        phone: phone?.trim() || null,
        businessName: tenant.name,
        source: `onboard:${tenantSlug}`,
      },
      update: {
        name: name.trim(),
        ...(phone?.trim() ? { phone: phone.trim() } : {}),
      },
    });

    // 2. Upsert TenantUser
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TenantUser" ("tenantId", "userId", "role")
       VALUES ($1::uuid, $2, $3)
       ON CONFLICT ("tenantId", "userId") DO UPDATE SET "role" = $3`,
      tenant.id,
      userId,
      role?.trim() || "team",
    );

    // 3. Add to CompeteAllowlist (so they can access /compete/[tenantSlug])
    await prisma.competeAllowlist.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: normalizedEmail,
        },
      },
      create: {
        tenantId: tenant.id,
        email: normalizedEmail,
      },
      update: {},
    });

    // 4. Store Sora Cameo data if provided (in Tenant settings JSONB)
    if (soraCameo) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Tenant" SET settings = jsonb_set(
          COALESCE(settings, '{}'),
          '{soraCameos}',
          COALESCE(settings->'soraCameos', '{}') || $1::jsonb
        ) WHERE id = $2::uuid`,
        JSON.stringify({ [normalizedEmail]: { ...soraCameo, name: name.trim(), submittedAt: new Date().toISOString() } }),
        tenant.id,
      );
    }

    // 5. Notify Shai via WhatsApp (best-effort)
    const wahaUrl = process.env.WAHA_API_URL || "http://172.245.56.50:3004";
    fetch(`${wahaUrl}/api/sendText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: "14695885133@c.us",
        text: `👤 *New team member onboarded!*\n${tenant.name}\n\nName: ${name.trim()}\nEmail: ${normalizedEmail}\nPhone: ${phone?.trim() || "N/A"}\nRole: ${role?.trim() || "N/A"}\nSora Cameo: ${soraCameo ? "Yes" : "No"}`,
        session: "default",
      }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `${name.trim()} added to ${tenant.name}`,
    });
  } catch (err: any) {
    console.error("[onboard] Error:", err.message, err.stack || "", JSON.stringify(err.meta || {}));
    return NextResponse.json(
      { error: "Failed to onboard. Please try again." },
      { status: 500 },
    );
  }
}
