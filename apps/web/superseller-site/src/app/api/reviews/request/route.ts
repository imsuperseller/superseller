import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tenantSlug,
      businessName,
      clientName,
      clientPhone,
      clientEmail,
      googleReviewUrl,
      yelpReviewUrl,
      delayHours = 2,
    } = body;

    if (!tenantSlug || !clientName || (!clientPhone && !clientEmail)) {
      return NextResponse.json(
        { error: "tenantSlug, clientName, and at least one of clientPhone/clientEmail required" },
        { status: 400 }
      );
    }

    // Look up business name from brand if not provided
    let biz = businessName;
    if (!biz) {
      const brand = await prisma.brand.findFirst({ where: { slug: tenantSlug } });
      biz = brand?.name || tenantSlug;
    }

    const scheduledFor = new Date(Date.now() + delayHours * 60 * 60 * 1000);

    const review = await prisma.reviewRequest.create({
      data: {
        tenantSlug,
        businessName: biz,
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        googleReviewUrl: googleReviewUrl || null,
        yelpReviewUrl: yelpReviewUrl || null,
        scheduledFor,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      id: review.id,
      scheduledFor: scheduledFor.toISOString(),
    });
  } catch (error) {
    console.error("[Review Request Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
