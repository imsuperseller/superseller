import prisma from "../src/lib/prisma";

async function test() {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: "elite-pro-remodeling" } });
    console.log("Tenant found:", tenant?.id, tenant?.status);

    const email = "test-local-debug@superseller.agency";
    const userId = email.replace(/[^a-z0-9]/g, "_");
    console.log("userId:", userId);

    // Step 1: Upsert User
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        id: userId,
        email,
        name: "Test Local",
        phone: "+1-555-000-0000",
        businessName: tenant?.name || "test",
        source: "onboard:elite-pro-remodeling",
      },
      update: { name: "Test Local" },
    });
    console.log("Step 1 OK - User upserted:", user.id);

    // Step 2: TenantUser
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TenantUser" ("tenantId", "userId", "role") VALUES ($1::uuid, $2, $3) ON CONFLICT ("tenantId", "userId") DO UPDATE SET "role" = $3`,
      tenant!.id, userId, "team"
    );
    console.log("Step 2 OK - TenantUser");

    // Step 3: CompeteAllowlist
    await prisma.competeAllowlist.upsert({
      where: { tenantId_email: { tenantId: tenant!.id, email } },
      create: { tenantId: tenant!.id, email },
      update: {},
    });
    console.log("Step 3 OK - CompeteAllowlist");

    console.log("ALL STEPS PASSED");

    // Clean up test data
    await prisma.competeAllowlist.deleteMany({ where: { email } });
    await prisma.$executeRawUnsafe(`DELETE FROM "TenantUser" WHERE "userId" = $1`, userId);
    await prisma.user.delete({ where: { email } });
    console.log("Test data cleaned up");
  } catch (err: any) {
    console.error("FAILED at:", err.message);
    console.error("META:", JSON.stringify(err.meta || {}));
    console.error("CODE:", err.code);
    console.error("STACK:", err.stack?.split("\n").slice(0, 5).join("\n"));
  } finally {
    await prisma.$disconnect();
  }
}
test();
