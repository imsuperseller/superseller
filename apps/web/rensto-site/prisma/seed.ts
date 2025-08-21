import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rensto.com' },
    update: {},
    create: {
      email: 'admin@rensto.com',
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Admin user created:', adminUser);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
