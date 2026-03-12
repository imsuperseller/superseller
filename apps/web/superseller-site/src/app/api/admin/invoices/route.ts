import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { generateInvoicePdf, type InvoiceData } from "@/lib/services/invoice-pdf";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/invoices — Generate a branded PDF invoice
 * Body: { tenantSlug, customerName, customerEmail?, customerAddress?, lineItems, notes?, issueDate?, dueDate?, status? }
 * Returns: PDF as application/pdf download, or { url } if stored in R2
 */
export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      tenantSlug,
      customerName,
      customerEmail,
      customerAddress,
      lineItems,
      notes,
      issueDate,
      dueDate,
      status,
      storeInR2,
    } = body;

    if (!tenantSlug || !customerName || !lineItems?.length) {
      return NextResponse.json(
        { error: "tenantSlug, customerName, and lineItems are required" },
        { status: 400 }
      );
    }

    // Generate invoice number: INV-{YYYY}-{sequential}
    const year = new Date().getFullYear();
    const existingCount = await prisma.payment.count(); // rough sequential count
    const seq = String(existingCount + 1).padStart(4, "0");
    const invoiceNumber = `INV-${year}-${seq}`;

    const today = new Date().toISOString().split("T")[0];
    const due = dueDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split("T")[0];
    })();

    const data: InvoiceData = {
      invoiceNumber,
      issueDate: issueDate || today,
      dueDate: due,
      customerName,
      customerEmail,
      customerAddress,
      lineItems,
      notes,
      status: status || "unpaid",
    };

    const pdfBuffer = await generateInvoicePdf(data);

    // If storeInR2, upload to R2 and return URL
    if (storeInR2) {
      const url = await uploadInvoiceToR2(
        pdfBuffer,
        tenantSlug,
        invoiceNumber
      );
      if (url) {
        return NextResponse.json({ url, invoiceNumber });
      }
      // R2 failed — still return JSON with a fallback download
      console.warn("[invoices] R2 upload failed, returning direct download");
    }

    // Return PDF as direct download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("[invoices] Generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

async function uploadInvoiceToR2(
  buffer: Buffer,
  tenantSlug: string,
  invoiceNumber: string
): Promise<string | null> {
  try {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const accountId =
      process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId =
      process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey =
      process.env.R2_SECRET_ACCESS_KEY ||
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn("[invoices] R2 credentials not configured");
      return null;
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });

    const key = `invoices/${tenantSlug}/${invoiceNumber}.pdf`;
    await s3.send(
      new PutObjectCommand({
        Bucket: "zillow-to-video-finals",
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
        CacheControl: "public, max-age=31536000",
      })
    );

    const publicDomain =
      process.env.R2_PUBLIC_DOMAIN || "https://videos.superseller.agency";
    return `${publicDomain}/${key}`;
  } catch (err: any) {
    console.error("[invoices] R2 upload failed:", err?.name, err?.message, err?.Code, JSON.stringify({ endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, bucket: "zillow-to-video-finals" }));
    return null;
  }
}
