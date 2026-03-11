import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/customers
 * Returns all tenants with user counts and active service instances from Prisma.
 */
export async function GET() {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all tenants
    const tenants = await prisma.tenant.findMany({
      include: {
        brand: {
          select: { name: true, slug: true, logoUrl: true },
        },
        leads: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get user counts per tenant via raw query (TenantUser is in Drizzle, not Prisma relations)
    const tenantUserCounts: Array<{ tenant_id: string; user_count: bigint }> = await prisma.$queryRaw`
      SELECT tenant_id, COUNT(*)::bigint as user_count
      FROM tenant_users
      GROUP BY tenant_id
    `;
    const userCountMap = new Map(
      tenantUserCounts.map(r => [r.tenant_id, Number(r.user_count)])
    );

    // Get service instances grouped by clientId (which maps to tenant users)
    const serviceInstances = await prisma.serviceInstance.findMany({
      select: {
        id: true,
        clientId: true,
        clientEmail: true,
        productName: true,
        status: true,
        type: true,
        createdAt: true,
        activatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map service instances to tenants by looking up clientEmail in tenant_users
    // For now, group services by clientEmail for display
    const servicesByEmail = new Map<string, typeof serviceInstances>();
    for (const si of serviceInstances) {
      const existing = servicesByEmail.get(si.clientEmail) || [];
      existing.push(si);
      servicesByEmail.set(si.clientEmail, existing);
    }

    // Get tenant user emails to map services to tenants
    const tenantUserEmails: Array<{ tenant_id: string; email: string }> = await prisma.$queryRaw`
      SELECT tu.tenant_id, u.email
      FROM tenant_users tu
      JOIN users u ON tu.user_id = u.id
    `;
    const tenantEmailMap = new Map<string, string[]>();
    for (const row of tenantUserEmails) {
      const existing = tenantEmailMap.get(row.tenant_id) || [];
      existing.push(row.email);
      tenantEmailMap.set(row.tenant_id, existing);
    }

    const customers = tenants.map(tenant => {
      const emails = tenantEmailMap.get(tenant.id) || [];
      const tenantServices = emails.flatMap(email => servicesByEmail.get(email) || []);

      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        plan: tenant.plan,
        createdAt: tenant.createdAt,
        userCount: userCountMap.get(tenant.id) || 0,
        leadCount: tenant.leads.length,
        brand: tenant.brand,
        emails,
        services: tenantServices.map(s => ({
          id: s.id,
          productName: s.productName,
          status: s.status,
          type: s.type,
          activatedAt: s.activatedAt,
        })),
      };
    });

    return NextResponse.json({
      customers,
      total: customers.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[customers] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers', detail: error.message }, { status: 500 });
  }
}
